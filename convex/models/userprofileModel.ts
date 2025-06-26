import { Id } from '../_generated/dataModel';
import { query, QueryCtx } from '../_generated/server';
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

// TODO:RELOCATE TO ACTUAL API ENDPOINT
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth - email, name, image, etc.
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
      return null;
    }
    // Get user data from your application's database
    // (skip this if you have no fields in your users table schema)
    const user = await ctx.db.get(userMetadata.userId as Id<'userProfiles'>);
    return {
      ...user,
      ...userMetadata,
    };
  },
});
