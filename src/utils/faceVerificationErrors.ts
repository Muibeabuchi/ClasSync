// Face verification error handling utilities

export interface FaceVerificationError {
  type:
    | 'face_mismatch'
    | 'no_face_detected'
    | 'camera_error'
    | 'network_error'
    | 'session_error'
    | 'unknown';
  title: string;
  message: string;
  actionable: boolean;
  retryable: boolean;
}

export function parseFaceVerificationError(
  error: unknown,
): FaceVerificationError {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Face verification failed (from server)
  if (
    errorMessage.includes('Face verification failed') &&
    errorMessage.includes('attempts remaining')
  ) {
    return {
      type: 'face_mismatch',
      title: 'Face Not Recognized',
      message:
        "Your face doesn't match our records. Please ensure good lighting and look directly at the camera.",
      actionable: true,
      retryable: true,
    };
  }

  // No face detected
  if (
    errorMessage.includes('No face detected') ||
    errorMessage.includes('face is clearly visible')
  ) {
    return {
      type: 'no_face_detected',
      title: 'No Face Detected',
      message:
        "We couldn't detect your face. Please ensure you're in good lighting and facing the camera directly.",
      actionable: true,
      retryable: true,
    };
  }

  // Camera/permission errors
  if (
    errorMessage.includes('camera') ||
    errorMessage.includes('permission') ||
    errorMessage.includes('getUserMedia')
  ) {
    return {
      type: 'camera_error',
      title: 'Camera Access Required',
      message:
        'Please allow camera access in your browser settings and try again.',
      actionable: true,
      retryable: true,
    };
  }

  // Session-related errors
  if (
    errorMessage.includes('session') &&
    (errorMessage.includes('ended') || errorMessage.includes('not active'))
  ) {
    return {
      type: 'session_error',
      title: 'Session Unavailable',
      message: 'The attendance session has ended or is no longer active.',
      actionable: false,
      retryable: false,
    };
  }

  // Network/connection errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection')
  ) {
    return {
      type: 'network_error',
      title: 'Connection Problem',
      message: 'Please check your internet connection and try again.',
      actionable: true,
      retryable: true,
    };
  }

  // GPS/location errors
  if (
    errorMessage.includes('location') ||
    errorMessage.includes('GPS') ||
    errorMessage.includes('radius')
  ) {
    return {
      type: 'network_error', // Treating as network for now
      title: 'Location Verification Failed',
      message:
        'You may be too far from the session location. Please move closer and try again.',
      actionable: true,
      retryable: true,
    };
  }

  // Face descriptor/onboarding errors
  if (
    errorMessage.includes('Face descriptor not found') ||
    errorMessage.includes('complete onboarding')
  ) {
    return {
      type: 'session_error',
      title: 'Setup Required',
      message:
        'Please complete your face verification setup in your profile first.',
      actionable: true,
      retryable: false,
    };
  }

  // Default unknown error
  return {
    type: 'unknown',
    title: 'Verification Failed',
    message:
      'Something went wrong during face verification. Please try again or use GPS-only verification.',
    actionable: true,
    retryable: true,
  };
}

export function getFaceVerificationTips(): string[] {
  return [
    "Ensure you're in good lighting",
    'Look directly at the camera',
    'Keep your face centered in the frame',
    'Remove glasses or hats if possible',
    'Stay still during verification',
  ];
}

export function getFaceVerificationSuccessMessage(matchScore: number): string {
  const percentage = Math.round((1 - matchScore) * 100);

  if (percentage >= 95) {
    return `Excellent match! (${percentage}% confidence)`;
  } else if (percentage >= 85) {
    return `Great match! (${percentage}% confidence)`;
  } else if (percentage >= 75) {
    return `Good match! (${percentage}% confidence)`;
  } else {
    return `Face verified! (${percentage}% confidence)`;
  }
}
