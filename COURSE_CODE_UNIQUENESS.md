# Course Code Uniqueness Implementation

## Overview

This document describes the implementation of course code uniqueness in the ClassSync application. The system ensures that no two courses can have the same course code across the entire application.

## Implementation Details

### 1. Course Code Generation

When a lecturer creates a new course, the system:

1. Takes the initial course code provided by the lecturer
2. Cleans and normalizes it (removes special characters, converts to uppercase, limits to 5 characters)
3. Generates random alphanumeric characters to create a 10-character unique code
4. Checks the database to ensure the generated code is unique
5. If not unique, generates a new code (up to 10 attempts)
6. Throws an error if unable to generate a unique code after maximum attempts

### 2. Database Schema

The `courses` table includes:

- `courseCode: string` - The unique course code
- Index: `by_courseCode` for efficient uniqueness checking

### 3. Key Functions

#### `generateUniqueCourseCode(ctx, initialCourseCode, maxAttempts?)`

- **Purpose**: Generates a unique course code based on initial input
- **Parameters**:
  - `ctx`: Convex mutation context
  - `initialCourseCode`: The lecturer's desired course code
  - `maxAttempts`: Maximum attempts to generate unique code (default: 10)
- **Returns**: Promise<string> - A unique 10-character course code
- **Throws**: ConvexError if unable to generate unique code

#### `validateCourseCodeUniqueness(ctx, courseCode, excludeCourseId?)`

- **Purpose**: Validates if a course code is unique
- **Parameters**:
  - `ctx`: Convex mutation context
  - `courseCode`: The code to validate
  - `excludeCourseId`: Optional course ID to exclude from check (for updates)
- **Returns**: Promise<boolean> - True if unique, false otherwise

### 4. Course Creation Flow

```typescript
// In createCourse mutation
const courseCode = await CoursesModel.generateUniqueCourseCode(
  ctx,
  initialCourseCode,
);

const courseId = await ctx.db.insert('courses', {
  lecturerId,
  courseName,
  courseCode, // Guaranteed to be unique
  status: 'active',
  classListIds,
  schedule,
});
```

### 5. Migration Support

The system includes a migration (`ensureCourseCodeUniqueness`) that:

- Identifies existing duplicate course codes
- Keeps the first occurrence unchanged
- Generates new unique codes for duplicates
- Updates the database accordingly

### 6. Error Handling

- If uniqueness cannot be achieved after maximum attempts, a clear error message is provided
- The error suggests trying a different initial course code
- All database operations are atomic to prevent race conditions

## Usage Examples

### Creating a Course

```typescript
// Lecturer provides initial code "CS101"
// System might generate: "CS101ABCDE" (if unique)
// Or: "CS101XYZ12" (if first attempt wasn't unique)

const courseId = await createCourse({
  courseName: 'Computer Science 101',
  initialCourseCode: 'CS101',
  classListIds: [],
});
```

### Validation

```typescript
// Check if a code is unique
const isUnique = await validateCourseCodeUniqueness(ctx, 'MATH101ABC');
```

## Benefits

1. **Guaranteed Uniqueness**: No two courses can ever have the same code
2. **User-Friendly**: Lecturers can still provide meaningful initial codes
3. **Scalable**: System handles high concurrency and large numbers of courses
4. **Backward Compatible**: Existing courses are handled via migration
5. **Error Recovery**: Clear error messages when uniqueness cannot be achieved

## Testing

The implementation includes comprehensive tests covering:

- Basic uniqueness generation
- Multiple courses with same initial code
- Edge cases and error conditions
- Migration scenarios

## Future Enhancements

1. **Custom Code Patterns**: Allow institutions to define course code patterns
2. **Bulk Import**: Handle uniqueness during bulk course imports
3. **Code Recycling**: Reuse codes from deleted courses (with appropriate safeguards)
4. **Analytics**: Track course code generation patterns and conflicts
