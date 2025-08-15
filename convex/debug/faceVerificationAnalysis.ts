import { query } from '../_generated/server';
import { v } from 'convex/values';

/**
 * Debug query to analyze face verification patterns and thresholds
 */
export const analyzeFaceVerificationPatterns = query({
  args: {
    studentId: v.optional(v.id('userProfiles')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get face verification logs
    let logsQuery = ctx.db.query('faceVerificationLogs').order('desc');

    if (args.studentId) {
      logsQuery = logsQuery.filter((q) =>
        q.eq(q.field('studentId'), args.studentId),
      );
    }

    const logs = await logsQuery.take(limit);

    // Get student info for each log
    const logsWithStudentInfo = await Promise.all(
      logs.map(async (log) => {
        const student = await ctx.db.get(log.studentId);
        return {
          ...log,
          studentName: student?.fullName || 'Unknown',
          studentEmail: student?.email || 'Unknown',
        };
      }),
    );

    // Calculate statistics
    const successfulAttempts = logs.filter(
      (log) => log.verificationStatus === 'success',
    );
    const failedAttempts = logs.filter(
      (log) => log.verificationStatus === 'failed',
    );

    const matchScores = logs
      .map((log) => log.matchScore)
      .filter((score) => score !== undefined);
    const avgMatchScore =
      matchScores.length > 0
        ? matchScores.reduce((sum, score) => sum + score, 0) /
          matchScores.length
        : 0;

    const minScore = Math.min(...matchScores);
    const maxScore = Math.max(...matchScores);

    // Analyze score distribution
    const scoreRanges = {
      excellent: matchScores.filter((score) => score <= 0.2).length,
      good: matchScores.filter((score) => score > 0.2 && score <= 0.4).length,
      fair: matchScores.filter((score) => score > 0.4 && score <= 0.6).length,
      poor: matchScores.filter((score) => score > 0.6).length,
    };

    return {
      totalAttempts: logs.length,
      successfulAttempts: successfulAttempts.length,
      failedAttempts: failedAttempts.length,
      successRate:
        logs.length > 0 ? (successfulAttempts.length / logs.length) * 100 : 0,

      matchScoreStats: {
        average: avgMatchScore,
        minimum: minScore,
        maximum: maxScore,
        count: matchScores.length,
      },

      scoreDistribution: scoreRanges,

      thresholdAnalysis: {
        currentThreshold: 0.4,
        wouldPassAt03: matchScores.filter((score) => score <= 0.3).length,
        wouldPassAt04: matchScores.filter((score) => score <= 0.4).length,
        wouldPassAt05: matchScores.filter((score) => score <= 0.5).length,
        wouldPassAt06: matchScores.filter((score) => score <= 0.6).length,
      },

      recentLogs: logsWithStudentInfo.slice(0, 10),
    };
  },
});

/**
 * Compare face descriptors between stored and recent attempts
 */
export const compareFaceDescriptors = query({
  args: {
    studentId: v.id('userProfiles'),
    recentAttempts: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const recentAttempts = args.recentAttempts || 5;

    // Get student's stored face descriptor
    const student = await ctx.db.get(args.studentId);
    if (!student?.faceDescriptor) {
      throw new Error('Student face descriptor not found');
    }

    // Get recent verification logs for this student
    const recentLogs = await ctx.db
      .query('faceVerificationLogs')
      .withIndex('by_student', (q) => q.eq('studentId', args.studentId))
      .order('desc')
      .take(recentAttempts);

    // Calculate statistics about the stored descriptor
    const storedDescriptor = student.faceDescriptor;
    const descriptorStats = {
      length: storedDescriptor.length,
      mean:
        storedDescriptor.reduce((sum, val) => sum + val, 0) /
        storedDescriptor.length,
      min: Math.min(...storedDescriptor),
      max: Math.max(...storedDescriptor),
      standardDeviation: Math.sqrt(
        storedDescriptor.reduce((sum, val) => {
          const diff =
            val -
            storedDescriptor.reduce((s, v) => s + v, 0) /
              storedDescriptor.length;
          return sum + diff * diff;
        }, 0) / storedDescriptor.length,
      ),
    };

    return {
      studentInfo: {
        id: student._id,
        name: student.fullName,
        email: student.email,
        onboardingMethod: student.onboardingCaptureMethod,
      },

      storedDescriptorStats: descriptorStats,

      recentVerificationAttempts: recentLogs.map((log) => ({
        timestamp: log.verificationTimestamp,
        matchScore: log.matchScore,
        status: log.verificationStatus,
        retryAttempt: log.retryAttempt,
        sessionId: log.attendanceSessionId,
      })),

      recommendations: {
        averageScore:
          recentLogs.reduce((sum, log) => sum + (log.matchScore || 0), 0) /
          recentLogs.length,
        consistencyGood: recentLogs.every((log) => (log.matchScore || 1) < 0.5),
        suggestedThreshold:
          recentLogs.length > 0
            ? Math.max(
                0.3,
                Math.min(
                  0.5,
                  Math.max(...recentLogs.map((log) => log.matchScore || 0)) +
                    0.1,
                ),
              )
            : 0.4,
      },
    };
  },
});

/**
 * Test different thresholds against historical data
 */
export const testThresholds = query({
  args: {
    testThresholds: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const thresholds = args.testThresholds || [0.3, 0.4, 0.5, 0.6, 0.7];

    // Get all verification logs
    const allLogs = await ctx.db.query('faceVerificationLogs').collect();

    // Test each threshold
    const thresholdResults = thresholds.map((threshold) => {
      const wouldPass = allLogs.filter(
        (log) => (log.matchScore || 1) <= threshold,
      );
      const actuallySuccessful = allLogs.filter(
        (log) => log.verificationStatus === 'success',
      );

      // Calculate accuracy metrics
      const truePositives = wouldPass.filter(
        (log) => log.verificationStatus === 'success',
      ).length;
      const falsePositives = wouldPass.filter(
        (log) => log.verificationStatus === 'failed',
      ).length;
      const trueNegatives = allLogs.filter(
        (log) =>
          (log.matchScore || 1) > threshold &&
          log.verificationStatus === 'failed',
      ).length;
      const falseNegatives = allLogs.filter(
        (log) =>
          (log.matchScore || 1) > threshold &&
          log.verificationStatus === 'success',
      ).length;

      const accuracy =
        allLogs.length > 0
          ? (truePositives + trueNegatives) / allLogs.length
          : 0;

      const precision =
        truePositives + falsePositives > 0
          ? truePositives / (truePositives + falsePositives)
          : 0;

      const recall =
        truePositives + falseNegatives > 0
          ? truePositives / (truePositives + falseNegatives)
          : 0;

      return {
        threshold,
        wouldPassCount: wouldPass.length,
        accuracy: accuracy * 100,
        precision: precision * 100,
        recall: recall * 100,
        truePositives,
        falsePositives,
        trueNegatives,
        falseNegatives,
      };
    });

    return {
      totalLogs: allLogs.length,
      currentSuccessRate:
        allLogs.length > 0
          ? (allLogs.filter((log) => log.verificationStatus === 'success')
              .length /
              allLogs.length) *
            100
          : 0,
      thresholdAnalysis: thresholdResults,
      recommendation: thresholdResults.reduce((best, current) =>
        current.accuracy > best.accuracy ? current : best,
      ),
    };
  },
});
