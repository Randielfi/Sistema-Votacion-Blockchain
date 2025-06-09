import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  observerOnly?: boolean;
  voterOnly?: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false, observerOnly = false, voterOnly = false, children }) => {
  const { isAuthenticated, isAdmin, isObserver, user, loadingAuth } = useAuth();

    if (loadingAuth) {
      // Mientras AuthContext está cargando → no hacemos redirect
      return <div className="text-white p-6">Cargando autenticación...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
      return <Navigate to="/login" replace />;
    }

    if (observerOnly && !isObserver) {
      return <Navigate to="/login" replace />;
    }

    if (voterOnly && user?.role !== 'Voter') {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
