import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './global_styles/App.css'
import { AuthProvider } from './context/AuthContext'
import AuthLayout from './pages/auth/AuthLayout'
import Nav from './components/nav/Nav'
import Footer from './components/footer/Footer'
import ProtectedRoute from './components/protected_route/ProtectedRoute'
import PublicRoute from './components/public_route/PublicRoute'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
}

const pageTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1]
}

const Login = lazy(() => import('./pages/auth/forms/Login'))
const Register = lazy(() => import('./pages/auth/forms/Register'))
const Forgot = lazy(() => import('./pages/auth/forms/Forgot'))
const Verify = lazy(() => import('./pages/auth/forms/Verify'))
const Home = lazy(() => import('./pages/home/Home'))
const History = lazy(() => import('./pages/history/History'))
const Security = lazy(() => import('./pages/security/Security'))
const NotFound = lazy(() => import('./pages/not_found/NotFound'))
const AuthRequired = lazy(() => import('./pages/auth_required/AuthRequired'))
const Account = lazy(() => import('./pages/manage_account/Account'))
const About = lazy(() => import('./pages/about/About'))
const Services = lazy(() => import('./pages/services/Services'))
const News = lazy(() => import('./pages/news/News'))
const Download = lazy(() => import('./pages/download/Download'))

function AppContent() {
  const location = useLocation();
  const isAuthRoute = ['/login', '/signup', '/forgot-password', '/verify-email'].includes(location.pathname);

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
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="page-transition-wrapper"
          >
            <Suspense>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/news" element={<News />} />
                <Route path="/download" element={<Download />} />
                <Route path="/tests" element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } />
                <Route path="/security" element={
                  <ProtectedRoute>
                    <Security />
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
                <Route path="/forgot-password" element={
                  <AuthLayout activeTab="forgot"><Forgot /></AuthLayout>
                } />
                <Route path="/verify-email" element={
                  <AuthLayout activeTab="verify"><Verify /></AuthLayout>
                } />
                <Route path="/auth-required" element={<AuthRequired />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
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
