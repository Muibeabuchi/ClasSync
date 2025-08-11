import { ConvexError, v } from 'convex/values';
import {
  courseMutation,
  lecturerQuery,
  lecturerMutation,
} from './middlewares/lecturerMiddleware';
import {
  StudentMutationMiddleware,
  StudentQueryMiddleware,
} from './middlewares/studentMiddleware';
import { internal } from './_generated/api';
import { internalMutation } from './_generated/server';

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

    // schedule for the request to be deleted after 2 hrs
    await ctx.scheduler.runAfter(
      1000 * 60 * 60 * 2, // 2 hours
      internal.joinRequests.deleteJoinRequestInternal,
      {
        requestId: args.joinRequestId,
      },
    );

    return {
      success: true,
      message: 'Join request rejected successfully',
    };
  },
});

export const deleteJoinRequestInternal = internalMutation({
  args: {
    requestId: v.id('joinRequests'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (request && request.status === 'rejected') {
      await ctx.db.delete(args.requestId);
      console.log(`Deleted rejected join request: ${args.requestId}`);
    } else {
      console.log(
        `Join request ${args.requestId} not found or not in rejected status, skipping deletion.`,
      );
    }
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

        // Get profile image URL if available
        let profileImageUrl = null;
        if (student.student_passport_photo_id) {
          profileImageUrl = await ctx.storage.getUrl(
            student.student_passport_photo_id,
          );
        }

        // Get course-specific image URL
        let courseSpecificImageUrl = null;
        if (request.courseSpecificImageId) {
          courseSpecificImageUrl = await ctx.storage.getUrl(
            request.courseSpecificImageId,
          );
        }

        return {
          ...request,
          student: {
            ...student,
            profileImage: profileImageUrl,
          },
          course,
          courseSpecificImageUrl,
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
    uniqueCode: v.optional(v.string()),
    courseSpecificImageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const studentId = ctx.user._id;
    const student = ctx.user;

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
      .filter((q) => q.eq(q.field('status'), 'approved'))
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

    // Validation: Student must have either registrationNumber or provide uniqueCode
    if (!student.registrationNumber && !args.uniqueCode) {
      throw new ConvexError(
        'You must provide a unique code from your lecturer or complete your profile with a registration number',
      );
    }

    const requestId = await ctx.db.insert('joinRequests', {
      studentId,
      courseId: args.courseId,
      status: 'pending',
      message: args.message,
      uniqueCode: args.uniqueCode,
      lecturerId: args.lecturerId,
      courseSpecificImageId: args.courseSpecificImageId,
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

// Student-specific join request functions

export const getMyJoinRequests = StudentQueryMiddleware({
  args: {},
  handler: async (ctx) => {
    const studentId = ctx.user._id;

    // Get all join requests for this student
    const requests = await ctx.db
      .query('joinRequests')
      .withIndex('by_studentId', (q) => q.eq('studentId', studentId))
      // .filter((q) => q.neq(q.field('status'), 'approved'))
      .order('desc')
      .collect();

    // Populate with course and lecturer data
    const populatedRequests = await Promise.all(
      requests.map(async (request) => {
        const course = await ctx.db.get(request.courseId);
        if (!course) {
          throw new ConvexError('Course not found');
        }

        const lecturer = await ctx.db.get(request.lecturerId);
        if (!lecturer) {
          throw new ConvexError('Lecturer not found');
        }

        // Get lecturer profile image URL if available
        let lecturerProfileImageUrl = null;
        if (lecturer.lecturerPassportImage) {
          lecturerProfileImageUrl = await ctx.storage.getUrl(
            lecturer.lecturerPassportImage,
          );
        }

        return {
          ...request,
          course: {
            ...course,
          },
          lecturer: {
            ...lecturer,
            profileImage: lecturerProfileImageUrl,
          },
        };
      }),
    );

    return populatedRequests;
  },
});

export const cancelJoinRequest = StudentMutationMiddleware({
  args: {
    requestId: v.id('joinRequests'),
  },
  handler: async (ctx, args) => {
    const studentId = ctx.user._id;

    // Get the join request
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new ConvexError('Join request not found');
    }

    // Verify the student owns this request
    if (request.studentId !== studentId) {
      throw new ConvexError(
        'Unauthorized: You can only cancel your own join requests',
      );
    }

    // Only allow cancellation of pending requests
    if (request.status !== 'pending') {
      throw new ConvexError('Only pending join requests can be cancelled');
    }

    // Delete the request
    await ctx.db.delete(args.requestId);

    return {
      success: true,
      message: 'Join request cancelled successfully',
    };
  },
});

export const deleteJoinRequest = StudentMutationMiddleware({
  args: {
    requestId: v.id('joinRequests'),
  },
  handler: async (ctx, args) => {
    const studentId = ctx.user._id;

    // Get the join request
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new ConvexError('Join request not found');
    }

    // Verify the student owns this request
    if (request.studentId !== studentId) {
      throw new ConvexError(
        'Unauthorized: You can only delete your own join requests',
      );
    }

    // Only allow deletion of rejected requests or approved requests (for cleanup)
    if (request.status !== 'rejected') {
      throw new ConvexError(
        'Cannot delete pending requests. Use cancel instead.',
      );
    }

    // Delete the request
    await ctx.db.delete(args.requestId);

    return {
      success: true,
      message: 'Join request deleted successfully',
    };
  },
});

export const batchAcceptJoinRequests = lecturerMutation({
  args: {
    courseId: v.id('courses'),
    requestIds: v.array(v.id('joinRequests')),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;

    // Verify lecturer owns the course
    const course = await ctx.db.get(args.courseId);
    if (!course || course.lecturerId !== lecturerId) {
      throw new ConvexError('Unauthorized: Course not found or access denied');
    }

    // Get all class lists attached to this course
    const courseClassListIds = course.classListIds || [];
    if (courseClassListIds.length === 0) {
      throw new ConvexError('No class lists attached to this course');
    }

    // Get all class list students for matching
    const allClassListStudents = await Promise.all(
      courseClassListIds.map(async (classListId) => {
        const students = await ctx.db
          .query('classListStudents')
          .withIndex('by_classListId', (q) => q.eq('classListId', classListId))
          .collect();
        return students.map((student) => ({ ...student, classListId }));
      }),
    );
    const flatClassListStudents = allClassListStudents.flat();

    // Get existing course attendance list to check for duplicates
    const existingAttendees = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId_by_lecturerId', (q) =>
        q.eq('courseId', args.courseId).eq('lecturerId', lecturerId),
      )
      .collect();

    const existingStudentIds = new Set(
      existingAttendees.map((a) => a.studentId),
    );

    // Process each join request
    const results = {
      accepted: [] as Array<{
        studentId: string;
        joinRequestId: string;
        studentName: string;
      }>,
      alreadyAccepted: [] as Array<{
        studentId: string;
        joinRequestId: string;
        studentName: string;
      }>,
      noMatch: [] as Array<{
        studentId: string;
        joinRequestId: string;
        studentName: string;
      }>,
    };

    for (const requestId of args.requestIds) {
      const request = await ctx.db.get(requestId);
      if (
        !request ||
        request.lecturerId !== lecturerId ||
        request.courseId !== args.courseId
      ) {
        continue; // Skip invalid requests
      }

      if (request.status !== 'pending') {
        continue; // Skip non-pending requests
      }

      // Get student details
      const student = await ctx.db.get(request.studentId);
      if (!student) {
        continue; // Skip if student not found
      }

      const studentName = student.fullName || 'Unknown Student';

      // Check if student is already in the course
      if (existingStudentIds.has(request.studentId)) {
        results.alreadyAccepted.push({
          studentId: request.studentId,
          joinRequestId: requestId,
          studentName,
        });
        // Update request status to approved
        await ctx.db.patch(requestId, { status: 'approved' });
        continue;
      }

      // Try to match student by registration number
      let matchedClassListStudent: (typeof flatClassListStudents)[0] | null =
        null;

      if (student.registrationNumber) {
        matchedClassListStudent =
          flatClassListStudents.find(
            (cls) =>
              cls.student.studentRegistrationNumber ===
              student.registrationNumber,
          ) || null;
      }

      // If no match by registration number, try by unique code
      if (!matchedClassListStudent && request.uniqueCode) {
        // For unique code matching, we'll match against any available student
        // This is a fallback when registration numbers don't match
        const availableStudents = flatClassListStudents.filter((cls) => {
          const isAlreadyInCourse = existingAttendees.some(
            (attendee) => attendee.classListStudentId === cls._id,
          );
          return !isAlreadyInCourse;
        });

        if (availableStudents.length > 0) {
          // Take the first available student (lecturer will need to verify this is correct)
          matchedClassListStudent = availableStudents[0];
        }
      }

      if (matchedClassListStudent) {
        // Check if this class list student is already assigned to someone else
        const existingAssignment = existingAttendees.find(
          (attendee) =>
            attendee.classListStudentId === matchedClassListStudent._id,
        );

        if (!existingAssignment) {
          // Create course attendance entry
          await ctx.db.insert('courseAttendanceList', {
            lecturerId,
            courseId: args.courseId,
            studentId: request.studentId,
            classListId: matchedClassListStudent.classListId,
            classListStudentId: matchedClassListStudent._id,
          });

          // Update request status
          await ctx.db.patch(requestId, { status: 'approved' });

          // Add to existing student IDs to prevent duplicates in this batch
          existingStudentIds.add(request.studentId);

          results.accepted.push({
            studentId: request.studentId,
            joinRequestId: requestId,
            studentName,
          });
        } else {
          results.noMatch.push({
            studentId: request.studentId,
            joinRequestId: requestId,
            studentName,
          });
        }
      } else {
        results.noMatch.push({
          studentId: request.studentId,
          joinRequestId: requestId,
          studentName,
        });
      }
    }

    return results;
  },
});
