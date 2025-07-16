import { v } from 'convex/values';
import {
  classListQuery,
  lecturerMutation,
  lecturerQuery,
} from './middlewares/lecturerMiddleware';
import { studentGenderSchema } from './schema';
import * as ClassListModel from './models/classListModel';

// ? =====================> MUTATIONS <==========================
// Create a new ClassList
export const createClassList = lecturerMutation({
  args: {
    classListName: v.optional(v.string()),
    department: v.string(),
    yearGroup: v.string(),
    faculty: v.string(),
    students: v.array(
      v.object({
        Name: v.string(),
        registrationNumber: v.string(),
        gender: studentGenderSchema,
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Validate unique registration numbers
    const regNumbers = args.students.map((s) => s.registrationNumber);
    const uniqueRegNumbers = new Set(regNumbers);
    if (regNumbers.length !== uniqueRegNumbers.size) {
      throw new Error('Duplicate registration numbers found');
    }

    const classListId = await ctx.db.insert('classLists', {
      classListName: args.classListName,
      department: args.department,
      yearGroup: args.yearGroup,
      faculty: args.faculty,
      lecturerId: ctx.user._id,
      isArchived: false,
    });

    let position = 1;

    // add the students to the classlist
    await Promise.all(
      args.students.map(async (student) => {
        await ctx.db.insert('classListStudents', {
          classListId,
          student: {
            classlistPosition: position++,
            studentGender: student.gender,
            studentName: student.Name,
            studentRegistrationNumber: student.registrationNumber,
          },
        });
      }),
    );

    // TODO:Write logic that limits the number of students and number of classlist that a lecturer is allowed to create based on their subscription plan

    return classListId;
  },
});

// Delete ClassList
export const deleteClassList = lecturerMutation({
  args: {
    classListId: v.id('classLists'),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;
    const classList = await ctx.db.get(args.classListId);
    if (!classList) {
      throw new Error('ClassList not found');
    }

    if (classList.lecturerId !== lecturerId) {
      throw new Error(
        'Access denied: Classlist does not belong to the lecturer',
      );
    }

    // Check if ClassList is used in any active courses
    const courses = await ctx.db
      .query('courses')
      .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId))
      .collect();

    const activeCourses = courses.filter(
      (course) =>
        course.classListIds.includes(args.classListId) &&
        (course.status === 'active' || course.status === 'archived'),
    );

    if (activeCourses.length > 0) {
      throw new Error(
        `Cannot delete ClassList. It is used in ${activeCourses.length} active course(s)`,
      );
    }

    // grab the students in a classlist
    const classListStudents = await ctx.db
      .query('classListStudents')
      .withIndex('by_classListId', (q) => q.eq('classListId', args.classListId))
      .collect();

    await Promise.all(
      classListStudents.map(async (student) => {
        // delete the students attached to a classlist
        await ctx.db.delete(student._id);
      }),
    );

    await ctx.db.delete(args.classListId);

    return {
      success: true,
      coursesAffected: courses.filter((course) =>
        course.classListIds.includes(args.classListId),
      ).length,
    };
  },
});

// Update ClassList info
export const updateClassList = lecturerMutation({
  args: {
    classListId: v.id('classLists'),
    classListName: v.optional(v.string()),
    department: v.optional(v.string()),
    yearGroup: v.optional(v.string()),
    faculty: v.optional(v.string()),
    // students: v.optional(
    //   v.array(
    //     v.object({
    //       fullName: v.string(),
    //       registrationNumber: v.string(),
    //       gender: v.union(
    //         v.literal('Male'),
    //         v.literal('Female'),
    //         v.literal('Other'),
    //       ),
    //       faculty: v.string(),
    //       department: v.string(),
    //       yearLevel: v.string(),
    //     }),
    //   ),
    // ),
  },
  handler: async (ctx, args) => {
    const { classListId, classListName, department, faculty, yearGroup } = args;
    const lecturerId = ctx.user._id;

    const classList = await ClassListModel.ensureLecturerClassListAccess({
      ctx,
      classListId,
      lecturerId,
    });

    //   // Validate unique registration numbers
    //   const regNumbers = args.students.map((s) => s.registrationNumber);
    //   const uniqueRegNumbers = new Set(regNumbers);
    //   if (regNumbers.length !== uniqueRegNumbers.size) {
    //     throw new Error('Duplicate registration numbers found');
    //   }
    //   updates.students = args.students;
    // }

    await ctx.db.patch(classList._id, {
      classListName: classListName ?? classList.classListName,
      faculty: faculty ?? classList.faculty,
      department: department ?? classList.department,
      yearGroup: yearGroup ?? classList.yearGroup,
    });
    return { success: true };
  },
});

// ? =====================> QUERIES <==========================
// TODO: Add Filters to this query
// Get all ClassLists for a lecturer
export const getMyClassLists = lecturerQuery({
  args: {},
  handler: async (ctx) => {
    const lecturerId = ctx.user._id;

    const classLists = await ctx.db
      .query('classLists')
      .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId))
      .order('desc')
      .collect();

    return await ClassListModel.populateClassListWithNumberOfStudents({
      ctx,
      classLists,
    });
  },
});

// Get a specific ClassList
export const getClassList = classListQuery({
  args: {},
  handler: async (ctx) => {
    const { classList } = ctx;

    const classListStudents = await ClassListModel.getClassListStudents({
      ctx,
      classListId: classList._id,
    });
    return {
      classListInfo: classList,
      classListStudents,
    };
  },
});

// Get ClassList statistics
// export const getClassListStats = query({
//   args: { classListId: v.id('classLists') },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error('Not authenticated');
//     }

//     const classList = await ctx.db.get(args.classListId);
//     if (!classList) {
//       throw new Error('ClassList not found');
//     }

//     if (classList.lecturerId !== userId) {
//       throw new Error('Access denied');
//     }

//     // Get courses using this ClassList
//     const courses = await ctx.db
//       .query('courses')
//       .withIndex('by_lecturer', (q) => q.eq('lecturerId', userId))
//       .collect();

//     const coursesUsingClassList = courses.filter((course) =>
//       course.classListIds.includes(args.classListId),
//     );

//     // Calculate gender distribution
//     const genderStats = classList.students.reduce(
//       (acc, student) => {
//         acc[student.gender] = (acc[student.gender] || 0) + 1;
//         return acc;
//       },
//       {} as Record<string, number>,
//     );

//     // Calculate year level distribution
//     const yearLevelStats = classList.students.reduce(
//       (acc, student) => {
//         acc[student.yearLevel] = (acc[student.yearLevel] || 0) + 1;
//         return acc;
//       },
//       {} as Record<string, number>,
//     );

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
