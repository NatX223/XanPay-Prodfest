import * as ImagePicker from 'expo-image-picker';

export interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
}

export class ImageUploadService {
  private static readonly BASE_URL = 'https://80ae40f0d7c6.ngrok-free.app';
  private static readonly UPLOAD_ENDPOINT = '/api/upload/image';

  static async uploadImage(imageAsset: ImagePicker.ImagePickerAsset): Promise<ImageUploadResponse> {
    try {
      // Validate image asset
      if (!imageAsset || !imageAsset.uri) {
        throw new Error('Invalid image selected');
      }

      // Create FormData for image upload
      const formData = new FormData();
      
      // Add the image file to FormData
      formData.append('image', {
        uri: imageAsset.uri,
        type: imageAsset.mimeType || 'image/jpeg',
        name: imageAsset.fileName || 'business-image.jpg',
      } as any);

      const response = await fetch(`${this.BASE_URL}${this.UPLOAD_ENDPOINT}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.imageUrl) {
        throw new Error(result.error || 'Image upload failed - no URL returned');
      }

      return result;
    } catch (error) {
      console.error('Image upload error:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to upload image. Please try again.'
      );
    }
  }
}