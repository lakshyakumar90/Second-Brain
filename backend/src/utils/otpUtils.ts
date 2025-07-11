// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if OTP is expired (10 minutes)
export const isOTPExpired = (otpExpires: Date): boolean => {
  return new Date() > new Date(otpExpires);
};

// Set OTP expiration time (10 minutes from now)
export const getOTPExpiration = (): Date => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

// Validate OTP format (6 digits)
export const validateOTPFormat = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
}; 