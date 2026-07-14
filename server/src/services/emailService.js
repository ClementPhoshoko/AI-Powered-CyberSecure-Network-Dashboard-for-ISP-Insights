const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_VERIFY_ID = process.env.EMAILJS_TEMPLATE_VERIFY_ID;
const TEMPLATE_RESET_ID = process.env.EMAILJS_TEMPLATE_RESET_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

async function sendEmail({ to, subject, otpCode, purpose, verifyLink }) {
  const templateId = purpose === 'verify' ? TEMPLATE_VERIFY_ID : TEMPLATE_RESET_ID;

  if (!SERVICE_ID || !templateId || !PUBLIC_KEY) {
    console.warn('[EmailJS] Missing env vars — email not sent.', purpose === 'verify' ? 'Link:' : 'OTP:', otpCode || verifyLink);
    return { ok: false, skipped: true };
  }

  const templateParams = {
    email: to,
    to_email: to,
    subject,
    from_name: 'AkovoLabs',
  };

  if (purpose === 'verify' && verifyLink) {
    templateParams.verify_link = verifyLink;
    templateParams.message = 'Thanks for signing up. Click the link below to verify your email address.';
  } else {
    templateParams.otp_code = otpCode;
    templateParams.message = 'We received a request to reset your password. Use the code below to proceed.';
  }

  const payload = {
    service_id: SERVICE_ID,
    template_id: templateId,
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
