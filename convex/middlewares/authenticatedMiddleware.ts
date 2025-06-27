import {
  customCtx,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions';
import {
  ConvexError,
  //  v
} from 'convex/values';
import { getCurrentUser } from '../models/userprofileModel';
import { mutation, query } from '../_generated/server';

export const AuthenticatedUserQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await getCurrentUser({ ctx });

    if (!user)
      throw new ConvexError(
        'Unauthorized:User must be authenticated to make this call',
      );
    return { user };
  }),
);

export const AuthenticatedUserMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const user = await getCurrentUser({ ctx });

    if (!user)
      throw new ConvexError(
        'Unauthorized: User must be authenticated to take this action',
      );

    return { ctx: { userId: user._id, user }, args: {} };
  },
});
