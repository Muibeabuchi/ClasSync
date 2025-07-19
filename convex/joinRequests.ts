// import { mutation, query } from './_generated/server';
// import { v } from 'convex/values';
// // import { getAuthUserId } from "@convex-dev/auth/server";

// export const rejectJoinRequest = mutation({
//   args: {
//     requestId: v.id('joinRequests'),
//     reason: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error('Not authenticated');
//     }

//     const request = await ctx.db.get(args.requestId);
//     if (!request) {
//       throw new Error('Request not found');
//     }

//     const course = await ctx.db.get(request.courseId);
//     if (!course || course.lecturerId !== userId) {
//       throw new Error('Unauthorized');
//     }

//     await ctx.db.patch(args.requestId, {
//       status: 'rejected',
//       rejectionReason: args.reason,
//     });

//     return true;
//   },
// });

// export const getAllJoinRequestsForLecturer = query({
//   args: {},
//   handler: async (ctx) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       return [];
//     }

//     // Get all courses for this lecturer
//     const courses = await ctx.db
//       .query('courses')
//       .withIndex('by_lecturer', (q) => q.eq('lecturerId', userId))
//       .collect();

//     const allRequests = [];
//     for (const course of courses) {
//       const requests = await ctx.db
//         .query('joinRequests')
//         .withIndex('by_course', (q) => q.eq('courseId', course._id))
//         .filter((q) => q.eq(q.field('status'), 'pending'))
//         .collect();

//       const requestsWithStudentInfo = [];
//       for (const request of requests) {
//         const studentProfile = await ctx.db
//           .query('userProfiles')
//           .withIndex('by_user_id', (q) => q.eq('userId', request.studentId))
//           .unique();

//         if (studentProfile) {
//           requestsWithStudentInfo.push({
//             ...request,
//             studentProfile,
//             course,
//           });
//         }
//       }

//       allRequests.push({
//         course,
//         requests: requestsWithStudentInfo,
//       });
//     }

//     return allRequests.filter((item) => item.requests.length > 0);
//   },
// });

// export const getUnlinkedStudentsForCourse = query({
//   args: { courseId: v.id('courses') },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       return [];
//     }

//     const course = await ctx.db.get(args.courseId);
//     if (!course || course.lecturerId !== userId) {
//       throw new Error('Unauthorized');
//     }

//     return course.studentsData.filter((student) => !student.isLinked);
//   },
// });
