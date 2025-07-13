# Avatar Upload Functionality

This document describes the avatar upload functionality implemented using Cloudinary and Multer.

## Features

- ✅ Secure file upload with validation
- ✅ Image optimization and transformation
- ✅ Automatic old avatar cleanup
- ✅ Multiple image format support (JPEG, PNG, GIF, WebP)
- ✅ File size validation (max 5MB)
- ✅ Cloudinary integration with face detection
- ✅ Proper error handling and responses

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Dependencies

The following packages are required:

```json
{
  "cloudinary": "^1.x.x",
  "multer": "^1.x.x",
  "@types/multer": "^1.x.x"
}
```

## API Endpoint

### Upload Avatar

**POST** `/api/v1/users/avatar`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body:**
- `avatar`: Image file (JPEG, PNG, GIF, WebP, max 5MB)

**Response (Success - 200):**
```json
{
  "message": "Avatar uploaded successfully",
  "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/avatars/user_123_avatar_1234567890.jpg",
  "publicId": "avatars/user_123_avatar_1234567890"
}
```

**Response (Error - 400):**
```json
{
  "message": "No file uploaded",
  "error": "Please select an image file to upload"
}
```

**Response (Error - 400):**
```json
{
  "message": "Invalid file type",
  "error": "Only JPEG, PNG, GIF, and WebP images are allowed"
}
```

**Response (Error - 400):**
```json
{
  "message": "File too large",
  "error": "Avatar image must be less than 5MB"
}
```

## Implementation Details

### File Structure

```
backend/src/
├── config/
│   └── cloudinary.ts          # Cloudinary configuration
├── middlewares/
│   └── uploadMiddleware.ts    # Multer configuration
├── services/
│   └── cloudinaryService.ts   # Cloudinary service
├── controllers/
│   └── user.controller.ts     # Upload avatar function
└── routes/
    └── user.routes.ts         # User routes
```

### Key Components

#### 1. Cloudinary Configuration (`config/cloudinary.ts`)
- Validates environment variables
- Configures Cloudinary client
- Handles initialization errors

#### 2. Upload Middleware (`middlewares/uploadMiddleware.ts`)
- Configures Multer for memory storage
- Validates file types and sizes
- Handles upload errors gracefully

#### 3. Cloudinary Service (`services/cloudinaryService.ts`)
- Handles image upload to Cloudinary
- Manages image transformations
- Provides utility functions for URL management

#### 4. Upload Avatar Function (`controllers/user.controller.ts`)
- Validates uploaded file
- Manages old avatar cleanup
- Updates user profile with new avatar URL

## Image Transformations

The uploaded images are automatically transformed with the following settings:

- **Size**: 400x400 pixels
- **Crop**: Fill (maintains aspect ratio)
- **Gravity**: Face (centers on detected faces)
- **Quality**: Auto (optimized for web)
- **Format**: Auto (best format for browser)

## Security Features

1. **File Type Validation**: Only allows image files
2. **File Size Limits**: Maximum 5MB per file
3. **Authentication Required**: JWT token validation
4. **Old File Cleanup**: Automatically deletes previous avatars
5. **Secure URLs**: Uses HTTPS for all Cloudinary URLs

## Error Handling

The implementation includes comprehensive error handling for:

- Missing files
- Invalid file types
- File size exceeded
- Cloudinary upload failures
- Database errors
- Authentication errors

## Usage Examples

### Frontend (JavaScript/TypeScript)

```javascript
// Upload avatar using FormData
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch('/api/v1/users/avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result;
};

// Usage
const fileInput = document.getElementById('avatar-input');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const result = await uploadAvatar(file);
      console.log('Avatar uploaded:', result.avatar);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
});
```

### Frontend (React)

```jsx
import { useState } from 'react';

const AvatarUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/v1/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update user avatar in your app state
      console.log('Avatar uploaded:', result.avatar);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

## Testing

### Manual Testing

1. **Valid Upload**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/users/avatar \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "avatar=@/path/to/image.jpg"
   ```

2. **Invalid File Type**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/users/avatar \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "avatar=@/path/to/document.pdf"
   ```

3. **Large File**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/users/avatar \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "avatar=@/path/to/large-image.jpg"
   ```

## Troubleshooting

### Common Issues

1. **Cloudinary Configuration Error**:
   - Ensure all environment variables are set
   - Verify Cloudinary credentials are correct

2. **File Upload Fails**:
   - Check file size (must be < 5MB)
   - Verify file type is supported
   - Ensure proper authentication

3. **Old Avatar Not Deleted**:
   - Check if old avatar URL is valid Cloudinary URL
   - Verify Cloudinary delete permissions

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
```

This will log detailed information about upload processes and errors.

## Performance Considerations

- Images are optimized automatically by Cloudinary
- Face detection ensures good avatar cropping
- Old avatars are cleaned up to save storage
- CDN delivery ensures fast loading worldwide

## Future Enhancements

- [ ] Multiple avatar sizes (thumbnail, medium, large)
- [ ] Avatar cropping interface
- [ ] Bulk avatar upload
- [ ] Avatar templates/themes
- [ ] Avatar analytics 