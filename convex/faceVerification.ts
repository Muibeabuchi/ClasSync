import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Store face descriptor during onboarding
export const storeFaceDescriptor = mutation({
  args: {
    faceDescriptor: v.array(v.number()),
    captureMethod: v.union(v.literal('live_camera'), v.literal('image_upload')),
  },
  handler: async (ctx, args) => {
    console.log('storeFaceDescriptor: Function called with args:', {
      descriptorLength: args.faceDescriptor.length,
      captureMethod: args.captureMethod,
    });

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error('storeFaceDescriptor: No authentication identity found');
      throw new Error('Authentication required. Please log in and try again.');
    }

    console.log('storeFaceDescriptor: Starting for user:', identity.email);
    console.log('storeFaceDescriptor: Identity subject:', identity.subject);

    // Get user profile by email
    const userProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!userProfile) {
      console.error(
        'storeFaceDescriptor: User profile not found for:',
        identity.email,
      );

      // List all users for debugging
      const allUsers = await ctx.db.query('userProfiles').collect();
      console.log(
        'storeFaceDescriptor: Total users in system:',
        allUsers.length,
      );
      console.log(
        'storeFaceDescriptor: Available emails:',
        allUsers.map((u) => u.email),
      );

      throw new Error(
        'User profile not found. Please ensure you are properly logged in.',
      );
    }

    console.log('storeFaceDescriptor: Found user profile:', {
      id: userProfile._id,
      email: userProfile.email,
      isOnboarded: userProfile.isOnboarded,
      role: userProfile.role,
    });

    // Validate face descriptor
    if (!args.faceDescriptor || args.faceDescriptor.length === 0) {
      console.error('storeFaceDescriptor: Invalid face descriptor:', {
        isArray: Array.isArray(args.faceDescriptor),
        length: args.faceDescriptor?.length,
      });
      throw new Error('Invalid face descriptor provided');
    }

    console.log(
      'storeFaceDescriptor: Face descriptor length:',
      args.faceDescriptor.length,
    );

    try {
      console.log('storeFaceDescriptor: Attempting to patch user profile...');

      // Update user profile with face descriptor
      await ctx.db.patch(userProfile._id, {
        faceDescriptor: args.faceDescriptor,
        onboardingCaptureMethod: args.captureMethod,
        faceVerificationEnabled: true,
      });

      console.log(
        'storeFaceDescriptor: Successfully updated user profile with face data',
      );

      // Verify the update was successful
      const updatedProfile = await ctx.db.get(userProfile._id);
      console.log(
        'storeFaceDescriptor: Verification - updated profile has face descriptor:',
        {
          hasFaceDescriptor: !!updatedProfile?.faceDescriptor,
          descriptorLength: updatedProfile?.faceDescriptor?.length,
          captureMethod: updatedProfile?.onboardingCaptureMethod,
          verificationEnabled: updatedProfile?.faceVerificationEnabled,
        },
      );

      return {
        success: true,
        message: 'Face verification data saved successfully',
      };
    } catch (error) {
      console.error(
        'storeFaceDescriptor: Failed to update user profile:',
        error,
      );
      throw new Error(
        `Failed to save face verification data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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

    // Enhanced face match threshold for SSDMobileNet (≤ 0.5 = match)
    // SSDMobileNet provides more accurate descriptors, allowing for slightly higher threshold
    const FACE_MATCH_THRESHOLD = 0.5;
    const isMatch = euclideanDistance <= FACE_MATCH_THRESHOLD;

    // Calculate confidence score (0-1, higher is more confident)
    const confidence = Math.max(0, 1 - euclideanDistance / 1.0);
    const faceMatchScore = 1 - euclideanDistance; // Convert distance to score

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
      faceMatchScore: faceMatchScore,
      confidence: confidence,
      distance: euclideanDistance,
      threshold: FACE_MATCH_THRESHOLD,
      retryAttempt: args.retryAttempt,
      verificationStatus: isMatch ? 'verified' : 'failed',
      error: !isMatch
        ? 'Face verification failed - insufficient match confidence'
        : undefined,
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
