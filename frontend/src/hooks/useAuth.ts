import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setUser, 
  setIsAuthenticated, 
  loginSuccess, 
  logoutSuccess,
  setAuthLoading,
  loadFromLocalStorage,
  updateUserData,
  setAuthFromStorage
} from '../store/slices/authSlice';
import { authApi } from '../services/authApi';
import { AuthStorage } from '../utils/authStorage';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, hasCheckedLocalStorage } = useAppSelector((state) => state.auth);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(setAuthLoading(true));
      const response = await authApi.login(email, password);
      
      // Token is automatically stored as httpOnly cookie by backend
      // Store user data in localStorage and Redux
      dispatch(loginSuccess((response as any).user));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Cookie is cleared by backend logout endpoint
      // localStorage is cleared by the logoutSuccess action
      dispatch(logoutSuccess());
    }
  }, [dispatch]);

  // Simple checkAuth that makes only one API call
  const checkAuth = useCallback(async (forceApiCall: boolean = false) => {
    console.log('checkAuth called, forceApiCall:', forceApiCall);
    
    try {
      dispatch(setAuthLoading(true));

      // First, try localStorage
      const storedUser = AuthStorage.getUser();
      console.log('Stored user found:', !!storedUser);
      
      if (storedUser && !forceApiCall) {
        console.log('Using stored user data, no API call needed');
        dispatch(setAuthFromStorage({ user: storedUser }));
        return;
      }

      // Make single API call only if no localStorage data or forced
      console.log('Making API call to check authentication...');
      try {
        // Use quick method for initial auth check (no retries, fast timeout)
        const response = forceApiCall ? 
          await authApi.getCurrentUser() : // Use retry version for forced calls
          await authApi.getCurrentUserQuick(); // Use quick version for initial check
        const userData = response as any;
        console.log('API call successful, user authenticated');
        
        dispatch(setUser(userData));
        dispatch(setIsAuthenticated(true));
      } catch (apiError: any) {
        console.log('API call failed, setting guest mode');
        dispatch(setUser(null));
        dispatch(setIsAuthenticated(false));
        AuthStorage.removeUser();
        AuthStorage.setGuestSession();
      }
      
      // Mark as checked regardless of outcome
      dispatch(loadFromLocalStorage());
      
    } catch (error: any) {
      console.log('Auth check error:', error.message);
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
      AuthStorage.setGuestSession();
      dispatch(loadFromLocalStorage());
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch]);

  // Quick authentication check using only localStorage
  const checkAuthFromStorage = useCallback(() => {
    dispatch(loadFromLocalStorage());
  }, [dispatch]);

  // Refresh user data from API (for critical operations)
  const refreshUserData = useCallback(async () => {
    try {
      dispatch(setAuthLoading(true));
      const response = await authApi.getCurrentUser();
      const userData = response as any;
      
      dispatch(setUser(userData));
      dispatch(setIsAuthenticated(true));
      
      return { success: true, user: userData };
    } catch (error: any) {
      // If refresh fails, user might be logged out
      dispatch(logoutSuccess());
      return { success: false, error: error.message };
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch]);

  // Update user profile (with localStorage sync)
  const updateProfile = useCallback(async (profileData: {
    name?: string;
    username?: string;
    email?: string;
    bio?: string;
    avatar?: string;
  }) => {
    try {
      dispatch(setAuthLoading(true));
      const response = await authApi.updateProfile(profileData);
      const updatedUser = response as any;
      
      // Update Redux state and localStorage
      dispatch(updateUserData(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch]);

  // Check if localStorage data will expire soon
  const willExpireSoon = useCallback(() => {
    return AuthStorage.willExpireSoon();
  }, []);

  // Get localStorage expiration time
  const getExpirationTime = useCallback(() => {
    return AuthStorage.getExpirationTime();
  }, []);

  // Heartbeat check to validate authentication with server (detects cookie clearing)
  const heartbeatCheck = useCallback(async () => {
    // Only check if we think we're authenticated and have localStorage data
    if (!isAuthenticated || !AuthStorage.isUserDataValid()) {
      return { success: false, reason: 'not_authenticated' };
    }

    try {
      // Make a lightweight API call to verify authentication
      await authApi.getCurrentUser();
      return { success: true };
    } catch (error: any) {
      console.log('Heartbeat failed - likely cookies cleared or expired');
      
      // If heartbeat fails, user is likely not authenticated (cookies cleared/expired)
      dispatch(logoutSuccess());
      
      return { success: false, reason: 'authentication_failed', error: error.message };
    }
  }, [isAuthenticated, dispatch]);



  return {
    user,
    isAuthenticated,
    isLoading,
    hasCheckedLocalStorage,
    login,
    logout,
    checkAuth,
    checkAuthFromStorage,
    refreshUserData,
    updateProfile,
    willExpireSoon,
    getExpirationTime,
    heartbeatCheck,
  };
};
