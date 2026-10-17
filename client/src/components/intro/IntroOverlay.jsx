import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import './IntroOverlay.css';

function IntroOverlay() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [statementIndex, setStatementIndex] = useState(() => prefersReducedMotion ? 2 : 0);
  const [docking, setDocking] = useState(false);
  const dialogRef = useRef(null);
  const logoRef = useRef(null);
  const timersRef = useRef([]);
  const animationRef = useRef(null);
  const cleanupRef = useRef(null);
  const statements = [
    t('intro.statement1'),
    t('intro.statement2'),
    t('intro.statement3')
  ];

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const dismiss = () => {
    clearTimers();
    animationRef.current?.cancel();
    animationRef.current = null;
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return undefined;

    const root = document.documentElement;
    const bodyOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const backgroundNodes = Array.from(
      document.querySelectorAll('.nav-container, .app-content, .footer-container')
    );
    const previousBackgroundState = backgroundNodes.map((node) => ({
      node,
      inert: node.inert,
      ariaHidden: node.getAttribute('aria-hidden')
    }));
    let isCleanedUp = false;

    root.classList.add('app-intro-active');
    document.body.style.overflow = 'hidden';
    backgroundNodes.forEach((node) => {
      node.inert = true;
      node.setAttribute('aria-hidden', 'true');
    });
    dialogRef.current?.focus({ preventScroll: true });

    const schedule = (callback, delay) => {
      const timer = window.setTimeout(callback, delay);
      timersRef.current.push(timer);
      return timer;
    };

    const restoreBackground = () => {
      previousBackgroundState.forEach(({ node, inert, ariaHidden }) => {
        node.inert = inert;
        if (ariaHidden === null) node.removeAttribute('aria-hidden');
        else node.setAttribute('aria-hidden', ariaHidden);
      });
      document.body.style.overflow = bodyOverflow;
      root.classList.remove('app-intro-active');
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected && previousFocus !== document.body) {
        previousFocus.focus({ preventScroll: true });
      }
    };

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      clearTimers();
      animationRef.current?.cancel();
      animationRef.current = null;
      window.removeEventListener('keydown', onKeyDown);
      restoreBackground();
      if (cleanupRef.current === cleanup) cleanupRef.current = null;
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }

      if (event.key === 'Tab') {
        const dialog = dialogRef.current;
        if (dialog) {
          event.preventDefault();
          dialog.focus();
        }
      }
    };

    cleanupRef.current = cleanup;
    window.addEventListener('keydown', onKeyDown);

    if (prefersReducedMotion) {
      setStatementIndex(2);
      schedule(() => setVisible(false), 480);
    } else {
      schedule(() => setStatementIndex(1), 640);
      schedule(() => setStatementIndex(2), 1280);
      schedule(() => {
        setDocking(true);
        const logo = logoRef.current;
        const headerLogo = document.querySelector('.nav-container .nav-logo-icon');
        if (!logo || !headerLogo || typeof logo.animate !== 'function') {
          schedule(() => setVisible(false), 520);
          return;
        }

        try {
          const from = logo.getBoundingClientRect();
          const to = headerLogo.getBoundingClientRect();
          if (to.width <= 0 || to.height <= 0) {
            schedule(() => setVisible(false), 520);
            return;
          }

          const animation = logo.animate(
            [
              {
                left: `${from.left + from.width / 2}px`,
                top: `${from.top + from.height / 2}px`,
                width: `${from.width}px`,
                height: `${from.height}px`
              },
              {
                left: `${to.left + to.width / 2}px`,
                top: `${to.top + to.height / 2}px`,
                width: `${to.width}px`,
                height: `${to.height}px`
              }
            ],
            {
              duration: 620,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'forwards'
            }
          );
          animationRef.current = animation;
          animation.onfinish = () => {
            animationRef.current = null;
            setVisible(false);
          };
        } catch {
          schedule(() => setVisible(false), 320);
        }
      }, 1840);
      schedule(() => setVisible(false), 2900);
    }

    return cleanup;
  }, [visible, prefersReducedMotion]);

  return (
    <AnimatePresence onExitComplete={() => cleanupRef.current?.()}>
      {visible && (
        <motion.div
          className="app-intro-overlay"
          key="akovolabs-intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.12 : 0.28, ease: 'easeOut' }}
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-intro-title"
          aria-describedby="app-intro-statement"
        >
          <h1 className="app-intro-sr-only" id="app-intro-title">{t('intro.dialogLabel')}</h1>

          <div className="app-intro-brand" aria-hidden="true">
            <div className="app-intro-logo" ref={logoRef}>
              <img
                src={loginLogo}
                alt=""
                className="app-intro-logo-image"
                onError={dismiss}
              />
            </div>
          </div>

          <motion.div
            className="app-intro-copy"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={docking ? { opacity: 0, y: -6 } : { opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: 'easeOut' }}
          >
            <div className="nav-logo-text app-intro-wordmark">{t('app.name')}</div>
            <div className="app-intro-statements" aria-live="polite" aria-atomic="true">
              <p id="app-intro-statement">{statements[statementIndex]}</p>
            </div>

            {!prefersReducedMotion && (
              <div className="app-intro-step-indicator" aria-hidden="true">
                {statements.map((statement, index) => (
                  <span className={index === statementIndex ? 'is-active' : ''} key={statement} />
                ))}
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default IntroOverlay;
