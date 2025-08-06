/**
 * Test file for manual attendance override functionality
 * This file contains test functions to validate the override mutations
 */

import { query } from './_generated/server';
import { v } from 'convex/values';
import {
  validateAndCleanJustification,
  validateAndCleanLecturerSettings,
  OverrideErrorType,
  getOverrideErrorMessage,
} from './schemas/overrideValidation';
import {
  calculateOverrideEligibility,
  getDefaultLecturerSettings,
  type AttendanceSessionForOverride,
} from './utils/overrideEligibility';

/**
 * Test function to validate override justification validation
 */
export const testJustificationValidation = query({
  args: {},
  handler: async (ctx, args) => {
    const testCases = [
      {
        input: 'Student had GPS issues but was physically present in class',
        expected: true,
        description: 'Valid justification',
      },
      {
        input: 'Too short',
        expected: false,
        description: 'Too short (less than 15 characters)',
      },
      {
        input: '',
        expected: false,
        description: 'Empty justification',
      },
      {
        input: 'a'.repeat(101),
        expected: false,
        description: 'Too long (more than 100 characters)',
      },
      {
        input: 'Student was present but phone died during check-in process',
        expected: true,
        description: 'Valid detailed justification',
      },
    ];

    const results = testCases.map((testCase) => {
      const validation = validateAndCleanJustification(testCase.input);
      return {
        input: testCase.input,
        expected: testCase.expected,
        actual: validation.success,
        passed: validation.success === testCase.expected,
        description: testCase.description,
        errors: validation.errors,
      };
    });

    return {
      testName: 'Justification Validation Tests',
      results,
      summary: {
        total: results.length,
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
      },
    };
  },
});

/**
 * Test function to validate lecturer settings validation
 */
export const testLecturerSettingsValidation = query({
  args: {},
  handler: async (ctx, args) => {
    const testCases = [
      {
        input: { overrideWindowHours: 24, notifyOnOverride: true },
        expected: true,
        description: 'Valid settings with 24 hours',
      },
      {
        input: { overrideWindowHours: 1, notifyOnOverride: false },
        expected: true,
        description: 'Valid settings with 1 hour',
      },
      {
        input: { overrideWindowHours: 0 },
        expected: false,
        description: 'Invalid - 0 hours',
      },
      {
        input: { overrideWindowHours: 25 },
        expected: false,
        description: 'Invalid - more than 24 hours',
      },
      {
        input: { overrideWindowHours: 12 },
        expected: true,
        description: 'Valid - 12 hours with default notify',
      },
    ];

    const results = testCases.map((testCase) => {
      const validation = validateAndCleanLecturerSettings(testCase.input);
      return {
        input: testCase.input,
        expected: testCase.expected,
        actual: validation.success,
        passed: validation.success === testCase.expected,
        description: testCase.description,
        errors: validation.errors,
        data: validation.data,
      };
    });

    return {
      testName: 'Lecturer Settings Validation Tests',
      results,
      summary: {
        total: results.length,
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
      },
    };
  },
});

/**
 * Test function to validate override eligibility calculation
 */
export const testOverrideEligibility = query({
  args: {},
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    const twentyFiveHoursAgo = now - 25 * 60 * 60 * 1000;

    const testCases = [
      {
        session: {
          _id: 'test-session-1',
          courseId: 'test-course-1',
          lecturerId: 'test-lecturer-1',
          status: 'complete' as const,
          endedAt: oneHourAgo,
          _creationTime: twoHoursAgo,
        },
        settings: { overrideWindowHours: 24, notifyOnOverride: true },
        expected: true,
        description: 'Session ended 1 hour ago, 24-hour window',
      },
      {
        session: {
          _id: 'test-session-2',
          courseId: 'test-course-2',
          lecturerId: 'test-lecturer-2',
          status: 'active' as const,
          endedAt: oneHourAgo,
          _creationTime: twoHoursAgo,
        },
        settings: { overrideWindowHours: 24, notifyOnOverride: true },
        expected: false,
        description: 'Session still active - should not allow override',
      },
      {
        session: {
          _id: 'test-session-3',
          courseId: 'test-course-3',
          lecturerId: 'test-lecturer-3',
          status: 'complete' as const,
          endedAt: twentyFiveHoursAgo,
          _creationTime: twentyFiveHoursAgo,
        },
        settings: { overrideWindowHours: 24, notifyOnOverride: true },
        expected: false,
        description: 'Session ended 25 hours ago, 24-hour window expired',
      },
      {
        session: {
          _id: 'test-session-4',
          courseId: 'test-course-4',
          lecturerId: 'test-lecturer-4',
          status: 'complete' as const,
          endedAt: oneHourAgo,
          _creationTime: twoHoursAgo,
        },
        settings: { overrideWindowHours: 2, notifyOnOverride: true },
        expected: true,
        description: 'Session ended 1 hour ago, 2-hour window',
      },
    ];

    const results = testCases.map((testCase) => {
      const eligibility = calculateOverrideEligibility(
        testCase.session,
        testCase.settings,
        now,
      );
      return {
        session: testCase.session,
        settings: testCase.settings,
        expected: testCase.expected,
        actual: eligibility.canOverride,
        passed: eligibility.canOverride === testCase.expected,
        description: testCase.description,
        eligibilityResult: eligibility,
      };
    });

    return {
      testName: 'Override Eligibility Tests',
      results,
      summary: {
        total: results.length,
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
      },
      currentTime: now,
    };
  },
});

/**
 * Test function to validate error message generation
 */
export const testErrorMessages = query({
  args: {},
  handler: async (ctx, args) => {
    const errorTypes = [
      OverrideErrorType.SESSION_STILL_ACTIVE,
      OverrideErrorType.TIME_WINDOW_EXPIRED,
      OverrideErrorType.STUDENT_ALREADY_PRESENT,
      OverrideErrorType.INSUFFICIENT_JUSTIFICATION,
      OverrideErrorType.PERMISSION_DENIED,
      OverrideErrorType.SESSION_NOT_FOUND,
      OverrideErrorType.STUDENT_NOT_ENROLLED,
      OverrideErrorType.DUPLICATE_OVERRIDE,
    ];

    const results = errorTypes.map((errorType) => {
      const message = getOverrideErrorMessage(errorType, { windowHours: 24 });
      return {
        errorType,
        message,
        hasMessage: message.length > 0,
      };
    });

    return {
      testName: 'Error Message Tests',
      results,
      summary: {
        total: results.length,
        withMessages: results.filter((r) => r.hasMessage).length,
      },
    };
  },
});

/**
 * Test function to validate default lecturer settings
 */
export const testDefaultSettings = query({
  args: {},
  handler: async (ctx, args) => {
    const defaultSettings = getDefaultLecturerSettings();

    return {
      testName: 'Default Settings Test',
      defaultSettings,
      validations: {
        hasOverrideWindowHours:
          typeof defaultSettings.overrideWindowHours === 'number',
        overrideWindowInRange:
          defaultSettings.overrideWindowHours >= 1 &&
          defaultSettings.overrideWindowHours <= 24,
        hasNotifyOnOverride:
          typeof defaultSettings.notifyOnOverride === 'boolean',
      },
    };
  },
});
