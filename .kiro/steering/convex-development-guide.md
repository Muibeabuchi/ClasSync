# Convex Development Guide for ClassSync

## Overview

Convex is our backend-as-a-service that provides real-time database, serverless functions, and authentication. This guide covers best practices for working with Convex in the ClassSync project.

## Database Schema Patterns

### Schema Definition Best Practices

```typescript
// Always use proper indexing for query performance
defineTable({
  // fields
})
  .index('by_primary_field', ['primaryField'])
  .index('by_composite', ['field1', 'field2'])
  .index('by_status_and_date', ['status', 'createdAt']);
```

### Key Schema Principles

1. **Index frequently queried fields** - Every query should use an index
2. **Use composite indexes** for multi-field queries
3. **Validate data types** with Convex validators
4. **Reference integrity** - Use proper Id types for relationships

## Function Types and Usage

### Queries (Read Operations)

```typescript
// queries/getAttendanceSession.ts
export const getAttendanceSession = query({
  args: { sessionId: v.id('attendanceSessions') },
  handler: async (ctx, args) => {
    // Always check permissions first
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    // Use indexed queries
    return await ctx.db.get(args.sessionId);
  },
});
```

### Mutations (Write Operations)

```typescript
// mutations/createAttendanceSession.ts
export const createAttendanceSession = mutation({
  args: {
    courseId: v.id('courses'),
    location: v.object({ lat: v.number(), long: v.number() }),
    requireCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    // Validate business logic
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error('Course not found');

    // Create with server timestamp
    const sessionId = await ctx.db.insert('attendanceSessions', {
      ...args,
      lecturerId: identity.subject as Id<'userProfiles'>,
      status: 'pending',
      startTime: Date.now(),
      endTime: Date.now() + 60000, // 1 minute
    });

    return sessionId;
  },
});
```

### Actions (External API Calls)

```typescript
// actions/sendNotification.ts
export const sendNotification = action({
  args: { userId: v.id('userProfiles'), message: v.string() },
  handler: async (ctx, args) => {
    // Actions can call external APIs
    // Use for integrations, email sending, etc.
  },
});
```

## Real-time Data Patterns

### Server-Driven State Management

```typescript
// Compute state based on server time, not client time
export const getAttendanceSessionWithState = query({
  args: { sessionId: v.id('attendanceSessions') },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    const now = Date.now();
    const { startTime, endTime } = session;

    let state: 'pending' | 'active' | 'inactive';
    if (now < startTime + 30000) {
      state = 'pending';
    } else if (now < endTime) {
      state = 'active';
    } else {
      state = 'inactive';
    }

    return { ...session, computedState: state };
  },
});
```

### Reactive UI Updates

```typescript
// Client-side: Subscribe to real-time updates
const useAttendanceSession = (sessionId: string) => {
  const session = useQuery(api.attendance.getAttendanceSessionWithState, {
    sessionId: sessionId as Id<'attendanceSessions'>,
  });

  // Component automatically re-renders when server data changes
  return session;
};
```

## Authentication & Authorization

### User Identity Validation

```typescript
// Always validate user identity in functions
const validateLecturerAccess = async (
  ctx: QueryCtx | MutationCtx,
  courseId: Id<'courses'>,
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const course = await ctx.db.get(courseId);
  if (!course || course.lecturerId !== identity.subject) {
    throw new Error('Access denied');
  }

  return identity;
};
```

### Role-Based Access Control

```typescript
// Check user roles and permissions
export const lecturerOnlyMutation = mutation({
  args: {
    /* args */
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const userProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', identity.email))
      .first();

    if (!userProfile || userProfile.role !== 'lecturer') {
      throw new Error('Lecturer access required');
    }

    // Proceed with mutation
  },
});
```

## Error Handling Best Practices

### Consistent Error Messages

```typescript
// Use descriptive error messages
if (!session) {
  throw new Error('Attendance session not found');
}

if (session.status === 'inactive') {
  throw new Error('Attendance session has ended');
}

// For client-side handling
try {
  await createAttendanceSession(args);
} catch (error) {
  toast.error('Failed to create session', {
    description: error.message,
  });
}
```

### Validation Patterns

```typescript
// Validate inputs thoroughly
export const checkInToAttendance = mutation({
  args: {
    sessionId: v.id('attendanceSessions'),
    location: v.object({
      lat: v.number(),
      long: v.number(),
    }),
    code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Validate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');

    // 2. Validate session exists and is active
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error('Session not found');

    const now = Date.now();
    if (now < session.startTime + 30000 || now > session.endTime) {
      throw new Error('Session is not currently active');
    }

    // 3. Validate attendance code if required
    if (session.requiresCode && args.code !== session.code) {
      throw new Error('Invalid attendance code');
    }

    // 4. Check for duplicate check-in
    const existingRecord = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendanceSessionId_by_StudentId', (q) =>
        q
          .eq('attendanceSessionId', args.sessionId)
          .eq('studentId', identity.subject as Id<'userProfiles'>),
      )
      .first();

    if (existingRecord) {
      throw new Error('Already checked in to this session');
    }

    // 5. Validate GPS location (implement distance calculation)
    const distance = calculateDistance(args.location, session.location);
    if (distance > session.radiusMeters) {
      throw new Error('You are too far from the session location');
    }

    // 6. Create attendance record
    return await ctx.db.insert('attendanceRecords', {
      attendanceSessionId: args.sessionId,
      studentId: identity.subject as Id<'userProfiles'>,
      courseId: session.courseId,
      checkedInAt: new Date().toISOString(),
      location: args.location,
    });
  },
});
```

## Performance Optimization

### Efficient Queries

```typescript
// Use specific indexes
const coursesByLecturer = await ctx.db
  .query('courses')
  .withIndex('by_lecturer', (q) => q.eq('lecturerId', lecturerId))
  .collect();

// Limit results when appropriate
const recentSessions = await ctx.db
  .query('attendanceSessions')
  .withIndex('by_courseId', (q) => q.eq('courseId', courseId))
  .order('desc')
  .take(10);
```

### Batch Operations

```typescript
// Process multiple operations efficiently
const createMultipleRecords = mutation({
  args: {
    records: v.array(
      v.object({
        /* record schema */
      }),
    ),
  },
  handler: async (ctx, args) => {
    const results = await Promise.all(
      args.records.map((record) => ctx.db.insert('tableName', record)),
    );
    return results;
  },
});
```

## Testing Convex Functions

### Unit Testing Patterns

```typescript
// Test business logic separately from Convex context
export const calculateAttendancePercentage = (
  totalSessions: number,
  attendedSessions: number,
): number => {
  if (totalSessions === 0) return 0;
  return Math.round((attendedSessions / totalSessions) * 100);
};

// Test this function independently
describe('calculateAttendancePercentage', () => {
  it('should calculate correct percentage', () => {
    expect(calculateAttendancePercentage(10, 8)).toBe(80);
  });
});
```

## Common Patterns

### Pagination

```typescript
export const getPaginatedCourses = query({
  args: {
    lecturerId: v.id('userProfiles'),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let query = ctx.db
      .query('courses')
      .withIndex('by_lecturer', (q) => q.eq('lecturerId', args.lecturerId));

    if (args.cursor) {
      query = query.filter((q) => q.gt(q.field('_creationTime'), args.cursor));
    }

    const courses = await query.take(limit + 1);
    const hasMore = courses.length > limit;

    return {
      courses: courses.slice(0, limit),
      nextCursor: hasMore ? courses[limit]._creationTime : null,
    };
  },
});
```

### Aggregations

```typescript
export const getCourseStats = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('attendanceSessions')
      .withIndex('by_courseId', (q) => q.eq('courseId', args.courseId))
      .collect();

    const totalSessions = sessions.length;
    const activeSessions = sessions.filter((s) => s.status === 'active').length;

    return { totalSessions, activeSessions };
  },
});
```
