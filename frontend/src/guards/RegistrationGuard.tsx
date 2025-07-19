import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface RegistrationGuardProps {
  children: React.ReactNode;
}

const RegistrationGuard: React.FC<RegistrationGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // If user exists but hasn't completed registration (completedSteps < 3), redirect to registration
  if (user && (user as any).completedSteps !== undefined && (user as any).completedSteps < 3) {
    return <Navigate to="/auth/register" replace />;
  }

  // If registration is complete, allow access
  return <>{children}</>;
};

export default RegistrationGuard; 