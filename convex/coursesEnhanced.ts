import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Create course with ClassLists
export const createCourseWithClassLists = mutation({
  args: {
    courseName: v.string(),
    courseCode: v.string(),
    description: v.optional(v.string()),
    classListIds: v.array(v.id("classLists")),
    excludedStudents: v.optional(v.array(v.object({
      classListId: v.id("classLists"),
      registrationNumber: v.string(),
      reason: v.optional(v.string()),
    }))),
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
      throw new Error("Only lecturers can create courses");
    }

    // Validate ClassLists belong to lecturer
    for (const classListId of args.classListIds) {
      const classList = await ctx.db.get(classListId);
      if (!classList || classList.lecturerId !== userId) {
        throw new Error("Invalid ClassList access");
      }
    }

    // Generate unique join code
    let joinCode: string;
    let isUnique = false;
    do {
      joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await ctx.db
        .query("courses")
        .withIndex("by_join_code", (q) => q.eq("joinCode", joinCode))
        .first();
      isUnique = !existing;
    } while (!isUnique);

    // Generate attendance list from ClassLists
    const attendanceList = await generateAttendanceListFromClassLists(
      ctx,
      args.classListIds,
      args.excludedStudents || []
    );

    const courseId = await ctx.db.insert("courses", {
      courseName: args.courseName,
      courseCode: args.courseCode,
      description: args.description,
      lecturerId: userId,
      joinCode,
      classListIds: args.classListIds,
      excludedStudents: args.excludedStudents || [],
      attendanceList,
      isAttendanceListLocked: false,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { courseId, joinCode };
  },
});

// Helper function to generate attendance list
async function generateAttendanceListFromClassLists(
  ctx: any,
  classListIds: string[],
  excludedStudents: Array<{
    classListId: string;
    registrationNumber: string;
    reason?: string;
  }>
) {
  const attendanceList = [];
  const seenRegistrationNumbers = new Set();

  for (const classListId of classListIds) {
    const classList = await ctx.db.get(classListId);
    if (!classList) continue;

    for (const student of classList.students) {
      // Skip if already added (from another ClassList)
      if (seenRegistrationNumbers.has(student.registrationNumber)) {
        continue;
      }

      // Skip if excluded
      const isExcluded = excludedStudents.some(
        excluded => excluded.classListId === classListId && 
                   excluded.registrationNumber === student.registrationNumber
      );

      if (!isExcluded) {
        attendanceList.push({
          ...student,
          classListId,
          isLinked: false,
          linkedUserId: undefined,
        });
        seenRegistrationNumbers.add(student.registrationNumber);
      }
    }
  }

  return attendanceList;
}

// Regenerate attendance list for a course
export const regenerateAttendanceList = mutation({
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

    if (course.isAttendanceListLocked) {
      throw new Error("Attendance list is locked and cannot be regenerated");
    }

    // Preserve existing links
    const existingLinks = new Map();
    for (const student of course.attendanceList) {
      if (student.isLinked && student.linkedUserId) {
        existingLinks.set(student.registrationNumber, student.linkedUserId);
      }
    }

    // Generate new attendance list
    const newAttendanceList = await generateAttendanceListFromClassLists(
      ctx,
      course.classListIds,
      course.excludedStudents
    );

    // Restore links
    for (const student of newAttendanceList) {
      if (existingLinks.has(student.registrationNumber)) {
        student.isLinked = true;
        student.linkedUserId = existingLinks.get(student.registrationNumber);
      }
    }

    await ctx.db.patch(args.courseId, {
      attendanceList: newAttendanceList,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Lock/unlock attendance list
export const toggleAttendanceListLock = mutation({
  args: {
    courseId: v.id("courses"),
    locked: v.boolean(),
  },
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

    await ctx.db.patch(args.courseId, {
      isAttendanceListLocked: args.locked,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get course with enhanced data
export const getCourseWithDetails = query({
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

    // Get ClassLists
    const classLists = await Promise.all(
      course.classListIds.map(id => ctx.db.get(id))
    );

    // Get join requests
    const joinRequests = await ctx.db
      .query("joinRequests")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Get attendance sessions
    const sessions = await ctx.db
      .query("attendanceSessions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    return {
      course,
      classLists: classLists.filter(Boolean),
      joinRequests,
      sessions,
    };
  },
});

// Complete course and generate report
export const completeCourse = mutation({
  args: {
    courseId: v.id("courses"),
    confirmationText: v.string(),
  },
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

    if (args.confirmationText !== course.courseName) {
      throw new Error("Confirmation text does not match course name");
    }

    // TODO: Generate completion report
    // const analytics = await ctx.runQuery(api.courseManagement.getCourseAnalytics, {
    //   courseId: args.courseId,
    // });
    
    const enrolledStudents = course.attendanceList.filter((s: any) => s.isLinked);
    
    const analytics = {
      totalStudents: enrolledStudents.length,
      totalSessions: 0,
      averageAttendance: 0,
      topPerformers: [],
      bottomPerformers: [],
      sessionBreakdown: [],
    };

    await ctx.db.insert("courseReports", {
      courseId: args.courseId,
      reportType: "completion",
      data: {
        totalStudents: analytics.totalStudents,
        totalSessions: analytics.totalSessions,
        averageAttendance: analytics.averageAttendance,
        topPerformers: analytics.topPerformers,
        bottomPerformers: analytics.bottomPerformers,
        sessionBreakdown: analytics.sessionBreakdown,
      },
      generatedAt: Date.now(),
      generatedBy: userId,
    });

    // Update course status
    await ctx.db.patch(args.courseId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    // Notify all linked students
    for (const student of course.attendanceList) {
      if (student.isLinked && student.linkedUserId) {
        await ctx.db.insert("notifications", {
          userId: student.linkedUserId,
          type: "course_completed",
          title: "Course Completed",
          message: `${course.courseName} has been marked as completed. Your final attendance report is now available.`,
          data: { courseId: args.courseId },
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Get all courses by status
export const getCoursesByStatus = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let query = ctx.db
      .query("courses")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", userId));

    if (args.status) {
      const courses = await query.collect();
      return courses.filter(course => course.status === args.status);
    }

    return await query.collect();
  },
});
