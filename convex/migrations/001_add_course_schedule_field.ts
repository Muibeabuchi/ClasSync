import { Migrations } from '@convex-dev/migrations';
import { components } from '../_generated/api.js';
import { DataModel } from '../_generated/dataModel.js';

export const migrations = new Migrations<DataModel>(components.migrations);

// Migration runner - this is what gets called to run migrations
export const run = migrations.runner();

export const addCourseScheduleField = migrations.define({
  table: 'courses',
  migrateOne: async (ctx, doc) => {
    // Add schedule field to existing courses if it doesn't exist
    if (!doc.schedule) {
      await ctx.db.patch(doc._id, {
        schedule: [], // Default to empty schedule array
      });
    }
  },
});
