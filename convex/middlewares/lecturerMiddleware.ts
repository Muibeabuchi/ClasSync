import { customMutation } from 'convex-helpers/server/customFunctions';
import { ConvexError } from 'convex/values';
import { mutation } from '../_generated/server';
import { getCurrentUser } from '../models/userprofileModel';

export const lecturerMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const user = await getCurrentUser({ ctx });

    if (!user)
      throw new ConvexError(
        'Unauthorized: User must be authenticated to take this action',
      );

    if (user.role !== 'lecturer')
      throw new ConvexError('Unauthorized: User must bea lecturer');

    return { ctx: { user }, args: {} };
  },
});
