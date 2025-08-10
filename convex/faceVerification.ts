import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Store face descriptor during onboarding
export const storeFaceDescriptor = mutation({
  args: {
    faceDescriptor: v.array(v.number()),
    captureMethod: v.union(v.literal('live_camera'), v.literal('image_upload')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    // Get user profile
    const userProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Update user profile with face descriptor
    await ctx.db.patch(userProfile._id, {
      faceDescriptor: args.faceDescriptor,
      onboardingCaptureMethod: args.captureMethod,
      faceVerificationEnabled: true,
    });

    return { success: true };
  },
});

// Get user's face verification status
export const getFaceVerificationStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!userProfile) {
      return null;
    }

    return {
      hasDescriptor: !!userProfile.faceDescriptor,
      captureMethod: userProfile.onboardingCaptureMethod,
      verificationEnabled: userProfile.faceVerificationEnabled ?? false,
    };
  },
});

// Verify face during attendance check-in
export const verifyFaceForAttendance = mutation({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    faceDescriptor: v.array(v.number()),
    location: v.object({
      lat: v.number(),
      long: v.number(),
    }),
    retryAttempt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    // Get user profile with stored face descriptor
    const userProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!userProfile || !userProfile.faceDescriptor) {
      throw new Error('Face descriptor not found. Please complete onboarding.');
    }

    // Get attendance session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      throw new Error('Attendance session not found');
    }

    if (session.status !== 'active') {
      throw new Error('Attendance session is not active');
    }

    // Calculate Euclidean distance between descriptors
    const storedDescriptor = userProfile.faceDescriptor;
    const currentDescriptor = args.faceDescriptor;

    if (storedDescriptor.length !== currentDescriptor.length) {
      throw new Error('Invalid face descriptor format');
    }

    let sumSquaredDifferences = 0;
    for (let i = 0; i < storedDescriptor.length; i++) {
      const diff = storedDescriptor[i] - currentDescriptor[i];
      sumSquaredDifferences += diff * diff;
    }
    const euclideanDistance = Math.sqrt(sumSquaredDifferences);

    // Face match threshold (≤ 0.4 = match) - Stricter threshold for better security
    const FACE_MATCH_THRESHOLD = 0.4;
    const isMatch = euclideanDistance <= FACE_MATCH_THRESHOLD;

    // Log verification attempt
    await ctx.db.insert('faceVerificationLogs', {
      attendanceSessionId: args.attendanceSessionId,
      studentId: userProfile._id,
      courseId: session.courseId,
      verificationTimestamp: new Date().toISOString(),
      verificationStatus: isMatch ? 'success' : 'failed',
      matchScore: euclideanDistance,
      retryAttempt: args.retryAttempt,
      fallbackReason: !isMatch ? 'Face verification failed' : undefined,
    });

    return {
      success: isMatch,
      matchScore: euclideanDistance,
      threshold: FACE_MATCH_THRESHOLD,
      retryAttempt: args.retryAttempt,
    };
  },
});

// Get face verification logs for a session (lecturer view)
export const getSessionFaceVerificationLogs = query({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    // Verify lecturer owns this session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const userProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!userProfile || session.lecturerId !== userProfile._id) {
      throw new Error('Access denied');
    }

    // Get verification logs for this session
    const logs = await ctx.db
      .query('faceVerificationLogs')
      .withIndex('by_session', (q) =>
        q.eq('attendanceSessionId', args.attendanceSessionId),
      )
      .collect();

    // Get student details for each log
    const logsWithStudentInfo = await Promise.all(
      logs.map(async (log) => {
        const student = await ctx.db.get(log.studentId);
        return {
          ...log,
          studentName: student?.fullName || 'Unknown',
          studentRegistrationNumber: student?.registrationNumber || 'Unknown',
        };
      }),
    );

    return logsWithStudentInfo;
  },
});

// Enable/disable face verification for user
export const toggleFaceVerification = mutation({
  args: {
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    const userProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Can only enable if face descriptor exists
    if (args.enabled && !userProfile.faceDescriptor) {
      throw new Error(
        'Face descriptor required. Please complete face verification setup.',
      );
    }

    await ctx.db.patch(userProfile._id, {
      faceVerificationEnabled: args.enabled,
    });

    return { success: true };
  },
});
