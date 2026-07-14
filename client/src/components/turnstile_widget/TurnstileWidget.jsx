import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './TurnstileWidget.css';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

// When no site key is configured the widget disables itself (dev fail-open):
// it renders nothing and forms should not block submission on the captcha.
const isTurnstileEnabled = Boolean(TURNSTILE_SITE_KEY);

/**
 * Cloudflare Turnstile widget (a privacy-friendly reCAPTCHA alternative).
 *
 * The Cloudflare script is loaded once in index.html. This component renders
 * the widget explicitly via window.turnstile.render so it can be reset after
 * each submit (tokens are single-use).
 *
 * Props:
 * - onVerify(token): called when a token is issued
 * - onExpire(): called when the token expires
 * - onError(): called on challenge error
 * - theme: 'auto' | 'light' | 'dark' (default 'auto')
 * - action: optional string label for analytics
 *
 * Ref API: { reset(), getResponse() }
 */
const TurnstileWidget = forwardRef(function TurnstileWidget(
  { onVerify, onExpire, onError, theme = 'auto', action, className = '' },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          // ignore reset errors on an already-removed widget
        }
      }
    },
    getResponse: () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        return window.turnstile.getResponse(widgetIdRef.current) || '';
      }
      return '';
    },
  }), []);

  useEffect(() => {
    if (!isTurnstileEnabled) return undefined;

    let cancelled = false;
    let pollId;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
      if (!window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme,
        action,
        callback: (token) => onVerify?.(token),
        'expired-callback': () => onExpire?.(),
        'error-callback': () => onError?.(),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      pollId = setInterval(() => {
        if (window.turnstile) {
          clearInterval(pollId);
          pollId = undefined;
          renderWidget();
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore removal errors
        }
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, action]);

  if (!isTurnstileEnabled) return null;

  return (
    <div className={`turnstile-akovolabs-recapture_wrapper ${className}`.trim()}>
      <div ref={containerRef} className="turnstile-akovolabs-recapture_widget" />
    </div>
  );
});

export default TurnstileWidget;
