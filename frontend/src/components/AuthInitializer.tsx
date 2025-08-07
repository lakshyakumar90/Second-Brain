import React, { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { authApi } from '../services/authApi';
import { setUser, setIsAuthenticated, setAuthLoading, loadFromLocalStorage } from '../store/slices/authSlice';
import { AuthStorage } from '../utils/authStorage';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let hasRun = false; // Prevent multiple runs

    const initializeAuth = async () => {
      if (hasRun) return; // Prevent multiple executions
      hasRun = true;

      try {
        console.log('Starting single auth check...');
        dispatch(setAuthLoading(true));

        // Check localStorage first
        const storedUser = AuthStorage.getUser();
        if (storedUser) {
          console.log('Using stored user data, no API call needed');
          dispatch(setUser(storedUser));
          dispatch(setIsAuthenticated(true));
          dispatch(loadFromLocalStorage());
          return;
        }

        // Make single API call
        console.log('Making API call to check authentication...');
        try {
          const userData = await authApi.getCurrentUserQuick();
          console.log('API call successful, user authenticated');
          dispatch(setUser(userData));
          dispatch(setIsAuthenticated(true));
        } catch (error: any) {
          console.log('API call failed, setting guest mode');
          dispatch(setUser(null));
          dispatch(setIsAuthenticated(false));
          AuthStorage.setGuestSession();
        }

        // Mark as checked
        dispatch(loadFromLocalStorage());
        console.log('Auth check completed');
      } catch (error) {
        console.error("Auth initialization error:", error);
        dispatch(setUser(null));
        dispatch(setIsAuthenticated(false));
        AuthStorage.setGuestSession();
        dispatch(loadFromLocalStorage());
      } finally {
        dispatch(setAuthLoading(false));

      }
    };

    // Only run once
    initializeAuth();

    return () => {
      // Cleanup if needed
    };
  }, []); // Empty dependency array - runs only once

  return <>{children}</>;
};

export default AuthInitializer; 