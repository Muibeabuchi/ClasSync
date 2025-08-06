/**
 * Edge case handling and validation scenarios for manual attendance overrides
 * Requirements: 1.2, 4.4, 5.1, 5.2 - Handle edge cases and validation scenarios
 */

import {
  OverrideError,
  OverrideErrorType,
  createOverrideError,
} from '@/lib/errors/overrideErrors';
import { overrideLogger } from '@/lib/logging/overrideLogger';

/**
 * Interface for override validation context
 */
export interface OverrideValidationContext {
  sessionId: string;
  studentId: string;
  lecturerId: string;
  courseId: string;
  justificationNote: string;
  sessionStatus: 'pending' | 'active' | 'complete';
  sessionEndTime?: number;
  currentTime?: number;
  overrideWindowHours?: number;
  existingRecord?: any;
  existingOverride?: any;
  studentEnrollment?: any;
  lecturerOwnership?: boolean;
}

/**
 * Interface for concurrent operation tracking
 */
interface ConcurrentOperationTracker {
  operationId: string;
  sessionId: string;
  studentId: string;
  lecturerId: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * In-memory store for tracking concurrent operations
 * In production, this would be replaced with Redis or similar
 */
class ConcurrentOperationStore {
  private operations = new Map<string, ConcurrentOperationTracker>();
  private readonly OPERATION_TIMEOUT = 30000; // 30 seconds

  /**
   * Generate operation key for tracking
   */
  private getOperationKey(sessionId: string, studentId: string): string {
    return `${sessionId}_${studentId}`;
  }

  /**
   * Check if operation is already in progress
   */
  isOperationInProgress(sessionId: string, studentId: string): boolean {
    const key = this.getOperationKey(sessionId, studentId);
    const operation = this.operations.get(key);

    if (!operation) {
      return false;
    }

    // Check if operation has timed out
    if (Date.now() - operation.timestamp > this.OPERATION_TIMEOUT) {
      this.operations.delete(key);
      return false;
    }

    return operation.status === 'pending';
  }

  /**
   * Start tracking an operation
   */
  startOperation(
    sessionId: string,
    studentId: string,
    lecturerId: string,
  ): string {
    const key = this.getOperationKey(sessionId, studentId);
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.operations.set(key, {
      operationId,
      sessionId,
      studentId,
      lecturerId,
      timestamp: Date.now(),
      status: 'pending',
    });

    return operationId;
  }

  /**
   * Complete an operation
   */
  completeOperation(sessionId: string, studentId: string, success: boolean) {
    const key = this.getOperationKey(sessionId, studentId);
    const operation = this.operations.get(key);

    if (operation) {
      operation.status = success ? 'completed' : 'failed';
      // Remove completed operations after a short delay
      setTimeout(() => {
        this.operations.delete(key);
      }, 5000);
    }
  }

  /**
   * Get operation details
   */
  getOperation(
    sessionId: string,
    studentId: string,
  ): ConcurrentOperationTracker | null {
    const key = this.getOperationKey(sessionId, studentId);
    return this.operations.get(key) || null;
  }

  /**
   * Clean up expired operations
   */
  cleanup() {
    const now = Date.now();
    for (const [key, operation] of this.operations.entries()) {
      if (now - operation.timestamp > this.OPERATION_TIMEOUT) {
        this.operations.delete(key);
      }
    }
  }
}

// Global instance for tracking concurrent operations
const concurrentOperationStore = new ConcurrentOperationStore();

// Clean up expired operations every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    concurrentOperationStore.cleanup();
  }, 60000);
}

/**
 * Validate that student is not already marked present
 * Requirements: 1.2 - Prevent overrides for students already marked present
 */
export const validateStudentNotAlreadyPresent = (
  context: OverrideValidationContext,
): OverrideError | null => {
  if (context.existingRecord) {
    overrideLogger.warn('Attempted override for student already present', {
      sessionId: context.sessionId,
      studentId: context.studentId,
      lecturerId: context.lecturerId,
      existingRecordId: context.existingRecord.id,
    });

    return createOverrideError(OverrideErrorType.STUDENT_ALREADY_PRESENT, {
      sessionId: context.sessionId,
      studentId: context.studentId,
      existingRecordTimestamp: context.existingRecord.checkedInAt,
      isManualOverride: context.existingRecord.isManualOverride,
    });
  }

  return null;
};

/**
 * Handle concurrent override attempts by multiple lecturers
 * Requirements: 4.4 - Handle concurrent override attempts
 */
export const validateNoConcurrentOverride = (
  context: OverrideValidationContext,
): OverrideError | null => {
  const isInProgress = concurrentOperationStore.isOperationInProgress(
    context.sessionId,
    context.studentId,
  );

  if (isInProgress) {
    const operation = concurrentOperationStore.getOperation(
      context.sessionId,
      context.studentId,
    );

    overrideLogger.warn('Concurrent override attempt detected', {
      sessionId: context.sessionId,
      studentId: context.studentId,
      currentLecturerId: context.lecturerId,
      existingOperationLecturerId: operation?.lecturerId,
      existingOperationId: operation?.operationId,
    });

    return createOverrideError(OverrideErrorType.CONCURRENT_OVERRIDE_ATTEMPT, {
      sessionId: context.sessionId,
      studentId: context.studentId,
      existingOperationLecturerId: operation?.lecturerId,
      operationStartTime: operation?.timestamp,
    });
  }

  return null;
};

/**
 * Validate session ownership and lecturer permissions
 * Requirements: 4.4, 5.2 - Validate session ownership and lecturer permissions
 */
export const validateLecturerPermissions = (
  context: OverrideValidationContext,
): OverrideError | null => {
  if (!context.lecturerOwnership) {
    overrideLogger.warn('Permission denied for override attempt', {
      sessionId: context.sessionId,
      studentId: context.studentId,
      lecturerId: context.lecturerId,
      courseId: context.courseId,
    });

    return createOverrideError(OverrideErrorType.LECTURER_NOT_OWNER, {
      sessionId: context.sessionId,
      lecturerId: context.lecturerId,
      courseId: context.courseId,
    });
  }

  return null;
};

/**
 * Validate that override window has not expired
 * Requirements: 5.1, 5.2 - Implement proper handling of expired override windows
 */
export const validateOverrideWindow = (
  context: OverrideValidationContext,
): OverrideError | null => {
  const currentTime = context.currentTime || Date.now();
  const sessionEndTime = context.sessionEndTime || currentTime;
  const windowHours = context.overrideWindowHours || 24;
  const windowMs = windowHours * 60 * 60 * 1000;
  const windowExpiresAt = sessionEndTime + windowMs;

  if (currentTime > windowExpiresAt) {
    overrideLogger.warn('Override window expired', {
      sessionId: context.sessionId,
      studentId: context.studentId,
      lecturerId: context.lecturerId,
      sessionEndTime,
      currentTime,
      windowHours,
      timeExpiredBy: currentTime - windowExpiresAt,
    });

    return createOverrideError(OverrideErrorType.TIME_WINDOW_EXPIRED, {
      sessionId: context.sessionId,
      windowHours,
      sessionEndTime,
      currentTime,
      expiredBy: currentTime - windowExpiresAt,
    });
  }

  return null;
};

/**
 * Validate justification note format and content
 * Requirements: 5.2 - Add validation for malformed or insufficient justification notes
 */
export const validateJustificationNote = (
  justificationNote: string,
  context: Partial<OverrideValidationContext>,
): OverrideError | null => {
  // Check minimum length
  if (!justificationNote || justificationNote.trim().length < 15) {
    return createOverrideError(OverrideErrorType.INSUFFICIENT_JUSTIFICATION, {
      ...context,
      justificationLength: justificationNote?.length || 0,
      minRequiredLength: 15,
    });
  }

  // Check maximum length
  if (justificationNote.length > 100) {
    return createOverrideError(OverrideErrorType.INVALID_JUSTIFICATION_FORMAT, {
      ...context,
      justificationLength: justificationNote.length,
      maxAllowedLength: 100,
    });
  }

  // Check for repeated characters (spam detection)
  const repeatedCharPattern = /(.)\1{10,}/;
  if (repeatedCharPattern.test(justificationNote)) {
    return createOverrideError(OverrideErrorType.INVALID_JUSTIFICATION_FORMAT, {
      ...context,
      validationFailure: 'repeated_characters',
      justificationLength: justificationNote.length,
    });
  }

  // Check for minimum word count
  const wordCount = justificationNote.trim().split(/\s+/).length;
  if (wordCount < 3) {
    return createOverrideError(OverrideErrorType.INSUFFICIENT_JUSTIFICATION, {
      ...context,
      wordCount,
      minRequiredWords: 3,
      justificationLength: justificationNote.length,
    });
  }

  // Check for only whitespace
  if (/^\s*$/.test(justificationNote)) {
    return createOverrideError(OverrideErrorType.INVALID_JUSTIFICATION_FORMAT, {
      ...context,
      validationFailure: 'whitespace_only',
    });
  }

  // Check for common placeholder text
  const placeholderPatterns = [
    /^test+$/i,
    /^placeholder$/i,
    /^lorem ipsum/i,
    /^asdf+$/i,
    /^1234+$/i,
  ];

  for (const pattern of placeholderPatterns) {
    if (pattern.test(justificationNote.trim())) {
      return createOverrideError(
        OverrideErrorType.INVALID_JUSTIFICATION_FORMAT,
        {
          ...context,
          validationFailure: 'placeholder_text',
          justificationLength: justificationNote.length,
        },
      );
    }
  }

  return null;
};

/**
 * Validate student enrollment in course
 * Requirements: 4.4 - Validate student enrollment
 */
export const validateStudentEnrollment = (
  context: OverrideValidationContext,
): OverrideError | null => {
  if (!context.studentEnrollment) {
    overrideLogger.warn('Override attempted for non-enrolled student', {
      sessionId: context.sessionId,
      studentId: context.studentId,
      lecturerId: context.lecturerId,
      courseId: context.courseId,
    });

    return createOverrideError(OverrideErrorType.STUDENT_NOT_ENROLLED, {
      sessionId: context.sessionId,
      studentId: context.studentId,
      courseId: context.courseId,
    });
  }

  return null;
};

/**
 * Validate that no duplicate override exists
 * Requirements: 4.4 - Prevent duplicate overrides
 */
export const validateNoDuplicateOverride = (
  context: OverrideValidationContext,
): OverrideError | null => {
  if (context.existingOverride) {
    overrideLogger.warn('Duplicate override attempt', {
      sessionId: context.sessionId,
      studentId: context.studentId,
      lecturerId: context.lecturerId,
      existingOverrideId: context.existingOverride.id,
      existingOverrideTimestamp: context.existingOverride.overrideTimestamp,
    });

    return createOverrideError(OverrideErrorType.DUPLICATE_OVERRIDE, {
      sessionId: context.sessionId,
      studentId: context.studentId,
      existingOverrideTimestamp: context.existingOverride.overrideTimestamp,
      existingOverrideLecturer: context.existingOverride.lecturerId,
    });
  }

  return null;
};

/**
 * Comprehensive validation function that runs all edge case checks
 * Requirements: 1.2, 4.4, 5.1, 5.2 - Comprehensive edge case validation
 */
export const validateOverrideOperation = (
  context: OverrideValidationContext,
): OverrideError[] => {
  const errors: OverrideError[] = [];

  // Run all validation checks
  const validations = [
    validateStudentNotAlreadyPresent,
    validateNoConcurrentOverride,
    validateLecturerPermissions,
    validateOverrideWindow,
    validateStudentEnrollment,
    validateNoDuplicateOverride,
  ];

  for (const validation of validations) {
    const error = validation(context);
    if (error) {
      errors.push(error);
    }
  }

  // Validate justification note separately
  const justificationError = validateJustificationNote(
    context.justificationNote,
    context,
  );
  if (justificationError) {
    errors.push(justificationError);
  }

  return errors;
};

/**
 * Start tracking a concurrent operation
 */
export const startOverrideOperation = (
  sessionId: string,
  studentId: string,
  lecturerId: string,
): string => {
  return concurrentOperationStore.startOperation(
    sessionId,
    studentId,
    lecturerId,
  );
};

/**
 * Complete tracking a concurrent operation
 */
export const completeOverrideOperation = (
  sessionId: string,
  studentId: string,
  success: boolean,
) => {
  concurrentOperationStore.completeOperation(sessionId, studentId, success);
};

/**
 * Rate limiting for override operations
 */
class OverrideRateLimiter {
  private attempts = new Map<string, number[]>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 60000; // 1 minute

  /**
   * Check if user has exceeded rate limit
   */
  isRateLimited(lecturerId: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(lecturerId) || [];

    // Remove attempts outside the window
    const recentAttempts = userAttempts.filter(
      (timestamp) => now - timestamp < this.WINDOW_MS,
    );

    this.attempts.set(lecturerId, recentAttempts);

    return recentAttempts.length >= this.MAX_ATTEMPTS;
  }

  /**
   * Record an attempt
   */
  recordAttempt(lecturerId: string) {
    const now = Date.now();
    const userAttempts = this.attempts.get(lecturerId) || [];
    userAttempts.push(now);
    this.attempts.set(lecturerId, userAttempts);
  }

  /**
   * Get time until rate limit resets
   */
  getTimeUntilReset(lecturerId: string): number {
    const userAttempts = this.attempts.get(lecturerId) || [];
    if (userAttempts.length === 0) {
      return 0;
    }

    const oldestAttempt = Math.min(...userAttempts);
    const resetTime = oldestAttempt + this.WINDOW_MS;
    return Math.max(0, resetTime - Date.now());
  }
}

export const overrideRateLimiter = new OverrideRateLimiter();

/**
 * Validate rate limiting for override operations
 */
export const validateRateLimit = (lecturerId: string): OverrideError | null => {
  if (overrideRateLimiter.isRateLimited(lecturerId)) {
    const timeUntilReset = overrideRateLimiter.getTimeUntilReset(lecturerId);

    overrideLogger.warn('Rate limit exceeded for override operations', {
      lecturerId,
      timeUntilReset,
    });

    return createOverrideError(OverrideErrorType.RATE_LIMIT_EXCEEDED, {
      lecturerId,
      timeRemaining: timeUntilReset,
    });
  }

  // Record the attempt
  overrideRateLimiter.recordAttempt(lecturerId);
  return null;
};

/**
 * Utility function to create validation context from request data
 */
export const createValidationContext = (data: {
  sessionId: string;
  studentId: string;
  lecturerId: string;
  courseId: string;
  justificationNote: string;
  sessionStatus: 'pending' | 'active' | 'complete';
  sessionEndTime?: number;
  overrideWindowHours?: number;
  existingRecord?: any;
  existingOverride?: any;
  studentEnrollment?: any;
  lecturerOwnership?: boolean;
}): OverrideValidationContext => {
  return {
    ...data,
    currentTime: Date.now(),
  };
};

/**
 * Constants for edge case handling
 */
export const EDGE_CASE_CONSTANTS = {
  MAX_CONCURRENT_OPERATIONS: 100,
  OPERATION_TIMEOUT_MS: 30000,
  RATE_LIMIT_MAX_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW_MS: 60000,
  MIN_JUSTIFICATION_LENGTH: 15,
  MAX_JUSTIFICATION_LENGTH: 100,
  MIN_JUSTIFICATION_WORDS: 3,
} as const;
