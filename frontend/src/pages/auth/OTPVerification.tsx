import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegistration } from '../../hooks/registration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { otpSchema, type OTPFormData } from '../../lib/validationSchemas';

const OTPVerification: React.FC = () => {
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const { registrationState, verifyOTP, resendOTP } = useRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange', // Validate on change for OTP (immediate feedback)
  });

  // Watch OTP value for auto-submission when 6 digits entered
  const otpValue = watch('otp');

  useEffect(() => {
    if (otpValue && otpValue.length === 6 && !errors.otp) {
      // Auto-submit when 6 valid digits are entered
      handleSubmit(onSubmit)();
    }
  }, [otpValue, errors.otp, handleSubmit]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const onSubmit = async (data: OTPFormData) => {
    const result = await verifyOTP(data.otp);
    
    if (!result.success) {
      setError('root', {
        type: 'manual',
        message: result.error || 'OTP verification failed',
      });
    }
  };

  const handleResendOTP = async () => {
    const result = await resendOTP();
    if (result.success) {
      setCountdown(30);
      setCanResend(false);
      setError('root', { type: 'manual', message: '' }); // Clear any existing errors
    } else {
      setError('root', {
        type: 'manual',
        message: result.error || 'Failed to resend OTP',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a 6-digit code to{' '}
            <span className="font-medium text-gray-900">
              {registrationState.email}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* API Error Display */}
            {errors.root && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            {/* Registration State Error Display */}
            {registrationState.error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{registrationState.error}</span>
              </div>
            )}

            {/* OTP Field */}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className={`pl-10 text-center text-lg tracking-wider ${errors.otp ? 'border-red-500 focus:border-red-500' : ''}`}
                  {...register('otp')}
                  autoComplete="one-time-code"
                />
              </div>
              {errors.otp && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.otp.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || registrationState.isLoading || !otpValue || otpValue.length !== 6}
            >
              {isSubmitting || registrationState.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            {/* Resend Section */}
            <div className="text-center space-y-2">
              {!canResend ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Resend code in {countdown}s</span>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  className="text-blue-600 hover:text-blue-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Code
                </Button>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="text-center text-sm text-gray-500">
              Step 2 of 4
            </div>

            {/* Help Text */}
            <div className="text-center text-xs text-gray-500">
              Didn't receive the code? Check your spam folder or try resending.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification; 