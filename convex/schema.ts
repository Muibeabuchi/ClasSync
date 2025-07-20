import { defineSchema, defineTable } from 'convex/server';
import { Infer, v } from 'convex/values';
import { FunctionReturnType } from 'convex/server';
import {
  // userRoleConstant,
  lecturerTitleConstant,
  studentYearLevelConstants,
  userRoleConstant,
} from '../src/constants/onboarding';
import { api } from './_generated/api';

export const lecturerCurrentPlan = {
  LECTURER_BASIC_PLAN: 'BASIC',
  LECTURER_PRO_PLAN: 'PRO',
  LECTURER_FREE_PLAN: 'FREE',
} as const;

export const userRoleSchema = v.union(
  v.literal(userRoleConstant.student),
  v.literal(userRoleConstant.lecturer),
);

export const lecturerTitleSchema = v.union(
  v.literal(lecturerTitleConstant.Dr),
  v.literal(lecturerTitleConstant.prof),
  v.literal(lecturerTitleConstant.Eng),
  v.literal(lecturerTitleConstant.Mr),
  v.literal(lecturerTitleConstant.Mrs),
);

export const studentYearLevelSchema = v.union(
  v.literal(studentYearLevelConstants[100]),
  v.literal(studentYearLevelConstants[200]),
  v.literal(studentYearLevelConstants[300]),
  v.literal(studentYearLevelConstants[400]),
  v.literal(studentYearLevelConstants[500]),
);

export const studentGenderSchema = v.union(
  v.literal('male'),
  v.literal('female'),
);

export const lecturerCourseStatusSchema = v.union(
  v.literal('active'),
  v.literal('archived'),
  v.literal('completed'),
);

export const classListStudentSchema = v.object({
  classlistPosition: v.number(),
  studentName: v.string(),
  studentGender: studentGenderSchema,
  studentRegistrationNumber: v.string(),
});

export type lecturerCourseStatusType = Infer<typeof lecturerCourseStatusSchema>;
export type GetCourseDetailsReturnType = FunctionReturnType<
  typeof api.courses.getCourseDetails
>;
export type GetAttendanceSessionsReturnType = FunctionReturnType<
  typeof api.attendance.getCourseAttendanceSessions
>;
export type GetAttendanceSessionReturnType = FunctionReturnType<
  typeof api.attendance.getAttendanceSessionById
>;
export type GetAttendanceSessionRecordsReturnType = FunctionReturnType<
  typeof api.attendance.getAttendanceSessionRecords
>;
export type GetLecturerClassListsReturnType = FunctionReturnType<
  typeof api.classLists.getMyClassLists
>;
export type GetLecturerJoinRequestsReturnType = FunctionReturnType<
  typeof api.joinRequests.getAllJoinRequestsForLecturer
>;
export type GetLecturerClassListWithStudentsReturnType = FunctionReturnType<
  typeof api.classLists.getClassListsWithStudents
>;
export type GetStudentsCoursesWithActiveAttendanceReturnType =
  FunctionReturnType<typeof api.courses.getCoursesWithActiveAttendance>;

export type GetStudentsCoursesReturnType = FunctionReturnType<
  typeof api.courses.getStudentCourses
>;
// const lecturerCurrentPlanSchema = v.optional(
//   v.union(
//     v.object({
//       plan: v.literal(lecturerCurrentPlan.LECTURER_FREE_PLAN),
//       isActive: v.boolean(),
//     }),
//     v.object({
//       plan: v.literal(lecturerCurrentPlan.LECTURER_BASIC_PLAN),
//       isActive: v.boolean(),
//     }),
//     v.object({
//       plan: v.literal(lecturerCurrentPlan.LECTURER_PRO_PLAN),
//       isActive: v.boolean(),
//     }),
//   ),
// );

const applicationTables = {
  // User profiles table
  userProfiles: defineTable({
    email: v.string(),
    fullName: v.string(),
    isOnboarded: v.boolean(),
    gender: v.optional(studentGenderSchema),
    role: v.optional(userRoleSchema),
    title: v.optional(lecturerTitleSchema),
    faculty: v.optional(v.string()),
    department: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    yearLevel: v.optional(studentYearLevelSchema),
    student_passport_photo_id: v.optional(v.id('_storage')),
    lecturerPassportImage: v.optional(v.id('_storage')),
  })
    .index('by_role', ['role'])
    .index('by_registration_number', ['registrationNumber'])
    .index('by_email', ['email'])
    .index('by_department', ['department']),

  // ? This table must be unique per lecturer.
  // ? This will be updated by  triggers
  //TODO: This should be deleted once the lecturer deletes their account
  // TODO: Once the lecturer account has  been created, this field has to be created for them ✅
  lecturerConsumption: defineTable({
    lecturerId: v.id('userProfiles'),
    attendanceSessionCount: v.number(),
    createdCourseCount: v.number(),
    registeredStudentCount: v.number(),
  }).index('by_lecturerId', ['lecturerId']),

  // Only lecturers on a paid plan can have a subscription
  subscriptions: defineTable({
    lecturerId: v.id('userProfiles'),
    emailToken: v.string(),
    authorizationCode: v.string(),
    subscriptionCode: v.string(),
    planCode: v.string(),
    PayStackCustomerId: v.string(),
    // Next payment date will be in  ISO 8601 format
    nextPaymentDate: v.string(),
  }).index('by_lecturerId', ['lecturerId']),

  // ClassList - Core abstraction for student groups
  classLists: defineTable({
    classListName: v.optional(v.string()),
    department: v.string(),
    yearGroup: v.string(), // e.g., "Software Engineering - 2022"
    faculty: v.string(),
    //  ClassLists have to be tied to a lecturer
    lecturerId: v.id('userProfiles'),
    // For figuring out classLists that are archived
    isArchived: v.boolean(),
  })
    .index('by_lecturer', ['lecturerId'])
    .index('by_department', ['department'])
    .index('by_year_group', ['yearGroup']),

  classListStudents: defineTable({
    classListId: v.id('classLists'),
    student: classListStudentSchema,
  }).index('by_classListId', ['classListId']),

  courses: defineTable({
    courseName: v.string(),
    courseCode: v.string(),
    lecturerId: v.id('userProfiles'),
    classListIds: v.array(v.id('classLists')), // Reference to ClassLists
    status: lecturerCourseStatusSchema,
  })
    .index('by_lecturer', ['lecturerId'])
    .index('by_courseCode', ['courseCode']),

  courseAttendanceList: defineTable({
    //!  A Course can only have one attendanceList
    // TODO Encode this in the mutations
    courseId: v.id('courses'),
    lecturerId: v.id('userProfiles'),
    studentId: v.id('userProfiles'),
    classListId: v.id('classLists'),
    classListStudentId: v.id('classListStudents'),
  })
    .index('by_classListId_by_courseId_by_lecturerId', [
      'classListId',
      'courseId',
      'lecturerId',
    ])
    .index('by_courseId', ['courseId'])
    .index('by_studentId', ['studentId'])
    .index('by_lecturerId', ['lecturerId'])
    .index('by_courseId_by_lecturerId', ['courseId', 'lecturerId'])
    .index('by_courseId_by_studentId', ['courseId', 'studentId'])
    .index('by_classListStudentId', ['classListStudentId']),

  joinRequests: defineTable({
    studentId: v.id('userProfiles'),
    lecturerId: v.id('userProfiles'),
    courseId: v.id('courses'),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
    ),
    rejectionReason: v.optional(v.string()),
    message: v.optional(v.string()),
  })
    .index('by_student_by_courseId', ['studentId', 'courseId'])
    .index('by_lecturerId_by_courseId', ['lecturerId', 'courseId'])
    .index('by_lecturerId', ['lecturerId'])
    .index('by_status', ['status']),

  // attendance created by lecturer
  attendanceSessions: defineTable({
    courseId: v.id('courses'),
    lecturerId: v.id('userProfiles'),
    attendanceCode: v.optional(v.string()),
    //  Lecturers can optionally name a session. Defaults to the {courseNAME}-{sessionNumber}
    // TODO: Encode this in the creation logic of an attendance session
    location: v.object({
      lat: v.number(),
      long: v.number(),
    }),
    status: v.union(
      v.literal('active'),
      v.literal('pending'),
      v.literal('complete'),
    ),
    radius: v.optional(v.number()),

    //  This will be the time the attendance session ends. It will be automatically set by a cron_job
    endedAt: v.optional(v.number()),
  })
    .index('by_courseId_by_lecturerId', ['courseId', 'lecturerId'])
    .index('by_courseId', ['courseId'])
    .index('by_status', ['status'])
    .index('by_lecturerId', ['lecturerId']),

  // Attendance records
  // A student attendance record will only exist if the attendance was taken
  attendanceRecords: defineTable({
    attendanceSessionId: v.id('attendanceSessions'),
    studentId: v.id('userProfiles'),
    courseId: v.id('courses'),
    distance: v.optional(v.number()),
    // This will be the ISO 8601 timestamp of when the student takes the attendance
    checkedInAt: v.string(),
    location: v.object({
      lat: v.number(),
      long: v.number(),
    }),
  })
    .index('by_attendanceSessionId_by_StudentId', [
      'attendanceSessionId',
      'studentId',
    ])
    .index('by_attendanceSessionId', ['attendanceSessionId'])
    .index('by_studentId', ['studentId'])
    .index('by_studentId_by_courseId', ['studentId', 'courseId']),

  // ? ==================== WILL LOOK AT THIS LATER ========================  //

  // Notifications
  // notifications: defineTable({
  //   userId: v.id('users'),
  //   type: v.union(
  //     v.literal('join_approved'),
  //     v.literal('join_rejected'),
  //     v.literal('session_created'),
  //     v.literal('course_completed'),
  //     v.literal('attendance_reminder'),
  //   ),
  //   title: v.string(),
  //   message: v.string(),
  //   data: v.optional(
  //     v.object({
  //       courseId: v.optional(v.id('courses')),
  //       sessionId: v.optional(v.id('attendanceSessions')),
  //       requestId: v.optional(v.id('joinRequests')),
  //     }),
  //   ),
  //   isRead: v.boolean(),
  //   // createdAt: v.number(),
  // })
  //   .index('by_user', ['userId'])
  //   .index('by_read', ['isRead']),

  // ? ============================== NOTHING HERE TO SEE ========================== //

  // Course completion reports
  // courseReports: defineTable({
  //   courseId: v.id('courses'),
  //   reportType: v.union(
  //     v.literal('completion'),
  //     v.literal('analytics'),
  //     v.literal('attendance'),
  //   ),
  //   data: v.object({
  //     totalStudents: v.number(),
  //     totalSessions: v.number(),
  //     averageAttendance: v.number(),
  //     topPerformers: v.array(
  //       v.object({
  //         studentId: v.string(),
  //         studentName: v.string(),
  //         attendancePercentage: v.number(),
  //       }),
  //     ),
  //     bottomPerformers: v.array(
  //       v.object({
  //         studentId: v.string(),
  //         studentName: v.string(),
  //         attendancePercentage: v.number(),
  //       }),
  //     ),
  //     sessionBreakdown: v.array(
  //       v.object({
  //         sessionId: v.string(),
  //         sessionName: v.string(),
  //         date: v.number(),
  //         attendanceCount: v.number(),
  //         attendancePercentage: v.number(),
  //       }),
  //     ),
  //   }),
  //   generatedAt: v.number(),
  //   generatedBy: v.id('users'),
  // })
  //   .index('by_course', ['courseId'])
  //   .index('by_type', ['reportType']),

  // Messages (existing)
  // messages: defineTable({
  //   senderId: v.id('users'),
  //   recipientId: v.id('users'),
  //   subject: v.string(),
  //   content: v.string(),
  //   isRead: v.boolean(),
  //   sentAt: v.number(),
  //   courseId: v.optional(v.id('courses')),
  // })
  //   .index('by_recipient', ['recipientId'])
  //   .index('by_sender', ['senderId'])
  //   .index('by_course', ['courseId']),
};

export default defineSchema({
  // ...authTables,
  ...applicationTables,
});

// applicationTables.userProfiles.validator.fields[""]

export type BackendUserRoleType = Infer<typeof userRoleSchema>;
