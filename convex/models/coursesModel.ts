import { ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';

export async function generateUniqueCourseCode(
  ctx: MutationCtx,
  initialCourseCode: string,
  maxAttempts: number = 10,
): Promise<string> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const courseCode = generateCourseCode(initialCourseCode);

    // Check if this course code already exists
    const existingCourse = await ctx.db
      .query('courses')
      .withIndex('by_courseCode', (q) => q.eq('courseCode', courseCode))
      .unique();

    if (!existingCourse) {
      return courseCode;
    }

    attempts++;
  }

  throw new ConvexError(
    `Unable to generate unique course code after ${maxAttempts} attempts. Please try a different initial course code.`,
  );
}

function generateCourseCode(courseCode: string): string {
  // Remove non-alphanumeric characters from course code and limit it to 5 characters
  const cleanCourseCode = courseCode
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 5);

  // Calculate how many random characters we need
  const randomCharsNeeded = 10 - cleanCourseCode.length;

  // Generate random alphanumeric characters
  const randomChars = generateRandomAlphanumeric(randomCharsNeeded);
  // Concatenate and return a 10-character alphanumeric code
  return cleanCourseCode + randomChars;
}

// Function to generate random alphanumeric characters
function generateRandomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function validateCourseCodeUniqueness(
  ctx: MutationCtx,
  courseCode: string,
  excludeCourseId?: Id<'courses'>,
): Promise<boolean> {
  const existingCourse = await ctx.db
    .query('courses')
    .withIndex('by_courseCode', (q) => q.eq('courseCode', courseCode))
    .unique();

  // If no existing course found, code is unique
  if (!existingCourse) {
    return true;
  }

  // If we're updating an existing course, exclude it from the check
  if (excludeCourseId && existingCourse._id === excludeCourseId) {
    return true;
  }

  return false;
}

export async function checkCourseCodeExists(
  ctx: MutationCtx,
  courseCode: string,
): Promise<boolean> {
  const existingCourse = await ctx.db
    .query('courses')
    .withIndex('by_courseCode', (q) => q.eq('courseCode', courseCode))
    .unique();

  return !!existingCourse;
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
