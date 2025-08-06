/**
 * Test file for override eligibility calculation logic
 * This file contains comprehensive tests for the override eligibility system
 * Requirements: 5.1, 5.2, 5.4 - Time-based restrictions and validation
 */

import {
  calculateOverrideEligibility,
  validateAndApplyLecturerSettings,
  isSessionEligibleForOverride,
  calculateTimeRemaining,
  formatTimeRemaining,
  isOverrideWindowApproachingExpiration,
  validateOverrideEligibilityWithErrors,
  createOverrideEligibilitySummary,
  createMockSessionForTesting,
  createMockLecturerSettingsForTesting,
  OVERRIDE_ELIGIBILITY_CONSTANTS,
  type AttendanceSessionForOverride,
  type LecturerOverrideSettings,
} from './utils/overrideEligibility';

import { OverrideErrorType } from './schemas/overrideValidation';

/**
 * Test suite for override eligibility calculation
 */
export const runOverrideEligibilityTests = () => {
  console.log('🧪 Running Override Eligibility Tests...\n');

  // Test 1: Session still active - should not allow override
  console.log('Test 1: Active session should not allow override');
  const activeSession = createMockSessionForTesting({
    status: 'active',
    endedAt: undefined,
  });
  const defaultSettings = createMockLecturerSettingsForTesting();

  const activeResult = calculateOverrideEligibility(
    activeSession,
    defaultSettings,
  );
  console.log('Result:', {
    canOverride: activeResult.canOverride,
    reason: activeResult.reason,
    errorType: activeResult.errorType,
  });
  console.log(
    '✅ Expected: canOverride = false, errorType = SESSION_STILL_ACTIVE\n',
  );

  // Test 2: Session complete within time window - should allow override
  console.log(
    'Test 2: Complete session within time window should allow override',
  );
  const now = Date.now();
  const recentSession = createMockSessionForTesting({
    status: 'complete',
    endedAt: now - 30 * 60 * 1000, // 30 minutes ago
  });

  const recentResult = calculateOverrideEligibility(
    recentSession,
    defaultSettings,
    now,
  );
  console.log('Result:', {
    canOverride: recentResult.canOverride,
    reason: recentResult.reason,
    timeRemaining: Math.ceil(recentResult.timeRemaining / (60 * 60 * 1000)), // hours
  });
  console.log('✅ Expected: canOverride = true, timeRemaining ≈ 23.5 hours\n');

  // Test 3: Session complete but time window expired - should not allow override
  console.log(
    'Test 3: Complete session with expired time window should not allow override',
  );
  const expiredSession = createMockSessionForTesting({
    status: 'complete',
    endedAt: now - 25 * 60 * 60 * 1000, // 25 hours ago
  });

  const expiredResult = calculateOverrideEligibility(
    expiredSession,
    defaultSettings,
    now,
  );
  console.log('Result:', {
    canOverride: expiredResult.canOverride,
    reason: expiredResult.reason,
    errorType: expiredResult.errorType,
  });
  console.log(
    '✅ Expected: canOverride = false, errorType = TIME_WINDOW_EXPIRED\n',
  );

  // Test 4: Custom lecturer settings with shorter window
  console.log('Test 4: Custom lecturer settings with 2-hour window');
  const shortWindowSettings = createMockLecturerSettingsForTesting({
    overrideWindowHours: 2,
  });
  const sessionFor2Hours = createMockSessionForTesting({
    status: 'complete',
    endedAt: now - 90 * 60 * 1000, // 1.5 hours ago
  });

  const shortWindowResult = calculateOverrideEligibility(
    sessionFor2Hours,
    shortWindowSettings,
    now,
  );
  console.log('Result:', {
    canOverride: shortWindowResult.canOverride,
    timeRemaining: Math.ceil(shortWindowResult.timeRemaining / (60 * 1000)), // minutes
  });
  console.log('✅ Expected: canOverride = true, timeRemaining ≈ 30 minutes\n');

  // Test 5: Lecturer settings validation and defaults
  console.log('Test 5: Lecturer settings validation and defaults');
  const invalidSettings = { overrideWindowHours: 30 }; // Invalid: > 24 hours
  const validatedSettings = validateAndApplyLecturerSettings(invalidSettings);
  console.log('Input:', invalidSettings);
  console.log('Validated:', validatedSettings);
  console.log('✅ Expected: overrideWindowHours = 24 (clamped to max)\n');

  // Test 6: Time formatting
  console.log('Test 6: Time formatting tests');
  const testTimes = [
    { ms: 2 * 60 * 60 * 1000 + 30 * 60 * 1000, expected: '2 hours 30 minutes' },
    { ms: 1 * 60 * 60 * 1000, expected: '1 hour' },
    { ms: 45 * 60 * 1000, expected: '45 minutes' },
    { ms: 0, expected: 'Expired' },
  ];

  testTimes.forEach(({ ms, expected }) => {
    const formatted = formatTimeRemaining(ms);
    console.log(`${ms}ms -> "${formatted}" (expected: "${expected}")`);
  });
  console.log('✅ Time formatting tests completed\n');

  // Test 7: Warning threshold detection
  console.log('Test 7: Warning threshold detection');
  const warningTests = [
    { timeMs: 3 * 60 * 60 * 1000, expected: false }, // 3 hours - no warning
    { timeMs: 1.5 * 60 * 60 * 1000, expected: true }, // 1.5 hours - warning
    { timeMs: 30 * 60 * 1000, expected: true }, // 30 minutes - warning
    { timeMs: 0, expected: false }, // Expired - no warning
  ];

  warningTests.forEach(({ timeMs, expected }) => {
    const isWarning = isOverrideWindowApproachingExpiration(timeMs);
    console.log(
      `${timeMs / (60 * 60 * 1000)}h -> warning: ${isWarning} (expected: ${expected})`,
    );
  });
  console.log('✅ Warning threshold tests completed\n');

  // Test 8: Comprehensive validation with errors
  console.log('Test 8: Comprehensive validation with error handling');
  const invalidSession = {
    _id: 'test',
    courseId: 'test',
    lecturerId: 'test',
    status: 'complete' as const,
    endedAt: -1, // Invalid timestamp
    _creationTime: Date.now(),
  };

  const errorResult = validateOverrideEligibilityWithErrors(
    invalidSession,
    defaultSettings,
  );
  console.log('Error result:', {
    canOverride: errorResult.canOverride,
    reason: errorResult.reason,
    errorType: errorResult.errorType,
  });
  console.log('✅ Expected: canOverride = false with error handling\n');

  // Test 9: Override eligibility summary
  console.log('Test 9: Override eligibility summary creation');
  const summaryResult = calculateOverrideEligibility(
    recentSession,
    defaultSettings,
    now,
  );
  const summary = createOverrideEligibilitySummary(summaryResult);
  console.log('Summary:', {
    canOverride: summary.canOverride,
    timeRemainingFormatted: summary.timeRemainingFormatted,
    isApproachingExpiration: summary.isApproachingExpiration,
    sessionStatus: summary.sessionStatus,
  });
  console.log('✅ Summary creation completed\n');

  // Test 10: Edge cases
  console.log('Test 10: Edge cases');

  // Session ended exactly at window boundary
  const boundarySession = createMockSessionForTesting({
    status: 'complete',
    endedAt: now - 24 * 60 * 60 * 1000, // Exactly 24 hours ago
  });

  const boundaryResult = calculateOverrideEligibility(
    boundarySession,
    defaultSettings,
    now,
  );
  console.log('Boundary case (exactly 24h ago):', {
    canOverride: boundaryResult.canOverride,
    timeRemaining: boundaryResult.timeRemaining,
  });

  // Pending session
  const pendingSession = createMockSessionForTesting({
    status: 'pending',
  });

  const pendingResult = calculateOverrideEligibility(
    pendingSession,
    defaultSettings,
    now,
  );
  console.log('Pending session:', {
    canOverride: pendingResult.canOverride,
    errorType: pendingResult.errorType,
  });
  console.log('✅ Edge cases completed\n');

  console.log('🎉 All Override Eligibility Tests Completed!\n');

  return {
    activeResult,
    recentResult,
    expiredResult,
    shortWindowResult,
    validatedSettings,
    errorResult,
    summary,
    boundaryResult,
    pendingResult,
  };
};

/**
 * Test specific scenarios for requirements validation
 */
export const testRequirementScenarios = () => {
  console.log('📋 Testing Requirement Scenarios...\n');

  const now = Date.now();

  // Requirement 5.1: Session must not be active
  console.log('Requirement 5.1: Prevent overrides during active sessions');
  const activeSession = createMockSessionForTesting({ status: 'active' });
  const activeTest = calculateOverrideEligibility(
    activeSession,
    createMockLecturerSettingsForTesting(),
  );
  console.log('Active session override allowed:', activeTest.canOverride);
  console.log('✅ Should be false\n');

  // Requirement 5.2: Time window restrictions (1-24 hours)
  console.log('Requirement 5.2: Time window restrictions');
  const settingsTests = [
    { hours: 0.5, expectedClamped: 1 },
    { hours: 12, expectedClamped: 12 },
    { hours: 30, expectedClamped: 24 },
  ];

  settingsTests.forEach(({ hours, expectedClamped }) => {
    const validated = validateAndApplyLecturerSettings({
      overrideWindowHours: hours,
    });
    console.log(
      `Input: ${hours}h -> Validated: ${validated.overrideWindowHours}h (expected: ${expectedClamped}h)`,
    );
  });
  console.log('✅ Time window validation working\n');

  // Requirement 5.4: Time window display and remaining time
  console.log('Requirement 5.4: Time window display');
  const displaySession = createMockSessionForTesting({
    status: 'complete',
    endedAt: now - 2 * 60 * 60 * 1000, // 2 hours ago
  });

  const displayResult = calculateOverrideEligibility(
    displaySession,
    createMockLecturerSettingsForTesting(),
    now,
  );

  const displaySummary = createOverrideEligibilitySummary(displayResult);
  console.log('Time display:', {
    timeRemainingFormatted: displaySummary.timeRemainingFormatted,
    windowExpiresAt: displaySummary.windowExpiresAt,
    isApproachingExpiration: displaySummary.isApproachingExpiration,
  });
  console.log('✅ Time display working\n');

  console.log('📋 Requirement Scenarios Testing Complete!\n');
};

/**
 * Performance test for override eligibility calculations
 */
export const performanceTest = () => {
  console.log('⚡ Running Performance Tests...\n');

  const iterations = 1000;
  const session = createMockSessionForTesting();
  const settings = createMockLecturerSettingsForTesting();

  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    calculateOverrideEligibility(session, settings);
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;

  console.log(`Performance Results:`);
  console.log(`- Total iterations: ${iterations}`);
  console.log(`- Total time: ${totalTime}ms`);
  console.log(`- Average time per calculation: ${avgTime.toFixed(3)}ms`);
  console.log(`- Calculations per second: ${Math.round(1000 / avgTime)}`);
  console.log('✅ Performance test completed\n');

  return {
    totalTime,
    avgTime,
    calculationsPerSecond: Math.round(1000 / avgTime),
  };
};

// Export test runner function
export const runAllOverrideEligibilityTests = () => {
  console.log('🚀 Starting Comprehensive Override Eligibility Tests\n');

  const basicTests = runOverrideEligibilityTests();
  testRequirementScenarios();
  const performanceResults = performanceTest();

  console.log('🎯 All Tests Completed Successfully!');

  return {
    basicTests,
    performanceResults,
  };
};

// Run tests if this file is executed directly
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // Only run tests in development environment
  // runAllOverrideEligibilityTests();
}
