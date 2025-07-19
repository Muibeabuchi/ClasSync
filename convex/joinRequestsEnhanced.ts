// import { ConvexError, v } from 'convex/values';
// import { mutation, query } from './_generated/server';
// import { courseMutation } from './middlewares/lecturerMiddleware';
// import { StudentMutationMiddleware } from './middlewares/studentMiddleware';
// // import { getAuthUserId } from "@convex-dev/auth/server";

// // // Enhanced join request with student linking

// // // Link student to attendance list entry

// // // Reject join request
// // export const rejectJoinRequest = mutation({
// //   args: {
// //     requestId: v.id("joinRequests"),
// //     reason: v.optional(v.string()),
// //   },
// //   handler: async (ctx, args) => {
// //     const userId = await getAuthUserId(ctx);
// //     if (!userId) {
// //       throw new Error("Not authenticated");
// //     }

// //     const profile = await ctx.db
// //       .query("userProfiles")
// //       .withIndex("by_user_id", (q) => q.eq("userId", userId))
// //       .unique();

// //     if (!profile || profile.role !== "lecturer") {
// //       throw new Error("Only lecturers can reject requests");
// //     }

// //     const request = await ctx.db.get(args.requestId);
// //     if (!request) {
// //       throw new Error("Join request not found");
// //     }

// //     const course = await ctx.db.get(request.courseId);
// //     if (!course) {
// //       throw new Error("Course not found");
// //     }

// //     if (course.lecturerId !== userId) {
// //       throw new Error("Access denied");
// //     }

// //     // Update join request
// //     await ctx.db.patch(args.requestId, {
// //       status: "rejected",
// //       processedAt: Date.now(),
// //       processedBy: userId,
// //       message: args.reason,
// //     });

// //     // Send notification to student
// //     await ctx.db.insert("notifications", {
// //       userId: request.studentId,
// //       type: "join_rejected",
// //       title: "Join Request Rejected",
// //       message: `Your request to join ${course.courseName} has been rejected.${args.reason ? ` Reason: ${args.reason}` : ''}`,
// //       data: { courseId: request.courseId, requestId: args.requestId },
// //       isRead: false,
// //       createdAt: Date.now(),
// //     });

// //     return { success: true };
// //   },
// // });

// // // Get join requests for a course
// // export const getCourseJoinRequests = query({
// //   args: { courseId: v.id("courses") },
// //   handler: async (ctx, args) => {
// //     const userId = await getAuthUserId(ctx);
// //     if (!userId) {
// //       throw new Error("Not authenticated");
// //     }

// //     const course = await ctx.db.get(args.courseId);
// //     if (!course) {
// //       throw new Error("Course not found");
// //     }

// //     if (course.lecturerId !== userId) {
// //       throw new Error("Access denied");
// //     }

// //     const requests = await ctx.db
// //       .query("joinRequests")
// //       .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
// //       .collect();

// //     // Get student profiles
// //     const requestsWithProfiles = await Promise.all(
// //       requests.map(async (request) => {
// //         const student = await ctx.db.get(request.studentId);
// //         return {
// //           ...request,
// //           studentProfile: student,
// //         };
// //       })
// //     );

// //     return requestsWithProfiles;
// //   },
// // });

// // // Get unlinked attendance entries for a course
// // export const getUnlinkedAttendanceEntries = query({
// //   args: { courseId: v.id("courses") },
// //   handler: async (ctx, args) => {
// //     const userId = await getAuthUserId(ctx);
// //     if (!userId) {
// //       throw new Error("Not authenticated");
// //     }

// //     const course = await ctx.db.get(args.courseId);
// //     if (!course) {
// //       throw new Error("Course not found");
// //     }

// //     if (course.lecturerId !== userId) {
// //       throw new Error("Access denied");
// //     }

// //     return course.attendanceList.filter(student => !student.isLinked);
// //   },
// // });

// // // Get student's join requests
// // export const getMyJoinRequests = query({
// //   args: {},
// //   handler: async (ctx) => {
// //     const userId = await getAuthUserId(ctx);
// //     if (!userId) {
// //       throw new Error("Not authenticated");
// //     }

// //     const requests = await ctx.db
// //       .query("joinRequests")
// //       .withIndex("by_student", (q) => q.eq("studentId", userId))
// //       .collect();

// //     // Get course details
// //     const requestsWithCourses = await Promise.all(
// //       requests.map(async (request) => {
// //         const course = await ctx.db.get(request.courseId);
// //         return {
// //           ...request,
// //           course,
// //         };
// //       })
// //     );

// //     return requestsWithCourses;
// //   },
// // });
