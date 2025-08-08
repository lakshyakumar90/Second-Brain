import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/auth';
import { AuthStorage } from '../../utils/authStorage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedLocalStorage: boolean; // Track if we've checked localStorage
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasCheckedLocalStorage: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Load user data from localStorage (without API call)
    loadFromLocalStorage: (state) => {
      const storedUser = AuthStorage.getUser();
      if (storedUser) {
        // User is logged in
        state.user = storedUser;
        state.isAuthenticated = true;
      } else {
        // User is not logged in
        state.user = null;
        state.isAuthenticated = false;
        
        // If no user data but also no guest session, create one
        if (!AuthStorage.hasGuestSession()) {
          AuthStorage.setGuestSession();
        }
      }
      state.hasCheckedLocalStorage = true;
      state.isLoading = false;
    },

    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      // Update localStorage when user changes
      if (action.payload) {
        AuthStorage.updateUser(action.payload);
      }
    },

    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      // Clear localStorage if user is no longer authenticated
      if (!action.payload) {
        AuthStorage.removeUser();
      }
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.hasCheckedLocalStorage = true;
      // Store in localStorage on successful login
      AuthStorage.setUser(action.payload);
    },

    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.hasCheckedLocalStorage = true;
      // Clear localStorage and set guest session on logout
      AuthStorage.removeUser();
      AuthStorage.setGuestSession();
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Update user data (for profile updates)
    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage with new user data
        AuthStorage.updateUser(state.user);
      }
    },

    // Reset localStorage check flag (for forcing re-check)
    resetLocalStorageCheck: (state) => {
      state.hasCheckedLocalStorage = false;
    },

    // Set authentication from localStorage (used during app initialization)
    setAuthFromStorage: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.hasCheckedLocalStorage = true;
    },
  },
});

export const {
  loadFromLocalStorage,
  setUser,
  setIsAuthenticated,
  setIsLoading,
  loginSuccess,
  logoutSuccess,
  setAuthLoading,
  updateUserData,
  resetLocalStorageCheck,
  setAuthFromStorage,
} = authSlice.actions;

export default authSlice.reducer; 