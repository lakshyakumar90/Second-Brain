import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../store/hooks';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { checkAuth } = useAuth();
  const { isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status when app initializes
    checkAuth();
  }, [checkAuth]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer; 