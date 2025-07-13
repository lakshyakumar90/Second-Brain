import cloudinary from '../config/cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

interface UploadOptions {
  folder?: string;
  transformation?: any;
  public_id?: string;
}

class CloudinaryService {
  /**
   * Upload image to Cloudinary
   */
  async uploadImage(
    fileBuffer: Buffer,
    options: UploadOptions = {}
  ): Promise<UploadApiResponse> {
    try {
      // Convert buffer to base64 string
      const base64String = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

      // Default transformation for avatars
      const defaultTransformation = {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto',
        fetch_format: 'auto'
      };

      const uploadOptions = {
        folder: options.folder || 'avatars',
        transformation: options.transformation || defaultTransformation,
        public_id: options.public_id,
        resource_type: 'image' as const,
        overwrite: true,
        invalidate: true
      };

      const result = await cloudinary.uploader.upload(base64String, uploadOptions);
      
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      // Don't throw error for delete operations as they're not critical
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return filename.split('.')[0]; // Remove file extension
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }

  /**
   * Generate optimized avatar URL
   */
  generateOptimizedUrl(publicId: string, options: any = {}): string {
    const defaultOptions = {
      width: 200,
      height: 200,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto'
    };

    const transformation = { ...defaultOptions, ...options };
    
    return cloudinary.url(publicId, {
      transformation: [transformation],
      secure: true
    });
  }

  /**
   * Validate if URL is a valid Cloudinary URL
   */
  isValidCloudinaryUrl(url: string): boolean {
    return url.includes('res.cloudinary.com');
  }
}

export default new CloudinaryService(); 