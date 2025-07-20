import { ConvexError, v } from 'convex/values';
import {
  courseMutation,
  lecturerQuery,
  lecturerMutation,
} from './middlewares/lecturerMiddleware';
import { StudentMutationMiddleware } from './middlewares/studentMiddleware';

export const rejectJoinRequest = lecturerMutation({
  args: {
    joinRequestId: v.id('joinRequests'),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;

    // Get the join request
    const request = await ctx.db.get(args.joinRequestId);
    if (!request) {
      throw new ConvexError('Join request not found');
    }

    // Verify the lecturer owns this request
    if (request.lecturerId !== lecturerId) {
      throw new ConvexError(
        'Unauthorized: You can only reject your own course join requests',
      );
    }

    // Verify the request is still pending
    if (request.status !== 'pending') {
      throw new ConvexError('Only pending join requests can be rejected');
    }

    // Update the request status to rejected
    await ctx.db.patch(args.joinRequestId, {
      status: 'rejected',
      rejectionReason: args.rejectionReason,
    });

    return {
      success: true,
      message: 'Join request rejected successfully',
    };
  },
});

export const getAllJoinRequestsForLecturer = lecturerQuery({
  args: {},
  handler: async (ctx) => {
    const lecturerId = ctx.user._id;
    // const allRequests = [];
    // for (const course of courses) {
    const requests = await ctx.db
      .query('joinRequests')
      .withIndex('by_lecturerId', (q) => q.eq('lecturerId', lecturerId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect();

    //   populate the requests with the Student data
    const populatedRequest = await Promise.all(
      requests.map(async (request) => {
        // fetch the data fro the student
        const student = await ctx.db.get(request.studentId);
        if (!student || student.role !== 'student')
          throw new ConvexError('Student does not exist');

        // grab the course information of the request
        const course = await ctx.db.get(request.courseId);
        if (!course) throw new ConvexError('Course does not exist');

        return {
          ...request,
          student,
          course,
        };
      }),
    );

    return populatedRequest;
  },
});

export const createJoinRequest = StudentMutationMiddleware({
  args: {
    courseId: v.id('courses'),
    lecturerId: v.id('userProfiles'),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const studentId = ctx.user._id;
    // Find course by join code
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error('Course does not Exist');
    }

    // Check if already requested
    const existingRequest = await ctx.db
      .query('joinRequests')
      .withIndex('by_student_by_courseId', (q) =>
        q.eq('studentId', studentId).eq('courseId', course._id),
      )
      .first();

    if (existingRequest) {
      throw new ConvexError('Join request already exists');
    }

    // Check if already linked
    const isAlreadyLinked = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId_by_studentId', (q) =>
        q.eq('courseId', course._id).eq('studentId', studentId),
      )
      .first();

    if (isAlreadyLinked) {
      throw new ConvexError('You are already enrolled in this course');
    }

    const requestId = await ctx.db.insert('joinRequests', {
      studentId,
      courseId: args.courseId,
      status: 'pending',
      rejectionReason: args.message,
      lecturerId: args.lecturerId,
    });

    return { requestId, courseName: course.courseName };
  },
});

export const linkStudentToAttendanceEntry = courseMutation({
  args: {
    requestId: v.id('joinRequests'),
    classListId: v.id('classLists'),
    classListStudentId: v.id('classListStudents'),
    studentId: v.id('userProfiles'),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;
    const course = ctx.course;

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new ConvexError('Join request not found');
    }
    if (request.lecturerId !== lecturerId)
      throw new ConvexError('Unauthorized access');

    // Update join request
    await ctx.db.patch(args.requestId, {
      status: 'approved',
    });

    // Update attendance list
    return await ctx.db.insert('courseAttendanceList', {
      lecturerId,
      courseId: course._id,
      studentId: args.studentId,
      classListId: args.classListId,
      classListStudentId: args.classListStudentId,
    });

    // // Send notification to student
    // await ctx.db.insert('notifications', {
    //   userId: request.studentId,
    //   type: 'join_approved',
    //   title: 'Join Request Approved',
    //   message: `Your request to join ${course.courseName} has been approved. You are now enrolled in the course.`,
    //   data: { courseId: request.courseId, requestId: args.requestId },
    //   isRead: false,
    //   createdAt: Date.now(),
    // });

    // return { success: true };
  },
});

// export const getUnlinkedStudentsForCourse = query({
//   args: { courseId: v.id('courses') },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       return [];
//     }

//     const course = await ctx.db.get(args.courseId);
//     if (!course || course.lecturerId !== userId) {
//       throw new Error('Unauthorized');
//     }

//     return course.studentsData.filter((student) => !student.isLinked);
//   },
// });
