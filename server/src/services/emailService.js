const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

async function sendEmail({ to, subject, otpCode, purpose }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('[EmailJS] Missing env vars — email not sent. OTP:', otpCode);
    return { ok: false, skipped: true };
  }

  const message = purpose === 'verify'
    ? 'Thanks for signing up. Use the code below to verify your email address.'
    : 'We received a request to reset your password. Use the code below to proceed.';

  const templateParams = {
    email: to,
    to_email: to,
    subject,
    message,
    otp_code: otpCode,
    purpose,
    from_name: 'AkovoLabs',
  };

  const payload = {
    service_id: SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id: PUBLIC_KEY,
    template_params: templateParams,
  };

  if (PRIVATE_KEY) {
    payload.accessToken = PRIVATE_KEY;
  }

  const res = await fetch(EMAILJS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error('[EmailJS] Send failed:', res.status, text);
    if (text.includes('non-browser')) {
      console.error('[EmailJS] >>> Go to https://dashboard.emailjs.com/admin/account/security and enable "API access from non-browser environments" <<<');
    }
    throw new Error(text.includes('non-browser')
      ? 'EmailJS server-side access is disabled — enable it in your EmailJS dashboard security settings'
      : 'Failed to send email');
  }

  console.log('[EmailJS] Email sent to', to);
  return { ok: true };
}

function otpSubject(purpose) {
  return purpose === 'verify'
    ? 'Verify your AkovoLabs email'
    : 'Reset your AkovoLabs password';
}

module.exports = { sendEmail, otpSubject };
