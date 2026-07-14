const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Verifies a Turnstile token against the backend for client-only flows
 * (Login, Contact) that don't otherwise hit a protected endpoint.
 * Backend routes that receive the token directly (register, send-otp) do
 * their own verification via middleware and don't need this call.
 */
export const verifyCaptcha = async (turnstileToken) => {
  let res;
  try {
    res = await fetch(`${API_URL}/api/turnstile/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turnstileToken }),
    });
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }
    throw new Error('Something went wrong verifying the captcha. Please try again.');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Captcha verification failed. Please try again.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Captcha verification failed. Please try again.');
  }
  return data;
};
