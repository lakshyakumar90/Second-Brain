import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegistration } from '../../hooks/useRegistration';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import AvatarUpload from '@/components/ui/avatar-upload';
import { Palette, Mail, AlertCircle } from 'lucide-react';
import { registerStep3Schema, type RegisterStep3FormData } from '../../lib/validationSchemas';

const RegisterStep3: React.FC = () => {
  const { registrationState, registerStep3 } = useRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
  } = useForm<RegisterStep3FormData>({
    resolver: zodResolver(registerStep3Schema),
    mode: 'onBlur',
    defaultValues: {
      avatar: '',
      bio: '',
      theme: 'system',
      emailNotifications: true,
    },
  });

  // Watch values for controlled components
  const themeValue = watch('theme');
  const emailNotificationsValue = watch('emailNotifications');
  const avatarValue = watch('avatar');

  const onSubmit = async (data: RegisterStep3FormData) => {
    const result = await registerStep3(data);
    
    if (!result.success) {
      setError('root', {
        type: 'manual',
        message: result.error || 'Profile completion failed',
      });
    }
  };

  const handleSkip = async () => {
    // Submit with minimal required data
    const minimalData: RegisterStep3FormData = {
      avatar: avatarValue || '',
      bio: '',
      theme: themeValue || 'system',
      emailNotifications: emailNotificationsValue ?? true,
    };
    
    const result = await registerStep3(minimalData);
    
    if (!result.success) {
      setError('root', {
        type: 'manual',
        message: result.error || 'Profile completion failed',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Customize Your Profile</CardTitle>
          <CardDescription className="text-center">
            Personalize your Second Brain experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Avatar Upload Field */}
            <div className="space-y-2">
              <Label>Profile Picture (optional)</Label>
              <div className="flex justify-center">
                <AvatarUpload
                  currentAvatar={avatarValue}
                  size="lg"
                  onAvatarChange={(avatarUrl) => setValue('avatar', avatarUrl)}
                  className="mx-auto"
                />
              </div>
              {errors.avatar && (
                <p className="text-sm text-red-600 flex items-center gap-1 justify-center">
                  <AlertCircle className="h-3 w-3" />
                  {errors.avatar.message}
                </p>
              )}
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                className={`resize-none ${errors.bio ? 'border-red-500 focus:border-red-500' : ''}`}
                rows={3}
                {...register('bio')}
              />
              {errors.bio && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.bio.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Share a brief description about yourself (optional)
              </p>
            </div>

            {/* Theme Preference */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme Preference
              </Label>
              <RadioGroup 
                value={themeValue} 
                onValueChange={(value) => setValue('theme', value as 'light' | 'dark' | 'system')}
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="text-sm font-normal cursor-pointer">
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="text-sm font-normal cursor-pointer">
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="text-sm font-normal cursor-pointer">
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailNotifications"
                checked={emailNotificationsValue}
                onCheckedChange={(checked) => setValue('emailNotifications', checked === true)}
              />
              <Label 
                htmlFor="emailNotifications" 
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Enable email notifications
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || registrationState.isLoading}
              >
                {isSubmitting || registrationState.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Completing setup...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                disabled={isSubmitting || registrationState.isLoading}
                className="w-full"
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterStep3; 