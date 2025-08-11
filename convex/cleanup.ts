import { internalMutation } from './_generated/server';

export const cleanupDuplicatePendingRequests = internalMutation({
  handler: async (ctx) => {
    // Get all join requests
    const allRequests = await ctx.db.query('joinRequests').collect();

    // Group by student and course to find duplicates
    const duplicates: Record<string, any[]> = {};

    for (const request of allRequests) {
      const key = `${request.studentId}-${request.courseId}`;
      if (!duplicates[key]) {
        duplicates[key] = [];
      }
      duplicates[key].push(request);
    }

    let deletedCount = 0;

    // For each group, keep only the most recent pending request
    for (const [key, requests] of Object.entries(duplicates)) {
      const pendingRequests = requests.filter((r) => r.status === 'pending');

      if (pendingRequests.length > 1) {
        // Sort by creation time (newest first)
        pendingRequests.sort((a, b) => b._creationTime - a._creationTime);

        // Delete all but the most recent
        const toDelete = pendingRequests.slice(1);

        for (const request of toDelete) {
          await ctx.db.delete(request._id);
          deletedCount++;
        }
      }
    }

    return {
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} duplicate pending requests`,
    };
  },
});
