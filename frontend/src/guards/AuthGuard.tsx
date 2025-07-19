import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  // No need to call checkAuth here anymore - AuthInitializer handles it

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // If user exists but hasn't completed registration, redirect to registration
  if (user && (user as any).completedSteps !== undefined && (user as any).completedSteps < 3) {
    return <Navigate to="/auth/register" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
