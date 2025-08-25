import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AvatarUpload from '@/components/ui/avatar-upload';
import { AlertCircle, Save, User, Mail, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Profile settings schema
const profileSettingsSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, dots, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  avatar: z.string().optional(),
});

type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;

interface ProfileSettingsProps {
  // Made optional since we'll get user data from useAuth hook
  currentUser?: {
    name: string;
    username: string;
    email: string;
    bio?: string;
    avatar?: string;
  };
  onSave?: (data: ProfileSettingsFormData) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  currentUser,
  onSave,
  isLoading: externalLoading = false,
}) => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use user from auth hook if currentUser prop is not provided
  const userData = currentUser || user;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    setValue,
    watch,
    reset,
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      bio: '',
      avatar: '',
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (userData) {
      reset({
        name: userData.name || '',
        username: userData.username || '',
        email: userData.email || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
      });
    }
  }, [userData, reset]);

  const watchedAvatar = watch('avatar');

  const onSubmit = async (data: ProfileSettingsFormData) => {
    try {
      setIsSaving(true);
      setSuccessMessage(null);

      let result;
      
      if (onSave) {
        // Use external save handler if provided
        result = await onSave(data);
      } else {
        // Use built-in updateProfile from useAuth hook
        result = await updateProfile({
          name: data.name,
          username: data.username,
          email: data.email,
          bio: data.bio,
          avatar: data.avatar,
        });
      }

      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Reset form dirty state
        reset(data);
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'Failed to update profile',
        });
      }
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setValue('avatar', avatarUrl, { shouldDirty: true });
  };

  const handleRefreshUserData = async () => {
    try {
      setIsRefreshing(true);
      const result = await refreshUser();
      
      if (result.success) {
        setSuccessMessage('User data refreshed successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'Failed to refresh user data',
        });
      }
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Failed to refresh user data',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your profile information and avatar
            </CardDescription>
          </div>
          
          {/* Action buttons for manual data refresh and session validation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshUserData}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Auth expiration warning */}
        {/* Removed authWillExpireSoon and expirationTime as they are no longer tracked */}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {errors.root && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.root.message}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Picture</Label>
            <AvatarUpload
              currentAvatar={watchedAvatar}
              onAvatarChange={handleAvatarChange}
              disabled={externalLoading || isSaving}
            />
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className={`pl-10 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={externalLoading || isSaving}
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
              <span className="absolute left-3 top-3 text-gray-400">@</span>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className={`pl-8 ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={externalLoading || isSaving}
                {...register('username')}
              />
            </div>
            {errors.username && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={externalLoading || isSaving}
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

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell us a bit about yourself..."
              className={`resize-none ${errors.bio ? 'border-red-500 focus:border-red-500' : ''}`}
              rows={4}
              disabled={externalLoading || isSaving}
              {...register('bio')}
            />
            {errors.bio && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.bio.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Max 500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!isDirty || externalLoading || isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;