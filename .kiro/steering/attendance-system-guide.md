# 📚 ClassSync Attendance System – Developer Implementation Guide

This guide explains how to implement the **real-time attendance logic** for ClassSync — a GPS-based attendance app for lecturers and students.

---

## ✅ Overview

- Lecturers can initiate attendance sessions.
- Students check in **within a fixed time window** using their GPS.
- The system supports optional **attendance codes** and **manual overrides**.
- **All timing is server-driven**, and **Convex's real-time reactivity** ensures synchronized UI updates across all connected clients.

---

## ⏱️ ⚠️ TIMING IS SERVER-DRIVEN

Do **not** rely on client-side timers for attendance logic.

- When a lecturer creates an attendance session:
  - The server sets:
    - `startTime = now`
    - `endTime = startTime + 60 seconds`
    - `state = "pending"` initially, then `"active"` after 30 seconds, then `"inactive"` after 60 seconds.
  - This state and `endTime` are exposed in a **Convex query**.
  - The **UI uses the `endTime` and `state` from the query to show countdowns and session status**.
  - Because the Convex database is reactive, **all clients (students and lecturers) see real-time updates automatically**.

---

## 🧑‍🏫 1. Lecturer Starts Attendance

- Endpoint: `createAttendanceSession(courseId, options?)`
- Payload includes:
  - `requiresCode: boolean`
  - `code: string | undefined`
- Server creates:

```ts
{
  state: "pending",
  startTime: Timestamp.now(),
  endTime: Timestamp.now() + 60s,
  duration: 60s,
  prepWindow: 30s,
  courseId: string,
  createdBy: lecturerId
}
```

---

## 🎯 2. Session State Management

### States:

- **`pending`**: Session created, students can see it but cannot check in yet (0-30s)
- **`active`**: Students can check in (30-60s)
- **`inactive`**: Session ended, no more check-ins allowed (60s+)

### State Transitions:

- Server automatically transitions states based on timestamps
- Use Convex scheduled functions or queries that compute state based on current time vs. session timestamps

---

## 📱 3. Student Check-in Process

- Endpoint: `checkInToAttendance(sessionId, location, code?)`
- Validation:
  1. Session must be in `"active"` state
  2. Student must be enrolled in the course
  3. GPS location must be within acceptable range
  4. If required, attendance code must match
  5. Student cannot check in twice to the same session

### GPS Validation:

- Calculate distance between student location and session location
- Use appropriate distance calculation (Haversine formula)
- Allow configurable radius (e.g., 100 meters)

---

## 🔄 4. Real-time Updates

### Convex Queries:

- `getActiveAttendanceSession(courseId)` - Returns current session with computed state
- `getAttendanceSessionDetails(sessionId)` - Returns session with attendee list
- `getMyAttendanceStatus(sessionId)` - Returns student's check-in status

### UI Reactivity:

- All components subscribe to relevant Convex queries
- State changes automatically trigger UI updates
- Countdown timers use server `endTime` as source of truth

---

## 🛠️ 5. Implementation Guidelines

### Server-Side (Convex):

- Always use server timestamps for time calculations
- Implement state computation in queries, not mutations
- Use Convex's built-in reactivity for real-time updates
- Validate all inputs thoroughly

### Client-Side (React):

- Subscribe to Convex queries for real-time data
- Use server timestamps for countdown calculations
- Handle loading and error states gracefully
- Implement optimistic updates where appropriate

### Error Handling:

- Handle network disconnections gracefully
- Provide clear error messages for failed check-ins
- Implement retry mechanisms for critical operations

---

## 📊 6. Data Models

### AttendanceSession:

```ts
{
  _id: Id<"attendanceSessions">,
  courseId: Id<"courses">,
  createdBy: Id<"users">,
  startTime: number,
  endTime: number,
  duration: number,
  prepWindow: number,
  state: "pending" | "active" | "inactive",
  requiresCode: boolean,
  code?: string,
  location?: {
    latitude: number,
    longitude: number,
    accuracy: number
  }
}
```

### AttendanceRecord:

```ts
{
  _id: Id<"attendanceRecords">,
  sessionId: Id<"attendanceSessions">,
  studentId: Id<"users">,
  checkInTime: number,
  location: {
    latitude: number,
    longitude: number,
    accuracy: number
  },
  status: "present" | "late" | "absent",
  isManualOverride: boolean
}
```

---

## 🔐 7. Security Considerations

- Validate user permissions for all operations
- Sanitize and validate GPS coordinates
- Protect attendance codes from client-side exposure
- Implement rate limiting for check-in attempts
- Log all attendance-related actions for audit trails

---

## 🧪 8. Testing Guidelines

- Test state transitions with different timing scenarios
- Verify GPS validation with various location inputs
- Test real-time updates across multiple clients
- Validate error handling for edge cases
- Test with poor network conditions

---

## 📝 9. Key Principles

1. **Server Authority**: All timing and state decisions happen on the server
2. **Real-time First**: Use Convex reactivity for immediate UI updates
3. **Validation Everywhere**: Validate inputs on both client and server
4. **User Experience**: Provide clear feedback and error messages
5. **Security**: Always verify permissions and sanitize inputs
