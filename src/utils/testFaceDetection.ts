// Test utility for face detection validation
// This can be used for debugging and testing the face detection feature

import { faceDetectionValidator } from './faceDetectionValidation';

export const testFaceDetection = async (imageFile: File): Promise<void> => {
  console.log('Testing face detection for file:', imageFile.name);
  console.log('File size:', (imageFile.size / 1024 / 1024).toFixed(2), 'MB');
  console.log('File type:', imageFile.type);

  try {
    const result = await faceDetectionValidator.validateImageFile(imageFile);

    console.log('Face detection result:', {
      isValid: result.isValid,
      faceCount: result.faceCount,
      error: result.error,
    });

    if (result.isValid) {
      console.log('✅ Image is valid for course-specific upload');
    } else {
      console.log('❌ Image validation failed:', result.error);
    }
  } catch (error) {
    console.error('Face detection test failed:', error);
  }
};

// Usage example:
// const fileInput = document.querySelector('input[type="file"]');
// fileInput.addEventListener('change', (e) => {
//   const file = e.target.files[0];
//   if (file) testFaceDetection(file);
// });
