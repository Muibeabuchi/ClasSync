// import { QueryCtx } from './../_generated/server.d';
import { ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { MutationCtx, QueryCtx } from '../_generated/server';
import { betterAuthComponent } from '../auth';

// Example function for getting the current user
// Feel free to edit, omit, etc.

export const getCurrentUser = async ({
  ctx,
}: {
  ctx: QueryCtx | MutationCtx;
}) => {
  // Get user data from Better Auth - email, name, image, etc.
  const userMetadata = await betterAuthComponent.getAuthUser(ctx);
  if (!userMetadata) {
    return null;
  }
  // Get user data from your application's database
  // (skip this if you have no fields in your users table schema)
  const user = await ctx.db.get(userMetadata.userId as Id<'userProfiles'>);
  if (!user) return null;
  return {
    ...user,
    ...userMetadata,
  };
  // },
};

export const ensureIsLecturer = async (ctx: MutationCtx) => {
  const user = await getCurrentUser({ ctx });

  if (!user)
    throw new ConvexError(
      'Unauthorized: User must be authenticated to take this action',
    );

  if (user.role !== 'lecturer')
    throw new ConvexError('Unauthorized: User must bea lecturer');

  return user;
};
