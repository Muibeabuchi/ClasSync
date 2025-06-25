import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Enhanced join request with student linking
export const createJoinRequest = mutation({
  args: {
    courseId: v.id("courses"),
    joinCode: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    
    if (!profile || profile.role !== "student") {
      throw new Error("Only students can request to join courses");
    }

    // Find course by join code
    const course = await ctx.db
      .query("courses")
      .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode))
      .first();

    if (!course) {
      throw new Error("Invalid join code");
    }

    if (course._id !== args.courseId) {
      throw new Error("Course ID mismatch");
    }

    // Check if already requested
    const existingRequest = await ctx.db
      .query("joinRequests")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .first();

    if (existingRequest) {
      throw new Error("Join request already exists");
    }

    // Check if already linked
    const isAlreadyLinked = course.attendanceList.some(
      student => student.linkedUserId === userId
    );

    if (isAlreadyLinked) {
      throw new Error("You are already enrolled in this course");
    }

    const requestId = await ctx.db.insert("joinRequests", {
      studentId: userId,
      courseId: args.courseId,
      status: "pending",
      requestedAt: Date.now(),
      message: args.message,
    });

    return { requestId, courseName: course.courseName };
  },
});

// Link student to attendance list entry
export const linkStudentToAttendanceEntry = mutation({
  args: {
    requestId: v.id("joinRequests"),
    registrationNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    
    if (!profile || profile.role !== "lecturer") {
      throw new Error("Only lecturers can link students");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Join request not found");
    }

    const course = await ctx.db.get(request.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    if (course.lecturerId !== userId) {
      throw new Error("Access denied");
    }

    // Find the attendance entry
    const attendanceEntryIndex = course.attendanceList.findIndex(
      student => student.registrationNumber === args.registrationNumber && !student.isLinked
    );

    if (attendanceEntryIndex === -1) {
      throw new Error("Attendance entry not found or already linked");
    }

    // Update attendance list
    const updatedAttendanceList = [...course.attendanceList];
    updatedAttendanceList[attendanceEntryIndex] = {
      ...updatedAttendanceList[attendanceEntryIndex],
      isLinked: true,
      linkedUserId: request.studentId,
    };

    await ctx.db.patch(request.courseId, {
      attendanceList: updatedAttendanceList,
      updatedAt: Date.now(),
    });

    // Update join request
    await ctx.db.patch(args.requestId, {
      status: "approved",
      linkedTo: args.registrationNumber,
      processedAt: Date.now(),
      processedBy: userId,
    });

    // Send notification to student
    await ctx.db.insert("notifications", {
      userId: request.studentId,
      type: "join_approved",
      title: "Join Request Approved",
      message: `Your request to join ${course.courseName} has been approved. You are now enrolled in the course.`,
      data: { courseId: request.courseId, requestId: args.requestId },
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Reject join request
export const rejectJoinRequest = mutation({
  args: {
    requestId: v.id("joinRequests"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    
    if (!profile || profile.role !== "lecturer") {
      throw new Error("Only lecturers can reject requests");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Join request not found");
    }

    const course = await ctx.db.get(request.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    if (course.lecturerId !== userId) {
      throw new Error("Access denied");
    }

    // Update join request
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      processedAt: Date.now(),
      processedBy: userId,
      message: args.reason,
    });

    // Send notification to student
    await ctx.db.insert("notifications", {
      userId: request.studentId,
      type: "join_rejected",
      title: "Join Request Rejected",
      message: `Your request to join ${course.courseName} has been rejected.${args.reason ? ` Reason: ${args.reason}` : ''}`,
      data: { courseId: request.courseId, requestId: args.requestId },
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Get join requests for a course
export const getCourseJoinRequests = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    if (course.lecturerId !== userId) {
      throw new Error("Access denied");
    }

    const requests = await ctx.db
      .query("joinRequests")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Get student profiles
    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        const student = await ctx.db.get(request.studentId);
        return {
          ...request,
          studentProfile: student,
        };
      })
    );

    return requestsWithProfiles;
  },
});

// Get unlinked attendance entries for a course
export const getUnlinkedAttendanceEntries = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    if (course.lecturerId !== userId) {
      throw new Error("Access denied");
    }

    return course.attendanceList.filter(student => !student.isLinked);
  },
});

// Get student's join requests
export const getMyJoinRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const requests = await ctx.db
      .query("joinRequests")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .collect();

    // Get course details
    const requestsWithCourses = await Promise.all(
      requests.map(async (request) => {
        const course = await ctx.db.get(request.courseId);
        return {
          ...request,
          course,
        };
      })
    );

    return requestsWithCourses;
  },
});
