// import { QueryCtx } from './../_generated/server.d';
import { Id } from '../_generated/dataModel';
import { QueryCtx } from '../_generated/server';
import { betterAuthComponent } from '../auth';

// Example function for getting the current user
// Feel free to edit, omit, etc.

export async function getUserProfileId(ctx: QueryCtx) {
  const userId = await betterAuthComponent.getAuthUserId(ctx);
  if (!userId) {
    return null;
  }
  return userId;
}

export const getCurrentUser = async ({ ctx }: { ctx: QueryCtx }) => {
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
