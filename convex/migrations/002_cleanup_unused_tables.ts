// import { Migrations } from '@convex-dev/migrations';
// import { components } from '../_generated/api.js';
// import { DataModel } from '../_generated/dataModel.js';

// export const migrations = new Migrations<DataModel>(components.migrations);

// // Migration runner - this is what gets called to run migrations
// export const run = migrations.runner();

// export const cleanupUnusedTables = migrations.define({
//   table: 'a',
//   migrateOne: async (ctx, doc) => {
//     // This table appears to be unused and empty in development
//     // We'll delete any documents that might exist
//     await ctx.db.delete(doc._id);
//   },
// });
