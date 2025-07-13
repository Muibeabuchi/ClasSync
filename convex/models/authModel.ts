import { ConvexError } from 'convex/values';
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
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError('User does not exist');

  // delete the lecturers subscription
  if (user.role === 'lecturer') {
    // grab the lecturers subscription
    const lecturerSubscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_lecturerId', (q) => q.eq('lecturerId', userId))
      .first();
    if (lecturerSubscription) {
      await ctx.db.delete(lecturerSubscription.lecturerId);
    }

    // get the lecturer plan
    const lecturerPlan = await ctx.db
      .query('lecturerConsumption')
      .withIndex('by_lecturerId', (q) => q.eq('lecturerId', userId))
      .unique();
    if (!lecturerPlan) throw new ConvexError('Lecturer has no plan');

    // TODO: Delete other information related to the lecturer
  }
  await ctx.db.delete(userId);
}
