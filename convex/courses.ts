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
import {
  StudentMutationMiddleware,
  StudentQueryMiddleware,
} from './middlewares/studentMiddleware';
import * as ClassListModel from './models/classListModel';
import * as ClassListStudentModel from './models/classListStudentModel';
import * as joinRequestModel from './models/joinRequestModel';

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
  handler: async (ctx) => {
    const lecturerId = ctx.user._id;
    console.log({ lecturerId });

    // if (args.status) {
    //   return await filter(
    //     ctx.db
    //       .query('courses')
    //       .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId)),
    //     (c) => c.status === args.status,
    //   ).collect();
    // }

    return await ctx.db
      .query('courses')
      .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId))
      .collect();

    // return await  ctx.db
    //     .query('courses')
    //     .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId)).collect()),

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

    // check if the student has already been added to the course
    const isMember = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId_by_studentId', (q) =>
        q.eq('courseId', course._id).eq('studentId', ctx.user._id),
      )
      .first();

    return {
      _id: course._id,
      courseName: course.courseName,
      courseCode: course.courseCode,
      lecturer: {
        name: lecturer.fullName,
        id: lecturer._id,
      },
      isMember: !!isMember,
    };
  },
});

// Mutation For Students to Cancel a JoinRequest
export const cancelJoinRequest = StudentMutationMiddleware({
  args: { joinRequestId: v.id('joinRequests') },
  async handler(ctx, args) {
    // Ensure the joinRequest is valid
    const joinRequest = await joinRequestModel.ensureValidJoinRequestOrThrow({
      ctx,
      joinRequestId: args.joinRequestId,
    });

    if (joinRequest.status === 'pending') {
      await ctx.db.delete(joinRequest._id);
    } else {
      throw new ConvexError('Only Pending JoinRequest can be cancelled');
    }
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
  args: { courseId: v.optional(v.id('courses')) },
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

export const rejectJoinRequest = lecturerMutation({
  args: { joinRequestId: v.id('joinRequests') },
  async handler(ctx, args) {
    const lecturerId = ctx.user._id;
    const request = await ctx.db.get(args.joinRequestId);
    if (!request) {
      throw new ConvexError('Request not found');
    }

    const course = await ctx.db.get(request.courseId);
    if (!course || course.lecturerId !== lecturerId) {
      throw new ConvexError('Unauthorized: Lecturer has no access this course');
    }

    await ctx.db.patch(args.joinRequestId, {
      status: 'rejected',
    });
  },
});

export const acceptAndLinkJoinRequest = lecturerMutation({
  args: {
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

    const course = await ctx.db.get(request.courseId);
    if (!course || course.lecturerId !== lecturerId) {
      throw new ConvexError('Unauthorized: Lecturer has no access this course');
    }

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

    // ????  TODO: ensure the student registration number is equal to the classListStudent registration number
    // if(settings.ensureValidRegistrationNumber){
    // const student = await ctx.db.get(request.studentId);
    // if (
    //   !student ||
    //   student.registrationNumber !==
    //     classListStudent.student.studentRegistrationNumber
    // )
    //   throw new ConvexError('Student Registration Number does not Match');
    // }

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

    // insert the student into the courseAttendanceList
    await ctx.db.insert('courseAttendanceList', {
      lecturerId,
      courseId: course._id,
      classListId: classList._id,
      studentId: request.studentId,
      classListStudentId: classListStudent._id,
    });

    // update the  joinRequest status
    return await ctx.db.patch(args.joinRequestId, {
      status: 'approved',
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
  },
});

export const unLinkStudentFromCourseAttendanceList = courseMutation({
  args: { courseAttendanceListId: v.id('courseAttendanceList') },
  async handler(ctx, args) {
    const courseAttendanceList = await ctx.db.get(args.courseAttendanceListId);
    if (!courseAttendanceList)
      throw new ConvexError('CourseAttendanceList does not exist');

    await ctx.db.delete(courseAttendanceList._id);
  },
});

export const getLecturerCoursesWithStats = lecturerQuery({
  args: {
    status: v.optional(lecturerCourseStatusSchema),
  },
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;

    // Get courses
    let coursesQuery = ctx.db
      .query('courses')
      .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId));

    if (args.status) {
      coursesQuery = filter(coursesQuery, (c) => c.status === args.status);
    }

    const courses = await coursesQuery.collect();

    // Get statistics for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Count classlists
        const classlistCount = course.classListIds.length;

        // Count total students (approved students in courseAttendanceList)
        const totalStudents = await ctx.db
          .query('courseAttendanceList')
          .withIndex('by_courseId', (q) => q.eq('courseId', course._id))
          .collect();

        // Count attendance sessions
        const attendanceSessions = await ctx.db
          .query('attendanceSessions')
          .withIndex('by_courseId', (q) => q.eq('courseId', course._id))
          .collect();

        // Count pending join requests
        const pendingRequests = await ctx.db
          .query('joinRequests')
          .withIndex('by_lecturerId_by_courseId', (q) =>
            q.eq('lecturerId', lecturerId).eq('courseId', course._id),
          )
          .filter((q) => q.eq(q.field('status'), 'pending'))
          .collect();

        return {
          ...course,
          stats: {
            classlistCount,
            totalStudents: totalStudents.length,
            sessionsHeld: attendanceSessions.length,
            pendingRequests: pendingRequests.length,
          },
        };
      }),
    );

    return coursesWithStats;
  },
});

export const getCoursesWithActiveAttendance = StudentQueryMiddleware({
  args: {},
  handler: async (ctx) => {
    const studentId = ctx.user._id;

    // Get all courses the student is enrolled in
    const enrolledCourses = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_studentId', (q) => q.eq('studentId', studentId))
      .collect();

    if (enrolledCourses.length === 0) {
      return [];
    }

    // Get courses with active attendance sessions
    const coursesWithActiveAttendance = await Promise.all(
      enrolledCourses.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) throw new ConvexError('Course does not Exist');
        if (course.status !== 'active') {
          return null;
        }

        // Check for active attendance sessions
        const activeSession = await ctx.db
          .query('attendanceSessions')
          .withIndex('by_courseId', (q) => q.eq('courseId', course._id))
          .filter((q) =>
            q.or(
              q.eq(q.field('status'), 'active'),
              q.eq(q.field('status'), 'pending'),
            ),
          )
          .first();

        if (!activeSession) {
          return null;
        }

        // filter out the courses with active sesion which you have already taken attendnace in
        const hasTakenAttendance = await ctx.db
          .query('attendanceRecords')
          .withIndex('by_attendanceSessionId', (q) =>
            q.eq('attendanceSessionId', activeSession._id),
          )
          .first();
        if (hasTakenAttendance) return null;

        // Get lecturer info
        const lecturer = await ctx.db.get(course.lecturerId);
        if (!lecturer) throw new ConvexError('Lecturer does not exist');

        return {
          // sessionStatus: active,
          courseId: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          lecturer: {
            name: lecturer.fullName,
            id: lecturer._id,
          },
          session: activeSession,
        };
      }),
    );

    // Filter out null results and only return courses with active sessions
    return coursesWithActiveAttendance.filter(Boolean);
    // .filter((course) => course?.session?.status !== 'pending');
  },
});

export const getCourseDetails = LecturerCourseQuery({
  args: {},
  handler: async (ctx, args) => {
    const lecturerId = ctx.user._id;
    const course = ctx.course;

    // Get course attendance list (enrolled students)
    const courseAttendanceList = await ctx.db
      .query('courseAttendanceList')
      .withIndex('by_courseId', (q) => q.eq('courseId', args.courseId))
      .collect();

    // Get student profiles and calculate attendance rates
    const studentsWithAttendance = await Promise.all(
      courseAttendanceList.map(async (attendance) => {
        const studentProfile = await ctx.db.get(attendance.studentId);
        // if (!studentProfile) return null;
        if (!studentProfile)
          throw new ConvexError('studentProfile does not exist');

        // Get classListStudent info for registration number
        const classListStudent = await ctx.db.get(
          attendance.classListStudentId,
        );
        if (!classListStudent)
          throw new ConvexError('ClassListStudent does not exist');

        // Calculate attendance rate for this student in this course
        const totalSessions = await ctx.db
          .query('attendanceSessions')
          .withIndex('by_courseId', (q) => q.eq('courseId', args.courseId))
          .filter((q) => q.neq(q.field('status'), 'pending'))
          .collect();

        const attendedSessions = await ctx.db
          .query('attendanceRecords')
          .withIndex('by_studentId_by_courseId', (q) =>
            q
              .eq('studentId', attendance.studentId)
              .eq('courseId', args.courseId),
          )
          .collect();

        const attendanceRate =
          totalSessions.length > 0
            ? Math.round((attendedSessions.length / totalSessions.length) * 100)
            : 0;

        return {
          id: studentProfile._id,
          name: studentProfile.fullName,
          email: studentProfile.email,
          gender: studentProfile.gender || 'Not specified',
          regNumber:
            classListStudent?.student?.studentRegistrationNumber || 'N/A',
          department: studentProfile.department || 'Not specified',
          attendanceRate,
          courseAttendanceListId: attendance._id,
        };
      }),
    );

    const students = studentsWithAttendance.filter(Boolean);

    // Get join requests with student information
    const joinRequests = await ctx.db
      .query('joinRequests')
      .withIndex('by_lecturerId_by_courseId', (q) =>
        q.eq('lecturerId', lecturerId).eq('courseId', args.courseId),
      )
      .collect();

    const requestsWithStudentInfo = await Promise.all(
      joinRequests.map(async (request) => {
        const studentProfile = await ctx.db.get(request.studentId);
        if (!studentProfile)
          throw new ConvexError('studentProfile does not exist');

        return {
          id: request._id,
          student: {
            name: studentProfile.fullName,
            email: studentProfile.email,
            regNumber: studentProfile.registrationNumber || 'N/A',
            department: studentProfile.department || 'Not specified',
          },
          status: request.status,
          requestDate: new Date(request._creationTime)
            .toISOString()
            .split('T')[0],
        };
      }),
    );

    const requests = requestsWithStudentInfo.filter(Boolean);

    // Get class lists information
    const classLists = await Promise.all(
      course.classListIds.map(async (classListId) => {
        const classList = await ctx.db.get(classListId);
        return classList
          ? {
              id: classList._id,
              name: classList.classListName,
            }
          : null;
      }),
    );

    // Calculate analytics
    const attendanceRates = students.map((s) => s.attendanceRate);
    const avgAttendance =
      attendanceRates.length > 0
        ? Math.round(
            attendanceRates.reduce((sum, rate) => sum + rate, 0) /
              attendanceRates.length,
          )
        : 0;

    const bestStudent =
      students.length > 0
        ? students.reduce((best, student) =>
            student.attendanceRate > best.attendanceRate ? student : best,
          )
        : null;

    const worstStudent =
      students.length > 0
        ? students.reduce((worst, student) =>
            student.attendanceRate < worst.attendanceRate ? student : worst,
          )
        : null;

    const lowAttendanceCount = students.filter(
      (s) => s.attendanceRate < 50,
    ).length;

    // Get attendance sessions count
    const attendanceSessions = await ctx.db
      .query('attendanceSessions')
      .withIndex('by_courseId', (q) => q.eq('courseId', args.courseId))
      .collect();

    return {
      course: {
        id: course._id,
        name: course.courseName,
        code: course.courseCode,
        status: course.status,
        enrolledCount: students.length,
        description: `Course managed by ${ctx.user.fullName}`, // You can add a description field to the schema if needed
      },
      students,
      requests,
      classLists: classLists.filter(Boolean),
      analytics: {
        avgAttendance,
        bestStudent,
        worstStudent,
        lowAttendanceCount,
        totalSessions: attendanceSessions.length,
        pendingRequests: requests.filter((r) => r.status === 'pending').length,
      },
    };
  },
});
