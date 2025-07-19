import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RegistrationState } from '../../types/auth';

const initialState: RegistrationState = {
  currentStep: 1,
  email: '',
  isLoading: false,
  error: null,
  isEmailVerified: false,
};

export const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setRegistrationState: (state, action: PayloadAction<Partial<RegistrationState>>) => {
      return { ...state, ...action.payload };
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setRegistrationLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setIsEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.isEmailVerified = action.payload;
    },
    resetRegistration: () => {
      return initialState;
    },
    registrationStep1Success: (state, action: PayloadAction<string>) => {
      state.currentStep = 2;
      state.email = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    registrationStep2Success: (state) => {
      state.currentStep = 4;
      state.isLoading = false;
      state.error = null;
    },
    registrationComplete: () => {
      return initialState;
    },
  },
});

export const {
  setRegistrationState,
  setCurrentStep,
  setEmail,
  setRegistrationLoading,
  setError,
  setIsEmailVerified,
  resetRegistration,
  registrationStep1Success,
  registrationStep2Success,
  registrationComplete,
} = registrationSlice.actions;

export default registrationSlice.reducer; 