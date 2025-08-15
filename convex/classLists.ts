import { ConvexError, v } from 'convex/values';
import {
  LecturerCourseQuery,
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
    console.log({ regNumbers });
    console.log({ uniqueRegNumbers });
    if (regNumbers.length !== uniqueRegNumbers.size) {
      throw new Error('Duplicate registration numbers found');
    }

    const classListId = await ctx.db.insert('classLists', {
      classListName: args.classListName,
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
export const updateClassListName = lecturerMutation({
  args: {
    classListId: v.id('classLists'),
    classListName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { classListId, classListName } = args;
    const lecturerId = ctx.user._id;

    const classList = await ClassListModel.ensureLecturerClassListAccess({
      ctx,
      classListId,
      lecturerId,
    });

    await ctx.db.patch(classList._id, {
      classListName: classListName ?? classList.classListName,
    });
    return { success: true };
  },
});

// Add student to ClassList
export const addStudentToClassList = lecturerMutation({
  args: {
    classListId: v.id('classLists'),
    student: v.object({
      Name: v.string(),
      registrationNumber: v.string(),
      gender: studentGenderSchema,
    }),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;

    await ClassListModel.ensureLecturerClassListAccess({
      ctx,
      classListId: args.classListId,
      lecturerId,
    });

    // Check for duplicate registration number within this classlist
    const existingStudents = await ctx.db
      .query('classListStudents')
      .withIndex('by_classListId', (q) => q.eq('classListId', args.classListId))
      .collect();

    const duplicateStudent = existingStudents.find(
      (s) =>
        s.student.studentRegistrationNumber === args.student.registrationNumber,
    );

    if (duplicateStudent) {
      throw new Error(
        'A student with this registration number already exists in this class list',
      );
    }

    // Get the next position
    const nextPosition = existingStudents.length + 1;

    const studentId = await ctx.db.insert('classListStudents', {
      classListId: args.classListId,
      student: {
        classlistPosition: nextPosition,
        studentGender: args.student.gender,
        studentName: args.student.Name,
        studentRegistrationNumber: args.student.registrationNumber,
      },
    });

    return studentId;
  },
});

// Update student in ClassList
export const updateClassListStudent = lecturerMutation({
  args: {
    classListId: v.id('classLists'),
    studentId: v.id('classListStudents'),
    student: v.object({
      Name: v.string(),
      registrationNumber: v.string(),
      gender: studentGenderSchema,
    }),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;

    // Verify lecturer has access to this classlist
    await ClassListModel.ensureLecturerClassListAccess({
      ctx,
      classListId: args.classListId,
      lecturerId,
    });

    // Get the student to update
    const studentToUpdate = await ctx.db.get(args.studentId);
    if (!studentToUpdate || studentToUpdate.classListId !== args.classListId) {
      throw new Error('Student not found in this class list');
    }

    // Check for duplicate registration number (excluding current student)
    const existingStudents = await ctx.db
      .query('classListStudents')
      .withIndex('by_classListId', (q) => q.eq('classListId', args.classListId))
      .collect();

    const duplicateStudent = existingStudents.find(
      (s) =>
        s._id !== args.studentId &&
        s.student.studentRegistrationNumber === args.student.registrationNumber,
    );

    if (duplicateStudent) {
      throw new Error(
        'A student with this registration number already exists in this class list',
      );
    }

    await ctx.db.patch(args.studentId, {
      student: {
        ...studentToUpdate.student,
        studentName: args.student.Name,
        studentRegistrationNumber: args.student.registrationNumber,
        studentGender: args.student.gender,
      },
    });

    return { success: true };
  },
});

// Delete student from ClassList
export const deleteClassListStudent = lecturerMutation({
  args: {
    classListId: v.id('classLists'),
    studentId: v.id('classListStudents'),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;

    // Verify lecturer has access to this classlist
    await ClassListModel.ensureLecturerClassListAccess({
      ctx,
      classListId: args.classListId,
      lecturerId,
    });

    // Get the student to delete
    const studentToDelete = await ctx.db.get(args.studentId);
    if (!studentToDelete || studentToDelete.classListId !== args.classListId) {
      throw new Error('Student not found in this class list');
    }

    // Check if student is enrolled in any courses
    const courseEnrollments = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_classListStudentId', (q) =>
        q.eq('classListStudentId', args.studentId),
      )
      .collect();

    if (courseEnrollments.length > 0) {
      throw new Error(
        'Cannot delete student. They are enrolled in active courses.',
      );
    }

    await ctx.db.delete(args.studentId);

    // Reorder positions for remaining students
    const remainingStudents = await ctx.db
      .query('classListStudents')
      .withIndex('by_classListId', (q) => q.eq('classListId', args.classListId))
      .collect();

    // Sort by current position and reassign positions
    const sortedStudents = remainingStudents.sort(
      (a, b) => a.student.classlistPosition - b.student.classlistPosition,
    );

    await Promise.all(
      sortedStudents.map(async (student, index) => {
        await ctx.db.patch(student._id, {
          student: {
            ...student.student,
            classlistPosition: index + 1,
          },
        });
      }),
    );

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

export const getClassListsWithStudents = lecturerQuery({
  args: {},
  async handler(ctx) {
    const lecturerId = ctx.user._id;

    const classLists = await ctx.db
      .query('classLists')
      .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId))
      .order('desc')
      .collect();

    const listWithStudents = await Promise.all(
      classLists.map(async (list) => {
        // grab all the classListStudents for each classList
        const classListStudents = await ctx.db
          .query('classListStudents')
          .withIndex('by_classListId', (q) => q.eq('classListId', list._id))
          .collect();

        return {
          ...list,
          classListStudents,
        };
      }),
    );

    return listWithStudents;
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

// Get ClassLists with students not yet added to a specific course
export const getClassListsWithAvailableStudents = LecturerCourseQuery({
  args: {
    courseId: v.id('courses'),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;
    const course = ctx.course;

    // Get only class lists that are attached to this specific course
    const courseClassListIds = course.classListIds || [];

    if (courseClassListIds.length === 0) {
      return []; // No class lists attached to this course
    }

    // Get class lists that are attached to this course
    const classLists = await Promise.all(
      courseClassListIds.map(async (classListId) => {
        const classList = await ctx.db.get(classListId);
        return classList;
      }),
    );

    // Filter out null results
    const validClassLists = classLists.filter(Boolean);

    // Get all students already in the course attendance list
    const existingCourseAttendees = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId_by_lecturerId', (q) =>
        q.eq('courseId', args.courseId).eq('lecturerId', lecturerId),
      )
      .collect();

    // Create a set of classListStudentIds that are already in the course
    const existingStudentIds = new Set(
      existingCourseAttendees.map((attendee) => attendee.classListStudentId),
    );

    // Process each class list and filter out students already in the course
    const classListsWithAvailableStudents = await Promise.all(
      validClassLists.map(async (classList) => {
        if (!classList) throw new ConvexError('ClassList does not exist');
        // Get all students in this class list
        const allClassListStudents = await ctx.db
          .query('classListStudents')
          .withIndex('by_classListId', (q) =>
            q.eq('classListId', classList._id),
          )
          .collect();

        // Filter out students who are already in the course
        const availableStudents = allClassListStudents.filter(
          (student) => !existingStudentIds.has(student._id),
        );

        return {
          ...classList,
          classListStudents: availableStudents,
          totalStudents: allClassListStudents.length,
          availableStudents: availableStudents.length,
          studentsInCourse:
            allClassListStudents.length - availableStudents.length,
        };
      }),
    );

    // Filter out class lists that have no available students (optional)
    return classListsWithAvailableStudents.filter(
      (classList) => classList.availableStudents > 0,
    );
  },
});
