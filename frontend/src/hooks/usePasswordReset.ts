import { useState, useCallback } from 'react';
import { authApi } from '../services/authApi';

interface PasswordResetState {
  currentStep: number; // 1: Enter Email, 2: Verify OTP, 3: New Password
  email: string;
  isLoading: boolean;
  error: string | null;
  isOTPVerified: boolean;
}

const initialState: PasswordResetState = {
  currentStep: 1,
  email: '',
  isLoading: false,
  error: null,
  isOTPVerified: false,
};

export const usePasswordReset = () => {
  const [passwordResetState, setPasswordResetState] = useState<PasswordResetState>(initialState);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      setPasswordResetState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await authApi.forgotPassword(email);
      
      setPasswordResetState(prev => ({
        ...prev,
        currentStep: 2,
        email,
        isLoading: false,
      }));
      
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error: any) {
      setPasswordResetState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return { success: false, error: error.message };
    }
  }, []);

  const verifyPasswordResetOTP = useCallback(async (otp: string) => {
    try {
      setPasswordResetState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await authApi.verifyPasswordResetOTP({ 
        email: passwordResetState.email, 
        otp 
      });
      
      setPasswordResetState(prev => ({
        ...prev,
        currentStep: 3,
        isOTPVerified: true,
        isLoading: false,
      }));
      
      return { success: true, message: 'OTP verified successfully' };
    } catch (error: any) {
      setPasswordResetState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return { success: false, error: error.message };
    }
  }, [passwordResetState.email]);

  const resetPassword = useCallback(async (newPassword: string) => {
    try {
      setPasswordResetState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await authApi.resetPassword({ 
        email: passwordResetState.email, 
        newPassword 
      });
      
      // Reset to initial state after successful password reset
      setPasswordResetState(initialState);
      
      return { success: true, message: 'Password reset successful' };
    } catch (error: any) {
      setPasswordResetState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return { success: false, error: error.message };
    }
  }, [passwordResetState.email]);

  const resendPasswordResetOTP = useCallback(async () => {
    try {
      setPasswordResetState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await authApi.forgotPassword(passwordResetState.email);
      
      setPasswordResetState(prev => ({ ...prev, isLoading: false }));
      return { success: true, message: 'OTP resent successfully' };
    } catch (error: any) {
      setPasswordResetState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return { success: false, error: error.message };
    }
  }, [passwordResetState.email]);

  const resetPasswordResetState = useCallback(() => {
    setPasswordResetState(initialState);
  }, []);

  return {
    passwordResetState,
    requestPasswordReset,
    verifyPasswordResetOTP,
    resetPassword,
    resendPasswordResetOTP,
    resetPasswordResetState,
  };
}; 