import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './global_styles/App.css'
import { AuthProvider } from './context/AuthContext'
import AuthLayout from './pages/auth/AuthLayout'
import Login from './pages/auth/forms/Login'
import Register from './pages/auth/forms/Register'
import Home from './pages/home/Home'
import History from './pages/history/History'
import Nav from './components/nav/Nav'
import Footer from './components/footer/Footer'
import NotFound from './pages/not_found/NotFound'
import AuthRequired from './pages/auth_required/AuthRequired'
import Account from './pages/manage_account/Account'
import ProtectedRoute from './components/protected_route/ProtectedRoute'
import PublicRoute from './components/public_route/PublicRoute'

function AppContent() {
  const location = useLocation();
  const isAuthRoute = ['/login', '/signup'].includes(location.pathname);

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

      {/* Navbar - Only on non-auth routes */}
      {!isAuthRoute && <Nav />}

      {/* Main Content */}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tests" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <AuthLayout activeTab="login"><Login /></AuthLayout>
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <AuthLayout activeTab="signup"><Register /></AuthLayout>
            </PublicRoute>
          } />
          <Route path="/auth-required" element={<AuthRequired />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Footer - Only on non-auth routes */}
      {!isAuthRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
