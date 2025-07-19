import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface GuestGuardProps {
  children: React.ReactNode;
}

const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    // If user has completed registration, redirect to dashboard
    if (user && (user as any).completedSteps === 3) {
    return <Navigate to="/dashboard" replace />;
    }
    // If user hasn't completed registration, allow access to auth routes to complete registration
    // but redirect from landing page to registration
    if (window.location.pathname === '/') {
      return <Navigate to="/auth/register" replace />;
    }
  }

  return <>{children}</>;
};

export default GuestGuard;
