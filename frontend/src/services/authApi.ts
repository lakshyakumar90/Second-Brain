const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

interface RequestConfig extends RequestInit {
  skipAuthClear?: boolean; // Skip clearing auth on 401 errors
}

class AuthApiService {
  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const { skipAuthClear = false, ...requestOptions } = options;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...requestOptions.headers,
      },
      credentials: 'include', // Include cookies in requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
      ...requestOptions,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401 && !skipAuthClear) {
          // For login/register endpoints, don't redirect
          if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
            // Optional: Emit a custom event for unauthorized access
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
        }

        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // Registration Step 1: Email & Password
  async registerStep1(data: { email: string; password: string }) {
    return this.request('/auth/register/step1', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuthClear: true, // Don't clear auth on registration errors
    });
  }

  // OTP Verification
  async verifyOTP(data: { email: string; otp: string }) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuthClear: true,
    });
  }

  // Resend OTP
  async resendOTP(email: string) {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuthClear: true,
    });
  }

  // Registration Step 2: Name & Username
  async registerStep2(data: { name: string; username: string }) {
    return this.request('/auth/register/step2', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Registration Step 3: Profile Completion
  async registerStep3(data: { 
    avatar?: string; 
    bio?: string; 
    theme: string; 
    emailNotifications: boolean 
  }) {
    return this.request('/auth/register/step3', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Login
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuthClear: true, // Don't clear auth on login errors
    });
  }

  // Logout
  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Get current user
  async getCurrentUser() {
    return this.request('/users/profile');
  }

  // Check registration step
  async checkRegistrationStep() {
    return this.request('/auth/registration-step');
  }

  // Forgot password - send reset email
  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuthClear: true,
    });
  }

  // Verify password reset OTP
  async verifyPasswordResetOTP(data: { email: string; otp: string }) {
    return this.request('/auth/verify-password-reset-otp', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuthClear: true,
    });
  }

  // Reset password
  async resetPassword(data: { email: string; newPassword: string }) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuthClear: true,
    });
  }

  // Upload avatar
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    // For file uploads, we need to make a custom request without JSON headers
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for auth
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users/avatar`, config);
      
      if (!response.ok) {
        // Handle 401 for avatar upload
        if (response.status === 401) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        
        const errorData = await response.json().catch(() => ({ 
          message: `Upload Error: ${response.statusText}` 
        }));
        
        throw new Error(errorData.message || `Upload Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error during file upload. Please check your connection.');
      }
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: {
    name?: string;
    username?: string;
    email?: string;
    bio?: string;
    avatar?: string;
  }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Get user profile
  async getProfile(userId?: string) {
    const endpoint = userId ? `/users/profile/${userId}` : '/users/profile';
    return this.request(endpoint);
  }

  // Health check endpoint
  async healthCheck() {
    return this.request('/health', { skipAuthClear: true });
  }
}

export const authApi = new AuthApiService();
