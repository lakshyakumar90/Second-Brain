import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { 
  setRegistrationState, 
  registrationStep1Success,
  registrationStep2Success,
  registrationComplete 
} from "../store/slices/registrationSlice";
import { loginSuccess } from "../store/slices/authSlice";
import { authApi } from "../services/authApi";

export const useRegistration = () => {
  const dispatch = useAppDispatch();
  const registrationState = useAppSelector((state) => state.registration);

  const registerStep1 = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch(setRegistrationState({
          email,
          isLoading: true,
          error: null,
        }));

        await authApi.registerStep1({ email, password });
        // Token is automatically stored as httpOnly cookie by backend
        dispatch(registrationStep1Success(email));

        return { success: true, message: "Registration successful" };
      } catch (error: any) {
        dispatch(setRegistrationState({
          isLoading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }
    },
    [dispatch]
  );

  const verifyOTP = useCallback(
    async (otp: string) => {
      try {
        dispatch(setRegistrationState({ isLoading: true, error: null }));

        await authApi.verifyOTP({
          email: registrationState.email,
          otp,
        });

        dispatch(setRegistrationState({
          currentStep: 3,
          isEmailVerified: true,
          isLoading: false,
        }));

        return { success: true };
      } catch (error: any) {
        dispatch(setRegistrationState({
          isLoading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }
    },
    [registrationState.email, dispatch]
  );

  const resendOTP = useCallback(
    async () => {
      try {
        dispatch(setRegistrationState({ isLoading: true, error: null }));

        await authApi.resendOTP(registrationState.email);

        dispatch(setRegistrationState({ isLoading: false }));
        return { success: true };
      } catch (error: any) {
        dispatch(setRegistrationState({
          isLoading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }
    },
    [registrationState.email, dispatch]
  );

  const registerStep2 = useCallback(
    async (name: string, username: string) => {
      try {
        dispatch(setRegistrationState({
          isLoading: true,
          error: null,
        }));

        await authApi.registerStep2({ name, username });

        // Token is automatically stored as httpOnly cookie by backend
        dispatch(registrationStep2Success());

        return { success: true };
      } catch (error: any) {
        dispatch(setRegistrationState({
          isLoading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }
    },
    [dispatch]
  );

  const registerStep3 = useCallback(
    async (data: {
      avatar?: string;
      bio?: string;
      theme: "light" | "dark" | "system";
      emailNotifications: boolean;
    }) => {
      try {
        dispatch(setRegistrationState({
          isLoading: true,
          error: null,
        }));

        const response = await authApi.registerStep3(data);

        // Token is automatically stored as httpOnly cookie by backend
        dispatch(loginSuccess((response as any).user));

        dispatch(registrationComplete());

        return { success: true };
      } catch (error: any) {
        dispatch(setRegistrationState({
          isLoading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }
    },
    [dispatch]
  );

  const resetRegistration = useCallback(() => {
    dispatch(registrationComplete());
  }, [dispatch]);

  return {
    registrationState,
    registerStep1,
    verifyOTP,
    resendOTP,
    registerStep2,
    registerStep3,
    resetRegistration,
  };
};
