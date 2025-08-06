import { Migrations } from '@convex-dev/migrations';
import { components } from '../_generated/api.js';
import { DataModel } from '../_generated/dataModel.js';

export const migrations = new Migrations<DataModel>(components.migrations);

// Migration runner - this is what gets called to run migrations
export const run = migrations.runner();

// Migration for ensuring attendance session data integrity
export const attendanceDataIntegrity = migrations.define({
  table: 'attendanceSessions',
  migrateOne: async (ctx, doc) => {
    const updates: any = {};

    // Ensure all attendance sessions have a valid status
    if (
      !doc.status ||
      !['active', 'pending', 'complete'].includes(doc.status)
    ) {
      console.warn(
        `Attendance session ${doc._id} has invalid status: ${doc.status}`,
      );
      // Set to complete if it has an endedAt time, otherwise pending
      updates.status = doc.endedAt ? 'complete' : 'pending';
    }

    // Ensure location coordinates are valid
    if (
      !doc.location ||
      typeof doc.location.lat !== 'number' ||
      typeof doc.location.long !== 'number'
    ) {
      console.warn(`Attendance session ${doc._id} has invalid location`);
      // Set default location (could be university coordinates)
      updates.location = {
        lat: 0,
        long: 0,
      };
    }

    // Validate location coordinates are within reasonable bounds
    if (doc.location) {
      if (doc.location.lat < -90 || doc.location.lat > 90) {
        console.warn(
          `Attendance session ${doc._id} has invalid latitude: ${doc.location.lat}`,
        );
        updates.location = { ...doc.location, lat: 0 };
      }
      if (doc.location.long < -180 || doc.location.long > 180) {
        console.warn(
          `Attendance session ${doc._id} has invalid longitude: ${doc.location.long}`,
        );
        updates.location = { ...doc.location, long: 0 };
      }
    }

    // Ensure radius is within reasonable bounds if set
    if (doc.radius !== undefined && (doc.radius < 10 || doc.radius > 1000)) {
      console.warn(
        `Attendance session ${doc._id} has invalid radius: ${doc.radius}`,
      );
      updates.radius = 100; // Default to 100 meters
    }

    // Verify that the course and lecturer still exist
    try {
      const course = await ctx.db.get(doc.courseId);
      if (!course) {
        console.warn(
          `Attendance session ${doc._id} references non-existent course ${doc.courseId}`,
        );
        // Could delete this session or mark it as invalid
        return;
      }

      const lecturer = await ctx.db.get(doc.lecturerId);
      if (!lecturer) {
        console.warn(
          `Attendance session ${doc._id} references non-existent lecturer ${doc.lecturerId}`,
        );
        return;
      }

      // Ensure the lecturer owns the course
      if (course.lecturerId !== doc.lecturerId) {
        console.warn(
          `Attendance session ${doc._id} lecturer mismatch with course`,
        );
        return;
      }
    } catch (error) {
      console.error(
        `Error validating references for attendance session ${doc._id}:`,
        error,
      );
      return;
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(doc._id, updates);
    }
  },
});

// Migration for cleaning up invalid join requests
export const cleanupJoinRequests = migrations.define({
  table: 'joinRequests',
  migrateOne: async (ctx, doc) => {
    try {
      // Verify student exists
      const student = await ctx.db.get(doc.studentId);
      if (!student) {
        console.warn(`Deleting join request ${doc._id} - student not found`);
        await ctx.db.delete(doc._id);
        return;
      }

      // Verify lecturer exists
      const lecturer = await ctx.db.get(doc.lecturerId);
      if (!lecturer) {
        console.warn(`Deleting join request ${doc._id} - lecturer not found`);
        await ctx.db.delete(doc._id);
        return;
      }

      // Verify course exists
      const course = await ctx.db.get(doc.courseId);
      if (!course) {
        console.warn(`Deleting join request ${doc._id} - course not found`);
        await ctx.db.delete(doc._id);
        return;
      }

      // Ensure status is valid
      const updates: any = {};
      if (
        !doc.status ||
        !['pending', 'approved', 'rejected'].includes(doc.status)
      ) {
        console.warn(
          `Join request ${doc._id} has invalid status: ${doc.status}`,
        );
        updates.status = 'pending';
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(doc._id, updates);
      }
    } catch (error) {
      console.error(`Error processing join request ${doc._id}:`, error);
    }
  },
});

// Migration for ensuring course attendance list integrity
export const ensureCourseAttendanceListIntegrity = migrations.define({
  table: 'courseAttendanceList',
  migrateOne: async (ctx, doc) => {
    try {
      // Verify all referenced entities exist
      const course = await ctx.db.get(doc.courseId);
      if (!course) {
        console.warn(
          `Deleting course attendance list entry ${doc._id} - course not found`,
        );
        await ctx.db.delete(doc._id);
        return;
      }

      const lecturer = await ctx.db.get(doc.lecturerId);
      if (!lecturer) {
        console.warn(
          `Deleting course attendance list entry ${doc._id} - lecturer not found`,
        );
        await ctx.db.delete(doc._id);
        return;
      }

      const student = await ctx.db.get(doc.studentId);
      if (!student) {
        console.warn(
          `Deleting course attendance list entry ${doc._id} - student not found`,
        );
        await ctx.db.delete(doc._id);
        return;
      }

      const classList = await ctx.db.get(doc.classListId);
      if (!classList) {
        console.warn(
          `Deleting course attendance list entry ${doc._id} - class list not found`,
        );
        await ctx.db.delete(doc._id);
        return;
      }

      const classListStudent = await ctx.db.get(doc.classListStudentId);
      if (!classListStudent) {
        console.warn(
          `Deleting course attendance list entry ${doc._id} - class list student not found`,
        );
        await ctx.db.delete(doc._id);
        return;
      }

      // Verify relationships are consistent
      if (course.lecturerId !== doc.lecturerId) {
        console.warn(
          `Course attendance list entry ${doc._id} has lecturer mismatch`,
        );
        await ctx.db.delete(doc._id);
        return;
      }

      if (classList.lecturerId !== doc.lecturerId) {
        console.warn(
          `Course attendance list entry ${doc._id} has class list lecturer mismatch`,
        );
        await ctx.db.delete(doc._id);
        return;
      }

      if (classListStudent.classListId !== doc.classListId) {
        console.warn(
          `Course attendance list entry ${doc._id} has class list student mismatch`,
        );
        await ctx.db.delete(doc._id);
        return;
      }
    } catch (error) {
      console.error(
        `Error processing course attendance list entry ${doc._id}:`,
        error,
      );
    }
  },
});
