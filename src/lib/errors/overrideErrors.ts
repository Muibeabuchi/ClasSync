/**
 * Comprehensive error handling system for manual attendance override operations
 * Requirements: 4.4, 5.2, 6.4 - Error handling with contextual information
 */

/**
 * Override error types using objects instead of enums as per requirements
 */
export const OverrideErrorType = {
  // Session-related errors
  SESSION_STILL_ACTIVE: 'SESSION_STILL_ACTIVE',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  INVALID_SESSION_STATUS: 'INVALID_SESSION_STATUS',

  // Time window errors
  TIME_WINDOW_EXPIRED: 'TIME_WINDOW_EXPIRED',
  TIME_WINDOW_INVALID: 'TIME_WINDOW_INVALID',

  // Student-related errors
  STUDENT_ALREADY_PRESENT: 'STUDENT_ALREADY_PRESENT',
  STUDENT_NOT_ENROLLED: 'STUDENT_NOT_ENROLLED',
  STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',

  // Permission and authorization errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  LECTURER_NOT_OWNER: 'LECTURER_NOT_OWNER',

  // Validation errors
  INSUFFICIENT_JUSTIFICATION: 'INSUFFICIENT_JUSTIFICATION',
  INVALID_JUSTIFICATION_FORMAT: 'INVALID_JUSTIFICATION_FORMAT',
  MALFORMED_REQUEST: 'MALFORMED_REQUEST',

  // Duplicate operation errors
  DUPLICATE_OVERRIDE: 'DUPLICATE_OVERRIDE',
  CONCURRENT_OVERRIDE_ATTEMPT: 'CONCURRENT_OVERRIDE_ATTEMPT',

  // System errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export type OverrideErrorType =
  (typeof OverrideErrorType)[keyof typeof OverrideErrorType];

/**
 * Error severity levels for logging and UI display
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

/**
 * Error context interface for providing additional information
 */
export interface OverrideErrorContext {
  sessionId?: string;
  studentId?: string;
  lecturerId?: string;
  courseId?: string;
  windowHours?: number;
  timeRemaining?: number;
  justificationLength?: number;
  attemptCount?: number;
  timestamp?: number;
  userAgent?: string;
  [key: string]: any;
}

/**
 * Comprehensive error information interface
 */
export interface OverrideError {
  type: OverrideErrorType;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  context?: OverrideErrorContext;
  recoverable: boolean;
  retryable: boolean;
  timestamp: number;
  code: string;
}

/**
 * Error message mapping with contextual information
 * Requirements: 4.4, 5.2, 6.4 - Descriptive error messages with context
 */
export const getOverrideErrorMessage = (
  errorType: OverrideErrorType,
  context?: OverrideErrorContext,
): string => {
  const errorMessages: Record<
    OverrideErrorType,
    (ctx?: OverrideErrorContext) => string
  > = {
    [OverrideErrorType.SESSION_STILL_ACTIVE]: () =>
      'Manual overrides are only available after the session ends. Please wait for the session to complete.',

    [OverrideErrorType.SESSION_NOT_FOUND]: () =>
      'The attendance session could not be found. It may have been deleted or you may not have access to it.',

    [OverrideErrorType.INVALID_SESSION_STATUS]: () =>
      'Cannot perform override on a session with invalid status. Please refresh and try again.',

    [OverrideErrorType.TIME_WINDOW_EXPIRED]: (ctx) =>
      `Override window has expired. Overrides must be made within ${ctx?.windowHours || 24} hours of session end.`,

    [OverrideErrorType.TIME_WINDOW_INVALID]: () =>
      'Invalid time window configuration. Please contact support.',

    [OverrideErrorType.STUDENT_ALREADY_PRESENT]: () =>
      'This student is already marked as present. No override is needed.',

    [OverrideErrorType.STUDENT_NOT_ENROLLED]: () =>
      'The student is not enrolled in this course and cannot be marked present.',

    [OverrideErrorType.STUDENT_NOT_FOUND]: () =>
      'Student information could not be found. Please verify the student ID.',

    [OverrideErrorType.PERMISSION_DENIED]: () =>
      'You do not have permission to override attendance for this session.',

    [OverrideErrorType.UNAUTHORIZED]: () =>
      'Authentication required. Please log in and try again.',

    [OverrideErrorType.LECTURER_NOT_OWNER]: () =>
      'Only the course lecturer can perform attendance overrides.',

    [OverrideErrorType.INSUFFICIENT_JUSTIFICATION]: (ctx) =>
      `Please provide a clear, descriptive reason (minimum 15 characters). Current length: ${ctx?.justificationLength || 0}`,

    [OverrideErrorType.INVALID_JUSTIFICATION_FORMAT]: () =>
      'Justification contains invalid characters or format. Please provide a clear description.',

    [OverrideErrorType.MALFORMED_REQUEST]: () =>
      'Invalid request format. Please refresh the page and try again.',

    [OverrideErrorType.DUPLICATE_OVERRIDE]: () =>
      'An override has already been applied for this student in this session.',

    [OverrideErrorType.CONCURRENT_OVERRIDE_ATTEMPT]: () =>
      'Another override is currently being processed for this student. Please wait and try again.',

    [OverrideErrorType.DATABASE_ERROR]: () =>
      'Database error occurred. Please try again in a few moments.',

    [OverrideErrorType.NETWORK_ERROR]: () =>
      'Network connection error. Please check your connection and try again.',

    [OverrideErrorType.UNKNOWN_ERROR]: () =>
      'An unexpected error occurred. Please try again or contact support.',

    [OverrideErrorType.RATE_LIMIT_EXCEEDED]: (ctx) =>
      `Too many override attempts. Please wait ${Math.ceil((ctx?.timeRemaining || 60000) / 1000)} seconds before trying again.`,
  };

  return (
    errorMessages[errorType]?.(context) ||
    errorMessages[OverrideErrorType.UNKNOWN_ERROR]()
  );
};

/**
 * Get user-friendly error message for UI display
 * Requirements: 6.4 - User-friendly error states with recovery options
 */
export const getUserFriendlyErrorMessage = (
  errorType: OverrideErrorType,
  context?: OverrideErrorContext,
): string => {
  const userFriendlyMessages: Record<
    OverrideErrorType,
    (ctx?: OverrideErrorContext) => string
  > = {
    [OverrideErrorType.SESSION_STILL_ACTIVE]: () =>
      'Please wait for the session to end before making overrides.',

    [OverrideErrorType.SESSION_NOT_FOUND]: () =>
      'Session not found. Please refresh the page.',

    [OverrideErrorType.INVALID_SESSION_STATUS]: () =>
      'Session status error. Please refresh and try again.',

    [OverrideErrorType.TIME_WINDOW_EXPIRED]: (ctx) =>
      `Override window closed ${ctx?.windowHours || 24} hours after session end.`,

    [OverrideErrorType.TIME_WINDOW_INVALID]: () =>
      'Time window error. Please contact support.',

    [OverrideErrorType.STUDENT_ALREADY_PRESENT]: () =>
      'Student is already marked present.',

    [OverrideErrorType.STUDENT_NOT_ENROLLED]: () =>
      'Student is not enrolled in this course.',

    [OverrideErrorType.STUDENT_NOT_FOUND]: () =>
      'Student not found. Please verify the information.',

    [OverrideErrorType.PERMISSION_DENIED]: () =>
      "You don't have permission for this action.",

    [OverrideErrorType.UNAUTHORIZED]: () => 'Please log in to continue.',

    [OverrideErrorType.LECTURER_NOT_OWNER]: () =>
      'Only the course lecturer can make overrides.',

    [OverrideErrorType.INSUFFICIENT_JUSTIFICATION]: () =>
      'Please provide a more detailed reason (at least 15 characters).',

    [OverrideErrorType.INVALID_JUSTIFICATION_FORMAT]: () =>
      'Please provide a valid reason for the override.',

    [OverrideErrorType.MALFORMED_REQUEST]: () =>
      'Request error. Please refresh and try again.',

    [OverrideErrorType.DUPLICATE_OVERRIDE]: () =>
      'Override already exists for this student.',

    [OverrideErrorType.CONCURRENT_OVERRIDE_ATTEMPT]: () =>
      'Another override is in progress. Please wait.',

    [OverrideErrorType.DATABASE_ERROR]: () =>
      'Database temporarily unavailable. Please try again.',

    [OverrideErrorType.NETWORK_ERROR]: () =>
      'Connection problem. Please check your internet.',

    [OverrideErrorType.UNKNOWN_ERROR]: () =>
      'Something went wrong. Please try again.',

    [OverrideErrorType.RATE_LIMIT_EXCEEDED]: () =>
      'Too many attempts. Please wait before trying again.',
  };

  return (
    userFriendlyMessages[errorType]?.(context) ||
    userFriendlyMessages[OverrideErrorType.UNKNOWN_ERROR]()
  );
};

/**
 * Get error severity level for logging and alerting
 */
export const getErrorSeverity = (
  errorType: OverrideErrorType,
): ErrorSeverity => {
  const severityMap: Record<OverrideErrorType, ErrorSeverity> = {
    [OverrideErrorType.SESSION_STILL_ACTIVE]: ErrorSeverity.LOW,
    [OverrideErrorType.SESSION_NOT_FOUND]: ErrorSeverity.MEDIUM,
    [OverrideErrorType.INVALID_SESSION_STATUS]: ErrorSeverity.MEDIUM,
    [OverrideErrorType.TIME_WINDOW_EXPIRED]: ErrorSeverity.LOW,
    [OverrideErrorType.TIME_WINDOW_INVALID]: ErrorSeverity.HIGH,
    [OverrideErrorType.STUDENT_ALREADY_PRESENT]: ErrorSeverity.LOW,
    [OverrideErrorType.STUDENT_NOT_ENROLLED]: ErrorSeverity.MEDIUM,
    [OverrideErrorType.STUDENT_NOT_FOUND]: ErrorSeverity.MEDIUM,
    [OverrideErrorType.PERMISSION_DENIED]: ErrorSeverity.MEDIUM,
    [OverrideErrorType.UNAUTHORIZED]: ErrorSeverity.MEDIUM,
    [OverrideErrorType.LECTURER_NOT_OWNER]: ErrorSeverity.MEDIUM,
    [OverrideErrorType.INSUFFICIENT_JUSTIFICATION]: ErrorSeverity.LOW,
    [OverrideErrorType.INVALID_JUSTIFICATION_FORMAT]: ErrorSeverity.LOW,
    [OverrideErrorType.MALFORMED_REQUEST]: ErrorSeverity.MEDIUM,
    [OverrideErrorType.DUPLICATE_OVERRIDE]: ErrorSeverity.LOW,
    [OverrideErrorType.CONCURRENT_OVERRIDE_ATTEMPT]: ErrorSeverity.MEDIUM,
    [OverrideErrorType.DATABASE_ERROR]: ErrorSeverity.HIGH,
    [OverrideErrorType.NETWORK_ERROR]: ErrorSeverity.MEDIUM,
    [OverrideErrorType.UNKNOWN_ERROR]: ErrorSeverity.HIGH,
    [OverrideErrorType.RATE_LIMIT_EXCEEDED]: ErrorSeverity.MEDIUM,
  };

  return severityMap[errorType] || ErrorSeverity.HIGH;
};

/**
 * Check if an error is recoverable (user can take action to fix it)
 */
export const isErrorRecoverable = (errorType: OverrideErrorType): boolean => {
  const recoverableErrors = new Set([
    OverrideErrorType.INSUFFICIENT_JUSTIFICATION,
    OverrideErrorType.INVALID_JUSTIFICATION_FORMAT,
    OverrideErrorType.UNAUTHORIZED,
    OverrideErrorType.NETWORK_ERROR,
    OverrideErrorType.RATE_LIMIT_EXCEEDED,
  ]);

  return recoverableErrors.has(errorType);
};

/**
 * Check if an error is retryable (operation can be attempted again)
 */
export const isErrorRetryable = (errorType: OverrideErrorType): boolean => {
  const retryableErrors = new Set([
    OverrideErrorType.DATABASE_ERROR,
    OverrideErrorType.NETWORK_ERROR,
    OverrideErrorType.UNKNOWN_ERROR,
    OverrideErrorType.CONCURRENT_OVERRIDE_ATTEMPT,
  ]);

  return retryableErrors.has(errorType);
};

/**
 * Create a comprehensive error object
 * Requirements: 4.4 - Comprehensive error handling with logging
 */
export const createOverrideError = (
  errorType: OverrideErrorType,
  context?: OverrideErrorContext,
): OverrideError => {
  const timestamp = Date.now();
  const code = `OVERRIDE_${errorType}_${timestamp.toString(36).toUpperCase()}`;

  return {
    type: errorType,
    message: getOverrideErrorMessage(errorType, context),
    userMessage: getUserFriendlyErrorMessage(errorType, context),
    severity: getErrorSeverity(errorType),
    context,
    recoverable: isErrorRecoverable(errorType),
    retryable: isErrorRetryable(errorType),
    timestamp,
    code,
  };
};

/**
 * Parse error from Convex error response
 */
export const parseConvexError = (
  error: any,
  context?: OverrideErrorContext,
): OverrideError => {
  if (typeof error === 'string') {
    // Try to match known error messages
    if (error.includes('already marked as present')) {
      return createOverrideError(
        OverrideErrorType.STUDENT_ALREADY_PRESENT,
        context,
      );
    }
    if (error.includes('not enrolled')) {
      return createOverrideError(
        OverrideErrorType.STUDENT_NOT_ENROLLED,
        context,
      );
    }
    if (error.includes('session is still active')) {
      return createOverrideError(
        OverrideErrorType.SESSION_STILL_ACTIVE,
        context,
      );
    }
    if (error.includes('time window expired')) {
      return createOverrideError(
        OverrideErrorType.TIME_WINDOW_EXPIRED,
        context,
      );
    }
    if (error.includes('permission denied')) {
      return createOverrideError(OverrideErrorType.PERMISSION_DENIED, context);
    }
    if (error.includes('justification')) {
      return createOverrideError(
        OverrideErrorType.INSUFFICIENT_JUSTIFICATION,
        context,
      );
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('Network')) {
      return createOverrideError(OverrideErrorType.NETWORK_ERROR, context);
    }
    if (error.message.includes('Unauthorized')) {
      return createOverrideError(OverrideErrorType.UNAUTHORIZED, context);
    }
  }

  // Default to unknown error
  return createOverrideError(OverrideErrorType.UNKNOWN_ERROR, {
    ...context,
    originalError: error instanceof Error ? error.message : String(error),
  });
};

/**
 * Get recovery suggestions for different error types
 * Requirements: 6.4 - Error states with recovery options
 */
export const getRecoverySuggestions = (
  errorType: OverrideErrorType,
): string[] => {
  const suggestions: Record<OverrideErrorType, string[]> = {
    [OverrideErrorType.SESSION_STILL_ACTIVE]: [
      'Wait for the session to end',
      'Check the session status',
    ],
    [OverrideErrorType.SESSION_NOT_FOUND]: [
      'Refresh the page',
      'Check if the session still exists',
      'Contact support if the problem persists',
    ],
    [OverrideErrorType.INVALID_SESSION_STATUS]: [
      'Refresh the page',
      'Try again in a few moments',
    ],
    [OverrideErrorType.TIME_WINDOW_EXPIRED]: [
      'Contact your institution for special cases',
      'Document the issue for future reference',
    ],
    [OverrideErrorType.TIME_WINDOW_INVALID]: ['Contact technical support'],
    [OverrideErrorType.STUDENT_ALREADY_PRESENT]: [
      'Check the attendance records',
      'No action needed - student is already marked present',
    ],
    [OverrideErrorType.STUDENT_NOT_ENROLLED]: [
      'Verify the student is enrolled in the course',
      'Check the course roster',
    ],
    [OverrideErrorType.STUDENT_NOT_FOUND]: [
      'Verify the student information',
      'Check the student ID',
    ],
    [OverrideErrorType.PERMISSION_DENIED]: [
      'Contact the course lecturer',
      'Verify your role and permissions',
    ],
    [OverrideErrorType.UNAUTHORIZED]: [
      'Log in to your account',
      "Check your session hasn't expired",
    ],
    [OverrideErrorType.LECTURER_NOT_OWNER]: [
      'Contact the course lecturer',
      "Verify you're accessing the correct course",
    ],
    [OverrideErrorType.INSUFFICIENT_JUSTIFICATION]: [
      'Provide a more detailed reason',
      'Ensure your justification is at least 15 characters',
      'Be specific about why the override is needed',
    ],
    [OverrideErrorType.INVALID_JUSTIFICATION_FORMAT]: [
      'Use only standard text characters',
      'Avoid special symbols or formatting',
    ],
    [OverrideErrorType.MALFORMED_REQUEST]: [
      'Refresh the page',
      'Clear your browser cache',
      'Try again',
    ],
    [OverrideErrorType.DUPLICATE_OVERRIDE]: [
      'Check the attendance records',
      'No action needed - override already exists',
    ],
    [OverrideErrorType.CONCURRENT_OVERRIDE_ATTEMPT]: [
      'Wait a few seconds',
      'Try again',
    ],
    [OverrideErrorType.DATABASE_ERROR]: [
      'Try again in a few moments',
      'Contact support if the problem persists',
    ],
    [OverrideErrorType.NETWORK_ERROR]: [
      'Check your internet connection',
      'Try again',
      'Switch to a different network if available',
    ],
    [OverrideErrorType.UNKNOWN_ERROR]: [
      'Try again',
      'Refresh the page',
      'Contact support with the error code',
    ],
    [OverrideErrorType.RATE_LIMIT_EXCEEDED]: [
      'Wait before trying again',
      'Avoid rapid repeated attempts',
    ],
  };

  return suggestions[errorType] || suggestions[OverrideErrorType.UNKNOWN_ERROR];
};

/**
 * Format error for logging
 * Requirements: 4.4 - Logging for failed override attempts and system errors
 */
export const formatErrorForLogging = (
  error: OverrideError,
): Record<string, any> => {
  return {
    errorType: error.type,
    errorCode: error.code,
    message: error.message,
    severity: error.severity,
    timestamp: new Date(error.timestamp).toISOString(),
    recoverable: error.recoverable,
    retryable: error.retryable,
    context: error.context,
  };
};

/**
 * Constants for error handling
 */
export const ERROR_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 10,
  ERROR_LOG_RETENTION_DAYS: 30,
} as const;
