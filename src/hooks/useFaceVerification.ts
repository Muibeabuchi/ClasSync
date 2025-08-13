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

  // Enhanced face detection from video with SSDMobileNet and landmarks
  const detectFaceFromVideo = useCallback(
    async (
      videoElement: HTMLVideoElement,
      useHighAccuracy = true, // Default to high accuracy for attendance
    ): Promise<
      FaceVerificationResult & {
        quality?: {
          faceSize: { width: number; height: number };
          confidence: number;
          landmarkQuality: number;
          isGoodQuality: boolean;
        };
        landmarks?: faceapi.FaceLandmarks68 | faceapi.FaceLandmarks68Tiny;
        feedback?: string[];
      }
    > => {
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

        // Use enhanced detection with landmarks for better accuracy
        const result = await faceApiService.detectFaceWithLandmarks(
          videoElement,
          useHighAccuracy,
        );

        if (!result.descriptor || !result.quality) {
          return {
            success: false,
            error:
              'No face detected. Please ensure your face is clearly visible and well-lit.',
          };
        }

        // Generate feedback based on quality
        const feedback: string[] = [];

        if (
          result.quality.faceSize.width < 120 ||
          result.quality.faceSize.height < 120
        ) {
          feedback.push('Move closer to the camera for better detection');
        }

        if (result.quality.confidence < 0.7) {
          feedback.push('Improve lighting for better face detection');
        }

        if (result.quality.landmarkQuality < 0.7) {
          feedback.push(
            'Face the camera directly for better landmark detection',
          );
        }

        if (result.quality.isGoodQuality) {
          feedback.push('Excellent face quality detected');
        }

        console.log('Enhanced face detection from video:', {
          model: faceApiService.getModelInfo().primaryDetector,
          quality: result.quality,
          landmarkModel: faceApiService.getModelInfo().landmarkModel,
        });

        return {
          success: true,
          descriptor: result.descriptor,
          confidence: result.quality.confidence,
          quality: result.quality,
          landmarks: result.landmarks,
          feedback,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Face detection failed';
        console.error('Enhanced face detection error:', err);
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

  // Enhanced face verification for attendance with SSDMobileNet and landmarks
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

        // Log enhanced verification attempt
        console.log('Enhanced face verification for attendance:', {
          model: faceApiService.getModelInfo().primaryDetector,
          landmarkModel: faceApiService.getModelInfo().landmarkModel,
          descriptorLength: descriptorArray.length,
          retryAttempt,
        });

        const result = await verifyFaceMutation({
          attendanceSessionId: attendanceSessionId as any,
          faceDescriptor: descriptorArray,
          location,
          retryAttempt,
        });

        // Enhanced logging for debugging
        if (result.success) {
          console.log('Face verification successful:', {
            matchScore: result.faceMatchScore,
            verificationStatus: result.verificationStatus,
            model: 'SSDMobileNet',
          });
        } else {
          console.log('Face verification failed:', {
            error: result.error,
            matchScore: result.faceMatchScore,
            threshold: result.threshold,
          });
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Face verification failed';
        setError(errorMessage);
        console.error('Face verification error:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [verifyFaceMutation],
  );

  // Enhanced attendance verification with quality assessment
  const verifyAttendanceWithQuality = useCallback(
    async (
      videoElement: HTMLVideoElement,
      storedDescriptorArray: number[],
    ): Promise<{
      success: boolean;
      matchScore: number;
      confidence: number;
      qualityScore: number;
      feedback: string[];
      error?: string;
    }> => {
      if (!modelsLoaded) {
        return {
          success: false,
          matchScore: 0,
          confidence: 0,
          qualityScore: 0,
          feedback: ['Face detection models not loaded'],
          error: 'Models not loaded',
        };
      }

      try {
        const storedDescriptor = faceApiService.arrayToDescriptor(
          storedDescriptorArray,
        );
        const result = await faceApiService.verifyAttendanceFace(
          videoElement,
          storedDescriptor,
        );

        console.log('Enhanced attendance verification result:', {
          success: result.success,
          matchScore: result.matchScore.toFixed(3),
          confidence: result.confidence.toFixed(3),
          qualityScore: result.qualityScore.toFixed(3),
          feedback: result.feedback,
          model: faceApiService.getModelInfo().primaryDetector,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Verification failed';
        console.error('Enhanced attendance verification error:', err);
        return {
          success: false,
          matchScore: 0,
          confidence: 0,
          qualityScore: 0,
          feedback: ['Technical error during verification'],
          error: errorMessage,
        };
      }
    },
    [modelsLoaded],
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
    verifyAttendanceWithQuality, // New enhanced method
    toggleFaceVerification,
    compareFaces,

    // Utilities
    faceApiService,
  };
};
