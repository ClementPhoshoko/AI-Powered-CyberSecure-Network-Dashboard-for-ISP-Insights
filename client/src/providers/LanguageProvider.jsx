import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '../../i18n/index.js'

export default function LanguageProvider({ children }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    const handle = (lng) => {
      document.documentElement.lang = lng
    }
    i18n.on('languageChanged', handle)
    return () => i18n.off('languageChanged', handle)
  }, [i18n])

  useEffect(() => {
    const handle = (lng) => {
      document.documentElement.setAttribute('data-switching-lang', '')
      setTimeout(() => {
        document.documentElement.removeAttribute('data-switching-lang')
      }, 200)
    }
    i18n.on('languageChanged', handle)
    return () => i18n.off('languageChanged', handle)
  }, [i18n])

  return children
}
