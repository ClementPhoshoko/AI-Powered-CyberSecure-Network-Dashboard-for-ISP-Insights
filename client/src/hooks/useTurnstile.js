import { useState, useRef, useCallback } from 'react';

// Mirrors the widget's own check: when no site key is configured the captcha is
// disabled (dev fail-open) and forms must not block submission on it.
const isTurnstileEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

/**
 * Manages a single Turnstile widget's token + reset lifecycle.
 *
 * Usage:
 *   const captcha = useTurnstile();
 *   <TurnstileWidget
 *     ref={captcha.widgetRef}
 *     onVerify={captcha.handleVerify}
 *     onExpire={captcha.handleExpire}
 *     onError={captcha.handleError}
 *   />
 *
 * Gate submission with `captcha.enabled && !captcha.token`, pass
 * `captcha.token` to the backend, and call `captcha.reset()` after every
 * submit (tokens are single-use).
 */
export function useTurnstile() {
  const [token, setToken] = useState('');
  const widgetRef = useRef(null);

  const handleVerify = useCallback((t) => setToken(t || ''), []);
  const handleExpire = useCallback(() => setToken(''), []);
  const handleError = useCallback(() => setToken(''), []);

  const reset = useCallback(() => {
    setToken('');
    widgetRef.current?.reset();
  }, []);

  return {
    token,
    widgetRef,
    enabled: isTurnstileEnabled,
    handleVerify,
    handleExpire,
    handleError,
    reset,
  };
}

export default useTurnstile;
