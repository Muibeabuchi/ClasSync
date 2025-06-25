// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";
// import { getAuthUserId } from "@convex-dev/auth/server";

// // Manual student actions for lecturers
// export const resetStudentAttendance = mutation({
//   args: {
//     studentId: v.id("users"),
//     courseId: v.id("courses"),
//     reason: v.optional(v.string()),
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

//     // Reset student course stats
//     const studentStat = await ctx.db
//       .query("studentCourseStats")
//       .withIndex("by_student_course", (q) => q.eq("studentId", args.studentId).eq("courseId", args.courseId))
//       .unique();

//     if (!studentStat) {
//       throw new Error("Student not found in course");
//     }

//     await ctx.db.patch(studentStat._id, {
//       attendancePercentage: 0,
//       sessionsAttended: 0,
//       lastAttendanceDate: undefined,
//     });

//     // Delete all attendance records for this student in this course
//     const attendanceRecords = await ctx.db
//       .query("attendanceRecords")
//       .withIndex("by_student_course", (q) => q.eq("studentId", args.studentId).eq("courseId", args.courseId))
//       .collect();

//     for (const record of attendanceRecords) {
//       await ctx.db.delete(record._id);
//     }

//     // Send notification to student
//     await ctx.db.insert("notifications", {
//       recipientId: args.studentId,
//       senderId: userId,
//       courseId: args.courseId,
//       title: "Attendance Reset",
//       message: `Your attendance for ${course.courseName} has been reset by your lecturer.${args.reason ? ` Reason: ${args.reason}` : ''}`,
//       type: "warning",
//       isRead: false,
//       createdAt: Date.now(),
//     });

//     return true;
//   },
// });

// export const removeStudentFromCourse = mutation({
//   args: {
//     studentId: v.id("users"),
//     courseId: v.id("courses"),
//     reason: v.optional(v.string()),
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

//     // Update student status to dropped
//     const studentStat = await ctx.db
//       .query("studentCourseStats")
//       .withIndex("by_student_course", (q) => q.eq("studentId", args.studentId).eq("courseId", args.courseId))
//       .unique();

//     if (!studentStat) {
//       throw new Error("Student not found in course");
//     }

//     await ctx.db.patch(studentStat._id, {
//       status: "dropped",
//     });

//     // Unlink from attendance list
//     const attendanceEntry = await ctx.db
//       .query("attendanceList")
//       .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
//       .filter((q) => q.eq(q.field("linkedStudentId"), args.studentId))
//       .unique();

//     if (attendanceEntry) {
//       await ctx.db.patch(attendanceEntry._id, {
//         linkedStudentId: undefined,
//         isLinked: false,
//       });
//     }

//     // Send notification to student
//     await ctx.db.insert("notifications", {
//       recipientId: args.studentId,
//       senderId: userId,
//       courseId: args.courseId,
//       title: "Removed from Course",
//       message: `You have been removed from ${course.courseName}.${args.reason ? ` Reason: ${args.reason}` : ''}`,
//       type: "warning",
//       isRead: false,
//       createdAt: Date.now(),
//     });

//     return true;
//   },
// });

// export const addStudentNote = mutation({
//   args: {
//     studentId: v.id("users"),
//     courseId: v.id("courses"),
//     note: v.string(),
//     isPrivate: v.boolean(),
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

//     // For now, we'll store notes as notifications with a special type
//     // In a full implementation, you might want a separate notes table
//     const noteId = await ctx.db.insert("notifications", {
//       recipientId: args.isPrivate ? userId : args.studentId, // Private notes go to lecturer
//       senderId: userId,
//       courseId: args.courseId,
//       title: args.isPrivate ? "Private Note Added" : "Note from Lecturer",
//       message: args.note,
//       type: "info",
//       isRead: false,
//       createdAt: Date.now(),
//     });

//     return noteId;
//   },
// });

// // Send direct message to student
// export const sendDirectMessageToStudent = mutation({
//   args: {
//     studentId: v.id("users"),
//     courseId: v.optional(v.id("courses")),
//     subject: v.string(),
//     body: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     // Verify lecturer has access to student (through course)
//     if (args.courseId) {
//       const course = await ctx.db.get(args.courseId);
//       if (!course || course.lecturerId !== userId) {
//         throw new Error("Unauthorized");
//       }

//       const studentStat = await ctx.db
//         .query("studentCourseStats")
//         .withIndex("by_student_course", (q) => q.eq("studentId", args.studentId).eq("courseId", args.courseId!))
//         .unique();

//       if (!studentStat) {
//         throw new Error("Student not found in course");
//       }
//     }

//     const messageId = await ctx.db.insert("messages", {
//       senderId: userId,
//       recipientIds: [args.studentId],
//       courseId: args.courseId,
//       subject: args.subject,
//       body: args.body,
//       type: "direct",
//       isRead: [{ userId: args.studentId }],
//       createdAt: Date.now(),
//     });

//     return messageId;
//   },
// });

// // Get student performance summary
// export const getStudentPerformanceSummary = query({
//   args: { studentId: v.id("users") },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     // Get all courses where this lecturer teaches this student
//     const studentStats = await ctx.db
//       .query("studentCourseStats")
//       .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
//       .collect();

//     const lecturerCourses = [];
//     for (const stat of studentStats) {
//       const course = await ctx.db.get(stat.courseId);
//       if (course && course.lecturerId === userId) {
//         lecturerCourses.push({
//           ...stat,
//           course,
//         });
//       }
//     }

//     if (lecturerCourses.length === 0) {
//       throw new Error("No courses found for this student with current lecturer");
//     }

//     // Calculate overall performance
//     const totalSessions = lecturerCourses.reduce((sum, c) => sum + c.totalSessions, 0);
//     const totalAttended = lecturerCourses.reduce((sum, c) => sum + c.sessionsAttended, 0);
//     const overallAttendancePercentage = totalSessions > 0 ? (totalAttended / totalSessions) * 100 : 0;

//     // Get recent attendance records
//     const recentAttendance = await ctx.db
//       .query("attendanceRecords")
//       .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
//       .order("desc")
//       .take(10);

//     const studentProfile = await ctx.db
//       .query("userProfiles")
//       .withIndex("by_user_id", (q) => q.eq("userId", args.studentId))
//       .unique();

//     return {
//       studentProfile,
//       courses: lecturerCourses,
//       overallStats: {
//         totalCourses: lecturerCourses.length,
//         totalSessions,
//         totalAttended,
//         overallAttendancePercentage,
//       },
//       recentAttendance,
//     };
//   },
// });
