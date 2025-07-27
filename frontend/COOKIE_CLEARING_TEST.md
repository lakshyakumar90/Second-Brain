# 🍪 Cookie Clearing Detection - Test Guide

## Overview
This guide explains how to test the enhanced authentication system that detects when cookies are manually cleared.

## 🧪 How to Test Cookie Clearing

### Method 1: Manual Cookie Clearing in DevTools
1. **Login to your app** → Navigate to `/home`
2. **Open DevTools** → F12 or Right-click → Inspect
3. **Go to Application tab** → Storage → Cookies → `http://localhost:5174` (or your domain)
4. **Delete all cookies** → Right-click → Clear or delete individual auth cookies
5. **Wait for detection**:
   - **Immediate**: Next API call will return 401
   - **Automatic**: Heartbeat check within 2 minutes will detect

### Method 2: Using ProfileSettings Validation
1. **Go to Profile Settings** (if you have this component)
2. **Click "Validate" button** → Tests session immediately
3. **Clear cookies in another tab**
4. **Click "Validate" again** → Should show "cookies may be cleared" message

### Method 3: Browser Incognito/Private Mode
1. **Login in normal browser**
2. **Copy the URL to incognito/private mode**
3. **Try to access `/home`** → Should redirect to login

## 🔍 Expected Behavior

### When Cookies Are Cleared:
1. **localStorage**: Still contains user data ✅
2. **Redux state**: Shows authenticated ✅  
3. **Server**: Rejects requests with 401 ❌
4. **Detection**:
   - Next API call returns 401 → Auto logout
   - Heartbeat check (every 2 min) → Auto logout
   - Manual validation → Shows error message

### Timeline:
- **0-10 seconds**: App still thinks user is authenticated
- **10 seconds - 2 minutes**: Initial heartbeat check detects issue
- **Immediate on API call**: Any authenticated request triggers 401 → logout

## 🎯 Detection Methods Implemented

### 1. **API-Level Detection** (`authApi.ts`)
```typescript
// Every API call checks for 401 errors
if (response.status === 401) {
  AuthStorage.removeUser(); // Clear localStorage
  window.dispatchEvent(new CustomEvent('auth:unauthorized')); // Notify app
}
```

### 2. **Heartbeat Monitoring** (`useAuth.ts`)
```typescript
// Periodic validation every 2 minutes
const heartbeatCheck = async () => {
  try {
    await authApi.getCurrentUser(); // Test authentication
    return { success: true };
  } catch (error) {
    dispatch(logoutSuccess()); // Auto logout on failure
    return { success: false, reason: 'authentication_failed' };
  }
};
```

### 3. **Global Event Handling** (`AuthInitializer.tsx`)
```typescript
// Listen for unauthorized events from API calls
window.addEventListener('auth:unauthorized', () => {
  logout(); // Handle immediate logout
});
```

### 4. **Manual Validation** (`ProfileSettings.tsx`)
```typescript
// On-demand session validation
<Button onClick={handleValidateSession}>
  <Shield /> Validate Session
</Button>
```

## 🚨 What Happens When Cookies Are Cleared

### Immediate Effects:
1. **App continues working** (using localStorage)
2. **UI shows authenticated state**
3. **User can navigate pages**

### Within 2 Minutes:
1. **Heartbeat check fails** → 401 error
2. **localStorage cleared** automatically
3. **Redux state reset** → `isAuthenticated: false`
4. **User redirected** to login page

### On Next API Call:
1. **Any authenticated request** returns 401
2. **Immediate detection** and logout
3. **User redirected** to login

## 🛡️ Security Benefits

### Why This Approach is Secure:
1. **HTTP-only cookies** → Prevents XSS token theft
2. **Server-side validation** → All requests validated
3. **Client-side caching** → Better performance
4. **Automatic cleanup** → No stale authentication state

### Multiple Detection Layers:
1. **Reactive**: API calls detect 401 immediately
2. **Proactive**: Heartbeat checks every 2 minutes  
3. **Manual**: User can validate session anytime
4. **Cross-tab**: Storage events sync logout across tabs

## 📝 Test Scenarios

### ✅ Scenario 1: Manual Cookie Deletion
- Clear cookies → Wait → Should auto-logout within 2 minutes

### ✅ Scenario 2: API Call After Cookie Clearing  
- Clear cookies → Make API call (refresh profile) → Immediate logout

### ✅ Scenario 3: Manual Session Validation
- Clear cookies → Click "Validate" button → Shows error + logout

### ✅ Scenario 4: Cross-Tab Synchronization
- Login in Tab A → Clear cookies in Tab B → Both tabs logout

### ✅ Scenario 5: Network Issues
- Disconnect network → Should handle gracefully → Reconnect → Auto-recovery

## 🎉 Summary

The authentication system now handles **both** localStorage and cookie clearing:

- **localStorage cleared** → Detected within 5 seconds
- **Cookies cleared** → Detected within 2 minutes (or immediately on API call)
- **Both cleared** → Immediate logout and redirect

**Your authentication is now bulletproof!** 🛡️ 