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
import { setRegistrationState } from '../store/slices/registrationSlice';
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

  // Enhanced checkAuth that uses localStorage first
  const checkAuth = useCallback(async (forceApiCall: boolean = false) => {
    try {
      dispatch(setAuthLoading(true));

      // First, try to load from localStorage if we haven't checked yet
      if (!hasCheckedLocalStorage && !forceApiCall) {
        const storedUser = AuthStorage.getUser();
        if (storedUser) {
          // User data found in localStorage and not expired
          dispatch(setAuthFromStorage({ user: storedUser }));
          
          // Update registration state if needed
          if (storedUser.completedSteps !== undefined && storedUser.completedSteps < 3) {
            dispatch(setRegistrationState({
              currentStep: getRegistrationStepFromUserData(storedUser),
              email: storedUser.email || '',
              isLoading: false,
              error: null,
              isEmailVerified: storedUser.emailVerified || false,
            }));
          }
          
          return; // Exit early, no API call needed
        } else {
          // No valid localStorage data, mark as checked
          dispatch(loadFromLocalStorage());
        }
      }

      // If localStorage check failed or force API call is requested
      if (forceApiCall || !AuthStorage.isUserDataValid()) {
        // Try to get current user from API
        // (cookie is sent automatically with credentials: 'include')
        const response = await authApi.getCurrentUser();
        const userData = response as any;
        
        dispatch(setUser(userData));
        dispatch(setIsAuthenticated(true));
        
        // If user hasn't completed all registration steps, update registration state
        if (userData.completedSteps !== undefined && userData.completedSteps < 3) {
          dispatch(setRegistrationState({
            currentStep: getRegistrationStepFromUserData(userData),
            email: userData.email || '',
            isLoading: false,
            error: null,
            isEmailVerified: userData.emailVerified || false,
          }));
        }
      }
    } catch (error) {
      // If API call fails, user is not authenticated
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
      // Also clear any stale localStorage data
      AuthStorage.removeUser();
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch, hasCheckedLocalStorage]);

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

  // Helper function to determine frontend registration step from user data
  const getRegistrationStepFromUserData = (userData: any): number => {
    const { completedSteps, emailVerified, name, username } = userData;
    
    // Step 1: Email/password (if completedSteps = 0)
    if (completedSteps === 0) return 1;
    
    // Step 2: OTP verification (if email not verified)
    if (completedSteps === 1 || !emailVerified) return 2;
    
    // Step 4: Profile completion (if name and username are set)
    if (name && username) return 4;
    
    // Step 3: Name/username (if email verified but no name/username)
    if (completedSteps === 2) return 3;
    
    // Fallback to step 1
    return 1;
  };

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
