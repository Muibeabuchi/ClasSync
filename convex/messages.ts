import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: {
    recipientIds: v.array(v.id("users")),
    courseId: v.optional(v.id("courses")),
    subject: v.string(),
    body: v.string(),
    type: v.union(v.literal("broadcast"), v.literal("direct")),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is a lecturer for broadcast messages
    if (args.type === "broadcast" && args.courseId) {
      const course = await ctx.db.get(args.courseId);
      if (!course || course.lecturerId !== userId) {
        throw new Error("Only course lecturers can send broadcast messages");
      }
    }

    const messageId = await ctx.db.insert("messages", {
      senderId: userId,
      recipientIds: args.recipientIds,
      courseId: args.courseId,
      subject: args.subject,
      body: args.body,
      type: args.type,
      isRead: args.recipientIds.map(id => ({ userId: id })),
      createdAt: Date.now(),
      parentMessageId: args.parentMessageId,
    });

    return messageId;
  },
});

export const getInboxMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    // Filter messages where user is sender or recipient
    const userMessages = messages.filter(msg => 
      msg.senderId === userId || msg.recipientIds.includes(userId)
    );

    const messagesWithSenderInfo = [];
    for (const message of userMessages) {
      const senderProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", message.senderId))
        .unique();

      const courseInfo = message.courseId ? await ctx.db.get(message.courseId) : null;

      messagesWithSenderInfo.push({
        ...message,
        senderProfile,
        courseInfo,
        isReadByUser: message.isRead.find(r => r.userId === userId)?.readAt !== undefined,
      });
    }

    return messagesWithSenderInfo;
  },
});

export const getSentMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", userId))
      .order("desc")
      .collect();

    const messagesWithRecipientInfo = [];
    for (const message of messages) {
      const recipientProfiles = [];
      for (const recipientId of message.recipientIds) {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", recipientId))
          .unique();
        if (profile) {
          recipientProfiles.push(profile);
        }
      }

      const courseInfo = message.courseId ? await ctx.db.get(message.courseId) : null;

      messagesWithRecipientInfo.push({
        ...message,
        recipientProfiles,
        courseInfo,
      });
    }

    return messagesWithRecipientInfo;
  },
});

export const markMessageAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Check if user is a recipient
    if (!message.recipientIds.includes(userId)) {
      throw new Error("Unauthorized");
    }

    const updatedIsRead = message.isRead.map(readStatus => 
      readStatus.userId === userId 
        ? { ...readStatus, readAt: Date.now() }
        : readStatus
    );

    await ctx.db.patch(args.messageId, {
      isRead: updatedIsRead,
    });

    return true;
  },
});

export const getCourseStudents = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const course = await ctx.db.get(args.courseId);
    if (!course || course.lecturerId !== userId) {
      throw new Error("Unauthorized");
    }

    const students = [];
    for (const studentData of course.studentsData) {
      if (studentData.isLinked && studentData.linkedUserId) {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", studentData.linkedUserId!))
          .unique();
        if (profile) {
          students.push(profile);
        }
      }
    }

    return students;
  },
});
