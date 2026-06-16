import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './global_styles/App.css'
import AuthLayout from './pages/auth/AuthLayout'
import Login from './pages/auth/forms/Login'
import Register from './pages/auth/forms/Register'

function App() {
  return (
    <div className="app-shell">
      {/* Background Layers */}
      <div className="background-canvas">
        <div className="network-grid"></div>
        <div className="stars-container">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                '--i': i,
                '--size': `${Math.random() * 3 + 1}px`,
                '--top': `${Math.random() * 100}%`,
                '--left': `${Math.random() * 100}%`,
                '--duration': `${Math.random() * 10 + 15}s`,
                '--delay': `${Math.random() * 10}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="app-content">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <AuthLayout activeTab="login">
                <Login />
              </AuthLayout>
            } />
            <Route path="/signup" element={
              <AuthLayout activeTab="signup">
                <Register />
              </AuthLayout>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}

export default App
