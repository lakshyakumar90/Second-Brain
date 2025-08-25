import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setUser, 
  setIsAuthenticated, 
  loginSuccess, 
  logoutSuccess,
  setAuthLoading,
  updateUserData,
  resetAuth
} from '../store/slices/authSlice';
import { authApi } from '../services/authApi';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(setAuthLoading(true));
      const response = await authApi.login(email, password);
      
      // Token is automatically stored as httpOnly cookie by backend
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

  // Check authentication by making API call
  const checkAuth = useCallback(async () => {
    try {
      dispatch(setAuthLoading(true));
      
      const userData = await authApi.getCurrentUser();
      dispatch(setUser(userData as any));
      dispatch(setIsAuthenticated(true));
      
      return { success: true, user: userData };
    } catch (error: any) {
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
      return { success: false, error: error.message };
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch]);

  // Refresh user data from API
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getCurrentUser();
      dispatch(setUser(userData as any));
      return { success: true, user: userData };
    } catch (error: any) {
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Update user profile
  const updateProfile = useCallback(async (profileData: any) => {
    try {
      const updatedUser = await authApi.updateProfile(profileData);
      dispatch(updateUserData(updatedUser as any));
      return { success: true, user: updatedUser };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Reset auth state
  const resetAuthState = useCallback(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    refreshUser,
    updateProfile,
    resetAuthState,
  };
};
