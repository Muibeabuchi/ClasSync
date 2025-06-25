// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";
// import { getAuthUserId } from "@convex-dev/auth/server";

// // Generate a random attendance code
// function generateAttendanceCode(): string {
//   return Math.random().toString(36).substring(2, 8).toUpperCase();
// }

// // Calculate distance between two GPS coordinates in meters
// function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
//   const R = 6371e3; // Earth's radius in meters
//   const φ1 = lat1 * Math.PI/180;
//   const φ2 = lat2 * Math.PI/180;
//   const Δφ = (lat2-lat1) * Math.PI/180;
//   const Δλ = (lon2-lon1) * Math.PI/180;

//   const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//           Math.cos(φ1) * Math.cos(φ2) *
//           Math.sin(Δλ/2) * Math.sin(Δλ/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

//   return R * c;
// }

// export const startAttendanceSession = mutation({
//   args: {
//     courseId: v.id("courses"),
//     sessionName: v.string(),
//     gpsCoordinates: v.object({
//       latitude: v.number(),
//       longitude: v.number(),
//     }),
//     radiusMeters: v.number(),
//     durationMinutes: v.number(),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const course = await ctx.db.get(args.courseId);
//     if (!course || course.lecturerId !== userId) {
//       throw new Error("Unauthorized");
//     }

//     const attendanceCode = generateAttendanceCode();
//     const startTime = Date.now();
//     const endTime = startTime + (args.durationMinutes * 60 * 1000);

//     const sessionId = await ctx.db.insert("attendanceSessions", {
//       courseId: args.courseId,
//       lecturerId: userId,
//       sessionName: args.sessionName,
//       attendanceCode,
//       gpsCoordinates: args.gpsCoordinates,
//       radiusMeters: args.radiusMeters,
//       startTime,
//       endTime,
//       isActive: true,
//       studentsPresent: [],
//       totalStudentsEnrolled: 0,
//       attendancePercentage: 0,
//     });

//     return { sessionId, attendanceCode };
//   },
// });

// export const getActiveSession = query({
//   args: { courseId: v.id("courses") },
//   handler: async (ctx, args) => {
//     const now = Date.now();

//     const session = await ctx.db
//       .query("attendanceSessions")
//       .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
//       .filter((q) => q.and(
//         q.eq(q.field("isActive"), true),
//         q.lt(q.field("startTime"), now),
//         q.gt(q.field("endTime"), now)
//       ))
//       .unique();

//     return session;
//   },
// });

// export const checkInToAttendance = mutation({
//   args: {
//     attendanceCode: v.string(),
//     gpsCoordinates: v.object({
//       latitude: v.number(),
//       longitude: v.number(),
//     }),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     // Find the session by attendance code
//     const session = await ctx.db
//       .query("attendanceSessions")
//       .withIndex("by_attendance_code", (q) => q.eq("attendanceCode", args.attendanceCode))
//       .unique();

//     if (!session) {
//       throw new Error("Invalid attendance code");
//     }

//     const now = Date.now();
//     if (now < session.startTime || now > session.endTime || !session.isActive) {
//       throw new Error("Attendance session is not active");
//     }

//     // Check if student is enrolled in the course
//     const course = await ctx.db.get(session.courseId);
//     if (!course) {
//       throw new Error("Course not found");
//     }

//     const studentData = course.studentsData.find(s => s.linkedUserId === userId);
//     if (!studentData) {
//       throw new Error("You are not enrolled in this course");
//     }

//     // Check GPS proximity
//     const distance = calculateDistance(
//       session.gpsCoordinates.latitude,
//       session.gpsCoordinates.longitude,
//       args.gpsCoordinates.latitude,
//       args.gpsCoordinates.longitude
//     );

//     if (distance > session.radiusMeters) {
//       throw new Error("You are not within the required location radius");
//     }

//     // Check if already checked in
//     const existingRecord = await ctx.db
//       .query("attendanceRecords")
//       .withIndex("by_session", (q) => q.eq("sessionId", session._id))
//       .filter((q) => q.eq(q.field("studentId"), userId))
//       .unique();

//     if (existingRecord) {
//       throw new Error("You have already checked in for this session");
//     }

//     // Create attendance record
//     const recordId = await ctx.db.insert("attendanceRecords", {
//       sessionId: session._id,
//       studentId: userId,
//       courseId: session.courseId,
//       status: "present",
//       checkedInAt: now,
//       gpsCoordinates: args.gpsCoordinates,
//     });

//     return recordId;
//   },
// });

// export const getAttendanceRecords = query({
//   args: { courseId: v.id("courses") },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       return [];
//     }

//     const course = await ctx.db.get(args.courseId);
//     if (!course) {
//       return [];
//     }

//     // Check if user is lecturer or enrolled student
//     const isLecturer = course.lecturerId === userId;
//     const isEnrolledStudent = course.studentsData.some(s => s.linkedUserId === userId);

//     if (!isLecturer && !isEnrolledStudent) {
//       throw new Error("Unauthorized");
//     }

//     const sessions = await ctx.db
//       .query("attendanceSessions")
//       .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
//       .collect();

//     const records = [];
//     for (const session of sessions) {
//       const sessionRecords = await ctx.db
//         .query("attendanceRecords")
//         .withIndex("by_session", (q) => q.eq("sessionId", session._id))
//         .collect();

//       const recordsWithStudentInfo = [];
//       for (const record of sessionRecords) {
//         const studentProfile = await ctx.db
//           .query("userProfiles")
//           .withIndex("by_user_id", (q) => q.eq("userId", record.studentId))
//           .unique();

//         if (studentProfile) {
//           recordsWithStudentInfo.push({
//             ...record,
//             studentProfile,
//           });
//         }
//       }

//       records.push({
//         session,
//         records: recordsWithStudentInfo,
//       });
//     }

//     return records;
//   },
// });

// export const endAttendanceSession = mutation({
//   args: { sessionId: v.id("attendanceSessions") },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const session = await ctx.db.get(args.sessionId);
//     if (!session || session.lecturerId !== userId) {
//       throw new Error("Unauthorized");
//     }

//     await ctx.db.patch(args.sessionId, {
//       isActive: false,
//     });

//     return true;
//   },
// });
