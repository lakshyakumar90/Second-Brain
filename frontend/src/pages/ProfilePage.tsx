import React from 'react';
import { useSelector } from 'react-redux';
import ProfileSettings from '../components/ProfileSettings';
import type { RootState } from '../store/store';
import { authApi } from '../services/authApi';

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  // Handle profile save
  const handleProfileSave = async (data: any) => {
    try {
      console.log('Saving profile data:', data);
      
      // Call API to update profile
      await authApi.updateProfile(data);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProfileSettings
          currentUser={user ? {
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            bio: user.bio || '',
            avatar: user.avatar || '',
          } : undefined}
          onSave={handleProfileSave}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ProfilePage; 