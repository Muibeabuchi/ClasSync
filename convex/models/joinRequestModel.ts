import { ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { QueryCtx } from '../_generated/server';

export const ensureValidJoinRequestOrThrow = async ({
  ctx,
  joinRequestId,
}: {
  ctx: QueryCtx;
  joinRequestId: Id<'joinRequests'>;
}) => {
  const joinRequest = await ctx.db.get(joinRequestId);
  if (!joinRequest) throw new ConvexError('The Join Request does not Exist');
  return joinRequest;
};
