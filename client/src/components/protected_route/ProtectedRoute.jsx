import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../loading/Loading';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/auth-required" replace />;
  }

  return children;
}

export default ProtectedRoute;
