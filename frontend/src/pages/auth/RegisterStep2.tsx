import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegistration } from '../../hooks/useRegistration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, AtSign, AlertCircle } from 'lucide-react';
import { registerStep2Schema, type RegisterStep2FormData } from '../../lib/validationSchemas';

const RegisterStep2: React.FC = () => {
  const { registrationState, registerStep2 } = useRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterStep2FormData>({
    resolver: zodResolver(registerStep2Schema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = async (data: RegisterStep2FormData) => {
    const result = await registerStep2(data.name, data.username);
    
    if (!result.success) {
      // Set API error on the form
      setError('root', {
        type: 'manual',
        message: result.error || 'Registration failed',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Tell us a bit about yourself to personalize your experience
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

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className={`pl-10 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a unique username"
                  className={`pl-10 ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.username.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Can contain letters, numbers, underscores and dots
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || registrationState.isLoading}
            >
              {isSubmitting || registrationState.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating profile...
                </>
              ) : (
                'Continue'
              )}
            </Button>

            {/* Progress Indicator */}
            <div className="text-center text-sm text-gray-500">
              Step 3 of 4
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterStep2; 