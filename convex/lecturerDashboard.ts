import { lecturerQuery } from './middlewares/lecturerMiddleware';
import { v } from 'convex/values';

export const getLecturerDashboardStats = lecturerQuery({
  args: {},
  handler: async (ctx) => {
    const lecturerId = ctx.user._id;

    // Get total courses count
    const totalCourses = await ctx.db
      .query('courses')
      .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId))
      .collect();

    // Get total students count (unique students across all courses)
    const courseAttendanceList = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_lecturerId', (q) => q.eq('lecturerId', lecturerId))
      .collect();

    const uniqueStudentIds = new Set(
      courseAttendanceList.map((entry) => entry.studentId),
    );
    const totalStudents = uniqueStudentIds.size;

    // Get all attendance sessions for this lecturer
    const allAttendanceSessions = await ctx.db
      .query('attendanceSessions')
      .withIndex('by_lecturerId', (q) => q.eq('lecturerId', lecturerId))
      .collect();

    // Calculate average attendance rate
    let totalAttendanceRate = 0;
    let coursesWithSessions = 0;

    for (const course of totalCourses) {
      const courseSessions = allAttendanceSessions.filter(
        (session) =>
          session.courseId === course._id && session.status === 'complete',
      );

      if (courseSessions.length > 0) {
        const courseStudents = courseAttendanceList.filter(
          (entry) => entry.courseId === course._id,
        );

        let totalPossibleAttendance =
          courseSessions.length * courseStudents.length;

        if (totalPossibleAttendance > 0) {
          const actualAttendance = await Promise.all(
            courseSessions.map(async (session) => {
              const records = await ctx.db
                .query('attendanceRecords')
                .withIndex('by_attendanceSessionId', (q) =>
                  q.eq('attendanceSessionId', session._id),
                )
                .collect();
              return records.length;
            }),
          );

          const totalActualAttendance = actualAttendance.reduce(
            (sum, count) => sum + count,
            0,
          );
          const courseAttendanceRate =
            (totalActualAttendance / totalPossibleAttendance) * 100;

          totalAttendanceRate += courseAttendanceRate;
          coursesWithSessions++;
        }
      }
    }

    const averageAttendanceRate =
      coursesWithSessions > 0
        ? Math.round(totalAttendanceRate / coursesWithSessions)
        : 0;

    // Get today's classes count (based on schedule)
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

    const todaysClasses = totalCourses.filter((course) => {
      if (!course.schedule) return false;
      return course.schedule.some(
        (scheduleItem) =>
          scheduleItem.day.toLowerCase() === dayName.toLowerCase(),
      );
    }).length;

    // Get next class time
    let nextClassTime = null;
    const currentTime = today.getHours() * 60 + today.getMinutes(); // Current time in minutes

    for (const course of totalCourses) {
      if (!course.schedule) continue;

      for (const scheduleItem of course.schedule) {
        if (scheduleItem.day.toLowerCase() === dayName.toLowerCase()) {
          const [startHour, startMinute] = scheduleItem.startTime
            .split(':')
            .map(Number);
          const startTimeInMinutes = startHour * 60 + startMinute;

          if (startTimeInMinutes > currentTime) {
            if (!nextClassTime || startTimeInMinutes < nextClassTime) {
              nextClassTime = startTimeInMinutes;
            }
          }
        }
      }
    }

    // Convert next class time back to readable format
    let nextClassTimeString = null;
    if (nextClassTime) {
      const hours = Math.floor(nextClassTime / 60);
      const minutes = nextClassTime % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      nextClassTimeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }

    return {
      totalCourses: totalCourses.length,
      totalStudents,
      averageAttendanceRate,
      todaysClasses,
      nextClassTime: nextClassTimeString,
      // Additional stats for growth indicators
      activeCourses: totalCourses.filter((course) => course.status === 'active')
        .length,
      totalSessions: allAttendanceSessions.length,
      completedSessions: allAttendanceSessions.filter(
        (session) => session.status === 'complete',
      ).length,
    };
  },
});

export const getLecturerRecentCourses = lecturerQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;
    const limit = args.limit ?? 5;

    // Get recent courses with their latest activity
    const courses = await ctx.db
      .query('courses')
      .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .order('desc')
      .take(limit);

    // Get additional stats for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Get student count
        const studentCount = await ctx.db
          .query('courseAttendanceList')
          .withIndex('by_courseId', (q) => q.eq('courseId', course._id))
          .collect();

        // Get latest attendance session
        const latestSession = await ctx.db
          .query('attendanceSessions')
          .withIndex('by_courseId', (q) => q.eq('courseId', course._id))
          .order('desc')
          .first();

        // Calculate attendance progress for this course
        const completedSessions = await ctx.db
          .query('attendanceSessions')
          .withIndex('by_courseId', (q) => q.eq('courseId', course._id))
          .filter((q) => q.eq(q.field('status'), 'complete'))
          .collect();

        let attendanceProgress = 0;
        if (completedSessions.length > 0 && studentCount.length > 0) {
          const totalPossibleAttendance =
            completedSessions.length * studentCount.length;

          const actualAttendance = await Promise.all(
            completedSessions.map(async (session) => {
              const records = await ctx.db
                .query('attendanceRecords')
                .withIndex('by_attendanceSessionId', (q) =>
                  q.eq('attendanceSessionId', session._id),
                )
                .collect();
              return records.length;
            }),
          );

          const totalActualAttendance = actualAttendance.reduce(
            (sum, count) => sum + count,
            0,
          );
          attendanceProgress = Math.round(
            (totalActualAttendance / totalPossibleAttendance) * 100,
          );
        }

        return {
          id: course._id,
          name: course.courseName,
          code: course.courseCode,
          students: studentCount.length,
          progress: attendanceProgress,
          lastActivity: latestSession?._creationTime || course._creationTime,
          hasActiveSession:
            latestSession?.status === 'active' ||
            latestSession?.status === 'pending',
        };
      }),
    );

    // Sort by last activity (most recent first)
    return coursesWithStats.sort((a, b) => b.lastActivity - a.lastActivity);
  },
});
