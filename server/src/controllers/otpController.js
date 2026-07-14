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

// ─── Register ────────────────────────────────────────────────────────
// POST /api/otp/register
// Body: { email, password }
// Creates the user via the admin API with email_confirm=false so Supabase
// does NOT send its own native confirmation email. We then send our own
// branded verification link via EmailJS. Sign-in stays blocked (Supabase
// "Enable email confirmations" must be ON) until the link is clicked.
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function registerUser(req, res, next) {
  try {
    const { email, password } = registerSchema.parse(req.body);
    console.log(`[Register] Request: email=${email}`);

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('[Register] listUsers error:', listError);
      return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Unable to process request' });
    }

    const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (existing && existing.email_confirmed_at) {
      return res.status(400).json({ status: 'error', code: 'AUTH_EMAIL_EXISTS', message: 'An account with this email already exists.' });
    }

    let userId;
    if (existing) {
      // Unconfirmed account already exists — update password and resend link
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, { password });
      if (updErr) {
        console.error('[Register] update password error:', updErr);
        return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Unable to create account. Please try again.' });
      }
      userId = existing.id;
    } else {
      // Create user WITHOUT triggering Supabase's native confirmation email
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
      });
      if (createErr) {
        console.error('[Register] createUser error:', createErr);
        const already = createErr.message?.toLowerCase().includes('already');
        return res.status(already ? 400 : 500).json({
          status: 'error',
          code: already ? 'AUTH_EMAIL_EXISTS' : 'SERVER_ERROR',
          message: already ? 'An account with this email already exists.' : 'Unable to create account. Please try again.',
        });
      }
      userId = created.user.id;
    }

    // Generate + persist verify token (survives server restarts)
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const { error: metaErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        verify_token: verifyToken,
        verify_token_expires: Date.now() + OTP_TTL_MS,
      },
    });
    if (metaErr) {
      console.error('[Register] Failed to store verify token:', metaErr);
    }

    const baseUrl = req.headers.origin || 'http://localhost:5173';
    const verifyLinkUrl = `${baseUrl}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;

    try {
      await sendEmail({
        to: email,
        subject: otpSubject('verify'),
        purpose: 'verify',
        verifyLink: verifyLinkUrl,
      });
    } catch (emailErr) {
      console.error('[Register] Email send failed:', emailErr.message);
      return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Failed to send email. Please try again.' });
    }

    res.status(201).json({ status: 'success', message: 'Account created. Verification email sent.' });
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
    console.log(`[OTP] Request: purpose=${purpose}, email=${email}`);

    // For reset: user must exist. For verify: user must exist and be unconfirmed.
    // listUsers returns { data: { users: AuthUser[], aud, nextPage, ... }, error }
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('[OTP] listUsers error:', listError);
      return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Unable to process request' });
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    console.log(`[OTP] User found:`, user ? `id=${user.id}, confirmed=${!!user.email_confirmed_at}` : 'no');

    if (purpose === 'reset' && !user) {
      // Don't reveal whether email exists — return success anyway
      return res.status(200).json({ status: 'success', message: 'If an account exists, an OTP has been sent.' });
    }

    if (purpose === 'verify' && !user) {
      return res.status(400).json({ status: 'error', code: 'AUTH_USER_NOT_FOUND', message: 'No account found with this email.' });
    }

    if (purpose === 'verify' && user?.email_confirmed_at) {
      return res.status(400).json({ status: 'error', code: 'AUTH_EMAIL_ALREADY_VERIFIED', message: 'This email is already verified.' });
    }

    const code = generateOtp();
    const verifyToken = purpose === 'verify' ? crypto.randomBytes(32).toString('hex') : null;
    const key = getOtpKey(email, purpose);

    const storeEntry = {
      code,
      purpose,
      userId: user?.id || null,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    };

    if (verifyToken) {
      storeEntry.verifyToken = verifyToken;
    }

    otpStore.set(key, storeEntry);

    console.log(`[OTP] ${purpose} code for ${email}: ${code}`);

    // Build email params
    const emailParams = {
      to: email,
      subject: otpSubject(purpose),
      purpose,
    };

    if (purpose === 'verify' && verifyToken) {
      const baseUrl = req.headers.origin || 'http://localhost:5173';
      emailParams.verifyLink = `${baseUrl}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;

      // Persist verify token in Supabase so it survives server restarts
      const { error: metaErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          verify_token: verifyToken,
          verify_token_expires: Date.now() + OTP_TTL_MS,
        },
      });
      if (metaErr) {
        console.error('[OTP] Failed to store verify token:', metaErr);
      }
    } else {
      emailParams.otpCode = code;
    }

    // Send email server-side via EmailJS
    try {
      await sendEmail(emailParams);
    } catch (emailErr) {
      console.error('[OTP] Email send failed:', emailErr.message);
      return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Failed to send email. Please try again.' });
    }

    res.status(200).json({
      status: 'success',
      message: purpose === 'reset'
        ? 'If an account exists, an OTP has been sent.'
        : 'Verification email sent',
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
      return res.status(400).json({ status: 'error', code: 'AUTH_OTP_NOT_FOUND', message: 'No OTP found. Please request a new one.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ status: 'error', code: 'AUTH_OTP_EXPIRED', message: 'OTP has expired. Please request a new one.' });
    }

    if (stored.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(key);
      return res.status(400).json({ status: 'error', code: 'AUTH_OTP_MAX_ATTEMPTS', message: 'Too many attempts. Please request a new OTP.' });
    }

    stored.attempts++;

    if (code !== stored.code) {
      return res.status(400).json({ status: 'error', code: 'AUTH_OTP_INVALID', message: 'Invalid code. Please try again.' });
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
        return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Failed to verify email. Please try again.' });
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
      return res.status(400).json({ status: 'error', code: 'AUTH_INVALID_RESET_SESSION', message: 'Invalid reset session. Please start over.' });
    }

    if (!stored.resetToken || stored.resetToken !== resetToken) {
      return res.status(400).json({ status: 'error', code: 'AUTH_INVALID_RESET_TOKEN', message: 'Invalid reset token.' });
    }

    if (Date.now() > stored.resetTokenExpiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ status: 'error', code: 'AUTH_RESET_TOKEN_EXPIRED', message: 'Reset token has expired. Please start over.' });
    }

    if (!stored.userId) {
      return res.status(400).json({ status: 'error', code: 'AUTH_USER_NOT_FOUND', message: 'User not found.' });
    }

    // Update the password via Supabase admin
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      stored.userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('[OTP] Failed to reset password:', updateError);
      return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Failed to reset password. Please try again.' });
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

// ─── Verify Link ──────────────────────────────────────────────────────
// GET /api/otp/verify-link?token=xxx&email=yyy
const verifyLinkSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
});

async function verifyLink(req, res, next) {
  try {
    const { token, email } = verifyLinkSchema.parse(req.query);

    // Look up the user directly in Supabase (token is persisted in user_metadata,
    // so this survives server restarts unlike the in-memory store)
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('[OTP] verifyLink listUsers error:', listError);
      return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Unable to process request' });
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(400).json({ status: 'error', code: 'AUTH_INVALID_VERIFY_LINK', message: 'Invalid or expired verification link.' });
    }

    if (user.email_confirmed_at) {
      return res.status(400).json({ status: 'error', code: 'AUTH_EMAIL_ALREADY_VERIFIED', message: 'This email is already verified. You can sign in.' });
    }

    const storedToken = user.user_metadata?.verify_token;
    const storedExpires = user.user_metadata?.verify_token_expires;

    if (!storedToken || storedToken !== token) {
      return res.status(400).json({ status: 'error', code: 'AUTH_INVALID_VERIFY_LINK', message: 'Invalid verification link.' });
    }

    if (Date.now() > (storedExpires || 0)) {
      return res.status(400).json({ status: 'error', code: 'AUTH_VERIFY_LINK_EXPIRED', message: 'Verification link has expired. Please sign up again.' });
    }

    // Confirm email in Supabase
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: { verify_token: null, verify_token_expires: null },
    });

    if (confirmError) {
      console.error('[OTP] Failed to confirm email via link:', confirmError);
      return res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: 'Failed to verify email. Please try again.' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification link.',
      });
    }
    next(error);
  }
}

module.exports = { registerUser, sendOtp, verifyOtp, resetPassword, verifyLink };
