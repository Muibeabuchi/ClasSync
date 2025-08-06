import { Migrations } from '@convex-dev/migrations';
import { components } from '../_generated/api';
import { DataModel } from '../_generated/dataModel';

export const migrations = new Migrations<DataModel>(components.migrations);

// Migration runner - this is what gets called to run migrations
export const run = migrations.runner();

// Migration for ensuring user profile data integrity for production
export const productionPreparation = migrations.define({
  table: 'userProfiles',
  migrateOne: async (ctx, doc) => {
    // Ensure all user profiles have required fields for production
    const updates: any = {};

    // Ensure isOnboarded is always set (default to false if missing)
    if (doc.isOnboarded === undefined) {
      updates.isOnboarded = false;
    }

    // Ensure email is properly formatted and not empty
    if (!doc.email || doc.email.trim() === '') {
      console.warn(`User profile ${doc._id} has invalid email: ${doc.email}`);
      // Skip this document or set a placeholder - depends on business logic
      return;
    }

    // Ensure fullName is not empty
    if (!doc.fullName || doc.fullName.trim() === '') {
      console.warn(
        `User profile ${doc._id} has invalid fullName: ${doc.fullName}`,
      );
      updates.fullName = 'Unknown User';
    }

    // Clean up registration numbers - ensure they follow the expected format
    if (doc.registrationNumber) {
      const cleanRegNumber = doc.registrationNumber.trim().toUpperCase();
      if (cleanRegNumber !== doc.registrationNumber) {
        updates.registrationNumber = cleanRegNumber;
      }
    }

    // Ensure role consistency - if someone has a title, they should be a lecturer
    if (doc.title && doc.role !== 'lecturer') {
      updates.role = 'lecturer';
    }

    // Ensure students have required fields
    if (doc.role === 'student') {
      if (!doc.registrationNumber) {
        console.warn(`Student ${doc._id} missing registration number`);
      }
      if (!doc.yearLevel) {
        console.warn(`Student ${doc._id} missing year level`);
        // Could set a default year level if needed
      }
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(doc._id, updates);
    }
  },
});

// Migration for ensuring lecturer consumption records exist
export const ensureLecturerConsumption = migrations.define({
  table: 'userProfiles',
  migrateOne: async (ctx, doc) => {
    // Only process lecturers
    if (doc.role !== 'lecturer') {
      return;
    }

    // Check if lecturer consumption record exists
    const existingConsumption = await ctx.db
      .query('lecturerConsumption')
      .withIndex('by_lecturerId', (q) => q.eq('lecturerId', doc._id))
      .first();

    if (!existingConsumption) {
      // Create consumption record for lecturer
      await ctx.db.insert('lecturerConsumption', {
        lecturerId: doc._id,
        attendanceSessionCount: 0,
        createdCourseCount: 0,
        registeredStudentCount: 0,
      });
      console.log(`Created consumption record for lecturer ${doc._id}`);
    }
  },
});

// Migration for cleaning up orphaned attendance records
export const cleanupOrphanedRecords = migrations.define({
  table: 'attendanceRecords',
  migrateOne: async (ctx, doc) => {
    try {
      // Verify attendance session exists
      const session = await ctx.db.get(doc.attendanceSessionId);
      if (!session) {
        console.warn(
          `Deleting orphaned attendance record ${doc._id} - session not found`,
        );
        await ctx.db.delete(doc._id);
        return;
      }

      // Verify student exists
      const student = await ctx.db.get(doc.studentId);
      if (!student) {
        console.warn(
          `Deleting orphaned attendance record ${doc._id} - student not found`,
        );
        await ctx.db.delete(doc._id);
        return;
      }

      // Verify course exists
      const course = await ctx.db.get(doc.courseId);
      if (!course) {
        console.warn(
          `Deleting orphaned attendance record ${doc._id} - course not found`,
        );
        await ctx.db.delete(doc._id);
        return;
      }

      // Ensure data consistency
      const updates: any = {};

      // Validate location data
      if (
        !doc.location ||
        typeof doc.location.lat !== 'number' ||
        typeof doc.location.long !== 'number'
      ) {
        console.warn(
          `Fixing invalid location for attendance record ${doc._id}`,
        );
        updates.location = { lat: 0, long: 0 };
      }

      // Validate checkedInAt format
      if (!doc.checkedInAt || typeof doc.checkedInAt !== 'string') {
        console.warn(
          `Fixing invalid checkedInAt for attendance record ${doc._id}`,
        );
        updates.checkedInAt = new Date().toISOString();
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(doc._id, updates);
      }
    } catch (error) {
      console.error(`Error processing attendance record ${doc._id}:`, error);
    }
  },
});

// Migration for ensuring course data integrity
export const ensureCourseDataIntegrity = migrations.define({
  table: 'courses',
  migrateOne: async (ctx, doc) => {
    const updates: any = {};

    // Ensure course has a valid status
    if (
      !doc.status ||
      !['active', 'archived', 'completed'].includes(doc.status)
    ) {
      console.warn(`Course ${doc._id} has invalid status: ${doc.status}`);
      updates.status = 'active'; // Default to active
    }

    // Ensure courseName and courseCode are not empty
    if (!doc.courseName || doc.courseName.trim() === '') {
      console.warn(`Course ${doc._id} has invalid courseName`);
      updates.courseName = 'Unnamed Course';
    }

    if (!doc.courseCode || doc.courseCode.trim() === '') {
      console.warn(`Course ${doc._id} has invalid courseCode`);
      updates.courseCode = `COURSE_${doc._id.slice(-6)}`;
    }

    // Verify lecturer exists
    try {
      const lecturer = await ctx.db.get(doc.lecturerId);
      if (!lecturer) {
        console.warn(
          `Course ${doc._id} references non-existent lecturer ${doc.lecturerId}`,
        );
        // Could mark course as archived or find a replacement lecturer
        updates.status = 'archived';
      }
    } catch (error) {
      console.error(`Error validating lecturer for course ${doc._id}:`, error);
    }

    // Ensure classListIds is an array
    if (!Array.isArray(doc.classListIds)) {
      console.warn(`Course ${doc._id} has invalid classListIds`);
      updates.classListIds = [];
    }

    // Validate schedule if it exists
    if (doc.schedule && Array.isArray(doc.schedule)) {
      const validSchedule = doc.schedule.filter(
        (item) =>
          item &&
          typeof item.day === 'string' &&
          typeof item.startTime === 'string' &&
          typeof item.endTime === 'string',
      );

      if (validSchedule.length !== doc.schedule.length) {
        console.warn(`Course ${doc._id} has invalid schedule items`);
        updates.schedule = validSchedule;
      }
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(doc._id, updates);
    }
  },
});
