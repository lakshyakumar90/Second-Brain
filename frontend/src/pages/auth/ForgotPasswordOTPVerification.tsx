import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { AlertCircle, Clock, RefreshCw, ArrowLeft } from 'lucide-react';
import { passwordResetOTPSchema, type PasswordResetOTPFormData } from '../../lib/validationSchemas';

interface ForgotPasswordOTPVerificationProps {
  passwordResetHook: ReturnType<typeof import('../../hooks/usePasswordReset').usePasswordReset>;
}

const ForgotPasswordOTPVerification: React.FC<ForgotPasswordOTPVerificationProps> = ({ passwordResetHook }) => {
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const { 
    passwordResetState, 
    verifyPasswordResetOTP, 
    resendPasswordResetOTP,
    resetPasswordResetState 
  } = passwordResetHook;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<PasswordResetOTPFormData>({
    resolver: zodResolver(passwordResetOTPSchema),
    mode: 'onChange', // Validate on change for OTP (immediate feedback)
    defaultValues: {
      email: passwordResetState.email,
      otp: '',
    },
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

  const onSubmit = async (data: PasswordResetOTPFormData) => {
    const result = await verifyPasswordResetOTP(data.otp);
    
    if (!result.success) {
      setError('root', {
        type: 'manual',
        message: result.error || 'OTP verification failed',
      });
    }
  };

  const handleResendOTP = async () => {
    const result = await resendPasswordResetOTP();
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

  const handleGoBack = () => {
    resetPasswordResetState();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Verify Reset Code</CardTitle>
          </div>
          <CardDescription>
            We've sent a 6-digit verification code to{' '}
            <span className="font-medium text-gray-900">
              {passwordResetState.email}
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

            {/* Password Reset State Error Display */}
            {passwordResetState.error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{passwordResetState.error}</span>
              </div>
            )}

            {/* OTP Field */}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="flex justify-center">
                <Controller
                  name="otp"
                  control={control}
                  render={({ field }) => (
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      className={errors.otp ? 'border-red-500' : ''}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
              </div>
              {errors.otp && (
                <p className="text-sm text-red-600 flex items-center gap-1 justify-center">
                  <AlertCircle className="h-3 w-3" />
                  {errors.otp.message}
                </p>
              )}
              <p className="text-xs text-gray-500 text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || passwordResetState.isLoading || !otpValue || otpValue.length !== 6}
            >
              {isSubmitting || passwordResetState.isLoading ? (
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

export default ForgotPasswordOTPVerification; 