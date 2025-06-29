import { defineSchema, defineTable } from 'convex/server';
import { Infer, v } from 'convex/values';
import {
  userRoleConstant,
  lecturerTitleConstant,
  studentYearLevelConstants,
} from '../src/constants/constants';

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
  v.literal(studentYearLevelConstants[600]),
);

export const studentGenderSchema = v.union(
  v.literal('male'),
  v.literal('female'),
);

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
  })
    .index('by_role', ['role'])
    .index('by_registration_number', ['registrationNumber'])
    .index('by_department', ['department']),
  // ClassList - Core abstraction for student groups
  classLists: defineTable({
    title: v.string(),
    department: v.string(),
    yearGroup: v.string(), // e.g., "Software Engineering - 2022"
    faculty: v.string(),
    lecturerId: v.id('users'),
    students: v.array(
      v.object({
        fullName: v.string(),
        registrationNumber: v.string(),
        gender: v.union(
          v.literal('Male'),
          v.literal('Female'),
          v.literal('Other'),
        ),
        faculty: v.string(),
        department: v.string(),
        yearLevel: v.string(),
      }),
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_lecturer', ['lecturerId'])
    .index('by_department', ['department'])
    .index('by_year_group', ['yearGroup']),

  // Updated courses table
  courses: defineTable({
    courseName: v.string(),
    courseCode: v.string(),
    description: v.optional(v.string()),
    lecturerId: v.id('users'),
    joinCode: v.string(),
    classListIds: v.array(v.id('classLists')), // Reference to ClassLists
    excludedStudents: v.array(
      v.object({
        classListId: v.id('classLists'),
        registrationNumber: v.string(),
        reason: v.optional(v.string()),
      }),
    ),
    attendanceList: v.array(
      v.object({
        fullName: v.string(),
        registrationNumber: v.string(),
        gender: v.union(
          v.literal('Male'),
          v.literal('Female'),
          v.literal('Other'),
        ),
        faculty: v.string(),
        department: v.string(),
        yearLevel: v.string(),
        classListId: v.id('classLists'),
        isLinked: v.boolean(),
        linkedUserId: v.optional(v.id('users')),
      }),
    ),
    isAttendanceListLocked: v.boolean(),
    status: v.union(
      v.literal('active'),
      v.literal('archived'),
      v.literal('completed'),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_lecturer', ['lecturerId'])
    .index('by_join_code', ['joinCode'])
    .index('by_status', ['status']),

  // Enhanced join requests
  joinRequests: defineTable({
    studentId: v.id('users'),
    courseId: v.id('courses'),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
    ),
    linkedTo: v.optional(v.string()), // registration number from attendance list
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
    processedBy: v.optional(v.id('users')),
    message: v.optional(v.string()),
  })
    .index('by_course', ['courseId'])
    .index('by_student', ['studentId'])
    .index('by_status', ['status']),

  // Attendance sessions
  attendanceSessions: defineTable({
    courseId: v.id('courses'),
    sessionName: v.string(),
    sessionDate: v.number(),
    location: v.optional(v.string()),
    duration: v.optional(v.number()), // in minutes
    isActive: v.boolean(),
    qrCode: v.optional(v.string()),
    createdBy: v.id('users'),
    createdAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index('by_course', ['courseId'])
    .index('by_date', ['sessionDate'])
    .index('by_active', ['isActive']),

  // Attendance records
  attendanceRecords: defineTable({
    sessionId: v.id('attendanceSessions'),
    studentId: v.id('users'),
    registrationNumber: v.string(),
    checkedInAt: v.number(),
    location: v.optional(v.string()),
    method: v.union(
      v.literal('qr'),
      v.literal('manual'),
      v.literal('proximity'),
    ),
  })
    .index('by_session', ['sessionId'])
    .index('by_student', ['studentId'])
    .index('by_registration', ['registrationNumber']),

  // Course completion reports
  courseReports: defineTable({
    courseId: v.id('courses'),
    reportType: v.union(
      v.literal('completion'),
      v.literal('analytics'),
      v.literal('attendance'),
    ),
    data: v.object({
      totalStudents: v.number(),
      totalSessions: v.number(),
      averageAttendance: v.number(),
      topPerformers: v.array(
        v.object({
          studentId: v.string(),
          studentName: v.string(),
          attendancePercentage: v.number(),
        }),
      ),
      bottomPerformers: v.array(
        v.object({
          studentId: v.string(),
          studentName: v.string(),
          attendancePercentage: v.number(),
        }),
      ),
      sessionBreakdown: v.array(
        v.object({
          sessionId: v.string(),
          sessionName: v.string(),
          date: v.number(),
          attendanceCount: v.number(),
          attendancePercentage: v.number(),
        }),
      ),
    }),
    generatedAt: v.number(),
    generatedBy: v.id('users'),
  })
    .index('by_course', ['courseId'])
    .index('by_type', ['reportType']),

  // Notifications
  notifications: defineTable({
    userId: v.id('users'),
    type: v.union(
      v.literal('join_approved'),
      v.literal('join_rejected'),
      v.literal('session_created'),
      v.literal('course_completed'),
      v.literal('attendance_reminder'),
    ),
    title: v.string(),
    message: v.string(),
    data: v.optional(
      v.object({
        courseId: v.optional(v.id('courses')),
        sessionId: v.optional(v.id('attendanceSessions')),
        requestId: v.optional(v.id('joinRequests')),
      }),
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_read', ['isRead']),

  // Messages (existing)
  messages: defineTable({
    senderId: v.id('users'),
    recipientId: v.id('users'),
    subject: v.string(),
    content: v.string(),
    isRead: v.boolean(),
    sentAt: v.number(),
    courseId: v.optional(v.id('courses')),
  })
    .index('by_recipient', ['recipientId'])
    .index('by_sender', ['senderId'])
    .index('by_course', ['courseId']),
};

export default defineSchema({
  // ...authTables,
  ...applicationTables,
});

// applicationTables.userProfiles.validator.fields[""]

export type BackendUserRoleType = Infer<typeof userRoleSchema>;
