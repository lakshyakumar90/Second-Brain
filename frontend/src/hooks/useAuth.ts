import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setUser, 
  setIsAuthenticated, 
  loginSuccess, 
  logoutSuccess,
  setAuthLoading 
} from '../store/slices/authSlice';
import { setRegistrationState } from '../store/slices/registrationSlice';
import { authApi } from '../services/authApi';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(setAuthLoading(true));
      const response = await authApi.login(email, password);
      
      // Token is automatically stored as httpOnly cookie by backend
      // No need to manually store it in localStorage
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
      dispatch(logoutSuccess());
    }
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    try {
      dispatch(setAuthLoading(true));
      
      // Try to get current user - if successful, user is authenticated
      // (cookie is sent automatically with credentials: 'include')
      const response = await authApi.getCurrentUser();
      dispatch(setUser(response as any));
      dispatch(setIsAuthenticated(true));
      
      // If user hasn't completed all registration steps, update registration state
      const userData = response as any;
      if (userData.completedSteps !== undefined && userData.completedSteps < 3) {
        dispatch(setRegistrationState({
          currentStep: getRegistrationStepFromUserData(userData),
          email: userData.email || '',
          isLoading: false,
          error: null,
          isEmailVerified: userData.emailVerified || false,
        }));
      }
    } catch (error) {
      // If getCurrentUser fails, user is not authenticated
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch]);

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
    login,
    logout,
    checkAuth,
  };
};
