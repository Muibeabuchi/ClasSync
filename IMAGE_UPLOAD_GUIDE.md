# Image Upload System Guide

This guide explains how to use the image upload functionality in ClassSync, which provides a complete solution for handling user profile images with Convex backend storage.

## Overview

The image upload system consists of:

1. **Backend Functions** (`convex/imageUpload.ts`) - Convex functions for generating upload URLs and managing images
2. **Frontend Hooks** (`src/hooks/useImageUpload.ts`) - TanStack Query hooks for image operations
3. **UI Components** (`src/components/ImageUpload.tsx`) - Reusable image upload component
4. **Onboarding Integration** (`src/hooks/useOnboarding.ts`) - Specialized hook for onboarding with image upload

## Backend Functions

### Available Functions

```typescript
// Generate a temporary upload URL
api.imageUpload.generateUploadUrl();

// Update user profile image
api.imageUpload.updateUserProfileImage({ storageId });

// Delete user profile image
api.imageUpload.deleteUserProfileImage();

// Get image URL by storage ID
api.imageUpload.getImageUrl({ storageId });

// Get current user's profile image URL
api.imageUpload.getUserProfileImage();
```

### Security Features

- ✅ Authentication required for all operations
- ✅ Automatic cleanup of old images when updating
- ✅ Role-based image field assignment (student vs lecturer)
- ✅ Error handling with proper error messages

## Frontend Hooks

### useImageUpload()

Main hook for image upload operations:

```typescript
const {
  uploadImage, // (file: File, options?) => void
  deleteImage, // () => void
  isUploading, // boolean
  isDeleting, // boolean
  uploadError, // Error | null
  deleteError, // Error | null
} = useImageUpload();

// Usage
uploadImage(file, {
  onSuccess: (data) => console.log('Upload successful:', data),
  onError: (error) => console.error('Upload failed:', error),
});
```

### useUserProfileImage()

Hook to get the current user's profile image:

```typescript
const {
  imageUrl, // string | null | undefined
  isLoading, // boolean
} = useUserProfileImage();
```

### useImageUrl()

Hook to get any image URL by storage ID:

```typescript
const {
  imageUrl, // string | null | undefined
  isLoading, // boolean
} = useImageUrl(storageId);
```

### useOnboarding()

Specialized hook for onboarding with image upload:

```typescript
const {
  completeOnboarding, // (data, options?) => void
  isLoading, // boolean
  error, // Error | null
} = useOnboarding();

// Usage
completeOnboarding({
  fullName: 'John Doe',
  gender: 'male',
  profileImage: file, // Optional File object
});
```

## UI Components

### ImageUpload Component

Reusable component for image upload with drag-and-drop support:

```typescript
<ImageUpload
  size="md"                    // 'sm' | 'md' | 'lg'
  showDeleteButton={true}      // boolean
  onImageChange={(url) => {}}  // (url: string | null) => void
  className="custom-class"     // string
/>
```

#### Features

- ✅ Drag and drop support
- ✅ Click to upload
- ✅ Image preview
- ✅ Loading states
- ✅ Error handling
- ✅ File validation (type and size)
- ✅ Responsive design
- ✅ Accessibility support

### OnboardingForm Component

Complete onboarding form with image upload:

```typescript
<OnboardingForm
  onComplete={() => {
    // Handle completion
  }}
/>
```

## Usage Examples

### Basic Image Upload

```typescript
import { ImageUpload } from '@/components/ImageUpload';

const ProfilePage = () => {
  const handleImageChange = (imageUrl: string | null) => {
    console.log('New image URL:', imageUrl);
  };

  return (
    <div>
      <h2>Update Profile Picture</h2>
      <ImageUpload onImageChange={handleImageChange} />
    </div>
  );
};
```

### Manual Upload with Hook

```typescript
import { useImageUpload } from '@/hooks/useImageUpload';

const ManualUpload = () => {
  const { uploadImage, isUploading } = useImageUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file, {
        onSuccess: (data) => {
          console.log('Upload successful:', data.imageUrl);
        },
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      {isUploading && <p>Uploading...</p>}
    </div>
  );
};
```

### Display User Profile Image

```typescript
import { useUserProfileImage } from '@/hooks/useImageUpload';

const UserAvatar = () => {
  const { imageUrl, isLoading } = useUserProfileImage();

  if (isLoading) return <div>Loading...</div>;

  return (
    <img
      src={imageUrl || '/default-avatar.png'}
      alt="Profile"
      className="w-10 h-10 rounded-full"
    />
  );
};
```

### Onboarding with Image

```typescript
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingPage = () => {
  const { completeOnboarding, isLoading } = useOnboarding();
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleSubmit = (formData: FormData) => {
    completeOnboarding({
      fullName: formData.get('fullName') as string,
      gender: formData.get('gender') as 'male' | 'female',
      profileImage: profileImage || undefined,
    }, {
      onSuccess: () => {
        // Redirect to dashboard
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
      />
      <button type="submit" disabled={isLoading}>
        Complete Onboarding
      </button>
    </form>
  );
};
```

## File Validation

The system automatically validates uploaded files:

- ✅ **File Type**: Must be an image (`image/*`)
- ✅ **File Size**: Maximum 5MB
- ✅ **Authentication**: User must be logged in

## Error Handling

All operations include comprehensive error handling:

```typescript
// Upload errors
uploadImage(file, {
  onError: (error) => {
    // Handle specific errors:
    // - "File must be an image"
    // - "Image size must be less than 5MB"
    // - "User must be authenticated to upload images"
    // - "Failed to upload image to storage"
  },
});
```

## Storage Management

- Images are stored in Convex's built-in file storage
- Old images are automatically deleted when updating
- Storage IDs are properly typed with `Id<'_storage'>`
- URLs are generated on-demand and cached

## Database Schema

The system uses existing schema fields:

```typescript
// For students
student_passport_photo_id: v.optional(v.id('_storage'));

// For lecturers
lecturerPassportImage: v.optional(v.id('_storage'));
```

## Best Practices

1. **Always handle loading states** - Show spinners during upload/delete operations
2. **Validate files client-side** - Check file type and size before upload
3. **Provide user feedback** - Use toast notifications for success/error states
4. **Handle errors gracefully** - Show meaningful error messages to users
5. **Optimize image sizes** - Consider resizing large images before upload
6. **Use proper alt text** - Ensure accessibility with descriptive alt attributes

## Troubleshooting

### Common Issues

1. **Upload fails silently**
   - Check if user is authenticated
   - Verify file type and size limits
   - Check network connectivity

2. **Image doesn't display**
   - Ensure storage ID is valid
   - Check if image URL generation succeeded
   - Verify image hasn't been deleted

3. **Slow uploads**
   - Consider image compression
   - Check file size (max 5MB)
   - Verify network conditions

### Debug Information

Enable debug logging by checking browser console for:

- Upload progress messages
- Error details
- Storage ID information
- URL generation status

## Migration Guide

If you have existing image upload code, follow these steps:

1. Replace direct Convex storage calls with the new hooks
2. Update components to use the `ImageUpload` component
3. Migrate onboarding forms to use `useOnboarding` hook
4. Update error handling to use the new error patterns
5. Test all image upload flows thoroughly

## Performance Considerations

- Images are uploaded directly to Convex storage (no server processing)
- URLs are cached by TanStack Query
- Old images are automatically cleaned up
- File validation happens client-side first for better UX

## Security Notes

- All operations require authentication
- File type validation prevents non-image uploads
- Size limits prevent abuse
- Storage IDs are properly typed and validated
- Error messages don't expose sensitive information

```

```
