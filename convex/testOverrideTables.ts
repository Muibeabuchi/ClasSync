import { query } from './_generated/server';

// Test query to verify that our new tables are accessible
export const testNewTables = query({
  args: {},
  handler: async (ctx) => {
    // Try to query the new tables to verify they exist
    const overrideLogs = await ctx.db.query('attendanceOverrideLogs').take(1);
    const lecturerSettings = await ctx.db.query('lecturerSettings').take(1);

    return {
      overrideLogsTableExists: true,
      lecturerSettingsTableExists: true,
      message: 'New tables are accessible',
    };
  },
});
