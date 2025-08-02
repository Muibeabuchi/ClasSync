import {
  OverrideErrorType,
  getOverrideErrorMessage,
  timeWindowValidationSchema,
  overrideEligibilityResultSchema,
  type OverrideEligibilityResultType,
  type LecturerOverrideSettingsType,
} from '../schemas/overrideValidation';

/**
 * Interface for attendance session data required for override eligibility calculation
 */
export interface AttendanceSessionForOverride {
  _id: string;
  courseId: string;
  lecturerId: string;
  status: 'pending' | 'active' | 'complete';
  endedAt?: number;
  _creationTime: number;
}

/**
 * Interface for lecturer settings with defaults
 */
export interface LecturerOverrideSettings {
  overrideWindowHours: number;
  notifyOnOverride?: boolean;
}

/**
 * Interface for override eligibility result
 */
export interface OverrideEligibilityResult {
  canOverride: boolean;
  reason: string;
  timeRemaining: number;
  windowExpiresAt: number;
  sessionStatus: 'pending' | 'active' | 'complete';
  errorType?: OverrideErrorType;
}

/**
 * Calculate override eligibility based on session end time and lecturer settings
 * Requirements: 5.1, 5.2, 5.4 - Time-based restrictions and validation
 *
 * @param session - The attendance session to check eligibility for
 * @param lecturerSettings - Lecturer-specific override settings
 * @param currentTime - Current timestamp (optional, defaults to Date.now())
 * @returns OverrideEligibilityResult with eligibility status and details
 */
export const calculateOverrideEligibility = (
  session: AttendanceSessionForOverride,
  lecturerSettings: LecturerOverrideSettings,
  currentTime?: number,
): OverrideEligibilityResult => {
  const now = currentTime || Date.now();

  // Validate inputs using Zod schema
  const validationData = {
    sessionEndTime: session.endedAt || session._creationTime,
    currentTime: now,
    overrideWindowHours: lecturerSettings.overrideWindowHours,
    sessionStatus: session.status,
  };

  const validationResult = timeWindowValidationSchema.safeParse(validationData);

  if (!validationResult.success) {
    return {
      canOverride: false,
      reason: 'Invalid session or settings data',
      timeRemaining: 0,
      windowExpiresAt: 0,
      sessionStatus: session.status,
      errorType: OverrideErrorType.INVALID_SESSION_STATUS,
    };
  }

  // Requirement 5.1: Session must be complete (not active)
  if (session.status === 'active' || session.status === 'pending') {
    return {
      canOverride: false,
      reason: getOverrideErrorMessage(OverrideErrorType.SESSION_STILL_ACTIVE),
      timeRemaining: 0,
      windowExpiresAt: 0,
      sessionStatus: session.status,
      errorType: OverrideErrorType.SESSION_STILL_ACTIVE,
    };
  }

  // Calculate time window based on session end time and lecturer settings
  const sessionEndTime = session.endedAt || session._creationTime;
  const windowHours = lecturerSettings.overrideWindowHours;
  const windowMs = windowHours * 60 * 60 * 1000; // Convert hours to milliseconds
  const windowExpiresAt = sessionEndTime + windowMs;

  // Requirement 5.2: Check if override window has expired
  if (now > windowExpiresAt) {
    return {
      canOverride: false,
      reason: getOverrideErrorMessage(OverrideErrorType.TIME_WINDOW_EXPIRED, {
        windowHours,
      }),
      timeRemaining: 0,
      windowExpiresAt,
      sessionStatus: session.status,
      errorType: OverrideErrorType.TIME_WINDOW_EXPIRED,
    };
  }

  // Calculate remaining time in the override window
  const timeRemaining = windowExpiresAt - now;

  // Override is available
  return {
    canOverride: true,
    reason: `Override available for ${Math.ceil(timeRemaining / (60 * 60 * 1000))} more hours`,
    timeRemaining,
    windowExpiresAt,
    sessionStatus: session.status,
  };
};

/**
 * Get default lecturer override settings
 * Requirements: 5.3 - Default settings for override time windows
 *
 * @returns Default lecturer override settings
 */
export const getDefaultLecturerSettings = (): LecturerOverrideSettings => {
  return {
    overrideWindowHours: 24, // Default to 24 hours
    notifyOnOverride: true,
  };
};

/**
 * Validate lecturer override settings and apply defaults
 * Requirements: 5.2, 5.3 - Settings validation with proper ranges
 *
 * @param settings - Raw lecturer settings
 * @returns Validated settings with defaults applied
 */
export const validateAndApplyLecturerSettings = (
  settings?: Partial<LecturerOverrideSettings>,
): LecturerOverrideSettings => {
  const defaults = getDefaultLecturerSettings();

  if (!settings) {
    return defaults;
  }

  // Validate override window hours
  let overrideWindowHours =
    settings.overrideWindowHours ?? defaults.overrideWindowHours;

  // Ensure window hours are within valid range (1-24 hours)
  if (overrideWindowHours < 1) {
    overrideWindowHours = 1;
  } else if (overrideWindowHours > 24) {
    overrideWindowHours = 24;
  }

  return {
    overrideWindowHours,
    notifyOnOverride: settings.notifyOnOverride ?? defaults.notifyOnOverride,
  };
};

/**
 * Check if a session is eligible for override operations
 * Requirements: 5.1, 5.4 - Session status validation
 *
 * @param session - The attendance session to check
 * @returns Boolean indicating if session is eligible for overrides
 */
export const isSessionEligibleForOverride = (
  session: AttendanceSessionForOverride,
): boolean => {
  // Only complete sessions are eligible for overrides
  return session.status === 'complete';
};

/**
 * Calculate time remaining in override window
 * Requirements: 5.4 - Time window display and calculations
 *
 * @param windowExpiresAt - Timestamp when override window expires
 * @param currentTime - Current timestamp (optional, defaults to Date.now())
 * @returns Time remaining in milliseconds (0 if expired)
 */
export const calculateTimeRemaining = (
  windowExpiresAt: number,
  currentTime?: number,
): number => {
  const now = currentTime || Date.now();
  const remaining = windowExpiresAt - now;
  return Math.max(0, remaining);
};

/**
 * Format time remaining into human-readable string
 * Requirements: 5.4 - User-friendly time display
 *
 * @param timeRemainingMs - Time remaining in milliseconds
 * @returns Formatted time string (e.g., "2 hours 30 minutes")
 */
export const formatTimeRemaining = (timeRemainingMs: number): string => {
  if (timeRemainingMs <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(timeRemainingMs / (60 * 60 * 1000));
  const minutes = Math.floor(
    (timeRemainingMs % (60 * 60 * 1000)) / (60 * 1000),
  );

  if (hours === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

/**
 * Check if override window is approaching expiration
 * Requirements: 5.4 - Warning system for approaching expiration
 *
 * @param timeRemainingMs - Time remaining in milliseconds
 * @param warningThresholdHours - Hours before expiration to show warning (default: 2)
 * @returns Boolean indicating if warning should be shown
 */
export const isOverrideWindowApproachingExpiration = (
  timeRemainingMs: number,
  warningThresholdHours: number = 2,
): boolean => {
  const warningThresholdMs = warningThresholdHours * 60 * 60 * 1000;
  return timeRemainingMs > 0 && timeRemainingMs <= warningThresholdMs;
};

/**
 * Validate override eligibility with comprehensive error handling
 * Requirements: 4.4, 5.2 - Comprehensive error handling with descriptive messages
 *
 * @param session - The attendance session
 * @param lecturerSettings - Lecturer override settings
 * @param currentTime - Current timestamp (optional)
 * @returns Detailed eligibility result with error information
 */
export const validateOverrideEligibilityWithErrors = (
  session: AttendanceSessionForOverride,
  lecturerSettings: LecturerOverrideSettings,
  currentTime?: number,
): OverrideEligibilityResult & { validationErrors?: string[] } => {
  try {
    // Validate inputs
    const validatedSettings =
      validateAndApplyLecturerSettings(lecturerSettings);

    // Calculate eligibility
    const result = calculateOverrideEligibility(
      session,
      validatedSettings,
      currentTime,
    );

    // Validate result using Zod schema
    const resultValidation = overrideEligibilityResultSchema.safeParse(result);

    if (!resultValidation.success) {
      return {
        canOverride: false,
        reason: 'Invalid eligibility calculation result',
        timeRemaining: 0,
        windowExpiresAt: 0,
        sessionStatus: session.status,
        errorType: OverrideErrorType.INVALID_SESSION_STATUS,
        validationErrors: resultValidation.error.errors.map((e) => e.message),
      };
    }

    return result;
  } catch (error) {
    return {
      canOverride: false,
      reason: 'Unexpected error during eligibility calculation',
      timeRemaining: 0,
      windowExpiresAt: 0,
      sessionStatus: session.status,
      errorType: OverrideErrorType.INVALID_SESSION_STATUS,
      validationErrors: [
        error instanceof Error ? error.message : 'Unknown error',
      ],
    };
  }
};

/**
 * Create override eligibility summary for UI display
 * Requirements: 5.4, 6.3 - User-friendly eligibility information
 *
 * @param eligibilityResult - Result from override eligibility calculation
 * @returns Summary object with user-friendly information
 */
export const createOverrideEligibilitySummary = (
  eligibilityResult: OverrideEligibilityResult,
) => {
  const timeRemainingFormatted = formatTimeRemaining(
    eligibilityResult.timeRemaining,
  );
  const isApproachingExpiration = isOverrideWindowApproachingExpiration(
    eligibilityResult.timeRemaining,
  );

  return {
    canOverride: eligibilityResult.canOverride,
    reason: eligibilityResult.reason,
    timeRemainingFormatted,
    isApproachingExpiration,
    sessionStatus: eligibilityResult.sessionStatus,
    errorType: eligibilityResult.errorType,
    windowExpiresAt: new Date(eligibilityResult.windowExpiresAt).toISOString(),
  };
};

/**
 * Constants for override eligibility calculations
 */
export const OVERRIDE_ELIGIBILITY_CONSTANTS = {
  DEFAULT_OVERRIDE_WINDOW_HOURS: 24,
  MIN_OVERRIDE_WINDOW_HOURS: 1,
  MAX_OVERRIDE_WINDOW_HOURS: 24,
  WARNING_THRESHOLD_HOURS: 2,
  MILLISECONDS_PER_HOUR: 60 * 60 * 1000,
  MILLISECONDS_PER_MINUTE: 60 * 1000,
} as const;

/**
 * Helper function to create mock session data for testing
 * This should only be used in development/testing environments
 */
export const createMockSessionForTesting = (
  overrides: Partial<AttendanceSessionForOverride> = {},
): AttendanceSessionForOverride => {
  const now = Date.now();
  return {
    _id: 'test-session-id',
    courseId: 'test-course-id',
    lecturerId: 'test-lecturer-id',
    status: 'complete',
    endedAt: now - 30 * 60 * 1000, // 30 minutes ago
    _creationTime: now - 60 * 60 * 1000, // 1 hour ago
    ...overrides,
  };
};

/**
 * Helper function to create mock lecturer settings for testing
 * This should only be used in development/testing environments
 */
export const createMockLecturerSettingsForTesting = (
  overrides: Partial<LecturerOverrideSettings> = {},
): LecturerOverrideSettings => {
  return {
    overrideWindowHours: 24,
    notifyOnOverride: true,
    ...overrides,
  };
};
