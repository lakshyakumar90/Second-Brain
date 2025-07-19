

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class AuthApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies in requests
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Registration Step 1: Email & Password
  async registerStep1(data: { email: string; password: string }) {
    return this.request('/auth/register/step1', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // OTP Verification
  async verifyOTP(data: { email: string; otp: string }) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Resend OTP
  async resendOTP(email: string) {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
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
    });
  }

  // Verify password reset OTP
  async verifyPasswordResetOTP(data: { email: string; otp: string }) {
    return this.request('/auth/verify-password-reset-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reset password
  async resetPassword(data: { email: string; newPassword: string }) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
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

    const response = await fetch(`${API_BASE_URL}/users/avatar`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Upload Error: ${response.statusText}`);
    }

    return await response.json();
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
}

export const authApi = new AuthApiService();
