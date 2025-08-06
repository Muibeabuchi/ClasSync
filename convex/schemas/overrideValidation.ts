import { z } from 'zod';

/**
 * Schema for validating manual attendance override justification notes
 * Requirements: 3.3 - Justification note must be 15-100 characters with clear, descriptive message
 */
export const overrideJustificationSchema = z.object({
  justificationNote: z
    .string()
    .min(15, 'Justification must be at least 15 characters long')
    .max(100, 'Justification cannot exceed 100 characters')
    .trim()
    .refine(
      (val) => val.trim().length >= 15,
      'Please provide a clear, descriptive reason for this override (minimum 15 characters after trimming)',
    )
    .refine(
      (val) => !/^\s*$/.test(val),
      'Justification cannot be empty or contain only whitespace',
    )
    .refine(
      (val) => val.split(' ').length >= 3,
      'Please provide a more descriptive justification with at least 3 words',
    )
    .refine(
      (val) => !/^(.)\1{10,}$/.test(val),
      'Justification cannot consist of repeated characters',
    ),
});

/**
 * Schema for validating lecturer override settings
 * Requirements: 5.2, 5.3 - Time window settings between 1-24 hours
 */
export const lecturerOverrideSettingsSchema = z.object({
  overrideWindowHours: z
    .number()
    .min(1, 'Override window must be at least 1 hour')
    .max(24, 'Override window cannot exceed 24 hours')
    .int('Override window must be a whole number of hours')
    .refine((val) => val > 0, 'Override window must be a positive number'),
  notifyOnOverride: z.boolean().optional().default(true),
});

/**
 * Schema for validating manual override request parameters
 * Combines session, student, and justification validation
 */
export const manualOverrideRequestSchema = z.object({
  attendanceSessionId: z.string().min(1, 'Attendance session ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  justificationNote: overrideJustificationSchema.shape.justificationNote,
});

/**
 * Schema for validating override eligibility check parameters
 */
export const overrideEligibilitySchema = z.object({
  attendanceSessionId: z.string().min(1, 'Attendance session ID is required'),
  currentTime: z
    .number()
    .positive('Current time must be a positive timestamp')
    .optional(), // Optional, defaults to server time
});

/**
 * Schema for override time window validation
 * Requirements: 5.1, 5.2, 5.4 - Time-based restrictions and validation
 */
export const timeWindowValidationSchema = z.object({
  sessionEndTime: z
    .number()
    .positive('Session end time must be a positive timestamp'),
  currentTime: z.number().positive('Current time must be a positive timestamp'),
  overrideWindowHours: z
    .number()
    .min(1, 'Override window must be at least 1 hour')
    .max(24, 'Override window cannot exceed 24 hours'),
  sessionStatus: z.enum(['pending', 'active', 'complete'], {
    errorMap: () => ({ message: 'Invalid session status' }),
  }),
});

/**
 * Schema for override audit log entry validation
 */
export const overrideAuditLogSchema = z.object({
  attendanceSessionId: z.string().min(1),
  studentId: z.string().min(1),
  lecturerId: z.string().min(1),
  courseId: z.string().min(1),
  overrideTimestamp: z.string().datetime('Invalid timestamp format'),
  justificationNote: overrideJustificationSchema.shape.justificationNote,
  originalStatus: z.literal('absent'),
  newStatus: z.literal('present'),
  sessionEndTime: z.number().positive(),
  overrideWindowHours: z.number().min(1).max(24),
});

/**
 * Schema for override eligibility result
 */
export const overrideEligibilityResultSchema = z.object({
  canOverride: z.boolean(),
  reason: z.string(),
  timeRemaining: z.number().min(0),
  windowExpiresAt: z.number().positive(),
  sessionStatus: z.enum(['pending', 'active', 'complete']),
});

/**
 * Error types for override operations (using objects instead of enums as per requirements)
 */
export const OverrideErrorType = {
  SESSION_STILL_ACTIVE: 'SESSION_STILL_ACTIVE',
  TIME_WINDOW_EXPIRED: 'TIME_WINDOW_EXPIRED',
  STUDENT_ALREADY_PRESENT: 'STUDENT_ALREADY_PRESENT',
  INSUFFICIENT_JUSTIFICATION: 'INSUFFICIENT_JUSTIFICATION',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  STUDENT_NOT_ENROLLED: 'STUDENT_NOT_ENROLLED',
  DUPLICATE_OVERRIDE: 'DUPLICATE_OVERRIDE',
  INVALID_SESSION_STATUS: 'INVALID_SESSION_STATUS',
  LECTURER_NOT_OWNER: 'LECTURER NOT THE OWNER',
  UNAUTHORIZED: 'UNAUTHORIZED ACCESS',
} as const;

export type OverrideErrorType =
  (typeof OverrideErrorType)[keyof typeof OverrideErrorType];

/**
 * Schema for override error validation
 */
export const overrideErrorSchema = z.object({
  errorType: z.nativeEnum(OverrideErrorType),
  message: z.string().min(1),
  context: z.record(z.any()).optional(),
});

// Type exports for use in other files
export type OverrideJustificationType = z.infer<
  typeof overrideJustificationSchema
>;
export type LecturerOverrideSettingsType = z.infer<
  typeof lecturerOverrideSettingsSchema
>;
export type ManualOverrideRequestType = z.infer<
  typeof manualOverrideRequestSchema
>;
export type OverrideEligibilityType = z.infer<typeof overrideEligibilitySchema>;
export type TimeWindowValidationType = z.infer<
  typeof timeWindowValidationSchema
>;
export type OverrideAuditLogType = z.infer<typeof overrideAuditLogSchema>;
export type OverrideEligibilityResultType = z.infer<
  typeof overrideEligibilityResultSchema
>;
export type OverrideErrorSchemaType = z.infer<typeof overrideErrorSchema>;

/**
 * Validation function for override justification
 * Returns validation result with detailed error messages
 */
export const validateOverrideJustification = (data: unknown) => {
  return overrideJustificationSchema.safeParse(data);
};

/**
 * Validation function for lecturer override settings
 * Returns validation result with detailed error messages
 */
export const validateLecturerOverrideSettings = (data: unknown) => {
  return lecturerOverrideSettingsSchema.safeParse(data);
};

/**
 * Validation function for manual override request
 * Returns validation result with detailed error messages
 */
export const validateManualOverrideRequest = (data: unknown) => {
  return manualOverrideRequestSchema.safeParse(data);
};

/**
 * Validation function for time window validation
 * Returns validation result with detailed error messages
 */
export const validateTimeWindow = (data: unknown) => {
  return timeWindowValidationSchema.safeParse(data);
};

/**
 * Helper function to format validation errors into user-friendly messages
 */
export const formatOverrideValidationErrors = (
  errors: z.ZodError,
): string[] => {
  return errors.errors.map((error) => {
    const path = error.path.length > 0 ? `${error.path.join('.')}: ` : '';
    return `${path}${error.message}`;
  });
};

/**
 * Helper function to get user-friendly error messages for override operations
 * Requirements: 4.4, 5.2, 6.4 - Comprehensive error handling with descriptive messages
 */
export const getOverrideErrorMessage = (
  errorType: OverrideErrorType,
  context?: Record<string, any>,
): string => {
  const errorMessages = {
    [OverrideErrorType.SESSION_STILL_ACTIVE]:
      'Manual overrides are only available after the session ends',
    [OverrideErrorType.TIME_WINDOW_EXPIRED]: `Override window has expired. Overrides must be made within ${context?.windowHours || 24} hours of session end`,
    [OverrideErrorType.STUDENT_ALREADY_PRESENT]:
      'This student is already marked as present',
    [OverrideErrorType.INSUFFICIENT_JUSTIFICATION]:
      'Please provide a clear, descriptive reason (minimum 15 characters)',
    [OverrideErrorType.PERMISSION_DENIED]:
      'You do not have permission to override attendance for this session',
    [OverrideErrorType.SESSION_NOT_FOUND]:
      'The attendance session could not be found',
    [OverrideErrorType.STUDENT_NOT_ENROLLED]:
      'The student is not enrolled in this course',
    [OverrideErrorType.DUPLICATE_OVERRIDE]:
      'An override has already been applied for this student in this session',
    [OverrideErrorType.INVALID_SESSION_STATUS]:
      'Cannot perform override on a session with invalid status',
  } as const;

  return (
    errorMessages[errorType as keyof typeof errorMessages] ||
    'An unexpected error occurred. Please try again.'
  );
};

/**
 * Helper function to validate and clean override justification
 * Applies basic cleaning before validation
 */
export const validateAndCleanJustification = (
  rawJustification: unknown,
): {
  success: boolean;
  data?: string;
  errors?: string[];
} => {
  try {
    // Pre-process the justification
    const cleaned =
      typeof rawJustification === 'string'
        ? rawJustification.trim()
        : rawJustification;

    const result = overrideJustificationSchema.safeParse({
      justificationNote: cleaned,
    });

    if (result.success) {
      return {
        success: true,
        data: result.data.justificationNote,
      };
    } else {
      return {
        success: false,
        errors: formatOverrideValidationErrors(result.error),
      };
    }
  } catch {
    return {
      success: false,
      errors: ['Unexpected error during justification validation'],
    };
  }
};

/**
 * Helper function to validate lecturer settings with defaults
 */
export const validateAndCleanLecturerSettings = (
  rawSettings: unknown,
): {
  success: boolean;
  data?: LecturerOverrideSettingsType;
  errors?: string[];
} => {
  try {
    // Apply defaults for missing values
    const settingsWithDefaults = {
      overrideWindowHours: 24, // Default to 24 hours
      notifyOnOverride: true, // Default to true
      ...(typeof rawSettings === 'object' && rawSettings !== null
        ? rawSettings
        : {}),
    };

    const result =
      lecturerOverrideSettingsSchema.safeParse(settingsWithDefaults);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        errors: formatOverrideValidationErrors(result.error),
      };
    }
  } catch {
    return {
      success: false,
      errors: ['Unexpected error during settings validation'],
    };
  }
};

/**
 * Constants for override validation
 */
export const OVERRIDE_VALIDATION_CONSTANTS = {
  MIN_JUSTIFICATION_LENGTH: 15,
  MAX_JUSTIFICATION_LENGTH: 100,
  MIN_OVERRIDE_WINDOW_HOURS: 1,
  MAX_OVERRIDE_WINDOW_HOURS: 24,
  DEFAULT_OVERRIDE_WINDOW_HOURS: 24,
  MIN_JUSTIFICATION_WORDS: 3,
} as const;
