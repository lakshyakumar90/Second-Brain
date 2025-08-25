import React, { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { authApi } from '../services/authApi';
import { setUser, setIsAuthenticated, setAuthLoading } from '../store/slices/authSlice';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication on page load...');
        dispatch(setAuthLoading(true));

        // Always make API call to check authentication
        const userData = await authApi.getCurrentUser();
        console.log('Authentication successful:', userData);
        
        dispatch(setUser(userData as any));
        dispatch(setIsAuthenticated(true));
      } catch (error: any) {
        console.log('Authentication failed:', error.message);
        dispatch(setUser(null));
        dispatch(setIsAuthenticated(false));
      } finally {
        dispatch(setAuthLoading(false));
      }
    };

    checkAuth();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer; 