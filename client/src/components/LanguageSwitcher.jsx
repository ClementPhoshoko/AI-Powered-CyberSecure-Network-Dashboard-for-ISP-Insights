import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

const languages = [
  { code: 'en', nativeName: 'English' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'af', nativeName: 'Afrikaans' },
  { code: 'zu', nativeName: 'isiZulu' },
]

export default function LanguageSwitcher({ variant = 'desktop', onOpenChange, closeToken }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const prevToken = useRef(closeToken)

  const current = languages.find((l) => l.code === i18n.language) || languages[0]

  // Close when another dropdown forces it
  useEffect(() => {
    if (closeToken !== undefined && closeToken !== prevToken.current) {
      setOpen(false)
      prevToken.current = closeToken
    }
  }, [closeToken])

  // Notify parent of open state changes
  useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSelect = (code) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  if (variant === 'mobile') {
    return (
      <div className="ls-mobile" ref={ref}>
        <button
          className="ls-mobile-btn"
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          <div className="ls-mobile-btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="ls-mobile-btn-text">
            <span className="ls-mobile-btn-label">Language</span>
            <span className="ls-mobile-btn-desc">{current.nativeName}</span>
          </div>
        </button>

        {open && (
          <>
            <div className="ls-mobile-overlay" onClick={() => setOpen(false)} />
            <div className="ls-mobile-dropdown">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`ls-mobile-option ${lang.code === current.code ? 'ls-mobile-option--active' : ''}`}
                  onClick={() => handleSelect(lang.code)}
                  type="button"
                >
                  <span className="ls-mobile-option-code">{lang.code.toUpperCase()}</span>
                  <span className="ls-mobile-option-name">{lang.nativeName}</span>
                  {lang.code === current.code && (
                    <svg className="ls-mobile-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="ls-desktop" ref={ref}>
      <button
        className={`ls-trigger ${open ? 'ls-trigger--open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
        aria-label={`Current language: ${current.nativeName}`}
      >
        <span className="ls-trigger-code">{current.code.toUpperCase()}</span>
        <svg
          className={`ls-trigger-chevron ${open ? 'ls-trigger-chevron--open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="ls-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`ls-option ${lang.code === current.code ? 'ls-option--active' : ''}`}
              onClick={() => handleSelect(lang.code)}
              type="button"
            >
              <span className="ls-option-code">{lang.code.toUpperCase()}</span>
              <span className="ls-option-name">{lang.nativeName}</span>
              {lang.code === current.code && (
                <svg className="ls-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
