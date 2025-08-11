// Test utility for the fixed face detection validation
// This can be used for debugging and testing the face detection feature

import { faceDetectionValidator } from './faceDetectionValidation';
import { FaceApiService } from '@/lib/faceApi';

export const testFaceDetectionFixed = async (
  imageFile: File,
): Promise<void> => {
  console.log('🧪 Testing fixed face detection for file:', imageFile.name);
  console.log('📁 File size:', (imageFile.size / 1024 / 1024).toFixed(2), 'MB');
  console.log('📄 File type:', imageFile.type);

  try {
    // Test model loading first
    console.log('🔄 Testing model loading...');
    const faceApiService = FaceApiService.getInstance();
    const modelsLoaded = await faceApiService.loadModels();

    if (modelsLoaded) {
      console.log('✅ Models loaded successfully');
    } else {
      console.log('❌ Models failed to load');
      return;
    }

    // Test face validation
    console.log('🔍 Testing face validation...');
    const result = await faceDetectionValidator.validateImageFile(imageFile);

    console.log('📊 Face detection result:', {
      isValid: result.isValid,
      faceCount: result.faceCount,
      error: result.error,
    });

    if (result.isValid) {
      console.log('✅ Image is valid for course-specific upload');
      console.log('👤 Exactly one face detected with good quality');
    } else {
      console.log('❌ Image validation failed:', result.error);
      if (result.faceCount !== undefined) {
        console.log(`👥 Face count: ${result.faceCount}`);
      }
    }
  } catch (error) {
    console.error('💥 Face detection test failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('FaceLandmark68Net')) {
        console.error('🚨 Landmark model error - this should be fixed now');
      }
    }
  }
};

// Test model loading independently
export const testModelLoading = async (): Promise<boolean> => {
  console.log('🔄 Testing model loading independently...');

  try {
    const faceApiService = FaceApiService.getInstance();
    const result = await faceApiService.loadModels();

    if (result) {
      console.log('✅ All models loaded successfully');
      console.log('📋 Model status:');
      console.log('  - TinyFaceDetector:', faceApiService.isModelsLoaded());
      return true;
    } else {
      console.log('❌ Model loading failed');
      return false;
    }
  } catch (error) {
    console.error('💥 Model loading test failed:', error);
    return false;
  }
};

// Usage example for testing in browser console:
// const fileInput = document.querySelector('input[type="file"]');
// fileInput.addEventListener('change', (e) => {
//   const file = e.target.files[0];
//   if (file) testFaceDetectionFixed(file);
// });
