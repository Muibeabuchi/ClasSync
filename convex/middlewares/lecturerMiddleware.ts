import {
  customCtx,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { getCurrentUser } from '../models/userprofileModel';
import * as ClassListModel from '../models/classListModel';

export const lecturerMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const user = await getCurrentUser({ ctx });

    if (!user)
      throw new ConvexError(
        'Unauthorized: User must be authenticated to take this action',
      );

    if (user.role !== 'lecturer')
      throw new ConvexError('Unauthorized: User must be a lecturer');

    return { ctx: { user }, args: {} };
  },
});

export const ClassListMutation = customMutation(mutation, {
  args: { classListId: v.id('classLists') },
  input: async (ctx, args) => {
    const user = await getCurrentUser({ ctx });

    if (!user)
      throw new ConvexError(
        'Unauthorized: User must be authenticated to take this action',
      );

    if (user.role !== 'lecturer')
      throw new ConvexError('Unauthorized: User must be a lecturer');

    const lecturerId = user._id;

    const classList = await ClassListModel.ensureLecturerClassListAccess({
      ctx,
      classListId: args.classListId,
      lecturerId,
    });

    return {
      ctx: { user, classList },
      args: { classListId: args.classListId },
    };
  },
});

export const lecturerQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await getCurrentUser({ ctx });

    if (!user)
      throw new ConvexError(
        'Unauthorized: User must be authenticated to take this action',
      );

    if (user.role !== 'lecturer')
      throw new ConvexError('Unauthorized: User must be a lecturer');

    return { user };
  }),
);

export const classListQuery = customQuery(query, {
  args: { classListId: v.id('classLists') },
  input: async (ctx, args) => {
    const user = await getCurrentUser({ ctx });

    if (!user)
      throw new ConvexError(
        'Unauthorized: User must be authenticated to take this action',
      );

    if (user.role !== 'lecturer')
      throw new ConvexError('Unauthorized: User must be a lecturer');
    const lecturerId = user._id;

    const classList = await ClassListModel.ensureLecturerClassListAccess({
      ctx,
      classListId: args.classListId,
      lecturerId,
    });

    return { ctx: { user, classList }, args: {} };
  },
});

export const courseMutation = customMutation(mutation, {
  args: { courseId: v.id('courses') },
  async input(ctx, args) {
    const user = await getCurrentUser({ ctx });

    if (!user)
      throw new ConvexError(
        'Unauthorized: User must be authenticated to take this action',
      );

    if (user.role !== 'lecturer')
      throw new ConvexError('Unauthorized: User must be a lecturer');
    const lecturerId = user._id;

    // grab the course
    const course = await ctx.db.get(args.courseId);
    if (!course || course.lecturerId !== lecturerId)
      throw new ConvexError(
        'Unauthorized: Lecturer has no access to this course',
      );

    return { ctx: { course, user }, args: { courseId: args.courseId } };
  },
});

export const LecturerCourseQuery = customQuery(query, {
  args: { courseId: v.id('courses') },
  async input(ctx, args) {
    const user = await getCurrentUser({ ctx });

    if (!user)
      throw new ConvexError(
        'Unauthorized: User must be authenticated to take this action',
      );

    if (user.role !== 'lecturer')
      throw new ConvexError('Unauthorized: User must be a lecturer');
    const lecturerId = user._id;

    const course = await ctx.db.get(args.courseId);
    if (!course || course.lecturerId !== lecturerId)
      throw new ConvexError(
        'Unauthorized: Lecturer has no access to this course',
      );

    return { ctx: { user, course }, args: { courseId: args.courseId } };
  },
});
