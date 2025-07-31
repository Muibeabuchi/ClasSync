# ClassSync Database Migrations

This directory contains database migrations for preparing the ClassSync application for production deployment. Each migration is designed to ensure data integrity, consistency, and optimal performance.

## Migration Files

### 001_add_course_schedule_field.ts

**Purpose**: Adds the `schedule` field to existing courses

- **Target Table**: `courses`
- **Changes**: Adds empty schedule array to courses that don't have one
- **Reason**: Ensures all courses have the schedule field for new scheduling features

### 002_cleanup_unused_tables.ts

**Purpose**: Removes data from unused tables

- **Target Table**: `attendanceList` (deprecated table)
- **Changes**: Deletes any remaining documents from unused table
- **Reason**: Clean up legacy data structures

### 005_production_preparation.ts

**Purpose**: Comprehensive data validation and cleanup for production readiness

- **Target Tables**: `userProfiles`, `attendanceRecords`, `courses`
- **Changes**:
  - Validates and fixes user profile data (emails, names, roles)
  - Creates missing lecturer consumption records
  - Cleans up orphaned attendance records
  - Ensures course data integrity
- **Reason**: Ensures all core data meets production standards

### 006_attendance_data_integrity.ts

**Purpose**: Validates and fixes attendance-related data

- **Target Tables**: `attendanceSessions`, `joinRequests`, `courseAttendanceList`
- **Changes**:
  - Validates attendance session status and location data
  - Cleans up invalid join requests
  - Ensures course attendance list integrity
- **Reason**: Critical for attendance system reliability

### 007_final_production_checks.ts

**Purpose**: Final validation and optimization before production

- **Target Tables**: `userProfiles`, `courses`, `classLists`
- **Changes**:
  - Checks for duplicate emails and registration numbers
  - Optimizes data for index performance
  - Final cleanup of class lists
- **Reason**: Last-mile checks for production readiness

## Running Migrations

Migrations are run automatically by the Convex migrations component. Each migration file exports a `run` function that can be called to execute the migrations.

### To run migrations:

1. **Development Environment**:

   ```bash
   npx convex dev
   ```

   Migrations will run automatically when the development server starts.

2. **Production Deployment**:
   ```bash
   npx convex deploy
   ```
   Migrations will run as part of the deployment process.

### Manual Migration Execution:

If you need to run specific migrations manually, you can call the migration functions directly:

```typescript
// In a Convex function or action
import { run as runProductionPrep } from './migrations/005_production_preparation';

// Execute the migration
await runProductionPrep(ctx);
```

## Migration Safety

All migrations are designed to be:

1. **Idempotent**: Can be run multiple times safely
2. **Non-destructive**: Preserve existing data where possible
3. **Logged**: Include console warnings for data issues
4. **Reversible**: Changes can be undone if needed

## Data Validation Rules

### User Profiles

- Email addresses must be valid and non-empty
- Full names must be present
- Registration numbers are normalized (uppercase, trimmed)
- Role consistency (lecturers have titles, students have registration numbers)

### Courses

- Course names and codes must be present
- Status must be valid ('active', 'archived', 'completed')
- Lecturer references must be valid
- Schedule data must be properly formatted

### Attendance Sessions

- Status must be valid ('active', 'pending', 'complete')
- Location coordinates must be within valid ranges
- Radius must be between 10-1000 meters
- Course and lecturer references must be valid

### Attendance Records

- All foreign key references must be valid
- Location data must be present and valid
- Check-in timestamps must be in ISO format

## Monitoring

After running migrations, monitor the console output for:

- **Warnings**: Data inconsistencies that were fixed
- **Errors**: Issues that couldn't be automatically resolved
- **Info**: Successful data transformations

## Rollback Strategy

If issues arise after migration:

1. **Data Backup**: Ensure you have a backup before running migrations
2. **Selective Rollback**: Use Convex's data import/export to restore specific tables
3. **Manual Fixes**: Address specific data issues identified in logs

## Production Checklist

Before deploying to production, ensure:

- [ ] All migrations have been tested in development
- [ ] Console logs have been reviewed for warnings/errors
- [ ] Data backup has been created
- [ ] Performance impact has been assessed
- [ ] Rollback plan is in place

## Support

For issues with migrations:

1. Check console logs for specific error messages
2. Review the migration code for the affected table
3. Test migrations in development environment first
4. Contact the development team for complex data issues
