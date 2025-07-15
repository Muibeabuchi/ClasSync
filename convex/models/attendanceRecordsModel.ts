import { ConvexError } from 'convex/values';
import { Doc } from '../_generated/dataModel';
import { QueryCtx } from '../_generated/server';

export async function populateAttendanceRecordWithStudent({
  ctx,
  attendanceRecords,
}: {
  ctx: QueryCtx;
  attendanceRecords: Doc<'attendanceRecords'>[];
}) {
  return Promise.all(
    attendanceRecords.map(async (record) => {
      const student = await ctx.db.get(record.studentId);
      if (!student) throw new ConvexError('Student does not exist');

      return {
        ...record,
        student,
      };
    }),
  );
}
