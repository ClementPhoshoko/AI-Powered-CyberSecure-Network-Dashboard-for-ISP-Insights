const { z } = require('zod');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/db');
const { sendEmail, otpSubject } = require('../services/emailService');

// In-memory OTP store (resets on server restart)
// Key: email, Value: { code, purpose, userId, expiresAt, attempts }
const otpStore = new Map();

const OTP_TTL_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_ATTEMPTS = 5;
const CODE_LENGTH = 6;

function generateOtp() {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += String(bytes[i] % 10);
  }
  return code;
}

function getOtpKey(email, purpose) {
  return `${email.toLowerCase()}:${purpose}`;
}

// ─── Send OTP ────────────────────────────────────────────────────────
// POST /api/otp/send
// Body: { email, purpose }  purpose = "verify" | "reset"
const sendOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['verify', 'reset']),
});

async function sendOtp(req, res, next) {
  try {
    const { email, purpose } = sendOtpSchema.parse(req.body);

    // For reset: user must exist. For verify: user must exist and be unconfirmed.
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return res.status(500).json({ status: 'error', message: 'Unable to process request' });
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (purpose === 'reset' && !user) {
      // Don't reveal whether email exists — return success anyway
      return res.status(200).json({ status: 'success', message: 'If an account exists, an OTP has been sent.' });
    }

    if (purpose === 'verify' && !user) {
      return res.status(400).json({ status: 'error', message: 'No account found with this email.' });
    }

    if (purpose === 'verify' && user?.email_confirmed_at) {
      return res.status(400).json({ status: 'error', message: 'This email is already verified.' });
    }

    const code = generateOtp();
    const key = getOtpKey(email, purpose);

    otpStore.set(key, {
      code,
      purpose,
      userId: user?.id || null,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    console.log(`[OTP] ${purpose} code for ${email}: ${code}`);

    // Send email server-side via EmailJS
    try {
      await sendEmail({
        to: email,
        subject: otpSubject(purpose),
        otpCode: code,
        purpose,
      });
    } catch (emailErr) {
      console.error('[OTP] Email send failed:', emailErr.message);
      if (process.env.NODE_ENV === 'production' || emailErr.message.includes('non-browser')) {
        return res.status(500).json({ status: 'error', message: emailErr.message });
      }
    }

    res.status(200).json({
      status: 'success',
      message: purpose === 'reset'
        ? 'If an account exists, an OTP has been sent.'
        : 'OTP sent successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error: ' + error.issues.map(i => `${i.path.join('.')} - ${i.message}`).join(', '),
      });
    }
    next(error);
  }
}

// ─── Verify OTP ──────────────────────────────────────────────────────
// POST /api/otp/verify
// Body: { email, code, purpose }
const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(CODE_LENGTH),
  purpose: z.enum(['verify', 'reset']),
});

async function verifyOtp(req, res, next) {
  try {
    const { email, code, purpose } = verifyOtpSchema.parse(req.body);
    const key = getOtpKey(email, purpose);
    const stored = otpStore.get(key);

    if (!stored || stored.purpose !== purpose) {
      return res.status(400).json({ status: 'error', message: 'No OTP found. Please request a new one.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ status: 'error', message: 'OTP has expired. Please request a new one.' });
    }

    if (stored.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(key);
      return res.status(400).json({ status: 'error', message: 'Too many attempts. Please request a new OTP.' });
    }

    stored.attempts++;

    if (code !== stored.code) {
      return res.status(400).json({ status: 'error', message: 'Invalid code. Please try again.' });
    }

    // OTP verified — generate a short-lived reset token for password reset
    const resetToken = purpose === 'reset'
      ? crypto.randomBytes(32).toString('hex')
      : null;

    if (purpose === 'reset' && resetToken) {
      // Store the reset token with the user ID
      stored.resetToken = resetToken;
      stored.resetTokenExpiresAt = Date.now() + OTP_TTL_MS;
    }

    // For verify purpose: confirm the user's email in Supabase
    if (purpose === 'verify' && stored.userId) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        stored.userId,
        { email_confirm: true }
      );
      if (confirmError) {
        console.error('[OTP] Failed to confirm email:', confirmError);
        return res.status(500).json({ status: 'error', message: 'Failed to verify email. Please try again.' });
      }
    }

    // Don't delete the OTP yet for reset — need it for the reset-password step
    if (purpose === 'verify') {
      otpStore.delete(key);
    }

    res.status(200).json({
      status: 'success',
      message: purpose === 'verify' ? 'Email verified successfully' : 'OTP verified successfully',
      ...(resetToken && { resetToken }),
      userId: stored.userId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error: ' + error.issues.map(i => `${i.path.join('.')} - ${i.message}`).join(', '),
      });
    }
    next(error);
  }
}

// ─── Reset Password ──────────────────────────────────────────────────
// POST /api/otp/reset-password
// Body: { email, resetToken, newPassword }
const resetPasswordSchema = z.object({
  email: z.string().email(),
  resetToken: z.string().min(1),
  newPassword: z.string().min(8),
});

async function resetPassword(req, res, next) {
  try {
    const { email, resetToken, newPassword } = resetPasswordSchema.parse(req.body);
    const key = getOtpKey(email, 'reset');
    const stored = otpStore.get(key);

    if (!stored || stored.purpose !== 'reset') {
      return res.status(400).json({ status: 'error', message: 'Invalid reset session. Please start over.' });
    }

    if (!stored.resetToken || stored.resetToken !== resetToken) {
      return res.status(400).json({ status: 'error', message: 'Invalid reset token.' });
    }

    if (Date.now() > stored.resetTokenExpiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ status: 'error', message: 'Reset token has expired. Please start over.' });
    }

    if (!stored.userId) {
      return res.status(400).json({ status: 'error', message: 'User not found.' });
    }

    // Update the password via Supabase admin
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      stored.userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('[OTP] Failed to reset password:', updateError);
      return res.status(500).json({ status: 'error', message: 'Failed to reset password. Please try again.' });
    }

    // Clean up
    otpStore.delete(key);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error: ' + error.issues.map(i => `${i.path.join('.')} - ${i.message}`).join(', '),
      });
    }
    next(error);
  }
}

module.exports = { sendOtp, verifyOtp, resetPassword };
