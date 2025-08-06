import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { useUserProfileImage, useImageUpload } from '@/hooks/useImageUpload';

/**
 * Example component showing different ways to use the ImageUpload component
 */
export const ImageUploadExample: React.FC = () => {
  const { imageUrl } = useUserProfileImage();
  const { isUploading, isDeleting } = useImageUpload();

  const handleImageChange = (newImageUrl: string | null) => {
    console.log('Image changed:', newImageUrl);
    // Handle image change in your component
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Image Upload Examples</h1>

      {/* Basic Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Image Upload</CardTitle>
          <CardDescription>
            Standard profile image upload with default settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ImageUpload onImageChange={handleImageChange} />
        </CardContent>
      </Card>

      {/* Different Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Different Sizes</CardTitle>
          <CardDescription>
            Image upload components in different sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-sm font-medium mb-2">Small</p>
              <ImageUpload size="sm" showDeleteButton={false} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-2">Medium (Default)</p>
              <ImageUpload size="md" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-2">Large</p>
              <ImageUpload size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>
            Shows the current state of image operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Current Image URL:</strong> {imageUrl || 'No image'}
            </p>
            <p>
              <strong>Is Uploading:</strong> {isUploading ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Is Deleting:</strong> {isDeleting ? 'Yes' : 'No'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploadExample;
