export interface User {
    _id: string;
    name: string;
    email: string;
    username?: string;
    avatar?: string;
    bio?: string;
    role: string;
    completedSteps: number;
    isVerified: boolean;
    isActive: boolean;
    emailVerified: boolean;
    preferences: {
      theme: 'light' | 'dark' | 'system';
      emailNotifications: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface RegistrationStep1Data {
    email: string;
    password: string;
  }
  
  export interface OTPVerificationData {
    email: string;
    otp: string;
  }
  
  export interface RegistrationStep2Data {
    name: string;
    username: string;
  }
  
  export interface RegistrationStep3Data {
    avatar?: string;
    bio?: string;
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface RegistrationState {
    currentStep: number;
    email: string;
    isLoading: boolean;
    error: string | null;
    isEmailVerified: boolean;
  }
  
  export interface AuthError {
    message: string;
    field?: string;
  } 