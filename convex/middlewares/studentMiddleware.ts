import { customMutation } from 'convex-helpers/server/customFunctions';
import { ConvexError } from 'convex/values';
import { getCurrentUser } from '../models/userprofileModel';
import { mutation } from '../_generated/server';

export const StudentMutationMiddleware = customMutation(mutation, {
  args: {},
  async input(ctx) {
    const user = await getCurrentUser({ ctx });

    if (!user)
      throw new ConvexError(
        'Unauthorized: User must be authenticated to take this action',
      );

    if (user.role !== 'student')
      throw new ConvexError('Unauthorized: User must be a lecturer');

    return { ctx: { user }, args: {} };
  },
});
