import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user notifications with real-time updates
export const getUserNotifications = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
      .order("desc");

    if (args.unreadOnly) {
      query = query.filter((q) => q.eq(q.field("isRead"), false));
    }

    const notifications = await query.take(args.limit || 50);

    // Get course and sender info for each notification
    const notificationsWithInfo = [];
    for (const notification of notifications) {
      let courseInfo = null;
      let senderInfo = null;

      if (notification.courseId) {
        courseInfo = await ctx.db.get(notification.courseId);
      }

      if (notification.senderId) {
        const senderProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", notification.senderId!))
          .unique();
        senderInfo = senderProfile;
      }

      notificationsWithInfo.push({
        ...notification,
        courseInfo,
        senderInfo,
      });
    }

    return notificationsWithInfo;
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.recipientId !== userId) {
      throw new Error("Notification not found or unauthorized");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });

    return true;
  },
});

// Mark all notifications as read
export const markAllNotificationsAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) => q.eq("recipientId", userId).eq("isRead", false))
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
      });
    }

    return unreadNotifications.length;
  },
});

// Get unread notification count
export const getUnreadNotificationCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) => q.eq("recipientId", userId).eq("isRead", false))
      .collect();

    return unreadNotifications.length;
  },
});

// Create system notification (internal use)
export const createSystemNotification = mutation({
  args: {
    recipientId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("success"), v.literal("enrollment"), v.literal("attendance")),
    courseId: v.optional(v.id("courses")),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      recipientId: args.recipientId,
      title: args.title,
      message: args.message,
      type: args.type,
      courseId: args.courseId,
      actionUrl: args.actionUrl,
      isRead: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

// Send bulk notifications (for course announcements)
export const sendBulkNotifications = mutation({
  args: {
    recipientIds: v.array(v.id("users")),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("success"), v.literal("enrollment"), v.literal("attendance")),
    courseId: v.optional(v.id("courses")),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notificationIds = [];
    for (const recipientId of args.recipientIds) {
      const notificationId = await ctx.db.insert("notifications", {
        recipientId,
        senderId: userId,
        title: args.title,
        message: args.message,
        type: args.type,
        courseId: args.courseId,
        actionUrl: args.actionUrl,
        isRead: false,
        createdAt: Date.now(),
      });
      notificationIds.push(notificationId);
    }

    return notificationIds;
  },
});
