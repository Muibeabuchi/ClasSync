// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";
// import { getAuthUserId } from "@convex-dev/auth/server";
// import { api } from "./_generated/api";

// // Create a new ClassList
// export const createClassList = mutation({
//   args: {
//     title: v.string(),
//     department: v.string(),
//     yearGroup: v.string(),
//     faculty: v.string(),
//     students: v.array(v.object({
//       fullName: v.string(),
//       registrationNumber: v.string(),
//       gender: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
//       faculty: v.string(),
//       department: v.string(),
//       yearLevel: v.string(),
//     })),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const profile = await ctx.db
//       .query("userProfiles")
//       .withIndex("by_user_id", (q) => q.eq("userId", userId))
//       .unique();

//     if (!profile || profile.role !== "lecturer") {
//       throw new Error("Only lecturers can create class lists");
//     }

//     // Validate unique registration numbers
//     const regNumbers = args.students.map(s => s.registrationNumber);
//     const uniqueRegNumbers = new Set(regNumbers);
//     if (regNumbers.length !== uniqueRegNumbers.size) {
//       throw new Error("Duplicate registration numbers found");
//     }

//     const classListId = await ctx.db.insert("classLists", {
//       title: args.title,
//       department: args.department,
//       yearGroup: args.yearGroup,
//       faculty: args.faculty,
//       lecturerId: userId,
//       students: args.students,
//       isActive: true,
//       createdAt: Date.now(),
//       updatedAt: Date.now(),
//     });

//     return classListId;
//   },
// });

// // Get all ClassLists for a lecturer
// export const getMyClassLists = query({
//   args: {},
//   handler: async (ctx) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const classLists = await ctx.db
//       .query("classLists")
//       .withIndex("by_lecturer", (q) => q.eq("lecturerId", userId))
//       .order("desc")
//       .collect();

//     return classLists;
//   },
// });

// // Get a specific ClassList
// export const getClassList = query({
//   args: { classListId: v.id("classLists") },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const classList = await ctx.db.get(args.classListId);
//     if (!classList) {
//       throw new Error("ClassList not found");
//     }

//     if (classList.lecturerId !== userId) {
//       throw new Error("Access denied");
//     }

//     return classList;
//   },
// });

// // Update ClassList
// export const updateClassList = mutation({
//   args: {
//     classListId: v.id("classLists"),
//     title: v.optional(v.string()),
//     department: v.optional(v.string()),
//     yearGroup: v.optional(v.string()),
//     faculty: v.optional(v.string()),
//     students: v.optional(v.array(v.object({
//       fullName: v.string(),
//       registrationNumber: v.string(),
//       gender: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
//       faculty: v.string(),
//       department: v.string(),
//       yearLevel: v.string(),
//     }))),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const classList = await ctx.db.get(args.classListId);
//     if (!classList) {
//       throw new Error("ClassList not found");
//     }

//     if (classList.lecturerId !== userId) {
//       throw new Error("Access denied");
//     }

//     const updates: any = {
//       updatedAt: Date.now(),
//     };

//     if (args.title !== undefined) updates.title = args.title;
//     if (args.department !== undefined) updates.department = args.department;
//     if (args.yearGroup !== undefined) updates.yearGroup = args.yearGroup;
//     if (args.faculty !== undefined) updates.faculty = args.faculty;
//     if (args.students !== undefined) {
//       // Validate unique registration numbers
//       const regNumbers = args.students.map(s => s.registrationNumber);
//       const uniqueRegNumbers = new Set(regNumbers);
//       if (regNumbers.length !== uniqueRegNumbers.size) {
//         throw new Error("Duplicate registration numbers found");
//       }
//       updates.students = args.students;
//     }

//     await ctx.db.patch(args.classListId, updates);

//     // Update related courses if not locked
//     const courses = await ctx.db
//       .query("courses")
//       .withIndex("by_lecturer", (q) => q.eq("lecturerId", userId))
//       .collect();

//     for (const course of courses) {
//       if (course.classListIds.includes(args.classListId) && !course.isAttendanceListLocked) {
//         // TODO: Regenerate attendance list when courses are updated
//         // await ctx.runMutation(api.coursesEnhanced.regenerateAttendanceList, {
//         //   courseId: course._id,
//         // });
//       }
//     }

//     return { success: true };
//   },
// });

// // Delete ClassList
// export const deleteClassList = mutation({
//   args: {
//     classListId: v.id("classLists"),
//     confirmationText: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const classList = await ctx.db.get(args.classListId);
//     if (!classList) {
//       throw new Error("ClassList not found");
//     }

//     if (classList.lecturerId !== userId) {
//       throw new Error("Access denied");
//     }

//     if (args.confirmationText !== classList.title) {
//       throw new Error("Confirmation text does not match ClassList title");
//     }

//     // Check if ClassList is used in any active courses
//     const courses = await ctx.db
//       .query("courses")
//       .withIndex("by_lecturer", (q) => q.eq("lecturerId", userId))
//       .collect();

//     const activeCourses = courses.filter(
//       course => course.classListIds.includes(args.classListId) && course.status === "active"
//     );

//     if (activeCourses.length > 0) {
//       throw new Error(`Cannot delete ClassList. It is used in ${activeCourses.length} active course(s)`);
//     }

//     await ctx.db.delete(args.classListId);

//     return {
//       success: true,
//       coursesAffected: courses.filter(course => course.classListIds.includes(args.classListId)).length,
//     };
//   },
// });

// // Add student to ClassList
// export const addStudentToClassList = mutation({
//   args: {
//     classListId: v.id("classLists"),
//     student: v.object({
//       fullName: v.string(),
//       registrationNumber: v.string(),
//       gender: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
//       faculty: v.string(),
//       department: v.string(),
//       yearLevel: v.string(),
//     }),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const classList = await ctx.db.get(args.classListId);
//     if (!classList) {
//       throw new Error("ClassList not found");
//     }

//     if (classList.lecturerId !== userId) {
//       throw new Error("Access denied");
//     }

//     // Check for duplicate registration number
//     const existingStudent = classList.students.find(
//       s => s.registrationNumber === args.student.registrationNumber
//     );

//     if (existingStudent) {
//       throw new Error("Student with this registration number already exists");
//     }

//     const updatedStudents = [...classList.students, args.student];

//     await ctx.db.patch(args.classListId, {
//       students: updatedStudents,
//       updatedAt: Date.now(),
//     });

//     return { success: true };
//   },
// });

// // Remove student from ClassList
// export const removeStudentFromClassList = mutation({
//   args: {
//     classListId: v.id("classLists"),
//     registrationNumber: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const classList = await ctx.db.get(args.classListId);
//     if (!classList) {
//       throw new Error("ClassList not found");
//     }

//     if (classList.lecturerId !== userId) {
//       throw new Error("Access denied");
//     }

//     const updatedStudents = classList.students.filter(
//       s => s.registrationNumber !== args.registrationNumber
//     );

//     await ctx.db.patch(args.classListId, {
//       students: updatedStudents,
//       updatedAt: Date.now(),
//     });

//     return { success: true };
//   },
// });

// // Get ClassList statistics
// export const getClassListStats = query({
//   args: { classListId: v.id("classLists") },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const classList = await ctx.db.get(args.classListId);
//     if (!classList) {
//       throw new Error("ClassList not found");
//     }

//     if (classList.lecturerId !== userId) {
//       throw new Error("Access denied");
//     }

//     // Get courses using this ClassList
//     const courses = await ctx.db
//       .query("courses")
//       .withIndex("by_lecturer", (q) => q.eq("lecturerId", userId))
//       .collect();

//     const coursesUsingClassList = courses.filter(course =>
//       course.classListIds.includes(args.classListId)
//     );

//     // Calculate gender distribution
//     const genderStats = classList.students.reduce((acc, student) => {
//       acc[student.gender] = (acc[student.gender] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     // Calculate year level distribution
//     const yearLevelStats = classList.students.reduce((acc, student) => {
//       acc[student.yearLevel] = (acc[student.yearLevel] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     return {
//       totalStudents: classList.students.length,
//       coursesUsing: coursesUsingClassList.length,
//       genderDistribution: genderStats,
//       yearLevelDistribution: yearLevelStats,
//       createdAt: classList.createdAt,
//       lastUpdated: classList.updatedAt,
//     };
//   },
// });
