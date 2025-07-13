import { ConvexError } from 'convex/values';
import { Doc, Id } from '../_generated/dataModel';
import { QueryCtx } from '../_generated/server';

export async function ensureLecturerClassListAccess({
  ctx,
  classListId,
  lecturerId,
}: {
  ctx: QueryCtx;
  classListId: Id<'classLists'>;
  lecturerId: Id<'userProfiles'>;
}) {
  const classList = await ctx.db.get(classListId);
  if (!classList) {
    throw new ConvexError('ClassList not found');
  }

  if (classList.lecturerId !== lecturerId) {
    throw new ConvexError('Access denied');
  }

  return classList;
}

export async function populateClassListWithNumberOfStudents({
  ctx,
  classLists,
}: {
  ctx: QueryCtx;
  classLists: Doc<'classLists'>[];
}): Promise<
  (Doc<'classLists'> & {
    numberOfStudent: number;
  })[]
> {
  return await Promise.all(
    classLists.map(async (classList) => {
      // grab the number of students in a classList
      const classListStudentLength = (
        await ctx.db
          .query('classListStudents')
          .withIndex('by_classListId', (q) =>
            q.eq('classListId', classList._id),
          )
          .collect()
      ).length;

      return {
        ...classList,
        numberOfStudent: classListStudentLength,
      };
    }),
  );
}

export async function ensureClassListExists({
  ctx,
  classListId,
  lecturerId,
}: {
  classListId: Id<'classLists'>;
  lecturerId: Id<'userProfiles'>;
  ctx: QueryCtx;
}) {
  const classList = await ctx.db.get(classListId);
  if (!classList) return null;
  if (classList.lecturerId !== lecturerId) return null;
  return classList;
}

export async function getClassListStudents({
  classListId,
  ctx,
}: {
  ctx: QueryCtx;
  classListId: Id<'classLists'>;
}): Promise<Doc<'classListStudents'>[]> {
  return await ctx.db
    .query('classListStudents')
    .withIndex('by_classListId', (q) => q.eq('classListId', classListId))
    .collect();
}
