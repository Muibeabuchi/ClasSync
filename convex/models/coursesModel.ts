import { ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';

export function generateCourseCode(
  courseCode: string,
  lecturerId: string,
): string {
  // Remove non-alphanumeric characters from course code and limit it to 6 characters
  const cleanCourseCode = courseCode
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6);

  // Generate a simple hash from the lecturerId
  const hash = simpleHash(lecturerId)
    .toString(36)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4);

  // Concatenate and return a 10-character alphanumeric code
  return (cleanCourseCode + hash).slice(0, 10);
}

// Simple deterministic hash function for string input
function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export async function updateLecturerConsumption({
  ctx,
  lecturerId,
  method,
}: {
  ctx: MutationCtx;
  lecturerId: Id<'userProfiles'>;
  method: 'insert' | 'delete';
}) {
  const lecturerConsumption = await ctx.db
    .query('lecturerConsumption')
    .withIndex('by_lecturerId', (q) => q.eq('lecturerId', lecturerId))
    .unique();
  if (!lecturerConsumption)
    throw new ConvexError('lECTURER"s Consumption DOES NOT EXIST');

  // create a new entry in the lecturers course count
  await ctx.db.patch(lecturerConsumption._id, {
    createdCourseCount:
      method === 'insert'
        ? lecturerConsumption.createdCourseCount + 1
        : lecturerConsumption.createdCourseCount - 1,
  });
}
