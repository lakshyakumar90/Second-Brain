import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { AuthStorage } from '../utils/authStorage';

interface GuestGuardProps {
  children: React.ReactNode;
}

const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { user, isAuthenticated, hasCheckedLocalStorage } = useAppSelector((state) => state.auth);

  // Check if localStorage has valid auth data
  const hasValidLocalStorage = AuthStorage.isUserDataValid();

  // If localStorage is invalid but Redux still shows authenticated,
  // it means localStorage was manually cleared - don't redirect, let it fall through to children
  if (isAuthenticated && !hasValidLocalStorage) {
    // Don't redirect here, let the app handle the invalid state
    // The AuthInitializer will detect this and clear the Redux state
    return <>{children}</>;
  }

  // If we haven't checked localStorage yet, wait for initialization
  if (!hasCheckedLocalStorage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Initializing...</p>
        </div>
      </div>
    );
  }

  // After localStorage check, if authenticated with valid storage
  if (isAuthenticated && hasValidLocalStorage) {
    // If user has completed registration, redirect to home
    if (user && (user as any).completedSteps === 3) {
      return <Navigate to="/home" replace />;
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
