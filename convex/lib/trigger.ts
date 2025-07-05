import { mutation as rawMutation } from '../_generated/server';

import { DataModel } from '../_generated/dataModel';
import { Triggers } from 'convex-helpers/server/triggers';
import {
  customCtx,
  customMutation,
} from 'convex-helpers/server/customFunctions';

// start using Triggers, with table types from schema.ts
const triggers = new Triggers<DataModel>();

// register a function to run when a `ctx.db.insert`, `ctx.db.patch`, `ctx.db.replace`, or `ctx.db.delete` changes the "users" table
triggers.register('attendanceSessions', async (ctx, change) => {
  // update the attendance count for the lecturer after creating a session

  if (change.newDoc) {
    const attendanceCount = await ctx.db
      .query('attendanceSessionCount')
      .withIndex('by_lecturerId', (q) =>
        q.eq('lecturerId', change.newDoc.lecturerId),
      )
      .unique();
    // We check if its the first session
    if (!attendanceCount) {
      await ctx.db.insert('attendanceSessionCount', {
        attendanceCount: 0,
        lecturerId: change.newDoc.lecturerId,
      });
    } else {
      await ctx.db.patch(attendanceCount._id, {
        attendanceCount: attendanceCount.attendanceCount + 1,
      });
    }
  }
  console.log(
    `attendance session count updated for lecturer ${change.newDoc?.lecturerId}`,
    change,
  );
});

// ? This mutation is used when creating attendance sessions
export const attendanceSessionMutation = customMutation(
  rawMutation,
  customCtx(triggers.wrapDB),
);
