// import { mutation as rawMutation } from '../_generated/server';

// import { DataModel } from '../_generated/dataModel';
// import { Triggers } from 'convex-helpers/server/triggers';
// import {
//   customCtx,
//   customMutation,
// } from 'convex-helpers/server/customFunctions';
// import { ConvexError } from 'convex/values';

// export const triggers = new Triggers<DataModel>();

// // triggers.register('courses', async (ctx, change) => {
// //   // grab the lecturer plan
// //   if (change.operation === 'insert') {
// //     const lecturerConsumption = await ctx.db
// //       .query('lecturerConsumption')
// //       .withIndex('by_lecturerId', (q) =>
// //         q.eq('lecturerId', change.newDoc.lecturerId),
// //       )
// //       .unique();
// //     if (!lecturerConsumption)
// //       throw new ConvexError('lECTURER"s Consumption DOES NOT EXIST');

// //     // create a new entry in the lecturers course count
// //     await ctx.db.patch(lecturerConsumption._id, {
// //       createdCourseCount: lecturerConsumption.createdCourseCount + 1,
// //     });
// //   }
// //   if (change.operation === 'delete') {
// //     const lecturerPlan = await ctx.db
// //       .query('lecturerConsumption')
// //       .withIndex('by_lecturerId', (q) =>
// //         q.eq('lecturerId', change.oldDoc.lecturerId),
// //       )
// //       .unique();
// //     if (!lecturerPlan) throw new ConvexError('lECTURER PLAN DOES NOT EXIST');

// //     await ctx.db.patch(lecturerPlan._id, {
// //       createdCourseCount: lecturerPlan.createdCourseCount - 1,
// //     });
// //   }
// // });

// // register a function to run when a `ctx.db.insert`, `ctx.db.patch`, `ctx.db.replace`, or `ctx.db.delete` changes the "users" table
// triggers.register('attendanceSessions', async (ctx, change) => {
//   // update the attendance count for the lecturer after creating a session

//   if (change.newDoc) {
//     const lecturerPlan = await ctx.db
//       .query('lecturerConsumption')
//       .withIndex('by_lecturerId', (q) =>
//         q.eq('lecturerId', change.newDoc.lecturerId),
//       )
//       .unique();
//     // We check if its the first session
//     if (!lecturerPlan) throw new ConvexError('LECTURER PLAN DOES NOT EXIST');
//     await ctx.db.patch(lecturerPlan._id, {
//       attendanceSessionCount: lecturerPlan.attendanceSessionCount + 1,
//     });
//   }
//   console.log(
//     `attendance session count updated for lecturer ${change.newDoc?.lecturerId}`,
//     change,
//   );
// });

// // ? This mutation is used when creating attendance sessions
// // TODO: Move this into a separate middleware file
