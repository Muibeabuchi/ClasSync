import { components } from '../_generated/api';

/**
 * Rate limiter configuration for AI CSV fix operations
 * Uses Convex rate limiter component with different policies for different use cases
 */

/**
 * Rate limit configuration constants
 */
export const RATE_LIMIT_CONFIG = {
  // AI CSV fix attempts per lecturer (5 attempts per hour)
  AI_CSV_FIX_PER_LECTURER: {
    name: 'ai_csv_fix_per_lecturer',
    kind: 'fixed window' as const,
    rate: 5,
    period: 60 * 60 * 1000, // 1 hour in milliseconds
    capacity: 5,
  },

  // Global AI service usage to prevent system abuse (100 requests per hour, distributed across 5 shards)
  AI_SERVICE_GLOBAL: {
    name: 'ai_service_global',
    kind: 'token bucket' as const,
    rate: 100,
    period: 60 * 60 * 1000, // 1 hour in milliseconds
    capacity: 120, // Allow some burst capacity
    shards: 5,
  },

  // Per-lecturer burst protection (3 requests per 5 minutes)
  AI_CSV_BURST_PROTECTION: {
    name: 'ai_csv_burst_protection',
    kind: 'fixed window' as const,
    rate: 3,
    period: 5 * 60 * 1000, // 5 minutes in milliseconds
    capacity: 3,
  },

  // Global system protection (prevent DoS attacks)
  SYSTEM_PROTECTION: {
    name: 'system_protection',
    kind: 'token bucket' as const,
    rate: 200,
    period: 60 * 60 * 1000, // 1 hour in milliseconds
    capacity: 250,
    shards: 10,
  },
} as const;

/**
 * Rate limit result interface
 */
export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  remaining?: number;
  resetTime?: number;
  limit?: number;
}

/**
 * Check rate limit for AI CSV fix per lecturer
 */
export const checkAiCsvFixRateLimit = async (
  ctx: any,
  lecturerId: string,
  count: number = 1,
): Promise<RateLimitResult> => {
  try {
    const result = await ctx.runQuery(
      components.rateLimiter.lib.checkRateLimit,
      {
        name: RATE_LIMIT_CONFIG.AI_CSV_FIX_PER_LECTURER.name,
        key: lecturerId,
        config: RATE_LIMIT_CONFIG.AI_CSV_FIX_PER_LECTURER,
        count,
        throws: false,
      },
    );

    return {
      allowed: result.ok,
      retryAfter: result.retryAfter,
      remaining: result.ok ? undefined : 0,
      resetTime: result.retryAfter
        ? Date.now() + result.retryAfter * 1000
        : undefined,
      limit: RATE_LIMIT_CONFIG.AI_CSV_FIX_PER_LECTURER.rate,
    };
  } catch (error) {
    console.error('Error checking AI CSV fix rate limit:', error);
    // Fail open - allow the request if rate limiter fails
    return { allowed: true };
  }
};

/**
 * Apply rate limit for AI CSV fix per lecturer
 */
export const applyAiCsvFixRateLimit = async (
  ctx: any,
  lecturerId: string,
  count: number = 1,
): Promise<RateLimitResult> => {
  try {
    const result = await ctx.runMutation(components.rateLimiter.lib.rateLimit, {
      name: RATE_LIMIT_CONFIG.AI_CSV_FIX_PER_LECTURER.name,
      key: lecturerId,
      config: RATE_LIMIT_CONFIG.AI_CSV_FIX_PER_LECTURER,
      count,
      throws: false,
    });

    return {
      allowed: result.ok,
      retryAfter: result.retryAfter,
      remaining: result.ok ? undefined : 0,
      resetTime: result.retryAfter
        ? Date.now() + result.retryAfter * 1000
        : undefined,
      limit: RATE_LIMIT_CONFIG.AI_CSV_FIX_PER_LECTURER.rate,
    };
  } catch (error) {
    console.error('Error applying AI CSV fix rate limit:', error);
    // Fail closed - deny the request if rate limiter fails
    return {
      allowed: false,
      retryAfter: 300, // 5 minutes default retry
    };
  }
};

/**
 * Check burst protection rate limit
 */
export const checkBurstProtectionRateLimit = async (
  ctx: any,
  lecturerId: string,
  count: number = 1,
): Promise<RateLimitResult> => {
  try {
    const result = await ctx.runQuery(
      components.rateLimiter.lib.checkRateLimit,
      {
        name: RATE_LIMIT_CONFIG.AI_CSV_BURST_PROTECTION.name,
        key: lecturerId,
        config: RATE_LIMIT_CONFIG.AI_CSV_BURST_PROTECTION,
        count,
        throws: false,
      },
    );

    return {
      allowed: result.ok,
      retryAfter: result.retryAfter,
      remaining: result.ok ? undefined : 0,
      resetTime: result.retryAfter
        ? Date.now() + result.retryAfter * 1000
        : undefined,
      limit: RATE_LIMIT_CONFIG.AI_CSV_BURST_PROTECTION.rate,
    };
  } catch (error) {
    console.error('Error checking burst protection rate limit:', error);
    return { allowed: true };
  }
};

/**
 * Apply burst protection rate limit
 */
export const applyBurstProtectionRateLimit = async (
  ctx: any,
  lecturerId: string,
  count: number = 1,
): Promise<RateLimitResult> => {
  try {
    const result = await ctx.runMutation(components.rateLimiter.lib.rateLimit, {
      name: RATE_LIMIT_CONFIG.AI_CSV_BURST_PROTECTION.name,
      key: lecturerId,
      config: RATE_LIMIT_CONFIG.AI_CSV_BURST_PROTECTION,
      count,
      throws: false,
    });

    return {
      allowed: result.ok,
      retryAfter: result.retryAfter,
      remaining: result.ok ? undefined : 0,
      resetTime: result.retryAfter
        ? Date.now() + result.retryAfter * 1000
        : undefined,
      limit: RATE_LIMIT_CONFIG.AI_CSV_BURST_PROTECTION.rate,
    };
  } catch (error) {
    console.error('Error applying burst protection rate limit:', error);
    return {
      allowed: false,
      retryAfter: 300, // 5 minutes default retry
    };
  }
};

/**
 * Check global AI service rate limit
 */
export const checkGlobalAiServiceRateLimit = async (
  ctx: any,
  count: number = 1,
): Promise<RateLimitResult> => {
  try {
    const result = await ctx.runQuery(
      components.rateLimiter.lib.checkRateLimit,
      {
        name: RATE_LIMIT_CONFIG.AI_SERVICE_GLOBAL.name,
        config: RATE_LIMIT_CONFIG.AI_SERVICE_GLOBAL,
        count,
        throws: false,
      },
    );

    return {
      allowed: result.ok,
      retryAfter: result.retryAfter,
      remaining: result.ok ? undefined : 0,
      resetTime: result.retryAfter
        ? Date.now() + result.retryAfter * 1000
        : undefined,
      limit: RATE_LIMIT_CONFIG.AI_SERVICE_GLOBAL.rate,
    };
  } catch (error) {
    console.error('Error checking global AI service rate limit:', error);
    return { allowed: true };
  }
};

/**
 * Apply global AI service rate limit
 */
export const applyGlobalAiServiceRateLimit = async (
  ctx: any,
  count: number = 1,
): Promise<RateLimitResult> => {
  try {
    const result = await ctx.runMutation(components.rateLimiter.lib.rateLimit, {
      name: RATE_LIMIT_CONFIG.AI_SERVICE_GLOBAL.name,
      config: RATE_LIMIT_CONFIG.AI_SERVICE_GLOBAL,
      count,
      throws: false,
    });

    return {
      allowed: result.ok,
      retryAfter: result.retryAfter,
      remaining: result.ok ? undefined : 0,
      resetTime: result.retryAfter
        ? Date.now() + result.retryAfter * 1000
        : undefined,
      limit: RATE_LIMIT_CONFIG.AI_SERVICE_GLOBAL.rate,
    };
  } catch (error) {
    console.error('Error applying global AI service rate limit:', error);
    return {
      allowed: false,
      retryAfter: 300, // 5 minutes default retry
    };
  }
};

/**
 * Comprehensive rate limit check for AI CSV fix operations
 * Checks all applicable rate limits before allowing the operation
 */
export const checkAllAiCsvFixRateLimits = async (
  ctx: any,
  lecturerId: string,
): Promise<{
  allowed: boolean;
  blockedBy?: string;
  retryAfter?: number;
  details: {
    lecturerLimit: RateLimitResult;
    burstProtection: RateLimitResult;
    globalLimit: RateLimitResult;
  };
}> => {
  // Check all rate limits in parallel
  const [lecturerLimit, burstProtection, globalLimit] = await Promise.all([
    checkAiCsvFixRateLimit(ctx, lecturerId),
    checkBurstProtectionRateLimit(ctx, lecturerId),
    checkGlobalAiServiceRateLimit(ctx),
  ]);

  // Determine if request is allowed
  let allowed = true;
  let blockedBy: string | undefined;
  let retryAfter: number | undefined;

  if (!lecturerLimit.allowed) {
    allowed = false;
    blockedBy = 'lecturer_hourly_limit';
    retryAfter = lecturerLimit.retryAfter;
  } else if (!burstProtection.allowed) {
    allowed = false;
    blockedBy = 'burst_protection';
    retryAfter = burstProtection.retryAfter;
  } else if (!globalLimit.allowed) {
    allowed = false;
    blockedBy = 'global_service_limit';
    retryAfter = globalLimit.retryAfter;
  }

  return {
    allowed,
    blockedBy,
    retryAfter,
    details: {
      lecturerLimit,
      burstProtection,
      globalLimit,
    },
  };
};

/**
 * Apply all rate limits for AI CSV fix operations
 * Only applies limits if all checks pass
 */
export const applyAllAiCsvFixRateLimits = async (
  ctx: any,
  lecturerId: string,
): Promise<{
  success: boolean;
  blockedBy?: string;
  retryAfter?: number;
  details: {
    lecturerLimit: RateLimitResult;
    burstProtection: RateLimitResult;
    globalLimit: RateLimitResult;
  };
}> => {
  // First check if all limits would allow the request
  const checkResult = await checkAllAiCsvFixRateLimits(ctx, lecturerId);

  if (!checkResult.allowed) {
    return {
      success: false,
      blockedBy: checkResult.blockedBy,
      retryAfter: checkResult.retryAfter,
      details: checkResult.details,
    };
  }

  // Apply all rate limits
  const [lecturerLimit, burstProtection, globalLimit] = await Promise.all([
    applyAiCsvFixRateLimit(ctx, lecturerId),
    applyBurstProtectionRateLimit(ctx, lecturerId),
    applyGlobalAiServiceRateLimit(ctx),
  ]);

  // Check if any application failed
  let success = true;
  let blockedBy: string | undefined;
  let retryAfter: number | undefined;

  if (!lecturerLimit.allowed) {
    success = false;
    blockedBy = 'lecturer_hourly_limit';
    retryAfter = lecturerLimit.retryAfter;
  } else if (!burstProtection.allowed) {
    success = false;
    blockedBy = 'burst_protection';
    retryAfter = burstProtection.retryAfter;
  } else if (!globalLimit.allowed) {
    success = false;
    blockedBy = 'global_service_limit';
    retryAfter = globalLimit.retryAfter;
  }

  return {
    success,
    blockedBy,
    retryAfter,
    details: {
      lecturerLimit,
      burstProtection,
      globalLimit,
    },
  };
};

/**
 * Reset rate limits for a specific lecturer (for testing or admin purposes)
 */
export const resetLecturerRateLimits = async (
  ctx: any,
  lecturerId: string,
): Promise<void> => {
  try {
    await Promise.all([
      ctx.runMutation(components.rateLimiter.lib.resetRateLimit, {
        name: RATE_LIMIT_CONFIG.AI_CSV_FIX_PER_LECTURER.name,
        key: lecturerId,
      }),
      ctx.runMutation(components.rateLimiter.lib.resetRateLimit, {
        name: RATE_LIMIT_CONFIG.AI_CSV_BURST_PROTECTION.name,
        key: lecturerId,
      }),
    ]);
  } catch (error) {
    console.error('Error resetting lecturer rate limits:', error);
  }
};

/**
 * Get current rate limit status for a lecturer
 */
export const getLecturerRateLimitStatus = async (
  ctx: any,
  lecturerId: string,
): Promise<{
  hourlyLimit: RateLimitResult;
  burstProtection: RateLimitResult;
  globalLimit: RateLimitResult;
}> => {
  const [hourlyLimit, burstProtection, globalLimit] = await Promise.all([
    checkAiCsvFixRateLimit(ctx, lecturerId, 0), // Check without consuming
    checkBurstProtectionRateLimit(ctx, lecturerId, 0),
    checkGlobalAiServiceRateLimit(ctx, 0),
  ]);

  return {
    hourlyLimit,
    burstProtection,
    globalLimit,
  };
};

/**
 * Calculate retry time with jitter to prevent thundering herd
 */
export const calculateRetryTimeWithJitter = (baseRetryTime: number): number => {
  // Add random jitter of ±20% to prevent all clients retrying at the same time
  const jitterPercent = 0.2;
  const jitter = (Math.random() - 0.5) * 2 * jitterPercent;
  const jitteredTime = baseRetryTime * (1 + jitter);

  // Ensure minimum retry time of 30 seconds
  return Math.max(30, Math.floor(jitteredTime));
};

/**
 * Format retry time into human-readable string
 */
export const formatRetryTime = (retryAfterSeconds: number): string => {
  if (retryAfterSeconds < 60) {
    return `${retryAfterSeconds} seconds`;
  } else if (retryAfterSeconds < 3600) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    const hours = Math.ceil(retryAfterSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
};

/**
 * Create user-friendly error message for rate limit exceeded
 */
export const createRateLimitErrorMessage = (
  blockedBy: string,
  retryAfter?: number,
): string => {
  const retryTimeStr = retryAfter ? formatRetryTime(retryAfter) : 'later';

  switch (blockedBy) {
    case 'lecturer_hourly_limit':
      return `You have reached the hourly limit of 5 AI CSV repair attempts. Please try again in ${retryTimeStr}.`;

    case 'burst_protection':
      return `Too many requests in a short time. Please wait ${retryTimeStr} before trying again.`;

    case 'global_service_limit':
      return `The AI repair service is currently experiencing high demand. Please try again in ${retryTimeStr}.`;

    default:
      return `Rate limit exceeded. Please try again in ${retryTimeStr}.`;
  }
};

/**
 * Create rate limit exceeded error result for AI CSV fix
 */
export const createRateLimitError = (
  blockedBy: string,
  retryAfter?: number,
): {
  repaired: false;
  error: string;
  errorType: 'rate_limit_error';
  retryable: true;
  retryAfter: number;
  suggestions: string[];
} => {
  const retryTime = retryAfter ? calculateRetryTimeWithJitter(retryAfter) : 300;

  return {
    repaired: false,
    error: createRateLimitErrorMessage(blockedBy, retryTime),
    errorType: 'rate_limit_error',
    retryable: true,
    retryAfter: retryTime,
    suggestions: [
      'Wait for the specified time before trying again',
      'Consider manually editing your CSV file',
      'Contact support if you need to process urgent uploads',
    ],
  };
};

/**
 * Handle rate limit check result and throw appropriate error if blocked
 */
export const handleRateLimitResult = (result: {
  allowed: boolean;
  blockedBy?: string;
  retryAfter?: number;
}): void => {
  if (!result.allowed) {
    const error = createRateLimitError(
      result.blockedBy || 'unknown',
      result.retryAfter,
    );
    throw new Error(JSON.stringify(error));
  }
};

/**
 * Middleware function to check rate limits before executing AI CSV fix
 */
export const withRateLimitCheck = async <T>(
  ctx: any,
  lecturerId: string,
  operation: () => Promise<T>,
): Promise<T> => {
  // Check rate limits
  const rateLimitResult = await checkAllAiCsvFixRateLimits(ctx, lecturerId);

  if (!rateLimitResult.allowed) {
    const error = createRateLimitError(
      rateLimitResult.blockedBy || 'unknown',
      rateLimitResult.retryAfter,
    );
    throw new Error(JSON.stringify(error));
  }

  // Apply rate limits
  const applyResult = await applyAllAiCsvFixRateLimits(ctx, lecturerId);

  if (!applyResult.success) {
    const error = createRateLimitError(
      applyResult.blockedBy || 'unknown',
      applyResult.retryAfter,
    );
    throw new Error(JSON.stringify(error));
  }

  // Execute the operation
  return await operation();
};

/**
 * Log rate limit events for monitoring and debugging
 */
export const logRateLimitEvent = (
  event: 'check' | 'apply' | 'exceeded' | 'reset',
  lecturerId: string,
  details: {
    limitType?: string;
    allowed?: boolean;
    retryAfter?: number;
    timestamp?: number;
  },
): void => {
  const logEntry = {
    event,
    lecturerId,
    timestamp: details.timestamp || Date.now(),
    ...details,
  };

  // In production, this would go to a proper logging service
  console.log('RateLimit Event:', JSON.stringify(logEntry));
};

/**
 * Get rate limit statistics for monitoring
 */
export const getRateLimitStats = async (
  ctx: any,
): Promise<{
  totalRequests: number;
  blockedRequests: number;
  averageRetryTime: number;
  topBlockedLecturers: string[];
}> => {
  // This would typically query a monitoring database
  // For now, return placeholder data
  return {
    totalRequests: 0,
    blockedRequests: 0,
    averageRetryTime: 0,
    topBlockedLecturers: [],
  };
};

/**
 * Health check for rate limiter service
 */
export const checkRateLimiterHealth = async (
  ctx: any,
): Promise<{
  healthy: boolean;
  latency: number;
  errors: string[];
}> => {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // Test basic rate limiter functionality
    await ctx.runQuery(components.rateLimiter.lib.checkRateLimit, {
      name: 'health_check',
      config: {
        kind: 'fixed window' as const,
        rate: 1000,
        period: 60000,
      },
      count: 0,
      throws: false,
    });

    const latency = Date.now() - startTime;

    return {
      healthy: true,
      latency,
      errors,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');

    return {
      healthy: false,
      latency: Date.now() - startTime,
      errors,
    };
  }
};
