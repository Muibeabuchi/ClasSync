import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Enhanced attendance session creation
export const startEnhancedAttendanceSession = mutation({
  args: {
    courseId: v.id("courses"),
    sessionName: v.string(),
    gpsCoordinates: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    radiusMeters: v.number(),
    durationMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course || course.lecturerId !== userId) {
      throw new Error("Unauthorized");
    }

    // Check if course is active
    if (course.status !== "active") {
      throw new Error("Cannot create attendance sessions for non-active courses");
    }

    // Count enrolled students
    const enrolledStudents = await ctx.db
      .query("studentCourseStats")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const attendanceCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const startTime = Date.now();
    const endTime = startTime + (args.durationMinutes * 60 * 1000);

    const sessionId = await ctx.db.insert("attendanceSessions", {
      courseId: args.courseId,
      lecturerId: userId,
      sessionName: args.sessionName,
      attendanceCode,
      gpsCoordinates: args.gpsCoordinates,
      radiusMeters: args.radiusMeters,
      startTime,
      endTime,
      isActive: true,
      studentsPresent: [],
      totalStudentsEnrolled: enrolledStudents.length,
      attendancePercentage: 0,
    });

    // Update total sessions for all students
    for (const student of enrolledStudents) {
      await ctx.db.patch(student._id, {
        totalSessions: student.totalSessions + 1,
      });
    }

    return { sessionId, attendanceCode };
  },
});

// Enhanced check-in with real-time updates
export const enhancedCheckInToAttendance = mutation({
  args: {
    attendanceCode: v.string(),
    gpsCoordinates: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Find the session by attendance code
    const session = await ctx.db
      .query("attendanceSessions")
      .withIndex("by_attendance_code", (q) => q.eq("attendanceCode", args.attendanceCode))
      .unique();

    if (!session) {
      throw new Error("Invalid attendance code");
    }

    const now = Date.now();
    if (now < session.startTime || now > session.endTime || !session.isActive) {
      throw new Error("Attendance session is not active");
    }

    // Check if student is enrolled
    const studentStat = await ctx.db
      .query("studentCourseStats")
      .withIndex("by_student_course", (q) => q.eq("studentId", userId).eq("courseId", session.courseId))
      .unique();

    if (!studentStat || studentStat.status !== "active") {
      throw new Error("You are not enrolled in this course");
    }

    // Check GPS proximity
    const distance = calculateDistance(
      session.gpsCoordinates.latitude,
      session.gpsCoordinates.longitude,
      args.gpsCoordinates.latitude,
      args.gpsCoordinates.longitude
    );

    if (distance > session.radiusMeters) {
      throw new Error("You are not within the required location radius");
    }

    // Check if already checked in
    const existingRecord = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .filter((q) => q.eq(q.field("studentId"), userId))
      .unique();

    if (existingRecord) {
      throw new Error("You have already checked in for this session");
    }

    // Create attendance record
    const recordId = await ctx.db.insert("attendanceRecords", {
      sessionId: session._id,
      studentId: userId,
      courseId: session.courseId,
      status: "present",
      checkedInAt: now,
      gpsCoordinates: args.gpsCoordinates,
    });

    // Update session with new student present
    const currentStudentsPresent = session.studentsPresent || [];
    const updatedStudentsPresent = [...currentStudentsPresent, userId];
    const totalEnrolled = session.totalStudentsEnrolled || 1;
    const sessionAttendancePercentage = (updatedStudentsPresent.length / totalEnrolled) * 100;

    await ctx.db.patch(session._id, {
      studentsPresent: updatedStudentsPresent,
      attendancePercentage: sessionAttendancePercentage,
    });

    // Update student course stats
    const newSessionsAttended = studentStat.sessionsAttended + 1;
    const studentAttendancePercentage = (newSessionsAttended / studentStat.totalSessions) * 100;

    await ctx.db.patch(studentStat._id, {
      sessionsAttended: newSessionsAttended,
      attendancePercentage: studentAttendancePercentage,
      lastAttendanceDate: now,
    });

    // Send notification for successful attendance
    await ctx.db.insert("notifications", {
      recipientId: userId,
      courseId: session.courseId,
      title: "Attendance Recorded",
      message: `Your attendance for ${session.sessionName} has been recorded successfully.`,
      type: "attendance",
      isRead: false,
      createdAt: now,
    });

    return recordId;
  },
});

// Calculate distance between two GPS coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Enhanced end session with final calculations
export const endEnhancedAttendanceSession = mutation({
  args: { sessionId: v.id("attendanceSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.lecturerId !== userId) {
      throw new Error("Unauthorized");
    }

    // Mark absent students
    const enrolledStudents = await ctx.db
      .query("studentCourseStats")
      .withIndex("by_course", (q) => q.eq("courseId", session.courseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    for (const student of enrolledStudents) {
      const studentsPresent = session.studentsPresent || [];
      if (!studentsPresent.includes(student.studentId)) {
        // Create absent record
        await ctx.db.insert("attendanceRecords", {
          sessionId: session._id,
          studentId: student.studentId,
          courseId: session.courseId,
          status: "absent",
        });

        // Update student stats (attendance percentage will decrease)
        const newAttendancePercentage = (student.sessionsAttended / student.totalSessions) * 100;
        await ctx.db.patch(student._id, {
          attendancePercentage: newAttendancePercentage,
        });
      }
    }

    await ctx.db.patch(args.sessionId, {
      isActive: false,
    });

    return true;
  },
});

// Get real-time attendance statistics
export const getRealtimeAttendanceStats = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return null;
    }

    // Check if user is lecturer or enrolled student
    const isLecturer = course.lecturerId === userId;
    const studentStat = await ctx.db
      .query("studentCourseStats")
      .withIndex("by_student_course", (q) => q.eq("studentId", userId).eq("courseId", args.courseId))
      .unique();

    if (!isLecturer && !studentStat) {
      throw new Error("Unauthorized");
    }

    const sessions = await ctx.db
      .query("attendanceSessions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.isActive).length;

    if (isLecturer) {
      // Return lecturer view
      const enrolledStudents = await ctx.db
        .query("studentCourseStats")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      const averageAttendance = enrolledStudents.length > 0
        ? enrolledStudents.reduce((sum, s) => sum + s.attendancePercentage, 0) / enrolledStudents.length
        : 0;

      return {
        totalStudents: enrolledStudents.length,
        totalSessions,
        activeSessions,
        averageAttendance,
        recentSessions: sessions.slice(-5),
      };
    } else {
      // Return student view
      const attendanceRecords = await ctx.db
        .query("attendanceRecords")
        .withIndex("by_student_course", (q) => q.eq("studentId", userId).eq("courseId", args.courseId))
        .collect();

      const presentCount = attendanceRecords.filter(r => r.status === "present").length;

      return {
        personalAttendancePercentage: studentStat?.attendancePercentage || 0,
        sessionsAttended: studentStat?.sessionsAttended || 0,
        totalSessions: studentStat?.totalSessions || 0,
        presentCount,
        recentAttendance: attendanceRecords.slice(-5),
      };
    }
  },
});
