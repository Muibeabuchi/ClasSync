import { Id } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';

export async function createUser(
  ctx: MutationCtx,
  user: {
    name: string;
    email: string;
  },
) {
  return await ctx.db.insert('userProfiles', {
    isOnboarded: false,
    fullName: user.name,
    email: user.email,
  });
}

export async function deleteUser(ctx: MutationCtx, id: string) {
  const userId = id as Id<'userProfiles'>;

  await ctx.db.delete(userId);
}
