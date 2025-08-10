import * as faceapi from 'face-api.js';

// Face-api.js model loading and initialization
export class FaceApiService {
  private static instance: FaceApiService;
  private modelsLoaded = false;

  static getInstance(): FaceApiService {
    if (!FaceApiService.instance) {
      FaceApiService.instance = new FaceApiService();
    }
    return FaceApiService.instance;
  }

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    try {
      console.log('Loading face-api.js models from /models...');

      // Load models with proper error handling
      const modelPromises = [
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ];

      await Promise.all(modelPromises);

      // Verify models are loaded
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        throw new Error('TinyFaceDetector failed to load');
      }
      if (!faceapi.nets.faceLandmark68TinyNet.isLoaded) {
        throw new Error('FaceLandmark68TinyNet failed to load');
      }
      if (!faceapi.nets.faceRecognitionNet.isLoaded) {
        throw new Error('FaceRecognitionNet failed to load');
      }

      this.modelsLoaded = true;
      console.log('Face-api.js models loaded successfully');
    } catch (error) {
      console.error('Failed to load face-api.js models:', error);
      this.modelsLoaded = false;
      throw new Error(
        `Failed to load face recognition models. Please ensure model files are available at /models/. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  isModelsLoaded(): boolean {
    return this.modelsLoaded;
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
      // Configure detector options based on accuracy requirement
      const detector = new faceapi.TinyFaceDetectorOptions({
        inputSize: useHighAccuracy ? 416 : 224,
        scoreThreshold: useHighAccuracy ? 0.3 : 0.5, // Lower threshold for better detection
      });

      console.log(
        'Detecting face with TinyFaceDetector, inputSize:',
        useHighAccuracy ? 416 : 224,
        'scoreThreshold:',
        useHighAccuracy ? 0.3 : 0.5,
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
        .withFaceLandmarks(true) // Use tiny landmarks for performance
        .withFaceDescriptor();

      if (!detection) {
        console.log('No face detected in input');
        return null;
      }

      // Validate detection quality
      const box = detection.detection.box;
      const minFaceSize = useHighAccuracy ? 80 : 60;

      if (box.width < minFaceSize || box.height < minFaceSize) {
        console.log(
          `Face too small: ${box.width}x${box.height}, minimum: ${minFaceSize}x${minFaceSize}`,
        );
        return null;
      }

      console.log(
        'Face detected successfully:',
        `${Math.round(box.width)}x${Math.round(box.height)}`,
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

  // Check if two faces match (distance <= 0.6)
  isFaceMatch(
    descriptor1: Float32Array,
    descriptor2: Float32Array,
    threshold = 0.6,
  ): boolean {
    const distance = this.calculateDistance(descriptor1, descriptor2);
    return distance <= threshold;
  }

  // Convert Float32Array to regular array for storage
  descriptorToArray(descriptor: Float32Array): number[] {
    return Array.from(descriptor);
  }

  // Convert array back to Float32Array
  arrayToDescriptor(array: number[]): Float32Array {
    return new Float32Array(array);
  }

  // Detect multiple faces in an image (for validation)
  async detectAllFaces(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  ): Promise<
    faceapi.WithFaceDescriptor<
      faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
    >[]
  > {
    if (!this.modelsLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    try {
      const detections = await faceapi
        .detectAllFaces(
          input,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.4,
          }),
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

      return detections;
    } catch (error) {
      console.error('Multiple face detection failed:', error);
      return [];
    }
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
  }
}

// Export singleton instance
export const faceApiService = FaceApiService.getInstance();
