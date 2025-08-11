# Course-Specific Student Image Upload Feature

## Overview

This feature allows students to upload a course-specific image of themselves when sending join requests to lecturers. This helps lecturers identify students during attendance verification and manual override processes.

## Key Features

### 1. **Mandatory Image Upload**

- Students must upload a photo when sending join requests
- Image is validated to contain exactly one face
- Face detection prevents wrong or inappropriate images

### 2. **Image Cropping & Validation**

- Built-in image cropper with zoom and rotation controls
- Real-time face detection validation
- Ensures image quality and authenticity

### 3. **Course-Specific Isolation**

- Each course application requires a separate image
- Images are isolated per course (not shared across courses)
- Helps lecturers identify students in specific course contexts

### 4. **Lecturer Identification Tools**

- Course-specific images displayed in StudentsTable
- Visual indicators distinguish course photos from profile photos
- Tooltips provide context about image source

### 5. **Automatic Cleanup**

- Images are deleted when courses are deleted
- Proper storage management prevents orphaned files

## Technical Implementation

### Database Schema Changes

```typescript
// Updated joinRequests table
joinRequests: defineTable({
  // ... existing fields
  courseSpecificImageId: v.id('_storage'), // New mandatory field
});
```

### Key Components

1. **CourseImageUpload** (`src/components/ui/course-image-upload.tsx`)
   - Drag & drop image upload
   - File validation (type, size)
   - Integration with face detection

2. **ImageCropper** (`src/components/ui/image-cropper.tsx`)
   - Crop images to square aspect ratio
   - Zoom and rotation controls
   - Real-time face validation

3. **FaceDetectionValidator** (`src/utils/faceDetectionValidation.ts`)
   - Validates exactly one face per image
   - Checks image quality and confidence
   - Lightweight face detection using face-api.js

### API Changes

#### Updated Join Request Creation

```typescript
export const createJoinRequest = StudentMutationMiddleware({
  args: {
    courseId: v.id('courses'),
    lecturerId: v.id('userProfiles'),
    message: v.optional(v.string()),
    uniqueCode: v.optional(v.string()),
    courseSpecificImageId: v.id('_storage'), // New required field
  },
  // ...
});
```

#### Enhanced Course Details

```typescript
// getCourseDetails now returns course-specific images for students
{
  students: [
    {
      // ... existing fields
      imageUrl: string | null, // Prioritizes course-specific image
      courseSpecificImageUrl: string | null,
      profileImageUrl: string | null,
    },
  ];
}
```

## User Experience Flow

### For Students

1. **Find Course**: Search for course using course code
2. **Enter Details**: Provide registration number or unique code
3. **Upload Photo**:
   - Upload clear photo of themselves
   - Crop and adjust image as needed
   - Validate face detection (exactly 1 face required)
4. **Submit Request**: Send join request with course-specific image

### For Lecturers

1. **Review Requests**: See student requests with course-specific photos
2. **Identify Students**: Use photos to match students with class lists
3. **Approve/Reject**: Make decisions based on visual identification
4. **View Students**: See course-specific images in StudentsTable
5. **Manual Verification**: Use images for attendance verification

## Security & Privacy

### Image Validation

- Only accepts image files (JPG, PNG)
- Maximum file size: 5MB
- Face detection prevents inappropriate images
- Exactly one face required per image

### Data Privacy

- Images are course-specific and isolated
- Automatic cleanup when courses are deleted
- Images stored securely in Convex storage
- No sharing of images across courses

### Access Control

- Only course lecturers can see student images
- Students can only upload images for their own requests
- Proper authentication and authorization checks

## Face Detection Requirements

### Image Quality Standards

- Clear, well-lit photos
- Face clearly visible (no sunglasses, hats, masks)
- Single person per image
- Minimum face size: 80x80 pixels
- Detection confidence threshold: 50%

### Technical Specifications

- Uses face-api.js TinyFaceDetector
- Lightweight and fast detection
- Client-side processing for privacy
- Fallback error handling

## Visual Indicators

### In Join Requests Page

- Course-specific images displayed prominently
- Green camera icon indicates course-specific photo
- Fallback to profile image with reduced opacity
- Tooltips explain image source

### In StudentsTable

- Course-specific images prioritized
- Tooltips indicate image type
- Hover effects for better UX

## Error Handling

### Upload Errors

- File type validation
- File size limits
- Face detection failures
- Network upload issues

### Graceful Degradation

- Fallback to profile images when available
- Clear error messages for users
- Retry mechanisms for failed uploads

## Future Enhancements

### Potential Improvements

1. **Bulk Image Processing**: Allow lecturers to process multiple requests
2. **Image Comparison**: Compare course images with profile images
3. **Quality Scoring**: Rate image quality for better identification
4. **Mobile Optimization**: Enhanced mobile camera integration
5. **Accessibility**: Screen reader support for image descriptions

### Analytics & Insights

- Track image upload success rates
- Monitor face detection accuracy
- Analyze lecturer approval patterns

## Testing

### Manual Testing Checklist

- [ ] Image upload with valid face
- [ ] Image upload with multiple faces (should fail)
- [ ] Image upload with no face (should fail)
- [ ] Image cropping functionality
- [ ] Face detection validation
- [ ] Join request submission
- [ ] Lecturer image viewing
- [ ] Course deletion cleanup
- [ ] Mobile responsiveness

### Automated Testing

- Unit tests for face detection validation
- Integration tests for image upload flow
- E2E tests for complete user journey

## Deployment Notes

### Dependencies

- `react-easy-crop`: Image cropping functionality
- `face-api.js`: Face detection (already installed)
- `@radix-ui/react-slider`: Cropper controls

### Environment Setup

- Ensure face-api.js models are available in `/public/models/`
- Convex storage properly configured
- File upload limits set appropriately

### Performance Considerations

- Face detection runs client-side
- Image processing may be CPU intensive
- Consider lazy loading for large student lists
- Optimize image storage and delivery

## Support & Troubleshooting

### Common Issues

1. **Face not detected**: Ensure good lighting and clear face visibility
2. **Upload fails**: Check file size and internet connection
3. **Cropper not working**: Verify browser compatibility
4. **Images not displaying**: Check Convex storage URLs

### Browser Compatibility

- Modern browsers with Canvas API support
- WebRTC for camera access (future enhancement)
- File API for drag & drop uploads

---

This feature significantly enhances the student identification process in ClassSync, providing lecturers with authentic, course-specific images for better attendance management and student verification.
