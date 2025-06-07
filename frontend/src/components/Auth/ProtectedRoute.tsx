import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'citizen') {
      return <Navigate to="/citizen/dashboard\" replace />;
    } else if (user.role === 'agent') {
      return <Navigate to="/agent/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard\" replace />;
    }
    
    // Fallback to home page if role is unknown
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;