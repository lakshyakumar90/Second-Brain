import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import registrationSlice from './slices/registrationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    registration: registrationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 