const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Verifies a Cloudflare Turnstile token server-side against the siteverify API.
// The token is single-use and short-lived (~300s), so it must be verified
// exactly once per challenge. Returns the raw Cloudflare response object:
// { success: boolean, 'error-codes': string[], challenge_ts, hostname, action, ... }
async function verifyTurnstileToken(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error('TURNSTILE_SECRET_KEY is not configured');
  }

  const body = new URLSearchParams();
  body.append('secret', secret);
  body.append('response', token);
  if (remoteip) {
    body.append('remoteip', remoteip);
  }

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    throw new Error(`Turnstile siteverify returned ${res.status}`);
  }

  return res.json();
}

module.exports = { verifyTurnstileToken };

/*
 * turnstileService Notes:
 * - Calls Cloudflare's siteverify endpoint with the secret key + client token
 * - Never expose TURNSTILE_SECRET_KEY to the client; it lives on the server only
 * - Tokens are single-use and expire (~300s) — verify once, then reset the widget
 */
