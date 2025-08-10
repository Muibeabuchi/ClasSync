import { useState, useCallback, useRef, useEffect } from 'react';
import { faceApiService } from '@/lib/faceApi';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

export interface FaceVerificationResult {
  success: boolean;
  descriptor?: Float32Array;
  error?: string;
  confidence?: number;
}

export interface FaceVerificationStatus {
  hasDescriptor: boolean;
  captureMethod?: 'live_camera' | 'image_upload';
  verificationEnabled: boolean;
}

export const useFaceVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convex mutations and queries
  const storeFaceDescriptor = useMutation(
    api.faceVerification.storeFaceDescriptor,
  );
  const verificationStatus = useQuery(
    api.faceVerification.getFaceVerificationStatus,
  );
  const toggleVerification = useMutation(
    api.faceVerification.toggleFaceVerification,
  );
  const verifyFaceMutation = useMutation(
    api.faceVerification.verifyFaceForAttendance,
  );

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    if (modelsLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('useFaceVerification: Starting lightweight model loading...');
      await faceApiService.loadModels();
      setModelsLoaded(true);
      console.log('useFaceVerification: Models loaded successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load face recognition models';
      setError(errorMessage);
      console.error('useFaceVerification: Model loading failed:', err);
      toast.error('Face Recognition Setup Failed', {
        description:
          'Unable to load face detection models. Please refresh and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [modelsLoaded]);

  // Detect face from video element (live camera)
  const detectFaceFromVideo = useCallback(
    async (
      videoElement: HTMLVideoElement,
      useHighAccuracy = false,
    ): Promise<FaceVerificationResult> => {
      if (!modelsLoaded) {
        return {
          success: false,
          error: 'Face detection models not loaded yet. Please wait...',
        };
      }

      try {
        // Check if video is ready
        if (!videoElement || videoElement.readyState < 2) {
          return {
            success: false,
            error: 'Video not ready for processing',
          };
        }

        const descriptor = await faceApiService.detectFaceAndGetDescriptor(
          videoElement,
          useHighAccuracy,
        );

        if (!descriptor) {
          return {
            success: false,
            error:
              'No face detected. Please ensure your face is clearly visible and well-lit.',
          };
        }

        return {
          success: true,
          descriptor,
          confidence: 1.0,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Face detection failed';
        console.error('Face detection error:', err);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [modelsLoaded],
  );

  // Detect face from image element (uploaded image)
  const detectFaceFromImage = useCallback(
    async (imageElement: HTMLImageElement): Promise<FaceVerificationResult> => {
      if (!modelsLoaded) {
        await loadModels();
      }

      setIsLoading(true);
      setError(null);

      try {
        // Use high accuracy for uploaded images
        const descriptor = await faceApiService.detectFaceAndGetDescriptor(
          imageElement,
          true,
        );

        if (!descriptor) {
          return {
            success: false,
            error:
              'No face detected in the image. Please upload a clear photo of your face.',
          };
        }

        // Check for multiple faces
        const allFaces = await faceApiService.detectAllFaces(imageElement);
        if (allFaces.length > 1) {
          return {
            success: false,
            error:
              'Multiple faces detected. Please upload an image with only your face.',
          };
        }

        return {
          success: true,
          descriptor,
          confidence: 1.0,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Face detection failed';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [modelsLoaded, loadModels],
  );

  // Store face descriptor for onboarding
  const saveFaceDescriptor = useCallback(
    async (
      descriptor: Float32Array,
      captureMethod: 'live_camera' | 'image_upload',
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const descriptorArray = faceApiService.descriptorToArray(descriptor);
        await storeFaceDescriptor({
          faceDescriptor: descriptorArray,
          captureMethod,
        });

        toast.success('Face Verification Setup Complete', {
          description:
            'Your face has been successfully registered for verification.',
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to save face data';
        setError(errorMessage);
        toast.error('Failed to Save Face Data', {
          description: errorMessage,
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [storeFaceDescriptor],
  );

  // Verify face for attendance
  const verifyFaceForAttendance = useCallback(
    async (
      descriptor: Float32Array,
      attendanceSessionId: string,
      location: { lat: number; long: number },
      retryAttempt = 1,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const descriptorArray = faceApiService.descriptorToArray(descriptor);
        // Use the mutation directly instead of api call
        const verifyFace = useMutation(
          api.faceVerification.verifyFaceForAttendance,
        );
        const result = await verifyFace({
          attendanceSessionId: attendanceSessionId as any,
          faceDescriptor: descriptorArray,
          location,
          retryAttempt,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Face verification failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Toggle face verification on/off
  const toggleFaceVerification = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await toggleVerification({ enabled });
        toast.success(
          enabled ? 'Face Verification Enabled' : 'Face Verification Disabled',
          {
            description: enabled
              ? 'Face verification is now required for attendance.'
              : 'Face verification has been disabled.',
          },
        );
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update settings';
        setError(errorMessage);
        toast.error('Settings Update Failed', {
          description: errorMessage,
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toggleVerification],
  );

  // Compare two face descriptors
  const compareFaces = useCallback(
    (descriptor1: Float32Array, descriptor2: Float32Array, threshold = 0.6) => {
      const distance = faceApiService.calculateDistance(
        descriptor1,
        descriptor2,
      );
      const isMatch = distance <= threshold;

      return {
        distance,
        isMatch,
        confidence: Math.max(0, 1 - distance / threshold),
      };
    },
    [],
  );

  return {
    // State
    isLoading,
    modelsLoaded,
    error,
    verificationStatus,

    // Actions
    loadModels,
    detectFaceFromVideo,
    detectFaceFromImage,
    saveFaceDescriptor,
    verifyFaceForAttendance,
    toggleFaceVerification,
    compareFaces,

    // Utilities
    faceApiService,
  };
};
