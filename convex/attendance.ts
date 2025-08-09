import { internalMutation, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import {
  LecturerCourseQuery,
  courseMutation,
} from './middlewares/lecturerMiddleware';
import * as AttendanceModel from './models/attendanceModel';
import {
  AttendanceSessionDuration,
  DefaultAttendanceRadius,
} from './constants/attendance';
import { internal } from './_generated/api';
import {
  StudentMutationMiddleware,
  StudentQueryMiddleware,
} from './middlewares/studentMiddleware';

import * as AttendanceRecordsModel from './models/attendanceRecordsModel';
import {
  calculateOverrideEligibility,
  getDefaultLecturerSettings,
  validateAndApplyLecturerSettings,
  createOverrideEligibilitySummary,
  type AttendanceSessionForOverride,
  type LecturerOverrideSettings,
} from './utils/overrideEligibility';
import {
  validateAndCleanJustification,
  validateAndCleanLecturerSettings,
  OverrideErrorType,
  getOverrideErrorMessage,
} from './schemas/overrideValidation';
import { query } from './_generated/server';
import { AuthenticatedUserQuery } from './middlewares/authenticatedMiddleware';

export const startAttendanceSession = courseMutation({
  args: {
    courseId: v.id('courses'),
    gpsCoordinates: v.object({
      lat: v.number(),
      long: v.number(),
    }),
    radiusMeters: v.optional(v.number()),
    requireCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;
    const course = ctx.course;

    // Check if there are any approved students in the course
    const approvedStudents = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId', (q) => q.eq('courseId', args.courseId))
      .collect();

    if (approvedStudents.length === 0) {
      throw new ConvexError(
        'Cannot create attendance session: No students are enrolled in this course. Please add students to the course before taking attendance.',
      );
    }

    // Check if there's already an active attendance session for this course
    const existingActiveSession = await ctx.db
      .query('attendanceSessions')
      .withIndex('by_courseId_by_lecturerId', (q) =>
        q.eq('courseId', args.courseId).eq('lecturerId', lecturerId),
      )
      .filter((q) => q.eq(q.field('status'), 'active'))
      .first();

    if (existingActiveSession) {
      throw new ConvexError(
        'There is already an active attendance session for this course',
      );
    }

    const startTime = Date.now();
    const endedAt = startTime + AttendanceSessionDuration;

    const sessionId = await ctx.db.insert('attendanceSessions', {
      courseId: args.courseId,
      lecturerId,
      attendanceCode: args.requireCode,
      location: args.gpsCoordinates,
      status: 'active', // Start immediately as active (no prep period)
      endedAt,
      radius: args.radiusMeters,
    });

    // Only schedule the end function since session starts immediately
    const endScheduledFunctionId = await ctx.scheduler.runAt(
      endedAt,
      internal.attendance.endAttendanceSession,
      {
        attendanceSessionId: sessionId,
      },
    );

    // Update the session with the scheduled function ID
    await ctx.db.patch(sessionId, {
      endScheduledFunctionId,
    });

    return {
      sessionId,
      courseId: course._id,
      attendanceCode: args.requireCode,
      status: 'active',
    };
  },
});

export const endAttendanceSession = internalMutation({
  args: { attendanceSessionId: v.id('attendanceSessions') },
  async handler(ctx, args) {
    // Get the current session to check if it has been cancelled
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      // Session doesn't exist, nothing to do
      return;
    }

    // Only update to complete if the session is not already cancelled
    if (session.status !== 'cancelled') {
      await ctx.db.patch(args.attendanceSessionId, {
        status: 'complete',
      });
    }
  },
});

export const activateAttendanceSession = internalMutation({
  args: { attendanceSessionId: v.id('attendanceSessions') },
  async handler(ctx, args) {
    // Get the current session to check if it has been cancelled
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      // Session doesn't exist, nothing to do
      return;
    }

    // Sessions are created as active, so no status update needed
    // This function can be used for other session initialization if needed
  },
});

/**
 * Get active attendance sessions for a student
 * This allows students to see all active sessions for courses they're enrolled in
 */
export const getActiveSessionsForStudent = StudentQueryMiddleware({
  args: {},
  handler: async (ctx) => {
    // Verify user authentication

    const studentId = ctx.user._id;

    // Get all courses the student is enrolled in
    const enrolledCourses = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_studentId', (q) => q.eq('studentId', studentId))
      .collect();

    if (enrolledCourses.length === 0) {
      return [];
    }

    // Get all active sessions for these courses
    const activeSessions = await Promise.all(
      enrolledCourses.map(async (enrollment) => {
        // Get active sessions for this course
        const sessions = await ctx.db
          .query('attendanceSessions')
          .withIndex('by_courseId', (q) =>
            q.eq('courseId', enrollment.courseId),
          )
          .filter((q) => q.eq(q.field('status'), 'active'))
          .collect();

        // Get course information
        const course = await ctx.db.get(enrollment.courseId);

        // Check if student has already checked in to each session
        const sessionsWithCheckInStatus = await Promise.all(
          sessions.map(async (session) => {
            const existingRecord = await ctx.db
              .query('attendanceRecords')
              .withIndex('by_attendanceSessionId_by_StudentId', (q) =>
                q
                  .eq('attendanceSessionId', session._id)
                  .eq('studentId', studentId),
              )
              .first();

            // Calculate computed state based on current time
            const currentTime = Date.now();
            let computedState: 'active' | 'complete' | 'cancelled' =
              session.status as any;

            if (
              session.status !== 'complete' &&
              session.status !== 'cancelled' &&
              session.endedAt
            ) {
              if (currentTime >= session.endedAt) {
                computedState = 'complete';
              } else {
                // Since there's no prep period, sessions are immediately active
                computedState = 'active';
              }
            }

            return {
              ...session,
              courseName: course?.courseName || 'Unknown Course',
              courseCode: course?.courseCode || 'N/A',
              hasCheckedIn: !!existingRecord,
              computedState,
              timeRemaining: session.endedAt
                ? Math.max(0, session.endedAt - currentTime)
                : 0,
            };
          }),
        );

        return sessionsWithCheckInStatus;
      }),
    );

    // Flatten the array and filter out completed sessions
    const flatSessions = activeSessions
      .flat()
      .filter((session) => session.computedState === 'active');

    // Sort by creation time (newest first)
    return flatSessions.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Get a specific attendance session for a student
 * This allows students to get detailed information about a session they want to check into
 */
export const getAttendanceSessionForStudent = StudentQueryMiddleware({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
  },
  handler: async (ctx, args) => {
    // Verify user authentication

    const studentId = ctx.user._id;

    // Get the attendance session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      throw new ConvexError('Attendance session not found');
    }

    // Check if student is enrolled in the course
    const enrollment = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId_by_studentId', (q) =>
        q.eq('courseId', session.courseId).eq('studentId', studentId),
      )
      .first();

    if (!enrollment) {
      throw new ConvexError('You are not enrolled in this course');
    }

    // Get course information
    const course = await ctx.db.get(session.courseId);
    if (!course) {
      throw new ConvexError('Course not found');
    }

    // Check if student has already checked in
    const existingRecord = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendanceSessionId_by_StudentId', (q) =>
        q
          .eq('attendanceSessionId', args.attendanceSessionId)
          .eq('studentId', studentId),
      )
      .first();

    // Calculate computed state based on current time
    const currentTime = Date.now();
    let computedState: 'active' | 'complete' | 'cancelled' = session.status;

    if (
      session.status !== 'complete' &&
      session.status !== 'cancelled' &&
      session.endedAt
    ) {
      if (currentTime >= session.endedAt) {
        computedState = 'complete';
      } else {
        // Since there's no prep period, sessions are immediately active
        computedState = 'active';
      }
    }

    return {
      ...session,
      courseName: course.courseName,
      courseCode: course.courseCode,
      hasCheckedIn: !!existingRecord,
      computedState,
      timeRemaining: session.endedAt
        ? Math.max(0, session.endedAt - currentTime)
        : 0,
      prepTimeRemaining: 0, // No prep period anymore
      canCheckIn: computedState === 'active' && !existingRecord,
      checkInRecord: existingRecord,
    };
  },
});

export const checkInToAttendance = StudentMutationMiddleware({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    attendanceCode: v.optional(v.string()),
    gpsCoordinates: v.object({
      lat: v.number(),
      long: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const studentId = ctx.user._id;
    // Ensure the attendance exists
    const attendanceSession = await ctx.db
      .query('attendanceSessions')
      .withIndex('by_id', (q) => q.eq('_id', args.attendanceSessionId))
      .unique();

    if (!attendanceSession) {
      throw new ConvexError('Attendance does not Exist');
    }

    // Check computed state based on current time (not just database status)
    const currentTime = Date.now();
    let computedState: 'active' | 'complete' | 'cancelled' =
      attendanceSession.status as any;

    if (
      attendanceSession.status !== 'complete' &&
      attendanceSession.status !== 'cancelled' &&
      attendanceSession.endedAt
    ) {
      if (currentTime >= attendanceSession.endedAt) {
        computedState = 'complete';
      } else {
        // Since there's no prep period, sessions are immediately active
        computedState = 'active';
      }
    }

    // Ensure the attendanceSession is active (computed state)
    if (computedState !== 'active') {
      if (computedState === 'complete') {
        throw new ConvexError('Attendance Session has ended.');
      } else if (computedState === 'cancelled') {
        throw new ConvexError('Attendance Session has been cancelled.');
      } else {
        throw new ConvexError('Attendance Session is not Active');
      }
    }

    // Check if student is enrolled in the course
    const studentCourseAttendanceId = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId_by_studentId', (q) =>
        q.eq('courseId', attendanceSession.courseId).eq('studentId', studentId),
      )
      .unique();

    if (!studentCourseAttendanceId)
      throw new ConvexError(' Student is not Enrolled in the course');

    // Check if already the student has already Checked in
    const existingRecord = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendanceSessionId_by_StudentId', (q) =>
        q
          .eq('attendanceSessionId', attendanceSession._id)
          .eq('studentId', studentId),
      )
      .unique();

    if (existingRecord) {
      throw new Error('Student has already checked in for this session');
    }

    // Check GPS proximity
    const distance = AttendanceModel.calculateDistance({
      lat1: attendanceSession.location.lat,
      lat2: args.gpsCoordinates.lat,
      lon1: attendanceSession.location.long,
      lon2: args.gpsCoordinates.long,
    });

    const allowedRadius = attendanceSession.radius || DefaultAttendanceRadius;
    if (distance > allowedRadius) {
      throw new ConvexError(
        `You are not within the required location radius of ${allowedRadius}m. You are ${Math.round(distance)}m away.`,
      );
    }

    if (attendanceSession.attendanceCode) {
      if (args.attendanceCode !== attendanceSession.attendanceCode) {
        throw new ConvexError('Attendance code is Needed');
      }
    }

    const checkedInAt = new Date().toISOString();

    // Create attendance record
    const recordId = await ctx.db.insert('attendanceRecords', {
      studentId,
      checkedInAt,
      attendanceSessionId: attendanceSession._id,
      courseId: attendanceSession.courseId,
      location: args.gpsCoordinates,
    });

    return recordId;
  },
});

// export const getActiveSession = courseMutation({
//   args: { courseId: v.id('courses') },
//   handler: async (ctx, args) => {
//     const lecturerId = ctx.user._id;
//     const now = Date.now();

//     const session = await ctx.db
//       .query('attendanceSessions')
//       .withIndex('by_courseId_by_lecturerId', (q) =>
//         q.eq('courseId', args.courseId).eq('lecturerId', lecturerId),
//       )
//       .filter((q) => q.eq(q.field('status'), 'active'))
//       .first();

//     return session;
//   },
// });

export const getAttendanceSessionById = LecturerCourseQuery({
  args: {
    courseId: v.id('courses'),
    attendanceSessionId: v.id('attendanceSessions'),
  },
  async handler(ctx, args) {
    const lecturerId = ctx.user._id;
    const course = ctx.course;
    const attendanceSession = await ctx.db.get(args.attendanceSessionId);
    if (!attendanceSession)
      throw new ConvexError('Attendance Session does not exist');

    // check if the attendanceSession belongs to the lecturer
    if (attendanceSession.lecturerId !== lecturerId)
      throw new ConvexError(
        'Attendance Session does not belong to the lecturer ',
      );

    // Verify the session belongs to the specified course
    if (attendanceSession.courseId !== args.courseId)
      throw new ConvexError(
        'Attendance Session does not belong to the specified course',
      );

    return {
      ...attendanceSession,
      courseName: course.courseName,
      courseCode: course.courseCode,
    };
  },
});

export const getCourseAttendanceSessions = LecturerCourseQuery({
  args: { courseId: v.id('courses') },
  async handler(ctx, args) {
    const lecturerId = ctx.user._id;

    // Get all attendance sessions for the course (including cancelled ones)
    const courseAttendanceSessions = await ctx.db
      .query('attendanceSessions')
      .withIndex('by_courseId_by_lecturerId', (q) =>
        q.eq('courseId', args.courseId).eq('lecturerId', lecturerId),
      )
      .order('desc') // Order by newest first
      .collect();

    // Get the number of students that took attendance for each session
    return await Promise.all(
      courseAttendanceSessions.map(async (session) => {
        const numberOfStudents = (
          await ctx.db
            .query('attendanceRecords')
            .withIndex('by_attendanceSessionId', (q) =>
              q.eq('attendanceSessionId', session._id),
            )
            .collect()
        ).length;

        return {
          ...session,
          numberOfStudents,
        };
      }),
    );
  },
});

export const getAttendanceSessionRecords = LecturerCourseQuery({
  args: {
    courseId: v.id('courses'),
    attendanceSessionId: v.id('attendanceSessions'),
  },
  handler: async (ctx, args) => {
    // Verify the session belongs to the specified course
    const attendanceSession = await ctx.db.get(args.attendanceSessionId);
    if (!attendanceSession) {
      throw new ConvexError('Attendance Session does not exist');
    }

    if (attendanceSession.courseId !== args.courseId) {
      throw new ConvexError(
        'Attendance Session does not belong to the specified course',
      );
    }

    const records = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendanceSessionId', (q) =>
        q.eq('attendanceSessionId', args.attendanceSessionId),
      )
      .collect();

    //   Populate the record with students Info
    const PopulatedAttendanceRecords =
      await AttendanceRecordsModel.populateAttendanceRecordWithStudent({
        ctx,
        attendanceRecords: records,
      });

    return PopulatedAttendanceRecords;
  },
});

/**
 * Enhanced attendance session query with override metadata
 * Requirements: 1.1, 5.4, 6.3 - Override eligibility calculation and time window information
 */
export const getAttendanceSessionWithOverrideInfo = AuthenticatedUserQuery({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    currentTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the attendance session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      return null;
    }

    // Get course information
    const course = await ctx.db.get(session.courseId);
    if (!course) {
      throw new ConvexError('Course not found for this session');
    }

    // Verify user has access to this session
    const userId = ctx.user._id;

    // Check if user is the lecturer for this session
    const isLecturer = session.lecturerId === userId;

    // Check if user is a student enrolled in the course
    let isEnrolledStudent = false;
    if (!isLecturer) {
      const enrollment = await ctx.db
        .query('courseAttendanceList')
        .withIndex('by_courseId_by_studentId', (q) =>
          q.eq('courseId', session.courseId).eq('studentId', userId),
        )
        .first();
      isEnrolledStudent = !!enrollment;
    }

    // Verify access permissions
    if (!isLecturer && !isEnrolledStudent) {
      throw new ConvexError(
        'Access denied: You are not authorized to view this session',
      );
    }

    // Get lecturer settings for override time window
    let lecturerSettings: LecturerOverrideSettings =
      getDefaultLecturerSettings();

    if (isLecturer) {
      const storedSettings = await ctx.db
        .query('lecturerSettings')
        .withIndex('by_lecturer', (q) => q.eq('lecturerId', session.lecturerId))
        .first();

      if (storedSettings) {
        lecturerSettings = validateAndApplyLecturerSettings({
          overrideWindowHours: storedSettings.overrideWindowHours,
          notifyOnOverride: storedSettings.notifyOnOverride,
        });
      }
    }

    // Calculate override eligibility
    const sessionForOverride: AttendanceSessionForOverride = {
      _id: session._id,
      courseId: session.courseId,
      lecturerId: session.lecturerId,
      status: session.status,
      endedAt: session.endedAt,
      _creationTime: session._creationTime,
    };

    const currentTime = args.currentTime || Date.now();
    const overrideEligibility = calculateOverrideEligibility(
      sessionForOverride,
      lecturerSettings,
      currentTime,
    );

    // Create user-friendly eligibility summary
    const eligibilitySummary =
      createOverrideEligibilitySummary(overrideEligibility);

    // Get total enrolled students count for statistics
    const totalEnrolledStudents = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId', (q) => q.eq('courseId', session.courseId))
      .collect();

    // Get attendance records count
    const attendanceRecords = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendanceSessionId', (q) =>
        q.eq('attendanceSessionId', session._id),
      )
      .collect();

    // Count manual overrides
    const manualOverrides = attendanceRecords.filter(
      (record) => record.isManualOverride === true,
    ).length;

    // Calculate session state based on current time
    let computedState: 'active' | 'complete' | 'cancelled' = session.status;
    if (
      session.status !== 'complete' &&
      session.status !== 'cancelled' &&
      session.endedAt
    ) {
      if (currentTime >= session.endedAt) {
        computedState = 'complete';
      } else {
        // Since there's no prep period, sessions are immediately active
        computedState = 'active';
      }
    }

    // Return enhanced session data with override metadata
    return {
      // Basic session information
      ...session,
      courseName: course.courseName,
      courseCode: course.courseCode,
      computedState,

      // Override-related metadata
      overrideEligibility: {
        canOverride: overrideEligibility.canOverride,
        reason: overrideEligibility.reason,
        timeRemaining: overrideEligibility.timeRemaining,
        windowExpiresAt: overrideEligibility.windowExpiresAt,
        sessionStatus: overrideEligibility.sessionStatus,
        errorType: overrideEligibility.errorType,
      },

      // User-friendly eligibility information
      eligibilitySummary,

      // Lecturer settings (only for lecturers)
      lecturerSettings: isLecturer ? lecturerSettings : undefined,

      // Statistics for UI display
      statistics: {
        totalEnrolledStudents: totalEnrolledStudents.length,
        totalAttendanceRecords: attendanceRecords.length,
        automaticCheckIns: attendanceRecords.length - manualOverrides,
        manualOverrides,
        absentStudents: totalEnrolledStudents.length - attendanceRecords.length,
      },

      // Access control information
      userAccess: {
        isLecturer,
        isEnrolledStudent,
        canPerformOverrides: isLecturer && overrideEligibility.canOverride,
      },

      // Real-time reactivity metadata
      lastUpdated: currentTime,
      serverTime: Date.now(),
    };
  },
});

/**
 * Attendance records query with override indicators
 * Requirements: 2.3, 6.1, 6.2 - Visual indicators for manually overridden records
 */
export const getAttendanceRecordsWithOverrides = query({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    includeAbsentStudents: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get the attendance session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      throw new ConvexError('Attendance session not found');
    }

    // Verify user has access to this session
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Authentication required');
    }

    // Check if user is the lecturer for this session
    const isLecturer = session.lecturerId === identity.subject;

    // Check if user is a student enrolled in the course
    let isEnrolledStudent = false;
    if (!isLecturer) {
      const enrollment = await ctx.db
        .query('courseAttendanceList')
        .withIndex('by_courseId_by_studentId', (q) =>
          q
            .eq('courseId', session.courseId)
            .eq('studentId', identity.subject as any),
        )
        .first();
      isEnrolledStudent = !!enrollment;
    }

    // Verify access permissions
    if (!isLecturer && !isEnrolledStudent) {
      throw new ConvexError(
        'Access denied: You are not authorized to view this session',
      );
    }

    // Get all attendance records for this session
    const attendanceRecords = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendanceSessionId', (q) =>
        q.eq('attendanceSessionId', args.attendanceSessionId),
      )
      .collect();

    // Get all enrolled students for this course
    const enrolledStudents = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId', (q) => q.eq('courseId', session.courseId))
      .collect();

    // Get student profiles for enrolled students
    const studentProfiles = await Promise.all(
      enrolledStudents.map(async (enrollment) => {
        const student = await ctx.db.get(enrollment.studentId);
        return student;
      }),
    );

    // Create a map of student attendance records
    const attendanceMap = new Map(
      attendanceRecords.map((record) => [record.studentId, record]),
    );

    // Build comprehensive attendance records with override indicators
    const recordsWithOverrides = await Promise.all(
      studentProfiles
        .filter((student) => student !== null)
        .map(async (student) => {
          const attendanceRecord = attendanceMap.get(student!._id);

          // Get override audit log if this is a manual override
          let overrideAuditLog = null;
          if (attendanceRecord?.isManualOverride) {
            overrideAuditLog = await ctx.db
              .query('attendanceOverrideLogs')
              .withIndex('by_session_student', (q) =>
                q
                  .eq('attendanceSessionId', args.attendanceSessionId)
                  .eq('studentId', student!._id),
              )
              .first();
          }

          // Get lecturer info for override (if applicable)
          let overrideLecturerInfo = null;
          if (attendanceRecord?.overriddenBy) {
            const overrideLecturer = await ctx.db.get(
              attendanceRecord.overriddenBy,
            );
            if (overrideLecturer) {
              overrideLecturerInfo = {
                _id: overrideLecturer._id,
                fullName: overrideLecturer.fullName,
                email: overrideLecturer.email,
              };
            }
          }

          // Determine attendance status
          let status: 'present' | 'absent' | 'override' = 'absent';
          if (attendanceRecord) {
            status = attendanceRecord.isManualOverride ? 'override' : 'present';
          }

          return {
            // Student information
            student: {
              _id: student!._id,
              fullName: student!.fullName,
              email: student!.email,
              registrationNumber: student!.registrationNumber,
              gender: student!.gender,
            },

            // Attendance record information
            attendanceRecord: attendanceRecord || null,

            // Status and indicators
            status,
            isPresent: !!attendanceRecord,
            isManualOverride: attendanceRecord?.isManualOverride || false,

            // Override-specific information
            overrideInfo: attendanceRecord?.isManualOverride
              ? {
                  overrideTimestamp: attendanceRecord.overrideTimestamp,
                  overrideReason: attendanceRecord.overrideReason,
                  overriddenBy: overrideLecturerInfo,
                  originalStatus: attendanceRecord.originalStatus || 'absent',
                  auditLog: overrideAuditLog,
                }
              : null,

            // Check-in information (for regular attendance)
            checkInInfo:
              attendanceRecord && !attendanceRecord.isManualOverride
                ? {
                    checkedInAt: attendanceRecord.checkedInAt,
                    location: attendanceRecord.location,
                    distance: attendanceRecord.distance,
                  }
                : null,

            // Visual indicators for UI
            visualIndicators: {
              showOverrideIcon: attendanceRecord?.isManualOverride || false,
              showRegularCheckInIcon:
                attendanceRecord && !attendanceRecord.isManualOverride,
              showAbsentIndicator: !attendanceRecord,
              statusColor:
                status === 'override'
                  ? 'amber'
                  : status === 'present'
                    ? 'green'
                    : 'red',
              statusLabel:
                status === 'override'
                  ? 'Manual Override'
                  : status === 'present'
                    ? 'Present'
                    : 'Absent',
            },
          };
        }),
    );

    // Sort records: Present (regular) first, then overrides, then absent
    const sortedRecords = recordsWithOverrides.sort((a, b) => {
      // Priority: present (regular) = 0, override = 1, absent = 2
      const getPriority = (record: typeof a) => {
        if (record.status === 'present') return 0;
        if (record.status === 'override') return 1;
        return 2;
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Within same status, sort by student name
      return a.student.fullName.localeCompare(b.student.fullName);
    });

    // Filter out absent students if not requested
    const finalRecords = args.includeAbsentStudents
      ? sortedRecords
      : sortedRecords.filter((record) => record.isPresent);

    // Calculate summary statistics
    const statistics = {
      totalEnrolled: enrolledStudents.length,
      totalPresent: recordsWithOverrides.filter((r) => r.isPresent).length,
      totalAbsent: recordsWithOverrides.filter((r) => !r.isPresent).length,
      regularCheckIns: recordsWithOverrides.filter(
        (r) => r.status === 'present',
      ).length,
      manualOverrides: recordsWithOverrides.filter(
        (r) => r.status === 'override',
      ).length,
      attendancePercentage: Math.round(
        (recordsWithOverrides.filter((r) => r.isPresent).length /
          enrolledStudents.length) *
          100,
      ),
    };

    return {
      records: finalRecords,
      statistics,
      session: {
        _id: session._id,
        courseId: session.courseId,
        status: session.status,
        endedAt: session.endedAt,
      },
      userAccess: {
        isLecturer,
        isEnrolledStudent,
        canViewOverrideDetails: isLecturer,
      },
      lastUpdated: Date.now(),
    };
  },
});

/**
 * Get attendance export data for a single session
 * This query provides session-specific attendance data for export functionality
 */
export const getSessionExportData = query({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    courseId: v.id('courses'),
  },
  handler: async (ctx, args) => {
    // Verify user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Authentication required');
    }

    // Get attendance session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      throw new ConvexError('Attendance session not found');
    }

    // Verify user is the lecturer for this session
    if (session.lecturerId !== identity.subject) {
      throw new ConvexError(
        'Access denied: You are not the lecturer for this session',
      );
    }

    // Verify session belongs to the specified course
    if (session.courseId !== args.courseId) {
      throw new ConvexError('Session does not belong to the specified course');
    }

    // Get course information
    const course = await ctx.db.get(session.courseId);
    if (!course) {
      throw new ConvexError('Course not found');
    }

    // Get lecturer information
    const lecturer = await ctx.db.get(session.lecturerId);
    if (!lecturer) {
      throw new ConvexError('Lecturer not found');
    }

    // Get attendance records for this session
    const attendanceRecords = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendanceSessionId', (q) =>
        q.eq('attendanceSessionId', args.attendanceSessionId),
      )
      .collect();

    // Get student details for each attendance record
    const studentsPresent = await Promise.all(
      attendanceRecords.map(async (record) => {
        const student = await ctx.db.get(record.studentId);
        return {
          name: student?.fullName || 'Unknown Student',
          registrationNumber: student?.registrationNumber || 'N/A',
          checkInTime: record.checkedInAt,
          isManualOverride: record.isManualOverride || false,
        };
      }),
    );

    // Get all enrolled students for statistics
    const enrolledStudents = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId', (q) => q.eq('courseId', session.courseId))
      .collect();

    // Count manual overrides
    const manualOverrides = attendanceRecords.filter(
      (record) => record.isManualOverride === true,
    ).length;

    // Build session data
    const sessionData = {
      sessionId: session._id,
      date: new Date(session._creationTime).toLocaleDateString(),
      time: new Date(session._creationTime).toLocaleTimeString(),
      status: session.status,
      attendanceCodeUsed: !!session.attendanceCode,
      totalPresent: attendanceRecords.length,
      totalEnrolled: enrolledStudents.length,
      manualOverrides,
      studentsPresent: studentsPresent.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    };

    return {
      courseInfo: {
        courseName: course.courseName,
        courseCode: course.courseCode,
        lecturerName: lecturer.fullName,
        lecturerTitle: lecturer.title || '',
        status: course.status,
      },
      session: sessionData,
      summary: {
        totalEnrolled: enrolledStudents.length,
        totalPresent: attendanceRecords.length,
        totalAbsent: enrolledStudents.length - attendanceRecords.length,
        manualOverrides,
        attendancePercentage:
          enrolledStudents.length > 0
            ? Math.round(
                (attendanceRecords.length / enrolledStudents.length) * 100,
              )
            : 0,
      },
      exportTimestamp: new Date().toISOString(),
    };
  },
});

/**
 * Get attendance export data for archived courses
 * This query provides comprehensive attendance data for export functionality
 */
export const getAttendanceExportData = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    // Verify user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Authentication required');
    }

    // Get course information
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new ConvexError('Course not found');
    }

    // Verify user is the lecturer for this course
    if (course.lecturerId !== identity.subject) {
      throw new ConvexError(
        'Access denied: You are not the lecturer for this course',
      );
    }

    // Only allow export for archived courses
    if (course.status !== 'archived') {
      throw new ConvexError('Export is only available for archived courses');
    }

    // Get lecturer information
    const lecturer = await ctx.db.get(course.lecturerId);
    if (!lecturer) {
      throw new ConvexError('Lecturer not found');
    }

    // Get all attendance sessions for this course
    const attendanceSessions = await ctx.db
      .query('attendanceSessions')
      .withIndex('by_courseId', (q) => q.eq('courseId', args.courseId))
      .order('desc')
      .collect();

    // Get detailed session data with attendance records
    const sessionsWithAttendance = await Promise.all(
      attendanceSessions.map(async (session) => {
        // Get attendance records for this session
        const attendanceRecords = await ctx.db
          .query('attendanceRecords')
          .withIndex('by_attendanceSessionId', (q) =>
            q.eq('attendanceSessionId', session._id),
          )
          .collect();

        // Get student details for each attendance record
        const studentsPresent = await Promise.all(
          attendanceRecords.map(async (record) => {
            const student = await ctx.db.get(record.studentId);
            return {
              name: student?.fullName || 'Unknown Student',
              registrationNumber: student?.registrationNumber || 'N/A',
              checkInTime: record.checkedInAt,
              isManualOverride: record.isManualOverride || false,
            };
          }),
        );

        // Count manual overrides
        const manualOverrides = attendanceRecords.filter(
          (record) => record.isManualOverride === true,
        ).length;

        return {
          sessionId: session._id,
          date: new Date(session._creationTime).toLocaleDateString(),
          time: new Date(session._creationTime).toLocaleTimeString(),
          status: session.status,
          attendanceCodeUsed: !!session.attendanceCode,
          totalPresent: attendanceRecords.length,
          manualOverrides,
          studentsPresent: studentsPresent.sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        };
      }),
    );

    // Calculate summary statistics
    const totalSessions = attendanceSessions.length;
    const totalAttendanceRecords = sessionsWithAttendance.reduce(
      (sum, session) => sum + session.totalPresent,
      0,
    );
    const totalManualOverrides = sessionsWithAttendance.reduce(
      (sum, session) => sum + session.manualOverrides,
      0,
    );

    return {
      courseInfo: {
        courseName: course.courseName,
        courseCode: course.courseCode,
        lecturerName: lecturer.fullName,
        lecturerTitle: lecturer.title || '',
        archiveTimestamp: new Date().toISOString(), // Current timestamp as archive time
        status: course.status,
      },
      summary: {
        totalSessions,
        totalAttendanceRecords,
        totalManualOverrides,
        averageAttendancePerSession:
          totalSessions > 0
            ? Math.round(totalAttendanceRecords / totalSessions)
            : 0,
      },
      sessions: sessionsWithAttendance,
      exportTimestamp: new Date().toISOString(),
    };
  },
});

/**
 * Comprehensive attendance statistics query for session overview
 * Requirements: 2.1, 2.2, 2.4 - Statistics breakdown and progress indicators
 */
export const getAttendanceStatistics = query({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    includeHistoricalData: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get the attendance session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      throw new ConvexError('Attendance session not found');
    }

    // Verify user has access to this session
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Authentication required');
    }

    // Check if user is the lecturer for this session
    const isLecturer = session.lecturerId === identity.subject;

    // Check if user is a student enrolled in the course
    let isEnrolledStudent = false;
    if (!isLecturer) {
      const enrollment = await ctx.db
        .query('courseAttendanceList')
        .withIndex('by_courseId_by_studentId', (q) =>
          q
            .eq('courseId', session.courseId)
            .eq('studentId', identity.subject as any),
        )
        .first();
      isEnrolledStudent = !!enrollment;
    }

    // Verify access permissions
    if (!isLecturer && !isEnrolledStudent) {
      throw new ConvexError(
        'Access denied: You are not authorized to view this session',
      );
    }

    // Get course information
    const course = await ctx.db.get(session.courseId);
    if (!course) {
      throw new ConvexError('Course not found for this session');
    }

    // Get all enrolled students for this course
    const enrolledStudents = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId', (q) => q.eq('courseId', session.courseId))
      .collect();

    // Get all attendance records for this session
    const attendanceRecords = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendanceSessionId', (q) =>
        q.eq('attendanceSessionId', args.attendanceSessionId),
      )
      .collect();

    // Get override audit logs for this session
    const overrideLogs = await ctx.db
      .query('attendanceOverrideLogs')
      .withIndex('by_session', (q) =>
        q.eq('attendanceSessionId', args.attendanceSessionId),
      )
      .collect();

    // Calculate basic statistics
    const totalEnrolledStudents = enrolledStudents.length;
    const totalAttendanceRecords = attendanceRecords.length;
    const manualOverrides = attendanceRecords.filter(
      (record) => record.isManualOverride === true,
    ).length;
    const automaticCheckIns = totalAttendanceRecords - manualOverrides;
    const absentStudents = totalEnrolledStudents - totalAttendanceRecords;

    // Calculate percentages
    const overallAttendancePercentage =
      totalEnrolledStudents > 0
        ? Math.round((totalAttendanceRecords / totalEnrolledStudents) * 100)
        : 0;

    const automaticCheckInPercentage =
      totalEnrolledStudents > 0
        ? Math.round((automaticCheckIns / totalEnrolledStudents) * 100)
        : 0;

    const manualOverridePercentage =
      totalEnrolledStudents > 0
        ? Math.round((manualOverrides / totalEnrolledStudents) * 100)
        : 0;

    // Get lecturer settings for override window information
    let lecturerSettings = getDefaultLecturerSettings();
    if (isLecturer) {
      const storedSettings = await ctx.db
        .query('lecturerSettings')
        .withIndex('by_lecturer', (q) => q.eq('lecturerId', session.lecturerId))
        .first();

      if (storedSettings) {
        lecturerSettings = validateAndApplyLecturerSettings({
          overrideWindowHours: storedSettings.overrideWindowHours,
          notifyOnOverride: storedSettings.notifyOnOverride,
        });
      }
    }

    // Calculate override eligibility for current session
    const sessionForOverride: AttendanceSessionForOverride = {
      _id: session._id,
      courseId: session.courseId,
      lecturerId: session.lecturerId,
      status: session.status,
      endedAt: session.endedAt,
      _creationTime: session._creationTime,
    };

    const overrideEligibility = calculateOverrideEligibility(
      sessionForOverride,
      lecturerSettings,
    );

    // Get historical data if requested (for lecturers only)
    let historicalData = null;
    if (args.includeHistoricalData && isLecturer) {
      const allCourseSessions = await ctx.db
        .query('attendanceSessions')
        .withIndex('by_courseId', (q) => q.eq('courseId', session.courseId))
        .collect();

      const historicalStats = await Promise.all(
        allCourseSessions.map(async (historicalSession) => {
          const historicalRecords = await ctx.db
            .query('attendanceRecords')
            .withIndex('by_attendanceSessionId', (q) =>
              q.eq('attendanceSessionId', historicalSession._id),
            )
            .collect();

          const historicalOverrides = historicalRecords.filter(
            (record) => record.isManualOverride === true,
          ).length;

          return {
            sessionId: historicalSession._id,
            sessionDate: new Date(
              historicalSession._creationTime,
            ).toISOString(),
            status: historicalSession.status,
            totalAttendance: historicalRecords.length,
            automaticCheckIns: historicalRecords.length - historicalOverrides,
            manualOverrides: historicalOverrides,
            attendancePercentage:
              totalEnrolledStudents > 0
                ? Math.round(
                    (historicalRecords.length / totalEnrolledStudents) * 100,
                  )
                : 0,
          };
        }),
      );

      // Calculate course-wide averages
      const totalSessions = historicalStats.length;
      const averageAttendance =
        totalSessions > 0
          ? Math.round(
              historicalStats.reduce(
                (sum, stat) => sum + stat.attendancePercentage,
                0,
              ) / totalSessions,
            )
          : 0;

      const totalOverridesAcrossSessions = historicalStats.reduce(
        (sum, stat) => sum + stat.manualOverrides,
        0,
      );

      historicalData = {
        totalSessions,
        averageAttendancePercentage: averageAttendance,
        totalOverridesAcrossSessions,
        sessionHistory: historicalStats.slice(-10), // Last 10 sessions
      };
    }

    // Build comprehensive statistics object
    const statistics = {
      // Basic counts
      totalEnrolledStudents,
      totalAttendanceRecords,
      automaticCheckIns,
      manualOverrides,
      absentStudents,

      // Percentages
      overallAttendancePercentage,
      automaticCheckInPercentage,
      manualOverridePercentage,
      absentPercentage: 100 - overallAttendancePercentage,

      // Progress indicators data
      progressIndicators: {
        overall: {
          value: overallAttendancePercentage,
          max: 100,
          label: 'Overall Attendance',
          color:
            overallAttendancePercentage >= 80
              ? 'green'
              : overallAttendancePercentage >= 60
                ? 'yellow'
                : 'red',
        },
        automatic: {
          value: automaticCheckInPercentage,
          max: 100,
          label: 'Automatic Check-ins',
          color: 'blue',
        },
        overrides: {
          value: manualOverridePercentage,
          max: 100,
          label: 'Manual Overrides',
          color: 'amber',
        },
      },

      // Breakdown for visual display
      attendanceBreakdown: [
        {
          type: 'automatic',
          count: automaticCheckIns,
          percentage: automaticCheckInPercentage,
          label: 'Automatic Check-ins',
          color: 'blue',
        },
        {
          type: 'override',
          count: manualOverrides,
          percentage: manualOverridePercentage,
          label: 'Manual Overrides',
          color: 'amber',
        },
        {
          type: 'absent',
          count: absentStudents,
          percentage: 100 - overallAttendancePercentage,
          label: 'Absent',
          color: 'red',
        },
      ],

      // Override-specific statistics
      overrideStatistics: {
        totalOverrides: manualOverrides,
        overridePercentage: manualOverridePercentage,
        canPerformOverrides: isLecturer && overrideEligibility.canOverride,
        overrideWindowRemaining: overrideEligibility.timeRemaining,
        overrideWindowExpiry: new Date(
          overrideEligibility.windowExpiresAt,
        ).toISOString(),
        overrideLogs: overrideLogs.map((log) => ({
          studentId: log.studentId,
          overrideTimestamp: log.overrideTimestamp,
          justificationNote: log.justificationNote,
          lecturerId: log.lecturerId,
        })),
      },

      // Session metadata
      sessionInfo: {
        sessionId: session._id,
        courseId: session.courseId,
        courseName: course.courseName,
        courseCode: course.courseCode,
        sessionStatus: session.status,
        sessionStartTime: new Date(session._creationTime).toISOString(),
        sessionEndTime: session.endedAt
          ? new Date(session.endedAt).toISOString()
          : null,
        lecturerId: session.lecturerId,
      },

      // Historical data (if requested and user is lecturer)
      historicalData,

      // Access control
      userAccess: {
        isLecturer,
        isEnrolledStudent,
        canViewDetailedStats: isLecturer,
        canPerformOverrides: isLecturer && overrideEligibility.canOverride,
      },

      // Metadata
      generatedAt: new Date().toISOString(),
      lastUpdated: Date.now(),
    };

    return statistics;
  },
});
/**
 * Manual attendance override mutation
 * Requirements: 1.1, 1.3, 1.4, 4.1, 4.2 - Create manual override with comprehensive validation
 */
export const createManualAttendanceOverride = mutation({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    studentId: v.id('userProfiles'),
    justificationNote: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Validate user authentication and identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError(
        getOverrideErrorMessage(OverrideErrorType.PERMISSION_DENIED),
      );
    }

    const lecturerId = identity.subject as any;

    // 2. Validate and clean justification note
    const justificationValidation = validateAndCleanJustification(
      args.justificationNote,
    );

    if (!justificationValidation.success) {
      throw new ConvexError(
        justificationValidation.errors?.[0] ||
          getOverrideErrorMessage(OverrideErrorType.INSUFFICIENT_JUSTIFICATION),
      );
    }

    const cleanedJustification = justificationValidation.data!;

    // 3. Get and validate attendance session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      throw new ConvexError(
        getOverrideErrorMessage(OverrideErrorType.SESSION_NOT_FOUND),
      );
    }

    // 4. Validate lecturer permissions and course ownership
    if (session.lecturerId !== lecturerId) {
      throw new ConvexError(
        getOverrideErrorMessage(OverrideErrorType.PERMISSION_DENIED),
      );
    }

    // 5. Get course information for validation
    const course = await ctx.db.get(session.courseId);
    if (!course) {
      throw new ConvexError('Course not found for this session');
    }

    // 6. Validate student enrollment in the course
    const enrollment = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId_by_studentId', (q) =>
        q.eq('courseId', session.courseId).eq('studentId', args.studentId),
      )
      .first();

    if (!enrollment) {
      throw new ConvexError(
        getOverrideErrorMessage(OverrideErrorType.STUDENT_NOT_ENROLLED),
      );
    }

    // 7. Check if student is already marked as present
    const existingRecord = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendanceSessionId_by_StudentId', (q) =>
        q
          .eq('attendanceSessionId', args.attendanceSessionId)
          .eq('studentId', args.studentId),
      )
      .first();

    if (existingRecord) {
      throw new ConvexError(
        getOverrideErrorMessage(OverrideErrorType.STUDENT_ALREADY_PRESENT),
      );
    }

    // 8. Get lecturer settings for override time window
    let lecturerSettings = getDefaultLecturerSettings();
    const storedSettings = await ctx.db
      .query('lecturerSettings')
      .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId))
      .first();

    if (storedSettings) {
      lecturerSettings = validateAndApplyLecturerSettings({
        overrideWindowHours: storedSettings.overrideWindowHours,
        notifyOnOverride: storedSettings.notifyOnOverride,
      });
    }

    // 9. Check time window eligibility
    const sessionForOverride: AttendanceSessionForOverride = {
      _id: session._id,
      courseId: session.courseId,
      lecturerId: session.lecturerId,
      status: session.status,
      endedAt: session.endedAt,
      _creationTime: session._creationTime,
    };

    const overrideEligibility = calculateOverrideEligibility(
      sessionForOverride,
      lecturerSettings,
    );

    if (!overrideEligibility.canOverride) {
      throw new ConvexError(
        overrideEligibility.reason ||
          getOverrideErrorMessage(
            overrideEligibility.errorType ||
              OverrideErrorType.TIME_WINDOW_EXPIRED,
            { windowHours: lecturerSettings.overrideWindowHours },
          ),
      );
    }

    // 10. Check for duplicate override attempts
    const existingOverrideLog = await ctx.db
      .query('attendanceOverrideLogs')
      .withIndex('by_session_student', (q) =>
        q
          .eq('attendanceSessionId', args.attendanceSessionId)
          .eq('studentId', args.studentId),
      )
      .first();

    if (existingOverrideLog) {
      throw new ConvexError(
        getOverrideErrorMessage(OverrideErrorType.DUPLICATE_OVERRIDE),
      );
    }

    // 11. Create attendance record with override metadata
    const overrideTimestamp = new Date().toISOString();
    const sessionEndTime = session.endedAt || session._creationTime;

    const attendanceRecordId = await ctx.db.insert('attendanceRecords', {
      attendanceSessionId: args.attendanceSessionId,
      studentId: args.studentId,
      courseId: session.courseId,
      checkedInAt: overrideTimestamp,
      location: session.location, // Use session location as placeholder
      distance: 0, // Override records don't have GPS distance
      isManualOverride: true,
      overrideTimestamp,
      overrideReason: cleanedJustification,
      overriddenBy: lecturerId,
      originalStatus: 'absent',
    });

    // 12. Create comprehensive audit log entry
    const auditLogId = await ctx.db.insert('attendanceOverrideLogs', {
      attendanceSessionId: args.attendanceSessionId,
      studentId: args.studentId,
      lecturerId,
      courseId: session.courseId,
      overrideTimestamp,
      justificationNote: cleanedJustification,
      originalStatus: 'absent',
      newStatus: 'present',
      sessionEndTime,
      overrideWindowHours: lecturerSettings.overrideWindowHours,
    });

    // 13. Get student information for response
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new ConvexError('Student information not found');
    }

    // 14. Return success response with comprehensive information
    return {
      success: true,
      attendanceRecordId,
      auditLogId,
      overrideDetails: {
        sessionId: args.attendanceSessionId,
        studentId: args.studentId,
        studentName: student.fullName,
        lecturerId,
        overrideTimestamp,
        justificationNote: cleanedJustification,
        originalStatus: 'absent',
        newStatus: 'present',
        sessionEndTime,
        overrideWindowHours: lecturerSettings.overrideWindowHours,
      },
      message: `Successfully marked ${student.fullName} as present via manual override`,
    };
  },
});

/**
 * Lecturer settings management mutation
 * Requirements: 5.3 - Update lecturer-specific override preferences
 */
export const updateLecturerOverrideSettings = mutation({
  args: {
    overrideWindowHours: v.number(),
    notifyOnOverride: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Validate user authentication and identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Authentication required');
    }

    const lecturerId = identity.subject as any;

    // 2. Validate user is a lecturer
    const userProfile = await ctx.db
      .query('userProfiles')
      .filter((q) => q.eq(q.field('_id'), lecturerId))
      .first();

    if (!userProfile || userProfile.role !== 'lecturer') {
      throw new ConvexError('Only lecturers can update override settings');
    }

    // 3. Validate and clean settings
    const settingsValidation = validateAndCleanLecturerSettings({
      overrideWindowHours: args.overrideWindowHours,
      notifyOnOverride: args.notifyOnOverride,
    });

    if (!settingsValidation.success) {
      throw new ConvexError(
        settingsValidation.errors?.[0] ||
          'Invalid settings provided. Override window must be between 1-24 hours.',
      );
    }

    const validatedSettings = settingsValidation.data!;

    // 4. Check if lecturer settings already exist
    const existingSettings = await ctx.db
      .query('lecturerSettings')
      .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId))
      .first();

    let settingsId: any;

    if (existingSettings) {
      // 5. Update existing settings
      await ctx.db.patch(existingSettings._id, {
        overrideWindowHours: validatedSettings.overrideWindowHours,
        notifyOnOverride: validatedSettings.notifyOnOverride,
      });
      settingsId = existingSettings._id;
    } else {
      // 6. Create new settings record
      settingsId = await ctx.db.insert('lecturerSettings', {
        lecturerId,
        overrideWindowHours: validatedSettings.overrideWindowHours,
        notifyOnOverride: validatedSettings.notifyOnOverride,
      });
    }

    // 7. Return updated settings
    return {
      success: true,
      settingsId,
      settings: {
        lecturerId,
        overrideWindowHours: validatedSettings.overrideWindowHours,
        notifyOnOverride: validatedSettings.notifyOnOverride,
      },
      message: `Override settings updated successfully. Override window set to ${validatedSettings.overrideWindowHours} hours.`,
    };
  },
});

/**
 * Get attendance record by session and student for validation
 * Requirements: 1.2 - Check if student is already marked present
 */
export const getAttendanceRecordBySessionAndStudent = query({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    studentId: v.id('userProfiles'),
  },
  handler: async (ctx, args) => {
    // Validate authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Authentication required');
    }

    // Get the attendance record
    const record = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendanceSessionId_by_StudentId', (q) =>
        q
          .eq('attendanceSessionId', args.attendanceSessionId)
          .eq('studentId', args.studentId),
      )
      .first();

    return record;
  },
});

/**
 * Get override log by session and student for validation
 * Requirements: 4.4 - Check for duplicate override attempts
 */
export const getOverrideLogBySessionAndStudent = query({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    studentId: v.id('userProfiles'),
  },
  handler: async (ctx, args) => {
    // Validate authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Authentication required');
    }

    // Get the override log
    const overrideLog = await ctx.db
      .query('attendanceOverrideLogs')
      .withIndex('by_session_student', (q) =>
        q
          .eq('attendanceSessionId', args.attendanceSessionId)
          .eq('studentId', args.studentId),
      )
      .first();

    return overrideLog;
  },
});

/**
 * Cancel attendance session during active period
 * Requirements: Allow lecturers to cancel sessions during active period (since there's no prep period)
 */
export const cancelAttendanceSession = courseMutation({
  args: {
    courseId: v.id('courses'),
    attendanceSessionId: v.id('attendanceSessions'),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;
    const course = ctx.course;

    // Get the attendance session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      throw new ConvexError('Attendance session not found');
    }

    // Verify the session belongs to this lecturer and course
    if (session.lecturerId !== lecturerId) {
      throw new ConvexError('You are not authorized to cancel this session');
    }

    if (session.courseId !== args.courseId) {
      throw new ConvexError('Session does not belong to this course');
    }

    // Check if session is already completed or cancelled
    if (session.status === 'complete') {
      throw new ConvexError('Cannot cancel a completed attendance session');
    }

    if (session.status === 'cancelled') {
      throw new ConvexError('Attendance session is already cancelled');
    }

    // Since there's no prep period, allow cancellation during active state
    // Only prevent cancellation if session has already ended naturally
    const currentTime = Date.now();
    if (session.endedAt && currentTime >= session.endedAt) {
      throw new ConvexError(
        'Cannot cancel attendance session. The session has already ended.',
      );
    }

    // Cancel the scheduled end function to prevent it from running
    if (session.endScheduledFunctionId) {
      try {
        await ctx.scheduler.cancel(session.endScheduledFunctionId);
      } catch (error) {
        // Function might have already run or been cancelled, continue with cancellation
        console.log('Could not cancel end function:', error);
      }
    }

    // Mark the session as cancelled instead of deleting it
    await ctx.db.patch(args.attendanceSessionId, {
      status: 'cancelled',
      endedAt: currentTime, // Set the end time to when it was cancelled
    });

    return {
      success: true,
      message: 'Attendance session cancelled successfully',
      sessionId: args.attendanceSessionId,
      courseId: args.courseId,
      courseName: course.courseName,
      courseCode: course.courseCode,
      cancelledAt: currentTime,
    };
  },
});

/**
 * Check if attendance session can be cancelled
 * Requirements: Provide UI feedback on whether cancellation is possible
 */
export const canCancelAttendanceSession = LecturerCourseQuery({
  args: {
    courseId: v.id('courses'),
    attendanceSessionId: v.id('attendanceSessions'),
  },
  handler: async (ctx, args) => {
    // const lecturerId = ctx.user._id;

    // Get the attendance session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      return {
        canCancel: false,
        reason: 'Session not found',
        timeRemaining: 0,
      };
    }

    // Check if session is already completed or cancelled
    if (session.status === 'complete') {
      return {
        canCancel: false,
        reason: 'Session already completed',
        timeRemaining: 0,
      };
    }

    if (session.status === 'cancelled') {
      return {
        canCancel: false,
        reason: 'Session already cancelled',
        timeRemaining: 0,
      };
    }

    // Since there's no prep period, check if session has ended naturally
    const currentTime = Date.now();
    const timeRemaining = session.endedAt
      ? Math.max(0, session.endedAt - currentTime)
      : 0;

    // Check if session has already ended
    if (session.endedAt && currentTime >= session.endedAt) {
      return {
        canCancel: false,
        reason: 'Session has already ended',
        timeRemaining: 0,
      };
    }

    // Allow cancellation during active period
    return {
      canCancel: true,
      reason: 'Can cancel during active session',
      timeRemaining,
      sessionStatus: session.status,
    };
  },
});

/**
 * Get student enrollment for validation
 * Requirements: 4.4 - Validate student enrollment in course
 */
export const getStudentEnrollment = query({
  args: {
    courseId: v.id('courses'),
    studentId: v.id('userProfiles'),
  },
  handler: async (ctx, args) => {
    // Validate authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Authentication required');
    }

    // Get the enrollment record
    const enrollment = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId_by_studentId', (q) =>
        q.eq('courseId', args.courseId).eq('studentId', args.studentId),
      )
      .first();

    return enrollment;
  },
});

/**
 * Utility function to check scheduled functions for a session
 * This helps with debugging and monitoring
 */
export const getSessionScheduledFunctions = query({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
  },
  handler: async (ctx, args) => {
    // Validate authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Authentication required');
    }

    // Get the session
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      throw new ConvexError('Session not found');
    }

    // Check if user has access to this session
    const isLecturer = session.lecturerId === identity.subject;
    if (!isLecturer) {
      // Check if user is a student enrolled in the course
      const enrollment = await ctx.db
        .query('courseAttendanceList')
        .withIndex('by_courseId_by_studentId', (q) =>
          q
            .eq('courseId', session.courseId)
            .eq('studentId', identity.subject as any),
        )
        .first();

      if (!enrollment) {
        throw new ConvexError('Access denied');
      }
    }

    const result: any = {
      sessionId: session._id,
      sessionStatus: session.status,
      activateScheduledFunctionId: session.activateScheduledFunctionId,
      endScheduledFunctionId: session.endScheduledFunctionId,
      scheduledFunctions: [],
    };

    // Get the scheduled function details if they exist
    if (session.activateScheduledFunctionId) {
      const activateFunction = await ctx.db.system.get(
        session.activateScheduledFunctionId,
      );
      result.scheduledFunctions.push({
        type: 'activate',
        id: session.activateScheduledFunctionId,
        details: activateFunction,
      });
    }

    if (session.endScheduledFunctionId) {
      const endFunction = await ctx.db.system.get(
        session.endScheduledFunctionId,
      );
      result.scheduledFunctions.push({
        type: 'end',
        id: session.endScheduledFunctionId,
        details: endFunction,
      });
    }

    return result;
  },
});

/**
 * Enhanced manual override mutation with comprehensive edge case handling
 * Requirements: 1.2, 4.4, 5.1, 5.2 - Handle all edge cases and validation scenarios
 */
export const createManualAttendanceOverrideEnhanced = mutation({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    studentId: v.id('userProfiles'),
    justificationNote: v.string(),
    operationId: v.optional(v.string()), // For concurrent operation tracking
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      // 1. Validate user authentication and identity
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError(
          getOverrideErrorMessage(OverrideErrorType.UNAUTHORIZED),
        );
      }

      const lecturerId = identity.subject as any;

      // 2. Get and validate attendance session
      const session = await ctx.db.get(args.attendanceSessionId);
      if (!session) {
        throw new ConvexError(
          getOverrideErrorMessage(OverrideErrorType.SESSION_NOT_FOUND),
        );
      }

      // 3. Validate lecturer permissions and course ownership
      if (session.lecturerId !== lecturerId) {
        throw new ConvexError(
          getOverrideErrorMessage(OverrideErrorType.LECTURER_NOT_OWNER),
        );
      }

      // 4. Get course information for validation
      const course = await ctx.db.get(session.courseId);
      if (!course) {
        throw new ConvexError('Course not found for this session');
      }

      // 5. Validate student enrollment in the course
      const enrollment = await ctx.db
        .query('courseAttendanceList')
        .withIndex('by_courseId_by_studentId', (q) =>
          q.eq('courseId', session.courseId).eq('studentId', args.studentId),
        )
        .first();

      if (!enrollment) {
        throw new ConvexError(
          getOverrideErrorMessage(OverrideErrorType.STUDENT_NOT_ENROLLED),
        );
      }

      // 6. Check if student is already marked as present
      const existingRecord = await ctx.db
        .query('attendanceRecords')
        .withIndex('by_attendanceSessionId_by_StudentId', (q) =>
          q
            .eq('attendanceSessionId', args.attendanceSessionId)
            .eq('studentId', args.studentId),
        )
        .first();

      if (existingRecord) {
        throw new ConvexError(
          getOverrideErrorMessage(OverrideErrorType.STUDENT_ALREADY_PRESENT),
        );
      }

      // 7. Check for duplicate override attempts
      const existingOverrideLog = await ctx.db
        .query('attendanceOverrideLogs')
        .withIndex('by_session_student', (q) =>
          q
            .eq('attendanceSessionId', args.attendanceSessionId)
            .eq('studentId', args.studentId),
        )
        .first();

      if (existingOverrideLog) {
        throw new ConvexError(
          getOverrideErrorMessage(OverrideErrorType.DUPLICATE_OVERRIDE),
        );
      }

      // 8. Validate and clean justification note
      const justificationValidation = validateAndCleanJustification(
        args.justificationNote,
      );

      if (!justificationValidation.success) {
        throw new ConvexError(
          justificationValidation.errors?.[0] ||
            getOverrideErrorMessage(
              OverrideErrorType.INSUFFICIENT_JUSTIFICATION,
            ),
        );
      }

      const cleanedJustification = justificationValidation.data!;

      // 9. Get lecturer settings for override time window
      let lecturerSettings = getDefaultLecturerSettings();
      const storedSettings = await ctx.db
        .query('lecturerSettings')
        .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId))
        .first();

      if (storedSettings) {
        lecturerSettings = validateAndApplyLecturerSettings({
          overrideWindowHours: storedSettings.overrideWindowHours,
          notifyOnOverride: storedSettings.notifyOnOverride,
        });
      }

      // 10. Check time window eligibility
      const sessionForOverride: AttendanceSessionForOverride = {
        _id: session._id,
        courseId: session.courseId,
        lecturerId: session.lecturerId,
        status: session.status,
        endedAt: session.endedAt,
        _creationTime: session._creationTime,
      };

      const overrideEligibility = calculateOverrideEligibility(
        sessionForOverride,
        lecturerSettings,
      );

      if (!overrideEligibility.canOverride) {
        throw new ConvexError(
          overrideEligibility.reason ||
            getOverrideErrorMessage(
              overrideEligibility.errorType ||
                OverrideErrorType.TIME_WINDOW_EXPIRED,
              { windowHours: lecturerSettings.overrideWindowHours },
            ),
        );
      }

      // 11. Create attendance record with override metadata
      const overrideTimestamp = new Date().toISOString();
      const sessionEndTime = session.endedAt || session._creationTime;

      const attendanceRecordId = await ctx.db.insert('attendanceRecords', {
        attendanceSessionId: args.attendanceSessionId,
        studentId: args.studentId,
        courseId: session.courseId,
        checkedInAt: overrideTimestamp,
        location: session.location, // Use session location as placeholder
        distance: 0, // Override records don't have GPS distance
        isManualOverride: true,
        overrideTimestamp,
        overrideReason: cleanedJustification,
        overriddenBy: lecturerId,
        originalStatus: 'absent',
      });

      // 12. Create comprehensive audit log entry
      const auditLogId = await ctx.db.insert('attendanceOverrideLogs', {
        attendanceSessionId: args.attendanceSessionId,
        studentId: args.studentId,
        lecturerId,
        courseId: session.courseId,
        overrideTimestamp,
        justificationNote: cleanedJustification,
        originalStatus: 'absent',
        newStatus: 'present',
        sessionEndTime,
        overrideWindowHours: lecturerSettings.overrideWindowHours,
      });

      // 13. Get student information for response
      const student = await ctx.db.get(args.studentId);
      if (!student) {
        throw new ConvexError('Student information not found');
      }

      // 14. Calculate processing time for monitoring
      const processingTime = Date.now() - startTime;

      // 15. Return success response with comprehensive information
      return {
        success: true,
        attendanceRecordId,
        auditLogId,
        processingTimeMs: processingTime,
        overrideDetails: {
          sessionId: args.attendanceSessionId,
          studentId: args.studentId,
          studentName: student.fullName,
          lecturerId,
          courseId: session.courseId,
          overrideTimestamp,
          justificationNote: cleanedJustification,
          originalStatus: 'absent',
          newStatus: 'present',
          sessionEndTime,
          overrideWindowHours: lecturerSettings.overrideWindowHours,
          operationId: args.operationId,
        },
        message: `Successfully marked ${student.fullName} as present via manual override`,
      };
    } catch (error) {
      // Log processing time even for errors
      const processingTime = Date.now() - startTime;

      // Re-throw with additional context
      if (error instanceof ConvexError) {
        throw error;
      }

      throw new ConvexError(
        `Override operation failed after ${processingTime}ms: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  },
});

/**
 * Batch validation query for multiple students
 * Requirements: 4.4 - Efficient validation for multiple override operations
 */
export const validateMultipleOverrides = query({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    studentIds: v.array(v.id('userProfiles')),
  },
  handler: async (ctx, args) => {
    // Validate authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('Authentication required');
    }

    const lecturerId = identity.subject as any;

    // Get session and validate lecturer ownership
    const session = await ctx.db.get(args.attendanceSessionId);
    if (!session) {
      throw new ConvexError('Session not found');
    }

    if (session.lecturerId !== lecturerId) {
      throw new ConvexError('Permission denied');
    }

    // Get all existing records for these students
    const existingRecords = await Promise.all(
      args.studentIds.map((studentId) =>
        ctx.db
          .query('attendanceRecords')
          .withIndex('by_attendanceSessionId_by_StudentId', (q) =>
            q
              .eq('attendanceSessionId', args.attendanceSessionId)
              .eq('studentId', studentId),
          )
          .first(),
      ),
    );

    // Get all existing override logs
    const existingOverrides = await Promise.all(
      args.studentIds.map((studentId) =>
        ctx.db
          .query('attendanceOverrideLogs')
          .withIndex('by_session_student', (q) =>
            q
              .eq('attendanceSessionId', args.attendanceSessionId)
              .eq('studentId', studentId),
          )
          .first(),
      ),
    );

    // Get all enrollments
    const enrollments = await Promise.all(
      args.studentIds.map((studentId) =>
        ctx.db
          .query('courseAttendanceList')
          .withIndex('by_courseId_by_studentId', (q) =>
            q.eq('courseId', session.courseId).eq('studentId', studentId),
          )
          .first(),
      ),
    );

    // Return validation results for each student
    return args.studentIds.map((studentId, index) => ({
      studentId,
      canOverride:
        !existingRecords[index] &&
        !existingOverrides[index] &&
        !!enrollments[index],
      alreadyPresent: !!existingRecords[index],
      duplicateOverride: !!existingOverrides[index],
      notEnrolled: !enrollments[index],
      existingRecord: existingRecords[index],
      existingOverride: existingOverrides[index],
      enrollment: enrollments[index],
    }));
  },
});
