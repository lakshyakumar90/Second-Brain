import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { AuthStorage } from '../utils/authStorage';
import { logoutSuccess } from '../store/slices/authSlice';

interface AuthInitializerProps {
  children: React.ReactNode;
}

// Track if this is the first visit or a refresh
const isInitialVisit = !sessionStorage.getItem('app_visited');

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { checkAuth, checkAuthFromStorage, willExpireSoon, logout, heartbeatCheck } = useAuth();
  const { isLoading, hasCheckedLocalStorage, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // Mark that the app has been visited in this session
  useEffect(() => {
    if (isInitialVisit) {
      sessionStorage.setItem('app_visited', 'true');
    }
  }, []);

  // Check for localStorage/Redux mismatch (manual localStorage clearing)
  useEffect(() => {
    const checkLocalStorageMismatch = () => {
      const hasValidLocalStorage = AuthStorage.isUserDataValid();
      
      // If Redux shows authenticated but localStorage is invalid, clear Redux state
      if (isAuthenticated && !hasValidLocalStorage) {
        console.log('localStorage manually cleared, updating auth state');
        dispatch(logoutSuccess());
      }
    };

    // Check on every render after initial load
    if (hasCheckedLocalStorage) {
      checkLocalStorageMismatch();
    }

    // Also set up an interval to periodically check for manual localStorage clearing
    const interval = setInterval(checkLocalStorageMismatch, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, hasCheckedLocalStorage, dispatch]);

  // Heartbeat check for cookie validation (detects cookie clearing)
  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return;

    const performHeartbeat = async () => {
      const result = await heartbeatCheck();
      if (!result.success && result.reason === 'authentication_failed') {
        console.log('Heartbeat detected invalid authentication - cookies likely cleared');
        // The heartbeatCheck already calls logoutSuccess(), so just log here
      }
    };

    // Initial heartbeat check after 10 seconds (give time for app to stabilize)
    const initialTimeout = setTimeout(performHeartbeat, 10000);

    // Periodic heartbeat check every 2 minutes to detect cookie clearing
    const heartbeatInterval = setInterval(performHeartbeat, 2 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(heartbeatInterval);
    };
  }, [isAuthenticated, isInitialized, heartbeatCheck]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have valid localStorage data
        const hasValidStorage = AuthStorage.isUserDataValid();
        const hasGuestData = AuthStorage.hasGuestSession();
        
        if (isInitialVisit) {
          // Initial visit - always make API call to check for cookies
          console.log('Initial visit - checking authentication via API');
          try {
            await checkAuth(false);
            
            // If API call succeeds (user is logged in), user data is stored
            // If API call fails (user not logged in), store guest session
            const stillNotAuthenticated = !AuthStorage.isUserDataValid();
            if (stillNotAuthenticated) {
              AuthStorage.setGuestSession();
            }
          } catch (error) {
            // API call failed - user is not logged in, store guest session
            AuthStorage.setGuestSession();
          }
        } else {
          // Page refresh - only check localStorage, DO NOT make API call
          console.log('Page refresh - checking localStorage only');
          
          if (hasValidStorage) {
            // User is logged in - load from localStorage
            checkAuthFromStorage();
            
            // Check if data will expire soon and refresh in background
            if (willExpireSoon()) {
              checkAuth(true).catch(console.error);
            }
          } else if (hasGuestData) {
            // User is not logged in but has guest session - stay in guest mode
            console.log('Guest session found - staying in guest mode');
            checkAuthFromStorage(); // This will set isAuthenticated to false
          } else {
            // No localStorage data at all - treat as guest
            AuthStorage.setGuestSession();
            checkAuthFromStorage();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Fallback to guest session
        AuthStorage.setGuestSession();
      } finally {
        setIsInitialized(true);
      }
    };

    // Only initialize if we haven't checked localStorage yet
    if (!hasCheckedLocalStorage) {
      initializeAuth();
    } else {
      setIsInitialized(true);
    }
  }, [checkAuth, checkAuthFromStorage, hasCheckedLocalStorage, willExpireSoon]);

  // Handle unauthorized events from API service
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('Unauthorized access detected, logging out user');
      logout();
      
      // Store guest session after logout
      AuthStorage.setGuestSession();
      
      // Optional: Show a toast notification
      // You can integrate with your notification system here
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/auth')) {
        // Optionally redirect to login with return URL
        window.location.href = '/auth/login';
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Background refresh for authenticated users (every 30 minutes)
  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return;

    const backgroundRefresh = () => {
      // Only refresh if localStorage is still valid
      if (AuthStorage.isUserDataValid()) {
        // Silent refresh - don't show loading spinner
        checkAuth(true).catch(console.error);
      }
    };

    // Refresh every 30 minutes for authenticated users
    const interval = setInterval(backgroundRefresh, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isInitialized, checkAuth]);

  // Listen for storage events (when localStorage is cleared in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // If the auth storage key was removed in another tab
      if (e.key === 'neuemonicore_auth' && e.newValue === null) {
        console.log('localStorage cleared in another tab, logging out');
        dispatch(logoutSuccess());
        AuthStorage.setGuestSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);

  // Show loading spinner only during initial visit when we have no localStorage data
  if (!isInitialized || (isLoading && !hasCheckedLocalStorage && isInitialVisit)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Initializing application...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isInitialVisit ? 'Checking authentication...' : 'Loading from cache...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer; 