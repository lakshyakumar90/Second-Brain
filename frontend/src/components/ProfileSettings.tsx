import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AvatarUpload from '@/components/ui/avatar-upload';
import { AlertCircle, Save, User, Mail } from 'lucide-react';

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
  isLoading = false,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    setValue,
    watch,
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
    mode: 'onBlur',
    defaultValues: {
      name: currentUser?.name || '',
      username: currentUser?.username || '',
      email: currentUser?.email || '',
      bio: currentUser?.bio || '',
      avatar: currentUser?.avatar || '',
    },
  });

  const watchedAvatar = watch('avatar');

  const onSubmit = async (data: ProfileSettingsFormData) => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      setSuccessMessage(null);

      const result = await onSave(data);

      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Update your profile information and avatar
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

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              <Save className="h-4 w-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex justify-center">
              <AvatarUpload
                currentAvatar={watchedAvatar || currentUser?.avatar}
                onAvatarChange={handleAvatarChange}
                size="lg"
                disabled={isLoading || isSaving}
              />
            </div>
          </div>

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
                disabled={isLoading || isSaving}
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
              <span className="absolute left-3 top-3 text-sm text-gray-400">@</span>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className={`pl-8 ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={isLoading || isSaving}
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
                disabled={isLoading || isSaving}
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
              disabled={isLoading || isSaving}
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
              disabled={!isDirty || isLoading || isSaving}
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