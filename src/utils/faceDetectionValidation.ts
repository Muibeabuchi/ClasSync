import { FaceApiService } from '@/lib/faceApi';

export interface FaceValidationResult {
  isValid: boolean;
  error?: string;
  faceCount?: number;
}

export class FaceDetectionValidator {
  private faceApiService: FaceApiService;

  constructor() {
    this.faceApiService = FaceApiService.getInstance();
  }

  /**
   * Validates that an image contains exactly one face
   * @param imageElement - The image element to validate
   * @returns Promise<FaceValidationResult>
   */
  async validateSingleFace(
    imageElement: HTMLImageElement,
  ): Promise<FaceValidationResult> {
    try {
      // Ensure face detection models are loaded
      const isLoaded = await this.faceApiService.loadModels();
      if (!isLoaded) {
        return {
          isValid: false,
          error:
            'Face detection models failed to load. Please check your internet connection and try again.',
        };
      }

      // Use the simplified face validation method
      const result = await this.faceApiService.validateFaceCount(imageElement);
      const { faceCount, detections } = result;

      if (faceCount === 0) {
        return {
          isValid: false,
          error:
            'No face detected in the image. Please upload a clear, well-lit photo showing your face without sunglasses or face coverings.',
          faceCount: 0,
        };
      }

      if (faceCount > 1) {
        return {
          isValid: false,
          error: `Multiple faces detected (${faceCount}). Please upload an image with only your face visible.`,
          faceCount,
        };
      }

      // Exactly one face detected - validate quality
      const singleFace = detections[0];
      const box = singleFace.box;

      // Check if face is too small (minimum 80x80 pixels)
      if (box.width < 80 || box.height < 80) {
        return {
          isValid: false,
          error:
            'Your face appears too small in the image. Please take a closer photo or crop the image to focus on your face.',
          faceCount: 1,
        };
      }

      // Check detection confidence (score should be reasonable)
      const confidence = singleFace.score;
      if (confidence < 0.5) {
        return {
          isValid: false,
          error:
            'Face detection confidence is low. Please ensure good lighting and that your face is clearly visible.',
          faceCount: 1,
        };
      }

      return {
        isValid: true,
        faceCount: 1,
      };
    } catch (error) {
      console.error('Face validation error:', error);

      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          return {
            isValid: false,
            error:
              'Face detection timed out. Please try again with a smaller image.',
          };
        }
        if (error.message.includes('load')) {
          return {
            isValid: false,
            error:
              'Failed to load face detection models. Please check your internet connection.',
          };
        }
        if (error.message.includes('FaceLandmark68Net')) {
          return {
            isValid: false,
            error:
              'Face detection models are not properly loaded. Please refresh the page and try again.',
          };
        }
      }

      return {
        isValid: false,
        error:
          'Face detection failed. Please try again with a different image or check your internet connection.',
      };
    }
  }

  /**
   * Validates an image file before processing
   * @param file - The image file to validate
   * @returns Promise<FaceValidationResult>
   */
  async validateImageFile(file: File): Promise<FaceValidationResult> {
    return new Promise((resolve) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        resolve({
          isValid: false,
          error: 'Please upload a valid image file.',
        });
        return;
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        resolve({
          isValid: false,
          error:
            'Image file is too large. Please upload an image smaller than 5MB.',
        });
        return;
      }

      // Create image element and validate face
      const img = new Image();
      img.onload = async () => {
        const result = await this.validateSingleFace(img);
        resolve(result);
      };
      img.onerror = () => {
        resolve({
          isValid: false,
          error: 'Failed to load image. Please try a different file.',
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }
}

// Export singleton instance
export const faceDetectionValidator = new FaceDetectionValidator();
