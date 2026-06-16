import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global_styles/index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/theme_context.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
