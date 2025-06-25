import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate a random join code
function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const createCourse = mutation({
  args: {
    courseName: v.string(),
    courseCode: v.string(),
    department: v.string(),
    year: v.string(),
    studentsData: v.array(v.object({
      name: v.string(),
      gender: v.string(),
      registrationNumber: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is a lecturer
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "lecturer") {
      throw new Error("Only lecturers can create courses");
    }

    // Check if course code already exists
    const existingCourse = await ctx.db
      .query("courses")
      .withIndex("by_course_code", (q) => q.eq("courseCode", args.courseCode))
      .unique();

    if (existingCourse) {
      throw new Error("Course code already exists");
    }

    const joinCode = generateJoinCode();
    
    const courseId = await ctx.db.insert("courses", {
      lecturerId: userId,
      courseName: args.courseName,
      courseCode: args.courseCode,
      joinCode,
      status: "active",
      department: args.department,
      year: args.year,
      studentsData: args.studentsData.map(student => ({
        ...student,
        isLinked: false,
      })),
      createdAt: Date.now(),
    });

    // Create attendance list entries
    for (const student of args.studentsData) {
      await ctx.db.insert("attendanceList", {
        courseId,
        name: student.name,
        gender: student.gender,
        registrationNumber: student.registrationNumber,
        isLinked: false,
        uploadedAt: Date.now(),
      });
    }

    return courseId;
  },
});

export const getMyCourses = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      return [];
    }

    if (profile.role === "lecturer") {
      if (args.status) {
        return await ctx.db
          .query("courses")
          .withIndex("by_lecturer_status", (q) => q.eq("lecturerId", userId).eq("status", args.status as "active" | "archived" | "completed"))
          .collect();
      } else {
        return await ctx.db
          .query("courses")
          .withIndex("by_lecturer", (q) => q.eq("lecturerId", userId))
          .collect();
      }
    } else {
      // For students, get approved courses
      const approvedRequests = await ctx.db
        .query("joinRequests")
        .withIndex("by_student", (q) => q.eq("studentId", userId))
        .filter((q) => q.eq(q.field("status"), "approved"))
        .collect();

      const courses = [];
      for (const request of approvedRequests) {
        const course = await ctx.db.get(request.courseId);
        if (course) {
          courses.push(course);
        }
      }
      return courses;
    }
  },
});

export const searchCourse = query({
  args: { courseCode: v.string() },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_course_code", (q) => q.eq("courseCode", args.courseCode))
      .unique();

    if (!course || course.status !== "active") {
      return null;
    }

    return {
      _id: course._id,
      courseName: course.courseName,
      courseCode: course.courseCode,
    };
  },
});

export const requestToJoinCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course || course.status !== "active") {
      throw new Error("Course not available for enrollment");
    }

    // Check if request already exists
    const existingRequest = await ctx.db
      .query("joinRequests")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .unique();

    if (existingRequest) {
      throw new Error("Join request already exists");
    }

    const requestId = await ctx.db.insert("joinRequests", {
      courseId: args.courseId,
      studentId: userId,
      status: "pending",
      requestedAt: Date.now(),
    });

    return requestId;
  },
});

export const getJoinRequests = query({
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

    const requests = await ctx.db
      .query("joinRequests")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithStudentInfo = [];
    for (const request of requests) {
      const studentProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", request.studentId))
        .unique();

      if (studentProfile) {
        requestsWithStudentInfo.push({
          ...request,
          studentProfile,
        });
      }
    }

    return requestsWithStudentInfo;
  },
});

export const approveJoinRequest = mutation({
  args: { 
    requestId: v.id("joinRequests"),
    registrationNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    const course = await ctx.db.get(request.courseId);
    if (!course || course.lecturerId !== userId) {
      throw new Error("Unauthorized");
    }

    // Find and link attendance list entry
    const attendanceEntry = await ctx.db
      .query("attendanceList")
      .withIndex("by_course", (q) => q.eq("courseId", request.courseId))
      .filter((q) => q.eq(q.field("registrationNumber"), args.registrationNumber))
      .unique();

    if (!attendanceEntry) {
      throw new Error("Registration number not found in attendance list");
    }

    if (attendanceEntry.isLinked) {
      throw new Error("This attendance entry is already linked to another student");
    }

    // Link the attendance entry
    await ctx.db.patch(attendanceEntry._id, {
      linkedStudentId: request.studentId,
      isLinked: true,
    });

    // Update the course studentsData
    const updatedStudentsData = course.studentsData.map(student => {
      if (student.registrationNumber === args.registrationNumber) {
        return {
          ...student,
          isLinked: true,
          linkedUserId: request.studentId,
        };
      }
      return student;
    });

    await ctx.db.patch(request.courseId, {
      studentsData: updatedStudentsData,
    });

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "approved",
      processedAt: Date.now(),
      linkedAttendanceListId: attendanceEntry._id,
    });

    // Create student course stats
    await ctx.db.insert("studentCourseStats", {
      studentId: request.studentId,
      courseId: request.courseId,
      attendancePercentage: 0,
      sessionsAttended: 0,
      totalSessions: 0,
      firstJoinDate: Date.now(),
      status: "active",
    });

    // Send notification to student
    await ctx.db.insert("notifications", {
      recipientId: request.studentId,
      senderId: userId,
      courseId: request.courseId,
      title: "Enrollment Approved",
      message: `You have been accepted into ${course.courseName} (${course.courseCode})`,
      type: "enrollment",
      isRead: false,
      createdAt: Date.now(),
      actionUrl: `/dashboard`,
    });

    return true;
  },
});
