import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { AuthStorage } from '../utils/authStorage';

interface RegistrationGuardProps {
  children: React.ReactNode;
}

const RegistrationGuard: React.FC<RegistrationGuardProps> = ({ children }) => {
  const { user, isAuthenticated, hasCheckedLocalStorage } = useAppSelector((state) => state.auth);

  // Check if localStorage has valid auth data
  const hasValidLocalStorage = AuthStorage.isUserDataValid();

  // If localStorage is invalid but Redux still shows authenticated, 
  // it means localStorage was manually cleared - redirect to login
  if (isAuthenticated && !hasValidLocalStorage) {
    return <Navigate to="/auth/login" replace />;
  }

  // If we haven't checked localStorage yet, show loading
  // This prevents redirects during initialization
  if (!hasCheckedLocalStorage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after localStorage check, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // If user exists but hasn't completed registration (completedSteps < 3), redirect to registration
  if (user && (user as any).completedSteps !== undefined && (user as any).completedSteps < 3) {
    return <Navigate to="/auth/register" replace />;
  }

  // If registration is complete and user is authenticated, allow access to protected routes
  // This ensures that protected routes stay on the same page during refresh
  return <>{children}</>;
};

export default RegistrationGuard; 