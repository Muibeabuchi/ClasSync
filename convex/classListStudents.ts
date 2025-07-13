import { ConvexError, v } from 'convex/values';
import { ClassListMutation } from './middlewares/lecturerMiddleware';
import * as ClassListStudentModel from './models/classListStudentModel';
import { studentGenderSchema } from './schema';

// Remove student from ClassList
export const removeStudentFromClassList = ClassListMutation({
  args: {
    classListStudentId: v.id('classListStudents'),
  },
  handler: async (ctx, { classListId, classListStudentId }) => {
    const classlistStudent =
      await ClassListStudentModel.ensureValidClassListStudent({
        ctx,
        classListStudentId,
        classListId,
      });

    await ctx.db.delete(classlistStudent._id);

    return { success: true };
  },
});

// Add student to ClassList
export const addStudentToClassList = ClassListMutation({
  args: {
    student: v.object({
      studentName: v.string(),
      studentRegistrationNumber: v.string(),
      studentGender: studentGenderSchema,
    }),
  },
  handler: async (ctx, args) => {
    // grab the classlist students
    const classListStudents = await ctx.db
      .query('classListStudents')
      .withIndex('by_classListId', (q) => q.eq('classListId', args.classListId))
      .collect();

    // Check for duplicate registration number

    // const regNumbers = classListStudents.map((s) => s.student.studentRegistrationNumber);
    //   const uniqueRegNumbers = new Set(regNumbers);
    //   if (regNumbers.length !== uniqueRegNumbers.size) {
    //     throw new Error('Duplicate registration numbers found');
    //   }

    // Ensure the registration number is not a duplicate
    const existingStudent = classListStudents.find(
      (s) =>
        s.student.studentRegistrationNumber ===
        args.student.studentRegistrationNumber,
    );
    if (existingStudent) {
      throw new ConvexError(
        'Student with this registration number already exists',
      );
    }

    // grab the last student and compute the position
    const classlistPosition =
      classListStudents.length > 0
        ? classListStudents.sort(
            (a, b) => b.student.classlistPosition - a.student.classlistPosition,
          )[0].student.classlistPosition
        : 0;

    await ctx.db.insert('classListStudents', {
      classListId: args.classListId,
      student: { ...args.student, classlistPosition },
    });

    return { success: true };
  },
});

// update  a student in the classList
export const updateClassListStudent = ClassListMutation({
  args: {
    classListStudentId: v.id('classListStudents'),
    student: v.object({
      studentName: v.optional(v.string()),
      studentGender: v.optional(studentGenderSchema),
      studentRegistrationNumber: v.optional(v.string()),
    }),
  },
  async handler(ctx, { classListId, classListStudentId, student }) {
    const classListStudent = await ClassListStudentModel.verifyClassListStudent(
      {
        ctx,
        classListStudentId,
        classListId,
      },
    );

    // Ensure the classListStudent Registration number is not a duplicate
    if (
      student.studentRegistrationNumber ===
      classListStudent.student.studentRegistrationNumber
    )
      throw new ConvexError('ClassListStudent must be Unique ');

    await ctx.db.patch(classListStudentId, {
      student: {
        studentName:
          student.studentName ?? classListStudent.student.studentName,
        studentGender:
          student.studentGender ?? classListStudent.student.studentGender,
        studentRegistrationNumber:
          student.studentRegistrationNumber ??
          classListStudent.student.studentRegistrationNumber,
        classlistPosition: classListStudent.student.classlistPosition,
      },
    });

    return {
      success: true,
    };
  },
});
