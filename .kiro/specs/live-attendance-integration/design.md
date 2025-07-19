# Design Document

## Overview

This design integrates the LiveAttendancePage component with the existing Convex backend to provide real-time attendance tracking. The system will replace mock data with actual database queries and leverage Convex's real-time reactivity for live updates during attendance sessions.

## Architecture

### Data Flow Architecture

```
Route Component → Convex Queries → LiveAttendancePage → Real-time Updates
     ↓                ↓                    ↓                    ↓
Load Session    Fetch Session      Display Data        Auto-refresh
   Data         & Records         with Loading         on Changes
```

### Real-time Update Pattern

- **Server-driven timing**: All session state calculations happen in Convex queries
- **Reactive UI**: Components automatically re-render when server data changes
- **Optimistic updates**: Manual overrides show immediately while syncing to server

## Components and Interfaces

### 1. Convex Query Functions

#### `getLiveAttendanceSession`

```typescript
export const getLiveAttendanceSession = query({
  args: { attendanceSessionId: v.id('attendanceSessions') },
  handler: async (ctx, args) => {
    // Fetch session with computed state based on server time
    // Return session data with current state (pending/active/complete)
    // Include timing information for countdown
  },
});
```

#### `getLiveAttendanceRecords`

```typescript
export const getLiveAttendanceRecords = query({
  args: { attendanceSessionId: v.id('attendanceSessions') },
  handler: async (ctx, args) => {
    // Fetch all attendance records for the session
    // Populate with student information
    // Calculate GPS distances and status
    // Return sorted by check-in time
  },
});
```

#### `getCourseEnrollmentCount`

```typescript
export const getCourseEnrollmentCount = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    // Get total number of enrolled students
    // Used for attendance percentage calculations
  },
});
```

### 2. Manual Override Mutation

#### `manualAttendanceOverride`

```typescript
export const manualAttendanceOverride = mutation({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    studentId: v.id('userProfiles'),
    reason: v.string(),
    overrideStatus: v.literal('present'),
  },
  handler: async (ctx, args) => {
    // Create or update attendance record with manual override
    // Record override reason and timestamp
    // Mark as manually adjusted
  },
});
```

### 3. Component Data Interfaces

#### `LiveAttendanceSessionData`

```typescript
interface LiveAttendanceSessionData {
  session: {
    _id: Id<'attendanceSessions'>;
    courseId: Id<'courses'>;
    courseName: string;
    courseCode: string;
    status: 'pending' | 'active' | 'complete';
    startTime: number;
    endTime: number;
    attendanceCode?: string;
    location: { lat: number; long: number };
    radiusMeters: number;
  };
  computedState: {
    currentState: 'pending' | 'active' | 'complete';
    timeRemaining: number;
    progressPercentage: number;
  };
  enrollmentCount: number;
}
```

#### `LiveAttendanceRecord`

```typescript
interface LiveAttendanceRecord {
  _id: Id<'attendanceRecords'>;
  studentId: Id<'userProfiles'>;
  studentName: string;
  registrationNumber: string;
  checkedInAt: string;
  location: { lat: number; long: number };
  distance: number;
  status: 'present' | 'outside_radius' | 'manual_override';
  isManualOverride: boolean;
  overrideReason?: string;
}
```

### 4. Loading Skeleton Component

#### `LiveAttendancePageSkeleton`

```typescript
const LiveAttendancePageSkeleton = () => {
  // Header skeleton
  // Session state card skeleton with animated elements
  // Student list skeleton with multiple rows
  // Proper spacing and animations
};
```

## Data Models

### Session State Computation

The session state will be computed server-side based on timing:

```typescript
const computeSessionState = (session: AttendanceSession) => {
  const now = Date.now();
  const { _creationTime, endedAt } = session;
  const prepDuration = AttendanceSessionDuration / 2; // 30 seconds

  if (now < _creationTime + prepDuration) {
    return 'pending';
  } else if (now < endedAt) {
    return 'active';
  } else {
    return 'complete';
  }
};
```

### GPS Distance Calculation

Reuse existing `calculateDistance` function from `attendanceModel.ts`:

```typescript
const calculateStudentDistance = (
  sessionLocation: { lat: number; long: number },
  studentLocation: { lat: number; long: number },
) => {
  return AttendanceModel.calculateDistance({
    lat1: sessionLocation.lat,
    lon1: sessionLocation.long,
    lat2: studentLocation.lat,
    lon2: studentLocation.long,
  });
};
```

## Error Handling

### Query Error States

1. **Session Not Found**: Return null, component shows "Session not found" message
2. **Permission Denied**: Throw error, component shows access denied message
3. **Network Issues**: Convex handles retries, component shows loading state

### Manual Override Validation

1. **Duplicate Override**: Check if student already has attendance record
2. **Session State**: Only allow overrides during active or recently completed sessions
3. **Reason Required**: Validate override reason is provided and non-empty

## Testing Strategy

### Unit Tests

1. **Query Functions**: Test session state computation with different timestamps
2. **Distance Calculations**: Test GPS validation with various coordinates
3. **Manual Overrides**: Test override logic and validation

### Integration Tests

1. **Real-time Updates**: Test that UI updates when attendance records change
2. **Session State Transitions**: Test UI behavior during state changes
3. **Error Handling**: Test component behavior with various error states

### End-to-End Tests

1. **Complete Attendance Flow**: Test lecturer creating session and students checking in
2. **Manual Override Flow**: Test lecturer overriding student attendance
3. **Session Lifecycle**: Test complete session from creation to completion

## Performance Considerations

### Query Optimization

1. **Indexed Queries**: Use existing indexes for fast session and record lookups
2. **Selective Data**: Only fetch necessary fields for UI display
3. **Pagination**: Consider pagination for large attendance lists (future enhancement)

### Real-time Efficiency

1. **Targeted Subscriptions**: Only subscribe to relevant session data
2. **Debounced Updates**: Prevent excessive re-renders during rapid changes
3. **Memoization**: Cache computed values like distances and states

## Security Considerations

### Authorization

1. **Lecturer Access**: Verify lecturer owns the course before showing session data
2. **Session Validation**: Ensure session exists and is accessible
3. **Override Permissions**: Only allow manual overrides by session owner

### Data Validation

1. **Input Sanitization**: Validate all override reasons and inputs
2. **GPS Coordinates**: Validate coordinate ranges and formats
3. **Session State**: Prevent invalid state transitions
