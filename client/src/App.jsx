import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './global_styles/App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthLayout from './pages/auth/AuthLayout'
import Login from './pages/auth/forms/Login'
import Register from './pages/auth/forms/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Nav from './components/nav/Nav'
import Footer from './components/footer/Footer'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}

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
      <div className="app-content" style={{ paddingTop: isAuthRoute ? 0 : '80px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <AuthLayout activeTab="login">
                <Login />
              </AuthLayout>
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <AuthLayout activeTab="signup">
                <Register />
              </AuthLayout>
            </PublicRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
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
