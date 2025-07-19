import { internalMutation } from './_generated/server';
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
import { StudentMutationMiddleware } from './middlewares/studentMiddleware';

import * as AttendanceRecordsModel from './models/attendanceRecordsModel';

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

    // const attendanceCode = AttendanceModel.generateAttendanceCode();

    const startTime = Date.now();
    const endedAt = startTime + AttendanceSessionDuration;

    const sessionId = await ctx.db.insert('attendanceSessions', {
      courseId: args.courseId,
      lecturerId,
      attendanceCode: args.requireCode,
      location: args.gpsCoordinates,
      status: 'pending',
      endedAt,
      radius: args.radiusMeters,
    });

    await ctx.scheduler.runAfter(
      AttendanceSessionDuration / 2,
      internal.attendance.activateAttendanceSession,
      {
        attendanceSessionId: sessionId,
      },
    );

    await ctx.scheduler.runAt(
      endedAt,
      internal.attendance.endAttendanceSession,
      {
        attendanceSessionId: sessionId,
      },
    );

    return {
      sessionId,
      courseId: course._id,
      attendanceCode: args.requireCode,
      status: 'pending',
    };
  },
});

export const endAttendanceSession = internalMutation({
  args: { attendanceSessionId: v.id('attendanceSessions') },
  async handler(ctx, args) {
    await ctx.db.patch(args.attendanceSessionId, {
      status: 'complete',
    });
  },
});

export const activateAttendanceSession = internalMutation({
  args: { attendanceSessionId: v.id('attendanceSessions') },
  async handler(ctx, args) {
    await ctx.db.patch(args.attendanceSessionId, {
      status: 'active',
    });
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

    // Ensure the attendanceSession is active
    if (attendanceSession.status !== 'active')
      throw new ConvexError('Attendance Session is not Active');

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

    if (distance > DefaultAttendanceRadius) {
      throw new ConvexError('You are not within the required location radius');
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
  args: { attendanceSessionId: v.id('attendanceSessions') },
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

    return {
      ...attendanceSession,
      courseName: course.courseName,
      courseCode: course.courseCode,
    };
  },
});

export const getCourseAttendanceSessions = LecturerCourseQuery({
  args: {},
  async handler(ctx, args) {
    const lecturerId = ctx.user._id;

    const courseAttendanceSessions = await ctx.db
      .query('attendanceSessions')
      .withIndex('by_courseId_by_lecturerId', (q) =>
        q.eq('courseId', args.courseId).eq('lecturerId', lecturerId),
      )
      .collect();

    //   get the number of students that took attendance
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
  args: { attendanceSessionId: v.id('attendanceSessions') },
  handler: async (ctx, args) => {
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
