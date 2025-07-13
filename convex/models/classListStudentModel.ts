import { ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { QueryCtx } from '../_generated/server';

export async function ensureValidClassListStudent({
  ctx,
  classListId,
  classListStudentId,
}: {
  ctx: QueryCtx;
  classListStudentId: Id<'classListStudents'>;
  classListId: Id<'classLists'>;
}) {
  const classListStudent = await ctx.db.get(classListStudentId);
  if (!classListStudent)
    throw new ConvexError('ClassListStudent does not exist');
  if (classListStudent.classListId !== classListId)
    throw new ConvexError(
      'Unauthorized: ClasslistStudent does not belong to this classlist',
    );

  return classListStudent;
}

export async function verifyClassListStudent({
  ctx,
  classListStudentId,
  classListId,
}: {
  ctx: QueryCtx;
  classListStudentId: Id<'classListStudents'>;
  classListId: Id<'classLists'>;
}) {
  const classListStudent = await ctx.db.get(classListStudentId);
  if (!classListStudent)
    throw new ConvexError('ClassListStudent does not exist');

  // ensure the classListStudent belongs to the classList
  if (classListStudent.classListId !== classListId)
    throw new ConvexError(
      'Unauthorized: ClassListStudent does not belong to the ClassList',
    );
  return classListStudent;
}
