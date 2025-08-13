import * as faceapi from 'face-api.js';

// Face-api.js model loading and initialization with SSDMobileNet for higher accuracy
export class FaceApiService {
  private static instance: FaceApiService;
  private modelsLoaded = false;
  private ssdMobilenetLoaded = false;
  private tinyFaceDetectorLoaded = false;

  static getInstance(): FaceApiService {
    if (!FaceApiService.instance) {
      FaceApiService.instance = new FaceApiService();
    }
    return FaceApiService.instance;
  }

  async loadModels(): Promise<boolean> {
    if (this.modelsLoaded) return true;

    try {
      console.log('Loading face-api.js models from /models...');

      // Load SSDMobileNet for high accuracy face detection
      console.log('Loading SSDMobileNetV1 (high accuracy)...');
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        this.ssdMobilenetLoaded = true;
        console.log('SSDMobileNetV1 loaded successfully');
      } catch (error) {
        console.warn(
          'Failed to load SSDMobileNetV1, falling back to TinyFaceDetector:',
          error,
        );

        // Fallback to TinyFaceDetector if SSDMobileNet fails
        console.log('Loading TinyFaceDetector (fallback)...');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        this.tinyFaceDetectorLoaded = true;
        console.log('TinyFaceDetector loaded as fallback');
      }

      // Load face landmark models (68-point for better accuracy)
      console.log('Loading FaceLandmark68Net (high accuracy)...');
      try {
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        console.log('FaceLandmark68Net loaded successfully');
      } catch (error) {
        console.warn(
          'Failed to load FaceLandmark68Net, falling back to tiny version:',
          error,
        );
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
        console.log('FaceLandmark68TinyNet loaded as fallback');
      }

      // Load face recognition model
      console.log('Loading FaceRecognitionNet...');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

      // Add a small delay to ensure models are fully initialized
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify at least one face detector is loaded
      const hasFaceDetector =
        this.ssdMobilenetLoaded || this.tinyFaceDetectorLoaded;
      if (!hasFaceDetector) {
        throw new Error('No face detection model could be loaded');
      }

      // Verify landmark model is loaded
      const hasLandmarkModel =
        faceapi.nets.faceLandmark68Net.isLoaded ||
        faceapi.nets.faceLandmark68TinyNet.isLoaded;
      if (!hasLandmarkModel) {
        throw new Error('No face landmark model could be loaded');
      }

      // Verify face recognition model is loaded
      if (!faceapi.nets.faceRecognitionNet.isLoaded) {
        throw new Error('FaceRecognitionNet failed to load');
      }

      this.modelsLoaded = true;
      console.log('Face-api.js models loaded successfully', {
        ssdMobilenet: this.ssdMobilenetLoaded,
        tinyFaceDetector: this.tinyFaceDetectorLoaded,
        faceLandmark68: faceapi.nets.faceLandmark68Net.isLoaded,
        faceLandmark68Tiny: faceapi.nets.faceLandmark68TinyNet.isLoaded,
        faceRecognition: faceapi.nets.faceRecognitionNet.isLoaded,
      });
      return true;
    } catch (error) {
      console.error('Failed to load face-api.js models:', error);
      this.modelsLoaded = false;

      // More specific error messages
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error(
          'Model loading timed out. Please check your internet connection and try again.',
        );
      }

      throw new Error(
        `Failed to load face recognition models. Please ensure model files are available at /models/. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  isModelsLoaded(): boolean {
    return this.modelsLoaded;
  }

  // Get the best available face detector
  private getFaceDetector(useHighAccuracy = false) {
    if (this.ssdMobilenetLoaded) {
      // Use SSDMobileNet for high accuracy
      return new faceapi.SsdMobilenetv1Options({
        minConfidence: useHighAccuracy ? 0.5 : 0.6, // Higher confidence for better accuracy
        maxResults: 100, // Allow multiple faces for detection
      });
    } else if (this.tinyFaceDetectorLoaded) {
      // Fallback to TinyFaceDetector
      return new faceapi.TinyFaceDetectorOptions({
        inputSize: useHighAccuracy ? 416 : 224,
        scoreThreshold: useHighAccuracy ? 0.3 : 0.5,
      });
    } else {
      throw new Error('No face detection model is loaded');
    }
  }

  // Get the best available landmark detector
  private useTinyLandmarks(): boolean {
    // Use full 68-point landmarks if available, otherwise use tiny
    return !faceapi.nets.faceLandmark68Net.isLoaded;
  }

  // Detect face and extract descriptor from image/video element
  async detectFaceAndGetDescriptor(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    useHighAccuracy = false,
  ): Promise<Float32Array | null> {
    if (!this.modelsLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    try {
      // Get the best available detector
      const detector = this.getFaceDetector(useHighAccuracy);
      const useTinyLandmarks = this.useTinyLandmarks();

      console.log(
        `Detecting face with ${this.ssdMobilenetLoaded ? 'SSDMobileNetV1' : 'TinyFaceDetector'}`,
        {
          useHighAccuracy,
          useTinyLandmarks,
          detectorOptions: detector,
        },
      );

      // For video elements, ensure they're ready
      if (input instanceof HTMLVideoElement) {
        if (input.readyState < 2) {
          console.log('Video not ready for processing');
          return null;
        }
        if (input.videoWidth === 0 || input.videoHeight === 0) {
          console.log('Video dimensions not available');
          return null;
        }
      }

      // Detect single face with landmarks and descriptor
      const detection = await faceapi
        .detectSingleFace(input, detector)
        .withFaceLandmarks(useTinyLandmarks)
        .withFaceDescriptor();

      if (!detection) {
        console.log('No face detected in input');
        return null;
      }

      // Validate detection quality
      const box = detection.detection.box;
      const minFaceSize = useHighAccuracy ? 100 : 80; // Higher minimum for SSDMobileNet

      if (box.width < minFaceSize || box.height < minFaceSize) {
        console.log(
          `Face too small: ${box.width}x${box.height}, minimum: ${minFaceSize}x${minFaceSize}`,
        );
        return null;
      }

      // Additional quality checks for SSDMobileNet
      if (this.ssdMobilenetLoaded) {
        const confidence = detection.detection.score;
        const minConfidence = useHighAccuracy ? 0.7 : 0.6;

        if (confidence < minConfidence) {
          console.log(
            `Face detection confidence too low: ${confidence}, minimum: ${minConfidence}`,
          );
          return null;
        }
      }

      console.log(
        'Face detected successfully:',
        `${Math.round(box.width)}x${Math.round(box.height)}`,
        'confidence:',
        detection.detection.score.toFixed(3),
        'descriptor length:',
        detection.descriptor.length,
      );

      return detection.descriptor;
    } catch (error) {
      console.error('Face detection failed:', error);
      throw error;
    }
  }

  // Calculate Euclidean distance between two descriptors
  calculateDistance(
    descriptor1: Float32Array,
    descriptor2: Float32Array,
  ): number {
    if (descriptor1.length !== descriptor2.length) {
      throw new Error('Descriptors must have the same length');
    }

    let sumSquaredDifferences = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      const diff = descriptor1[i] - descriptor2[i];
      sumSquaredDifferences += diff * diff;
    }

    return Math.sqrt(sumSquaredDifferences);
  }

  // Check if two faces match with improved thresholds for SSDMobileNet
  isFaceMatch(
    descriptor1: Float32Array,
    descriptor2: Float32Array,
    threshold?: number,
  ): boolean {
    const distance = this.calculateDistance(descriptor1, descriptor2);

    // Use different thresholds based on the model being used
    const defaultThreshold = this.ssdMobilenetLoaded ? 0.5 : 0.6;
    const finalThreshold = threshold ?? defaultThreshold;

    console.log(
      `Face comparison: distance=${distance.toFixed(3)}, threshold=${finalThreshold}, match=${distance <= finalThreshold}`,
    );

    return distance <= finalThreshold;
  }

  // Get face match confidence score (0-1, higher is more confident)
  getFaceMatchConfidence(
    descriptor1: Float32Array,
    descriptor2: Float32Array,
  ): number {
    const distance = this.calculateDistance(descriptor1, descriptor2);
    const maxDistance = this.ssdMobilenetLoaded ? 1.0 : 1.2;

    // Convert distance to confidence (inverse relationship)
    const confidence = Math.max(0, 1 - distance / maxDistance);
    return Math.min(1, confidence);
  }

  // Convert Float32Array to regular array for storage
  descriptorToArray(descriptor: Float32Array): number[] {
    return Array.from(descriptor);
  }

  // Convert array back to Float32Array
  arrayToDescriptor(array: number[]): Float32Array {
    return new Float32Array(array);
  }

  // Detect multiple faces in an image (for validation) - simplified version
  async detectAllFaces(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  ): Promise<faceapi.FaceDetection[]> {
    if (!this.modelsLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    try {
      // Use the best available detector for face validation
      const detector = this.getFaceDetector(true); // Use high accuracy for validation

      console.log(
        `Detecting all faces with ${this.ssdMobilenetLoaded ? 'SSDMobileNetV1' : 'TinyFaceDetector'}`,
      );

      // Use only face detection without landmarks or descriptors for validation
      const detections = await faceapi.detectAllFaces(input, detector);

      console.log(`Detected ${detections.length} faces in image`);
      return detections;
    } catch (error) {
      console.error('Multiple face detection failed:', error);
      return [];
    }
  }

  // Simplified face validation for join course (only checks face count)
  async validateFaceCount(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  ): Promise<{ faceCount: number; detections: faceapi.FaceDetection[] }> {
    if (!this.modelsLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    try {
      const detections = await this.detectAllFaces(input);
      return {
        faceCount: detections.length,
        detections,
      };
    } catch (error) {
      console.error('Face validation failed:', error);
      return {
        faceCount: 0,
        detections: [],
      };
    }
  }

  // Enhanced face detection with landmarks for attendance verification
  async detectFaceWithLandmarks(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    useHighAccuracy = true,
  ): Promise<{
    detection: faceapi.FaceDetection | null;
    landmarks: faceapi.FaceLandmarks68 | faceapi.FaceLandmarks68Tiny | null;
    descriptor: Float32Array | null;
    quality: {
      faceSize: { width: number; height: number };
      confidence: number;
      landmarkQuality: number;
      isGoodQuality: boolean;
    } | null;
  }> {
    if (!this.modelsLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    try {
      const detector = this.getFaceDetector(useHighAccuracy);
      const useTinyLandmarks = this.useTinyLandmarks();

      console.log(
        `Detecting face with landmarks using ${this.ssdMobilenetLoaded ? 'SSDMobileNetV1' : 'TinyFaceDetector'}`,
        { useHighAccuracy, useTinyLandmarks },
      );

      // For video elements, ensure they're ready
      if (input instanceof HTMLVideoElement) {
        if (input.readyState < 2) {
          console.log('Video not ready for processing');
          return {
            detection: null,
            landmarks: null,
            descriptor: null,
            quality: null,
          };
        }
        if (input.videoWidth === 0 || input.videoHeight === 0) {
          console.log('Video dimensions not available');
          return {
            detection: null,
            landmarks: null,
            descriptor: null,
            quality: null,
          };
        }
      }

      // Detect face with landmarks and descriptor
      const result = await faceapi
        .detectSingleFace(input, detector)
        .withFaceLandmarks(useTinyLandmarks)
        .withFaceDescriptor();

      if (!result) {
        console.log('No face detected with landmarks');
        return {
          detection: null,
          landmarks: null,
          descriptor: null,
          quality: null,
        };
      }

      const { detection, landmarks, descriptor } = result;
      const box = detection.box;

      // Calculate landmark quality score
      const landmarkQuality = this.calculateLandmarkQuality(landmarks);

      // Enhanced quality assessment
      const minFaceSize = useHighAccuracy ? 120 : 100; // Higher for SSDMobileNet
      const minConfidence = this.ssdMobilenetLoaded ? 0.7 : 0.6;
      const minLandmarkQuality = 0.7;

      const isGoodQuality =
        box.width >= minFaceSize &&
        box.height >= minFaceSize &&
        detection.score >= minConfidence &&
        landmarkQuality >= minLandmarkQuality;

      const quality = {
        faceSize: {
          width: Math.round(box.width),
          height: Math.round(box.height),
        },
        confidence: detection.score,
        landmarkQuality,
        isGoodQuality,
      };

      console.log('Face detected with landmarks:', {
        size: `${quality.faceSize.width}x${quality.faceSize.height}`,
        confidence: quality.confidence.toFixed(3),
        landmarkQuality: quality.landmarkQuality.toFixed(3),
        isGoodQuality,
        model: this.ssdMobilenetLoaded ? 'SSDMobileNet' : 'TinyFaceDetector',
      });

      return { detection, landmarks, descriptor, quality };
    } catch (error) {
      console.error('Face detection with landmarks failed:', error);
      throw error;
    }
  }

  // Calculate landmark quality score based on landmark positions
  private calculateLandmarkQuality(
    landmarks: faceapi.FaceLandmarks68 | faceapi.FaceLandmarks68Tiny,
  ): number {
    try {
      const positions = landmarks.positions;

      // Check if we have enough landmarks
      if (positions.length < 17) {
        // Minimum for basic face structure
        return 0.3;
      }

      // Calculate face symmetry and structure quality
      let qualityScore = 0.5; // Base score

      // Check if landmarks form a reasonable face structure
      if (positions.length >= 68) {
        // Full 68-point landmarks - better quality assessment
        const jawline = landmarks.getJawOutline();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const nose = landmarks.getNose();
        const mouth = landmarks.getMouth();

        // Check eye symmetry
        if (leftEye.length > 0 && rightEye.length > 0) {
          const eyeDistance = Math.abs(leftEye[0].x - rightEye[0].x);
          if (eyeDistance > 30) qualityScore += 0.2; // Good eye separation
        }

        // Check face structure completeness
        if (jawline.length > 10) qualityScore += 0.1;
        if (nose.length > 5) qualityScore += 0.1;
        if (mouth.length > 10) qualityScore += 0.1;
      } else {
        // Tiny landmarks - basic quality check
        qualityScore += 0.3; // Less detailed but still useful
      }

      return Math.min(1.0, qualityScore);
    } catch (error) {
      console.warn('Landmark quality calculation failed:', error);
      return 0.5; // Default moderate quality
    }
  }

  // Verify face against stored descriptor with detailed results and landmarks
  async verifyFaceIdentity(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    storedDescriptor: Float32Array,
    useHighAccuracy = true,
  ): Promise<{
    isMatch: boolean;
    confidence: number;
    distance: number;
    faceDetected: boolean;
    quality?: {
      faceSize: { width: number; height: number };
      confidence: number;
      landmarkQuality: number;
      isGoodQuality: boolean;
    };
    landmarks?: faceapi.FaceLandmarks68 | faceapi.FaceLandmarks68Tiny;
    error?: string;
  }> {
    try {
      // Use enhanced detection with landmarks
      const result = await this.detectFaceWithLandmarks(input, useHighAccuracy);

      if (!result.descriptor || !result.quality) {
        return {
          isMatch: false,
          confidence: 0,
          distance: Infinity,
          faceDetected: false,
          error: 'No face detected in the current image/video',
        };
      }

      // Calculate distance and confidence
      const distance = this.calculateDistance(
        storedDescriptor,
        result.descriptor,
      );
      const confidence = this.getFaceMatchConfidence(
        storedDescriptor,
        result.descriptor,
      );
      const isMatch = this.isFaceMatch(storedDescriptor, result.descriptor);

      // Enhanced logging for attendance verification
      console.log('Face verification result:', {
        isMatch,
        confidence: confidence.toFixed(3),
        distance: distance.toFixed(3),
        faceQuality: result.quality,
        model: this.ssdMobilenetLoaded ? 'SSDMobileNet' : 'TinyFaceDetector',
      });

      return {
        isMatch,
        confidence,
        distance,
        faceDetected: true,
        quality: result.quality,
        landmarks: result.landmarks,
      };
    } catch (error) {
      console.error('Face verification error:', error);
      return {
        isMatch: false,
        confidence: 0,
        distance: Infinity,
        faceDetected: false,
        error:
          error instanceof Error ? error.message : 'Unknown verification error',
      };
    }
  }

  // Enhanced attendance verification with quality checks
  async verifyAttendanceFace(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    storedDescriptor: Float32Array,
  ): Promise<{
    success: boolean;
    matchScore: number;
    confidence: number;
    qualityScore: number;
    feedback: string[];
    error?: string;
  }> {
    try {
      const result = await this.verifyFaceIdentity(
        input,
        storedDescriptor,
        true,
      );

      const feedback: string[] = [];
      let qualityScore = 0.5;

      if (!result.faceDetected) {
        return {
          success: false,
          matchScore: 0,
          confidence: 0,
          qualityScore: 0,
          feedback: [
            'No face detected',
            'Ensure good lighting and face visibility',
          ],
          error: result.error,
        };
      }

      // Quality assessment with feedback
      if (result.quality) {
        qualityScore =
          (result.quality.confidence + result.quality.landmarkQuality) / 2;

        if (
          result.quality.faceSize.width < 120 ||
          result.quality.faceSize.height < 120
        ) {
          feedback.push('Face appears small - move closer to camera');
        }

        if (result.quality.confidence < 0.7) {
          feedback.push('Low detection confidence - improve lighting');
        }

        if (result.quality.landmarkQuality < 0.7) {
          feedback.push('Face landmarks unclear - face camera directly');
        }

        if (result.quality.isGoodQuality) {
          feedback.push('Good face quality detected');
        }
      }

      // Match assessment
      const matchScore = 1 - result.distance; // Convert distance to score
      const isGoodMatch = result.isMatch && result.confidence > 0.7;

      if (isGoodMatch) {
        feedback.push(
          `Strong face match (${Math.round(result.confidence * 100)}%)`,
        );
      } else if (result.isMatch) {
        feedback.push(
          `Moderate face match (${Math.round(result.confidence * 100)}%)`,
        );
      } else {
        feedback.push('Face does not match registered profile');
      }

      return {
        success: isGoodMatch,
        matchScore,
        confidence: result.confidence,
        qualityScore,
        feedback,
      };
    } catch (error) {
      console.error('Attendance face verification error:', error);
      return {
        success: false,
        matchScore: 0,
        confidence: 0,
        qualityScore: 0,
        feedback: ['Verification failed due to technical error'],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get model information for debugging
  getModelInfo(): {
    ssdMobilenetLoaded: boolean;
    tinyFaceDetectorLoaded: boolean;
    faceLandmark68Loaded: boolean;
    faceLandmark68TinyLoaded: boolean;
    faceRecognitionLoaded: boolean;
    primaryDetector: string;
    landmarkModel: string;
  } {
    return {
      ssdMobilenetLoaded: this.ssdMobilenetLoaded,
      tinyFaceDetectorLoaded: this.tinyFaceDetectorLoaded,
      faceLandmark68Loaded: faceapi.nets.faceLandmark68Net.isLoaded,
      faceLandmark68TinyLoaded: faceapi.nets.faceLandmark68TinyNet.isLoaded,
      faceRecognitionLoaded: faceapi.nets.faceRecognitionNet.isLoaded,
      primaryDetector: this.ssdMobilenetLoaded
        ? 'SSDMobileNetV1'
        : 'TinyFaceDetector',
      landmarkModel: faceapi.nets.faceLandmark68Net.isLoaded
        ? 'FaceLandmark68Net'
        : 'FaceLandmark68TinyNet',
    };
  }

  // Draw detection results on canvas (for debugging/preview)
  drawDetections(
    canvas: HTMLCanvasElement,
    input: HTMLImageElement | HTMLVideoElement,
    detections: faceapi.WithFaceDescriptor<
      faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
    >[],
  ): void {
    const displaySize = {
      width:
        (input as HTMLVideoElement).videoWidth ||
        (input as HTMLImageElement).width ||
        640,
      height:
        (input as HTMLVideoElement).videoHeight ||
        (input as HTMLImageElement).height ||
        480,
    };
    faceapi.matchDimensions(canvas, displaySize);

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Clear canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Draw bounding boxes and landmarks
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

    // Add model info overlay
    if (ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 30);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(
        `Model: ${this.ssdMobilenetLoaded ? 'SSDMobileNet' : 'TinyFaceDetector'}`,
        15,
        30,
      );
    }
  }
}

// Export singleton instance
export const faceApiService = FaceApiService.getInstance();
