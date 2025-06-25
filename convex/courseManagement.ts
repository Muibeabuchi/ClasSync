import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all students taught by a lecturer across all courses
export const getAllStudentsByLecturer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    
    if (!profile || profile.role !== "lecturer") {
      throw new Error("Only lecturers can access this data");
    }

    // Get all courses by lecturer
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", userId))
      .collect();

    const allStudents = [];

    for (const course of courses) {
      for (const student of course.attendanceList) {
        // Get attendance stats for this student in this course
        const attendanceRecords = await ctx.db
          .query("attendanceRecords")
          .withIndex("by_registration", (q) => q.eq("registrationNumber", student.registrationNumber))
          .collect();

        const sessions = await ctx.db
          .query("attendanceSessions")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();

        const attendedSessions = attendanceRecords.filter(record => 
          sessions.some(session => session._id === record.sessionId)
        );

        const attendanceStats = {
          total: sessions.length,
          attended: attendedSessions.length,
          percentage: sessions.length > 0 ? (attendedSessions.length / sessions.length) * 100 : 0,
        };

        allStudents.push({
          ...student,
          courseId: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          attendanceStats,
        });
      }
    }

    return allStudents;
  },
});

// Get detailed student information
export const getStudentDetails = query({
  args: {
    courseId: v.id("courses"),
    registrationNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    if (course.lecturerId !== userId) {
      throw new Error("Access denied");
    }

    const student = course.attendanceList.find(
      s => s.registrationNumber === args.registrationNumber
    );

    if (!student) {
      throw new Error("Student not found");
    }

    // Get all sessions for this course
    const sessions = await ctx.db
      .query("attendanceSessions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Get attendance records for this student
    const attendanceRecords = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_registration", (q) => q.eq("registrationNumber", args.registrationNumber))
      .collect();

    // Build attendance history
    const attendanceHistory = sessions.map(session => {
      const record = attendanceRecords.find(r => r.sessionId === session._id);
      return {
        sessionName: session.sessionName,
        sessionDate: session.sessionDate,
        attended: !!record,
        checkedInAt: record?.checkedInAt,
      };
    });

    const attendedCount = attendanceHistory.filter(h => h.attended).length;
    const attendanceStats = {
      totalSessions: sessions.length,
      attended: attendedCount,
      missed: sessions.length - attendedCount,
      percentage: sessions.length > 0 ? (attendedCount / sessions.length) * 100 : 0,
    };

    return {
      student,
      attendanceStats,
      attendanceHistory,
    };
  },
});

// Get course analytics
export const getCourseAnalytics = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    if (course.lecturerId !== userId) {
      throw new Error("Access denied");
    }

    const sessions = await ctx.db
      .query("attendanceSessions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const enrolledStudents = course.attendanceList.filter(s => s.isLinked);
    const totalStudents = enrolledStudents.length;
    const totalSessions = sessions.length;

    // Calculate attendance for each student
    const studentAttendance = [];
    for (const student of enrolledStudents) {
      const attendanceRecords = await ctx.db
        .query("attendanceRecords")
        .withIndex("by_registration", (q) => q.eq("registrationNumber", student.registrationNumber))
        .collect();

      const attendedSessions = attendanceRecords.filter(record => 
        sessions.some(session => session._id === record.sessionId)
      );

      const percentage = totalSessions > 0 ? (attendedSessions.length / totalSessions) * 100 : 0;

      studentAttendance.push({
        studentId: student.linkedUserId || student.registrationNumber,
        studentName: student.fullName,
        attendancePercentage: percentage,
        attendedSessions: attendedSessions.length,
      });
    }

    // Sort by attendance percentage
    studentAttendance.sort((a, b) => b.attendancePercentage - a.attendancePercentage);

    const topPerformers = studentAttendance.slice(0, 5);
    const bottomPerformers = studentAttendance.slice(-5).reverse();

    // Calculate average attendance
    const averageAttendance = studentAttendance.length > 0
      ? studentAttendance.reduce((sum, s) => sum + s.attendancePercentage, 0) / studentAttendance.length
      : 0;

    // Session breakdown
    const sessionBreakdown = [];
    for (const session of sessions) {
      const attendanceRecords = await ctx.db
        .query("attendanceRecords")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();

      const attendanceCount = attendanceRecords.length;
      const attendancePercentage = totalStudents > 0 ? (attendanceCount / totalStudents) * 100 : 0;

      sessionBreakdown.push({
        sessionId: session._id,
        sessionName: session.sessionName,
        date: session.sessionDate,
        attendanceCount,
        attendancePercentage,
      });
    }

    return {
      totalStudents,
      totalSessions,
      averageAttendance,
      topPerformers,
      bottomPerformers,
      sessionBreakdown,
      studentAttendance,
    };
  },
});

// Get course reports
export const getCourseReports = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    if (course.lecturerId !== userId) {
      throw new Error("Access denied");
    }

    const reports = await ctx.db
      .query("courseReports")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    return reports;
  },
});
