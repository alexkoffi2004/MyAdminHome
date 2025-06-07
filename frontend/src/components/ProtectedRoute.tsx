import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'citizen' | 'agent' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute:', {
    isAuthenticated,
    userRole: user?.role,
    requiredRole: userType,
    currentPath: location.pathname
  });

  // Si nous sommes sur la page de confirmation de paiement, permettre l'accès
  if (location.pathname.includes('/payment/confirm/')) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si un type d'utilisateur est spécifié, vérifier que l'utilisateur a le bon rôle
  if (userType && user?.role !== userType) {
    // Ne rediriger que si l'utilisateur n'a pas le bon rôle
    const roleBasedPath = `/${user?.role}/dashboard`;
    return <Navigate to={roleBasedPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 