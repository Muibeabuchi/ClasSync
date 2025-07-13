import { ConvexError, v } from 'convex/values';
import {
  courseMutation,
  LecturerCourseQuery,
  lecturerMutation,
  lecturerQuery,
} from './middlewares/lecturerMiddleware';
import { filter } from 'convex-helpers/server/filter';
import { lecturerCourseStatusSchema } from './schema';
import * as CoursesModel from './models/coursesModel';
import { AuthenticatedUserQuery } from './middlewares/authenticatedMiddleware';
import { StudentMutationMiddleware } from './middlewares/studentMiddleware';
import * as ClassListModel from './models/classListModel';
import * as ClassListStudentModel from './models/classListStudentModel';
// import * as classListModel from './models/classListModel';

export const createCourse = lecturerMutation({
  args: {
    courseName: v.string(),
    initialCourseCode: v.string(),
    classListIds: v.array(v.id('classLists')),
  },
  handler: async (ctx, { courseName, initialCourseCode, classListIds }) => {
    const lecturerId = ctx.user._id;

    const courseCode = CoursesModel.generateCourseCode(
      initialCourseCode,
      lecturerId,
    );

    const courseId = await ctx.db.insert('courses', {
      lecturerId,
      courseName: courseName,
      courseCode: courseCode,
      status: 'active',
      classListIds,
    });

    // const [classListStudents] = await Promise.all(
    //   classListIds.map(async (classListId) => {
    //     const classList = await classListModel.ensureClassListExists({
    //       ctx,
    //       lecturerId,
    //       classListId,
    //     });
    //     if (!classList) throw new ConvexError('ClassList does not exist');
    //     // grab the students that belong to the classList
    //     return await ctx.db
    //       .query('classListStudents')
    //       .withIndex('by_classListId', (q) => q.eq('classListId', classListId))
    //       .collect();
    //   }),
    // );

    // // insert the classListStudent into the courseAttendanceList
    // await Promise.all(
    //   classListStudents.map(async (classListStudent) => {
    //     const classListStudentId = classListStudent._id;
    //     // create courseAttendanceList using the classList
    //     await ctx.db.insert('courseAttendanceList', {
    //       courseId,
    //       lecturerId,
    //       classListStudentId,
    //     });
    //   }),
    // );

    await CoursesModel.updateLecturerConsumption({
      ctx,
      lecturerId,
      method: 'insert',
    });

    return courseId;
  },
});

export const getLecturerCourses = lecturerQuery({
  args: {
    status: v.optional(lecturerCourseStatusSchema),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;

    return await filter(
      ctx.db
        .query('courses')
        .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId)),
      (c) => c.status === args.status,
    ).collect();

    //   // For students, get approved courses
    //   const approvedRequests = await ctx.db
    //     .query("joinRequests")
    //     .withIndex("by_student", (q) => q.eq("studentId", userId))
    //     .filter((q) => q.eq(q.field("status"), "approved"))
    //     .collect();

    //   const courses = [];
    //   for (const request of approvedRequests) {
    //     const course = await ctx.db.get(request.courseId);
    //     if (course) {
    //       courses.push(course);
    //     }
    //   }
    //   return courses;
  },
});

export const searchCourse = AuthenticatedUserQuery({
  args: { courseCode: v.string() },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query('courses')
      .withIndex('by_courseCode', (q) => q.eq('courseCode', args.courseCode))
      .unique();

    if (!course || course.status !== 'active') {
      return null;
    }
    // grab the lecturers Info
    const lecturer = await ctx.db.get(course.lecturerId);
    if (!lecturer) return null;
    return {
      _id: course._id,
      courseName: course.courseName,
      courseCode: course.courseCode,
      lecturer: {
        name: lecturer.fullName,
      },
    };
  },
});

export const updateCourse = courseMutation({
  args: {
    courseName: v.optional(v.string()),
    status: v.optional(lecturerCourseStatusSchema),
  },
  async handler(ctx, args) {
    const course = ctx.course;

    if (args.status === 'archived')
      throw new ConvexError('Course cannot be archived by Lecturer');

    await ctx.db.patch(args.courseId, {
      courseName: args.courseName ?? course.courseName,
      status: args.status ?? course.status,
    });
  },
});

export const removeCourseClassList = courseMutation({
  args: {
    classListIds: v.array(v.id('classLists')),
  },
  async handler(ctx, args) {
    const course = ctx.course;
    const lecturerId = ctx.user._id;

    if (course.status !== 'active')
      throw new ConvexError(
        'Course must be active in order to allow deleting of  ',
      );

    // Verify that the classLists are part of the course
    const validClassListIds = await Promise.all(
      args.classListIds.map(async (classlistId) => {
        const classList = await ctx.db.get(classlistId);
        if (!classList) throw new ConvexError('ClassList does not exist');
        const isIncluded = course.classListIds.includes(classlistId);
        if (!isIncluded)
          throw new ConvexError('The classList is not part of the Course');
        return classlistId;
      }),
    );

    await Promise.all(
      validClassListIds.map(async (classListId) => {
        // TODO: Abstract into a model method
        const courseAttendanceList = await ctx.db
          .query('courseAttendanceList')
          .withIndex('by_classListId_by_courseId_by_lecturerId', (q) =>
            q
              .eq('classListId', classListId)
              .eq('courseId', course._id)
              .eq('lecturerId', lecturerId),
          )
          .collect();

        await Promise.all(
          courseAttendanceList.map(async (courseAttendanceList) => {
            await ctx.db.delete(courseAttendanceList._id);
          }),
        );
      }),
    );

    const updatedCourseClassListIds = course.classListIds.filter(
      (classListId) => {
        return !!validClassListIds.find((c) => c === classListId);
      },
    );

    // remove the classListId from the course
    await ctx.db.patch(course._id, {
      classListIds: updatedCourseClassListIds,
    });
  },
});

export const requestToJoinCourse = StudentMutationMiddleware({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    const studentId = ctx.user._id;

    const course = await ctx.db.get(args.courseId);
    if (!course || course.status !== 'active') {
      throw new ConvexError('Course not available for enrollment');
    }

    // Check if request already exists
    const existingRequest = await ctx.db
      .query('joinRequests')
      .withIndex('by_student_by_courseId', (q) =>
        q.eq('studentId', studentId).eq('courseId', args.courseId),
      )
      .unique();

    if (existingRequest) {
      throw new Error('Join request already exists');
    }

    const requestId = await ctx.db.insert('joinRequests', {
      studentId,
      lecturerId: course.lecturerId,
      courseId: args.courseId,
      status: 'pending',
    });

    return requestId;
  },
});

export const getCourseJoinRequests = LecturerCourseQuery({
  // TODO: Tweak the function to show all join requests of a lecturer
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;
    const requests = await ctx.db
      .query('joinRequests')
      .withIndex('by_lecturerId_by_courseId', (q) =>
        q.eq('lecturerId', lecturerId).eq('courseId', args.courseId),
      )
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect();

    const requestsWithStudentInfo = [];
    for (const request of requests) {
      const studentProfile = await ctx.db
        .query('userProfiles')
        .withIndex('by_id', (q) => q.eq('_id', request.studentId))
        .unique();

      if (!studentProfile) throw new ConvexError('Student does not exist');

      requestsWithStudentInfo.push({
        ...request,
        studentProfile,
      });
    }

    return requestsWithStudentInfo;
  },
});

export const updateJoinRequest = lecturerMutation({
  args: {
    status: v.union(v.literal('approved'), v.literal('rejected')),
    joinRequestId: v.id('joinRequests'),
    classListId: v.id('classLists'),
    classListStudentId: v.id('classListStudents'),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;
    const request = await ctx.db.get(args.joinRequestId);
    if (!request) {
      throw new ConvexError('Request not found');
    }
    // if(request.status === "approved")

    const course = await ctx.db.get(request.courseId);
    if (!course || course.lecturerId !== lecturerId) {
      throw new ConvexError('Unauthorized: Lecturer has no access this course');
    }

    // ????  TODO: ensure the student registration number is equal to the classListStudent registration number

    // ensure the classList exists and belongs to the lecturer
    const classList = await ClassListModel.ensureClassListExists({
      ctx,
      classListId: args.classListId,
      lecturerId,
    });
    if (!classList) throw new ConvexError('ClassList does not exist');

    // ensure the classListStudent belongs to the classList
    const classListStudent = await ClassListStudentModel.verifyClassListStudent(
      {
        ctx,
        classListId: classList._id,
        classListStudentId: args.classListStudentId,
      },
    );

    if (args.status === 'rejected') {
      return await ctx.db.patch(args.joinRequestId, {
        status: 'rejected',
      });
    }

    // check if  the student has already been added to the attendanceList
    const linkedStudent = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId_by_studentId', (q) =>
        q.eq('courseId', course._id).eq('studentId', request.studentId),
      )
      .unique();

    if (linkedStudent)
      throw new ConvexError(
        'Student is already part of the courseAttendanceList',
      );

    // update the  joinRequest status
    await ctx.db.patch(args.joinRequestId, {
      status: 'approved',
    });

    // insert the student into the courseAttendanceList
    await ctx.db.insert('courseAttendanceList', {
      lecturerId,
      studentId: request.studentId,
      courseId: course._id,
      classListId: classList._id,
      classListStudentId: classListStudent._id,
    });

    // // Send notification to student
    // await ctx.db.insert('notifications', {
    //   recipientId: request.studentId,
    //   senderId: userId,
    //   courseId: request.courseId,
    //   title: 'Enrollment Approved',
    //   message: `You have been accepted into ${course.courseName} (${course.courseCode})`,
    //   type: 'enrollment',
    //   isRead: false,
    //   createdAt: Date.now(),
    //   actionUrl: `/dashboard`,
    // });

    return true;
  },
});
