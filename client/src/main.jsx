import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global_styles/index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import LanguageProvider from './providers/LanguageProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
