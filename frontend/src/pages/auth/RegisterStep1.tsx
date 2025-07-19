import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegistration } from '@/hooks/registration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { registerStep1Schema, type RegisterStep1FormData } from '../../lib/validationSchemas';

const RegisterStep1: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  const { registrationState, registerStep1 } = useRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterStep1FormData>({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = async (data: RegisterStep1FormData) => {
    const result = await registerStep1(data.email, data.password);
    
    if (!result.success) {
      // Set API error on the form
      setError('root', {
        type: 'manual',
        message: result.error || 'Registration failed',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Start your journey with Second Brain
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

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Must contain uppercase, lowercase, number and special character
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Links */}
            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link 
                to="/auth/login" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </Link>
            </div>

            {/* Progress Indicator */}
            <div className="text-center text-sm text-gray-500">
              Step 1 of 4
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterStep1;
