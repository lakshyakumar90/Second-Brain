# Avatar Upload Implementation Guide

This guide explains how to use the avatar upload functionality that integrates with Cloudinary backend.

## 🎯 Overview

The avatar upload system provides:
- ✅ **Drag & drop or click to upload** images
- ✅ **Real-time preview** with progress indication
- ✅ **Automatic validation** (file type, size)
- ✅ **Cloudinary integration** for optimized storage
- ✅ **Error handling** with user-friendly messages
- ✅ **Responsive design** with multiple sizes

## 📁 Components

### 1. AvatarUpload Component (`/src/components/ui/avatar-upload.tsx`)

**Features:**
- File validation (JPEG, PNG, GIF, WebP, max 5MB)
- Automatic upload to Cloudinary
- Progress indication with overlay
- Success/error feedback
- Three sizes: `sm`, `md`, `lg`
- Image preview with remove option

**Props:**
```typescript
interface AvatarUploadProps {
  currentAvatar?: string;          // Current avatar URL
  onAvatarChange?: (url: string) => void;  // Callback when avatar changes
  className?: string;              // Additional CSS classes
  size?: 'sm' | 'md' | 'lg';      // Component size
  disabled?: boolean;              // Disable upload
}
```

**Usage Example:**
```tsx
import AvatarUpload from '@/components/ui/avatar-upload';

const MyComponent = () => {
  const [avatarUrl, setAvatarUrl] = useState('');

  return (
    <AvatarUpload
      currentAvatar={avatarUrl}
      onAvatarChange={setAvatarUrl}
      size="lg"
    />
  );
};
```

### 2. ProfileSettings Component (`/src/components/ProfileSettings.tsx`)

**Features:**
- Complete profile form with avatar upload
- React Hook Form integration with Zod validation
- Success/error states
- Dirty state tracking (save only when changed)

**Props:**
```typescript
interface ProfileSettingsProps {
  currentUser?: {
    name: string;
    username: string;
    email: string;
    bio?: string;
    avatar?: string;
  };
  onSave?: (data: ProfileFormData) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}
```

## 🔧 Implementation Examples

### 1. Registration Step 3 (Already Implemented)

In `RegisterStep3.tsx`, avatar upload is integrated:

```tsx
{/* Avatar Upload Field */}
<div className="space-y-2">
  <Label>Profile Picture (optional)</Label>
  <div className="flex justify-center">
    <AvatarUpload
      size="lg"
      onAvatarChange={(avatarUrl) => setValue('avatar', avatarUrl)}
      className="mx-auto"
    />
  </div>
</div>
```

### 2. Profile Settings Page (Demo)

See `ProfilePage.tsx` for a complete implementation:

```tsx
import ProfileSettings from '../components/ProfileSettings';

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const handleProfileSave = async (data) => {
    try {
      await authApi.updateProfile(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <ProfileSettings
      currentUser={user}
      onSave={handleProfileSave}
    />
  );
};
```

### 3. Simple Avatar Upload in Any Component

```tsx
import { useState } from 'react';
import AvatarUpload from '@/components/ui/avatar-upload';

const UserCard = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="user-card">
      <AvatarUpload
        currentAvatar={user.avatar}
        onAvatarChange={(url) => {
          // Update user avatar
          updateUserAvatar(url);
        }}
        size="md"
        disabled={!isEditing}
      />
    </div>
  );
};
```

## 🔌 API Integration

### Backend Endpoints

**Upload Avatar:**
```
POST /api/v1/users/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: { avatar: File }

Response: {
  message: "Avatar uploaded successfully",
  avatar: "https://res.cloudinary.com/...",
  publicId: "avatars/user_123_avatar_1234567890"
}
```

**Update Profile:**
```
PUT /api/v1/users/profile
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  avatar?: string;
}
```

### Frontend API Service

The `authApi` service handles all avatar-related requests:

```typescript
// Upload avatar file
const result = await authApi.uploadAvatar(file);

// Update profile with avatar URL
await authApi.updateProfile({
  name: 'John Doe',
  avatar: 'https://res.cloudinary.com/...'
});
```

## 🎨 Styling & Customization

### Size Variants

```typescript
const sizeConfig = {
  sm: { avatar: 'w-16 h-16', button: 'w-6 h-6', icon: 'w-3 h-3' },
  md: { avatar: 'w-24 h-24', button: 'w-8 h-8', icon: 'w-4 h-4' },
  lg: { avatar: 'w-32 h-32', button: 'w-10 h-10', icon: 'w-5 h-5' },
};
```

### Custom Styling

```tsx
<AvatarUpload
  className="my-custom-avatar border-4 border-blue-500"
  size="lg"
/>
```

### Theme Integration

The component uses your existing design tokens:
- `border-gray-300` for default border
- `bg-blue-600` for upload button
- `text-red-600` for error messages
- `bg-green-50` for success states

## 🛡️ Validation & Error Handling

### File Validation

```typescript
const validateFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, GIF, and WebP images are allowed.';
  }

  if (file.size > maxSize) {
    return 'Image must be less than 5MB.';
  }

  return null;
};
```

### Error States

The component handles various error scenarios:
- Invalid file type
- File too large
- Network/upload errors
- Authentication errors

## 📱 Responsive Design

The avatar upload component is fully responsive:

```css
/* Small screens - stack vertically */
@media (max-width: 640px) {
  .avatar-upload-container {
    flex-direction: column;
    align-items: center;
  }
}
```

## 🚀 Production Considerations

### Environment Variables

Ensure these are set in your backend:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Performance Optimizations

1. **Image Optimization**: Cloudinary automatically optimizes images
2. **CDN Delivery**: Images served via Cloudinary CDN
3. **Progressive Loading**: Use loading states for better UX
4. **Error Boundaries**: Wrap components in error boundaries

### Security Features

1. **File Type Validation**: Client + server-side validation
2. **File Size Limits**: 5MB maximum enforced
3. **Authentication**: JWT token required for uploads
4. **CSRF Protection**: Cookies with SameSite settings

## 🐛 Troubleshooting

### Common Issues

1. **Upload fails with 401 error**
   - Check if user is authenticated
   - Verify JWT token is valid

2. **File type not accepted**
   - Ensure file is JPEG, PNG, GIF, or WebP
   - Check file extension matches MIME type

3. **Upload times out**
   - Check internet connection
   - Verify Cloudinary service status

4. **Preview not showing**
   - Check if URL is valid
   - Verify CORS settings

### Debug Mode

Enable console logging:

```typescript
// In AvatarUpload component
console.log('File selected:', file);
console.log('Upload response:', response);
console.log('Avatar URL updated:', avatarUrl);
```

## 📖 Next Steps

1. **Add image cropping** functionality
2. **Implement multiple avatar sizes** (thumbnail, medium, large)
3. **Add drag & drop zone** improvements
4. **Integrate with user settings** page
5. **Add avatar gallery** with predefined options

---

## 💡 Tips for Implementation

1. **Always handle loading states** for better UX
2. **Provide clear error messages** to users
3. **Use optimistic updates** when possible
4. **Implement proper cleanup** for preview URLs
5. **Test with various file types** and sizes

This avatar upload system is production-ready and follows best practices for security, performance, and user experience! 🎉 