/**
 * Hook for comprehensive override validation and edge case handling
 * Requirements: 1.2, 4.4, 5.1, 5.2 - Handle edge cases and validation scenarios
 */

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import {
  validateOverrideOperation,
  validateJustificationNote,
  validateRateLimit,
  startOverrideOperation,
  completeOverrideOperation,
  createValidationContext,
  type OverrideValidationContext,
} from '@/lib/validation/overrideEdgeCases';
import {
  OverrideError,
  OverrideErrorType,
  createOverrideError,
} from '@/lib/errors/overrideErrors';
import { useOverrideLogger } from '@/lib/logging/overrideLogger';

interface UseOverrideValidationProps {
  sessionId: Id<'attendanceSessions'> | null;
  studentId: Id<'userProfiles'> | null;
  lecturerId: string | null;
  enabled?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: OverrideError[];
  warnings: OverrideError[];
  canProceed: boolean;
  validationContext: OverrideValidationContext | null;
}

/**
 * Hook for comprehensive override validation
 */
export const useOverrideValidation = ({
  sessionId,
  studentId,
  lecturerId,
  enabled = true,
}: UseOverrideValidationProps) => {
  const logger = useOverrideLogger();

  // Fetch session data for validation
  const sessionQuery = useQuery(
    convexQuery(
      api.attendance.getAttendanceSessionWithOverrideInfo,
      sessionId && enabled
        ? { attendanceSessionId: sessionId, currentTime: Date.now() }
        : 'skip',
    ),
  );

  // Fetch existing attendance record
  const existingRecordQuery = useQuery(
    convexQuery(
      api.attendance.getAttendanceRecordBySessionAndStudent,
      sessionId && studentId && enabled
        ? { attendanceSessionId: sessionId, studentId }
        : 'skip',
    ),
  );

  // Fetch existing override log
  const existingOverrideQuery = useQuery(
    convexQuery(
      api.attendance.getOverrideLogBySessionAndStudent,
      sessionId && studentId && enabled
        ? { attendanceSessionId: sessionId, studentId }
        : 'skip',
    ),
  );

  // Fetch student enrollment
  const enrollmentQuery = useQuery(
    convexQuery(
      api.attendance.getStudentEnrollment,
      sessionId && studentId && enabled
        ? {
            courseId: sessionQuery.data?.courseId || ('skip' as any),
            studentId,
          }
        : 'skip',
    ),
  );

  /**
   * Validate justification note in real-time
   */
  const validateJustification = useCallback(
    (justificationNote: string): OverrideError | null => {
      if (!sessionId || !studentId) {
        return null;
      }

      return validateJustificationNote(justificationNote, {
        sessionId,
        studentId,
        lecturerId: lecturerId || 'unknown',
      });
    },
    [sessionId, studentId, lecturerId],
  );

  /**
   * Validate rate limiting for current lecturer
   */
  const validateLecturerRateLimit = useCallback((): OverrideError | null => {
    if (!lecturerId) {
      return createOverrideError(OverrideErrorType.UNAUTHORIZED);
    }

    return validateRateLimit(lecturerId);
  }, [lecturerId]);

  /**
   * Create validation context from current data
   */
  const validationContext = useMemo((): OverrideValidationContext | null => {
    if (!sessionId || !studentId || !lecturerId || !sessionQuery.data) {
      return null;
    }

    return createValidationContext({
      sessionId,
      studentId,
      lecturerId,
      courseId: sessionQuery.data.courseId,
      justificationNote: '', // Will be provided during validation
      sessionStatus: sessionQuery.data.status,
      sessionEndTime: sessionQuery.data.endedAt,
      overrideWindowHours: sessionQuery.data.overrideEligibility?.windowHours,
      existingRecord: existingRecordQuery.data,
      existingOverride: existingOverrideQuery.data,
      studentEnrollment: enrollmentQuery.data,
      lecturerOwnership: sessionQuery.data.userAccess?.isLecturer,
    });
  }, [
    sessionId,
    studentId,
    lecturerId,
    sessionQuery.data,
    existingRecordQuery.data,
    existingOverrideQuery.data,
    enrollmentQuery.data,
  ]);

  /**
   * Perform comprehensive validation
   */
  const validateOverride = useCallback(
    (justificationNote: string): ValidationResult => {
      if (!validationContext) {
        return {
          isValid: false,
          errors: [createOverrideError(OverrideErrorType.MALFORMED_REQUEST)],
          warnings: [],
          canProceed: false,
          validationContext: null,
        };
      }

      // Create context with justification note
      const contextWithJustification = {
        ...validationContext,
        justificationNote,
      };

      // Run comprehensive validation
      const errors = validateOverrideOperation(contextWithJustification);

      // Check rate limiting
      const rateLimitError = validateLecturerRateLimit();
      if (rateLimitError) {
        errors.push(rateLimitError);
      }

      // Separate errors and warnings
      const criticalErrors = errors.filter(
        (error) => error.severity === 'high' || error.severity === 'critical',
      );
      const warnings = errors.filter(
        (error) => error.severity === 'low' || error.severity === 'medium',
      );

      const isValid = criticalErrors.length === 0;
      const canProceed = isValid && warnings.length === 0;

      // Log validation results
      if (errors.length > 0) {
        logger.logValidationFailure(
          'override_validation',
          errors.map((e) => e.message),
          {
            sessionId: validationContext.sessionId,
            studentId: validationContext.studentId,
            lecturerId: validationContext.lecturerId,
          },
        );
      }

      return {
        isValid,
        errors: criticalErrors,
        warnings,
        canProceed,
        validationContext: contextWithJustification,
      };
    },
    [validationContext, validateLecturerRateLimit, logger],
  );

  /**
   * Start override operation tracking
   */
  const startOperation = useCallback((): string | null => {
    if (!sessionId || !studentId || !lecturerId) {
      return null;
    }

    return startOverrideOperation(sessionId, studentId, lecturerId);
  }, [sessionId, studentId, lecturerId]);

  /**
   * Complete override operation tracking
   */
  const completeOperation = useCallback(
    (success: boolean) => {
      if (!sessionId || !studentId) {
        return;
      }

      completeOverrideOperation(sessionId, studentId, success);
    },
    [sessionId, studentId],
  );

  /**
   * Check if all required data is loaded
   */
  const isDataLoaded = useMemo(() => {
    if (!enabled || !sessionId || !studentId) {
      return false;
    }

    return (
      sessionQuery.data !== undefined &&
      existingRecordQuery.data !== undefined &&
      existingOverrideQuery.data !== undefined &&
      enrollmentQuery.data !== undefined
    );
  }, [
    enabled,
    sessionId,
    studentId,
    sessionQuery.data,
    existingRecordQuery.data,
    existingOverrideQuery.data,
    enrollmentQuery.data,
  ]);

  /**
   * Check if any queries are loading
   */
  const isLoading = useMemo(() => {
    if (!enabled) {
      return false;
    }

    return (
      sessionQuery.isLoading ||
      existingRecordQuery.isLoading ||
      existingOverrideQuery.isLoading ||
      enrollmentQuery.isLoading
    );
  }, [
    enabled,
    sessionQuery.isLoading,
    existingRecordQuery.isLoading,
    existingOverrideQuery.isLoading,
    enrollmentQuery.isLoading,
  ]);

  /**
   * Check if any queries have errors
   */
  const hasQueryErrors = useMemo(() => {
    return (
      sessionQuery.isError ||
      existingRecordQuery.isError ||
      existingOverrideQuery.isError ||
      enrollmentQuery.isError
    );
  }, [
    sessionQuery.isError,
    existingRecordQuery.isError,
    existingOverrideQuery.isError,
    enrollmentQuery.isError,
  ]);

  /**
   * Get query errors
   */
  const queryErrors = useMemo(() => {
    const errors: Error[] = [];

    if (sessionQuery.error) errors.push(sessionQuery.error);
    if (existingRecordQuery.error) errors.push(existingRecordQuery.error);
    if (existingOverrideQuery.error) errors.push(existingOverrideQuery.error);
    if (enrollmentQuery.error) errors.push(enrollmentQuery.error);

    return errors;
  }, [
    sessionQuery.error,
    existingRecordQuery.error,
    existingOverrideQuery.error,
    enrollmentQuery.error,
  ]);

  /**
   * Quick validation checks for UI state
   */
  const quickChecks = useMemo(() => {
    if (!validationContext) {
      return {
        studentAlreadyPresent: false,
        timeWindowExpired: false,
        lecturerNotOwner: false,
        studentNotEnrolled: false,
        duplicateOverride: false,
      };
    }

    return {
      studentAlreadyPresent: !!validationContext.existingRecord,
      timeWindowExpired:
        validationContext.sessionStatus !== 'complete' ||
        (validationContext.currentTime || 0) >
          (validationContext.sessionEndTime || 0) +
            (validationContext.overrideWindowHours || 24) * 60 * 60 * 1000,
      lecturerNotOwner: !validationContext.lecturerOwnership,
      studentNotEnrolled: !validationContext.studentEnrollment,
      duplicateOverride: !!validationContext.existingOverride,
    };
  }, [validationContext]);

  return {
    // Validation functions
    validateOverride,
    validateJustification,
    validateLecturerRateLimit,

    // Operation tracking
    startOperation,
    completeOperation,

    // Data state
    isDataLoaded,
    isLoading,
    hasQueryErrors,
    queryErrors,
    validationContext,

    // Quick checks for UI
    quickChecks,

    // Raw query data for advanced use cases
    sessionData: sessionQuery.data,
    existingRecord: existingRecordQuery.data,
    existingOverride: existingOverrideQuery.data,
    studentEnrollment: enrollmentQuery.data,

    // Query controls
    refetchAll: () => {
      sessionQuery.refetch();
      existingRecordQuery.refetch();
      existingOverrideQuery.refetch();
      enrollmentQuery.refetch();
    },
  };
};

/**
 * Simplified hook for basic validation checks
 */
export const useBasicOverrideValidation = (
  sessionId: Id<'attendanceSessions'> | null,
  studentId: Id<'userProfiles'> | null,
) => {
  const validation = useOverrideValidation({
    sessionId,
    studentId,
    lecturerId: null, // Will be determined from auth context
    enabled: !!(sessionId && studentId),
  });

  return {
    canAttemptOverride:
      validation.isDataLoaded && !validation.quickChecks.studentAlreadyPresent,
    studentAlreadyPresent: validation.quickChecks.studentAlreadyPresent,
    timeWindowExpired: validation.quickChecks.timeWindowExpired,
    isLoading: validation.isLoading,
    hasErrors: validation.hasQueryErrors,
  };
};

export default useOverrideValidation;
