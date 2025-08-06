import { Migrations } from '@convex-dev/migrations';
import { components } from '../_generated/api.js';
import { DataModel } from '../_generated/dataModel.js';

export const migrations = new Migrations<DataModel>(components.migrations);

// Migration runner - this is what gets called to run migrations
export const run = migrations.runner();

// Final production readiness checks and optimizations
export const finalProductionChecks = migrations.define({
  table: 'userProfiles',
  migrateOne: async (ctx, doc) => {
    // This migration runs final checks to ensure data is production-ready

    // Check for duplicate emails (should be unique)
    if (doc.email) {
      const duplicates = await ctx.db
        .query('userProfiles')
        .withIndex('by_email', (q) => q.eq('email', doc.email))
        .collect();

      if (duplicates.length > 1) {
        console.warn(
          `Found ${duplicates.length} users with email ${doc.email}`,
        );
        // Log for manual review - don't auto-delete ds careful handling
      }
    }

    // Check for duplicate registration numbers for students
    if (doc.role === 'student' && doc.registrationNumber) {
      const duplicates = await ctx.db
        .query('userProfiles')
        .withIndex('by_registration_number', (q) =>
          q.eq('registrationNumber', doc.registrationNumber),
        )
        .collect();

      if (duplicates.length > 1) {
        console.warn(
          `Found ${duplicates.length} students with registration number ${doc.registrationNumber}`,
        );
        // Log for manual review
      }
    }

    // Ensure all lecturers have consumption tracking
    if (doc.role === 'lecturer') {
      const consumption = await ctx.db
        .query('lecturerConsumption')
        .withIndex('by_lecturerId', (q) => q.eq('lecturerId', doc._id))
        .first();

      if (!consumption) {
        console.warn(
          `Lecturer ${doc._id} missing consumption record - should have been created by earlier migration`,
        );
      }
    }
  },
});

// Migration to ensure all indexes are properly utilized
export const optimizeDataForIndexes = migrations.define({
  table: 'courses',
  migrateOne: async (ctx, doc) => {
    // Ensure course codes are properly formatted for indexing
    const updates: any = {};

    if (doc.courseCode) {
      const normalizedCode = doc.courseCode.trim().toUpperCase();
      if (normalizedCode !== doc.courseCode) {
        updates.courseCode = normalizedCode;
      }
    }

    // Ensure status is properly set for indexing
    if (!doc.status) {
      updates.status = 'active';
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(doc._id, updates);
    }
  },
});

// Migration to clean up any remaining inconsistencies
export const finalCleanup = migrations.define({
  table: 'classLists',
  migrateOne: async (ctx, doc) => {
    // Ensure all class lists have valid lecturers
    try {
      const lecturer = await ctx.db.get(doc.lecturerId);
      if (!lecturer) {
        console.warn(
          `Class list ${doc._id} references non-existent lecturer ${doc.lecturerId}`,
        );
        // Mark as archived instead of deleting to preserve data integrity
        await ctx.db.patch(doc._id, { isArchived: true });
        return;
      }

      // Ensure lecturer role is correct
      if (lecturer.role !== 'lecturer') {
        console.warn(
          `Class list ${doc._id} references user ${doc.lecturerId} who is not a lecturer`,
        );
      }

      // Ensure isArchived field exists
      if (doc.isArchived === undefined) {
        await ctx.db.patch(doc._id, { isArchived: false });
      }

      // Ensure classListName exists
      if (!doc.classListName) {
        await ctx.db.patch(doc._id, {
          classListName: `Class List ${doc._id.slice(-6)}`,
        });
      }
    } catch (error) {
      console.error(`Error processing class list ${doc._id}:`, error);
    }
  },
});
