# Design Document

## Overview

The manual attendance override system extends the existing attendance architecture to provide lecturers with controlled post-session attendance management capabilities. The design emphasizes accountability, auditability, and user experience while preventing abuse through time-based restrictions and comprehensive logging. The system integrates seamlessly with the existing Convex-based real-time architecture and maintains the clean, professional UI standards established in the application.

## Architecture

### System Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Layer      │    │   Business       │    │   Data Layer    │
│                 │    │   Logic Layer    │    │                 │
│ • Session Page  │◄──►│ • Override       │◄──►│ • Attendance    │
│ • Override      │    │   Validation     │    │   Records       │
│   Modal/Drawer  │    │ • Time Window    │    │ • Override      │
│ • Statistics    │    │   Checks         │    │   Audit Logs    │
│   Display       │    │ • Audit Logging  │    │ • Lecturer      │
└─────────────────┘    └──────────────────┘    │   Settings      │
                                               └─────────────────┘
```

### Data Flow for Manual Override

```
1. Lecturer views completed session → Check override eligibility
2. Click "Mark as Present" → Validate time window & permissions
3. Open Modal/Drawer → Load student info & current status
4. Enter justification → Validate minimum length (ZOD schema)
5. Confirm override → Create audit log & update attendance record
6. Real-time UI update → Refresh statistics & visual indicators
```

### Integration with Existing System

The override system builds upon the current attendance architecture:

- **Extends** existing `attendanceRecords` table with override fields
- **Leverages** current real-time Convex queries for immediate UI updates
- **Maintains** existing permission and course enrollment validation
- **Preserves** all current attendance session lifecycle management

## Components and Interfaces

### 1. Database Schema Extensions

#### Enhanced Attendance Records Table

```typescript
// Extension to existing attendanceRecords table
attendanceRecords: defineTable({
  // ... existing fields
  attendanceSessionId: v.id('attendanceSessions'),
  studentId: v.id('userProfiles'),
  courseId: v.id('courses'),
  checkedInAt: v.string(),
  location: v.object({ lat: v.number(), long: v.number() }),
  distance: v.optional(v.number()),

  // New override-related fields
  isManualOverride: v.optional(v.boolean()),
  overrideTimestamp: v.optional(v.string()),
  overrideReason: v.optional(v.string()),
  overriddenBy: v.optional(v.id('userProfiles')),
  originalStatus: v.optional(v.literal('absent')),
});
```

#### New Override Audit Log Table

```typescript
attendanceOverrideLogs: defineTable({
  attendanceSessionId: v.id('attendanceSessions'),
  studentId: v.id('userProfiles'),
  lecturerId: v.id('userProfiles'),
  courseId: v.id('courses'),
  overrideTimestamp: v.string(),
  justificationNote: v.string(),
  originalStatus: v.literal('absent'),
  newStatus: v.literal('present'),
  sessionEndTime: v.number(),
  overrideWindowHours: v.number(),
})
  .index('by_session', ['attendanceSessionId'])
  .index('by_lecturer', ['lecturerId'])
  .index('by_student', ['studentId'])
  .index('by_timestamp', ['overrideTimestamp']);
```

#### Lecturer Settings Extension

```typescript
// Extension to userProfiles or new lecturerSettings table
lecturerSettings: defineTable({
  lecturerId: v.id('userProfiles'),
  overrideWindowHours: v.number(), // 1-24 hours, default 24
  notifyOnOverride: v.optional(v.boolean()),
}).index('by_lecturer', ['lecturerId']);
```

### 2. Convex Functions

#### Query Functions

```typescript
// Get attendance session with override eligibility
export const getAttendanceSessionWithOverrideInfo = query({
  args: { attendanceSessionId: v.id('attendanceSessions') },
  handler: async (ctx, args) => {
    // Fetch session details
    // Calculate override window eligibility
    // Get lecturer settings for time window
    // Return session with override metadata
  },
});

// Get attendance records with override indicators
export const getAttendanceRecordsWithOverrides = query({
  args: { attendanceSessionId: v.id('attendanceSessions') },
  handler: async (ctx, args) => {
    // Fetch all attendance records
    // Populate student information
    // Include override status and audit trail
    // Calculate absent students eligible for override
  },
});

// Get attendance statistics with override breakdown
export const getAttendanceStatistics = query({
  args: { attendanceSessionId: v.id('attendanceSessions') },
  handler: async (ctx, args) => {
    // Calculate total enrolled students
    // Count automatic check-ins
    // Count manual overrides
    // Count remaining absent students
    // Return comprehensive statistics
  },
});
```

#### Mutation Functions

```typescript
// Manual attendance override
export const createManualAttendanceOverride = mutation({
  args: {
    attendanceSessionId: v.id('attendanceSessions'),
    studentId: v.id('userProfiles'),
    justificationNote: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate lecturer permissions
    // Check time window eligibility
    // Validate justification note (15+ chars)
    // Prevent duplicate overrides
    // Create/update attendance record
    // Create audit log entry
    // Return success with updated record
  },
});

// Update lecturer override settings
export const updateLecturerOverrideSettings = mutation({
  args: {
    overrideWindowHours: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate settings ranges (1-24 hours)
    // Update or create lecturer settings
    // Return updated settings
  },
});
```

### 3. Custom Hooks with TanStack Query Integration

Following the established patterns in the codebase, here are the custom hooks:

#### useManualAttendanceOverride Hook

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConvexAuth } from 'convex/react';
import { useConvexMutation } from '@convex-dev/react-query';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

interface ManualOverrideParams {
  attendanceSessionId: string;
  studentId: string;
  justificationNote: string;
}

export const useManualAttendanceOverride = () => {
  const { isAuthenticated } = useConvexAuth();
  const queryClient = useQueryClient();

  const overrideMutation = useMutation({
    mutationFn: useConvexMutation(
      api.attendance.createManualAttendanceOverride,
    ),
    onSuccess: (data, variables) => {
      toast.success('Student marked as present successfully');

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['attendanceRecords', variables.attendanceSessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['attendanceStatistics', variables.attendanceSessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['attendanceSession', variables.attendanceSessionId],
      });
    },
    onError: (error) => {
      console.error('Override error:', error);
      toast.error('Failed to mark student as present', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  return {
    createOverride: (params: ManualOverrideParams) =>
      overrideMutation.mutateAsync(params),
    isLoading: overrideMutation.isPending,
    error: overrideMutation.error,
  };
};
```

#### useAttendanceSessionWithOverrides Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '../../convex/_generated/api';

export const useAttendanceSessionWithOverrides = (sessionId: string) => {
  const { data: sessionData, isLoading: sessionLoading } = useQuery(
    convexQuery(api.attendance.getAttendanceSessionWithOverrideInfo, {
      attendanceSessionId: sessionId,
    }),
  );

  const { data: attendanceRecords, isLoading: recordsLoading } = useQuery(
    convexQuery(api.attendance.getAttendanceRecordsWithOverrides, {
      attendanceSessionId: sessionId,
    }),
  );

  const { data: statistics, isLoading: statsLoading } = useQuery(
    convexQuery(api.attendance.getAttendanceStatistics, {
      attendanceSessionId: sessionId,
    }),
  );

  return {
    session: sessionData,
    attendanceRecords,
    statistics,
    isLoading: sessionLoading || recordsLoading || statsLoading,
  };
};
```

### 4. UI Components Using Shadcn UI

#### AttendanceSessionDetailPage (Enhanced)

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAttendanceSessionWithOverrides } from '@/hooks/useAttendanceSessionWithOverrides';

interface AttendanceSessionDetailPageProps {
  sessionId: string;
}

const AttendanceSessionDetailPage = ({
  sessionId,
}: AttendanceSessionDetailPageProps) => {
  const { session, attendanceRecords, statistics, isLoading } =
    useAttendanceSessionWithOverrides(sessionId);

  // Component implementation using Shadcn UI components
  // Real-time data updates through TanStack Query + Convex
};
```

#### AttendanceStatisticsCard

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface AttendanceStatistics {
  totalEnrolled: number;
  automaticCheckIns: number;
  manualOverrides: number;
  remainingAbsent: number;
  overrideWindowRemaining: string;
  canPerformOverrides: boolean;
}

const AttendanceStatisticsCard = ({ statistics }: { statistics: AttendanceStatistics }) => {
  const attendancePercentage = (statistics.automaticCheckIns + statistics.manualOverrides) /
    statistics.totalEnrolled * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Attendance Overview
          {statistics.canPerformOverrides && (
            <Badge variant="outline" className="text-xs">
              Override window: {statistics.overrideWindowRemaining}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Attendance</span>
            <span>{Math.round(attendancePercentage)}%</span>
          </div>
          <Progress value={attendancePercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Automatic Check-ins</span>
              <span className="font-medium">{statistics.automaticCheckIns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manual Overrides</span>
              <span className="font-medium text-amber-600">{statistics.manualOverrides}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Enrolled</span>
              <span className="font-medium">{statistics.totalEnrolled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Absent</span>
              <span className="font-medium text-red-600">{statistics.remainingAbsent}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### ManualOverrideDialog Component

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useManualAttendanceOverride } from '@/hooks/useManualAttendanceOverride';

interface ManualOverrideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    registrationNumber: string;
  };
  sessionId: string;
}

const ManualOverrideDialog = ({
  isOpen,
  onClose,
  student,
  sessionId
}: ManualOverrideDialogProps) => {
  const [justification, setJustification] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { createOverride, isLoading } = useManualAttendanceOverride();

  const handleSubmit = async () => {
    if (justification.trim().length < 15) return;

    try {
      await createOverride({
        attendanceSessionId: sessionId,
        studentId: student.id,
        justificationNote: justification.trim(),
      });
      onClose();
      setJustification('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student-info">Student Information</Label>
        <div className="p-3 bg-muted rounded-lg">
          <p className="font-medium">{student.name}</p>
          <p className="text-sm text-muted-foreground">{student.registrationNumber}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="justification">
          Justification for Manual Override *
          <span className="text-xs text-muted-foreground ml-2">
            (minimum 15 characters)
          </span>
        </Label>
        <Textarea
          id="justification"
          placeholder="Please provide a clear, descriptive reason for marking this student as present (e.g., 'Student had GPS issues but was physically present in class')"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          maxLength={100}
          className="min-h-[100px]"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {justification.length < 15
              ? `${15 - justification.length} more characters needed`
              : 'Minimum requirement met'
            }
          </span>
          <span>{justification.length}/100</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={justification.trim().length < 15 || isLoading}
          className="flex-1"
        >
          {isLoading ? 'Marking Present...' : 'Mark as Present'}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="px-4 pb-4">
          <DrawerHeader>
            <DrawerTitle>Mark Student as Present</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Student as Present</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
```

## Data Models

### Override Error Types (Using Objects instead of Enums)

```typescript
const OverrideErrorType = {
  SESSION_STILL_ACTIVE: 'SESSION_STILL_ACTIVE',
  TIME_WINDOW_EXPIRED: 'TIME_WINDOW_EXPIRED',
  STUDENT_ALREADY_PRESENT: 'STUDENT_ALREADY_PRESENT',
  INSUFFICIENT_JUSTIFICATION: 'INSUFFICIENT_JUSTIFICATION',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

type OverrideErrorType =
  (typeof OverrideErrorType)[keyof typeof OverrideErrorType];
```

### Validation Schema

```typescript
// ZOD schema for override justification
export const overrideJustificationSchema = z.object({
  justificationNote: z
    .string()
    .min(15, 'Justification must be at least 15 characters')
    .max(100, 'Justification cannot exceed 100 characters')
    .refine(
      (val) => val.trim().length >= 15,
      'Please provide a clear, descriptive reason for this override',
    ),
});

// Lecturer settings schema
export const lecturerOverrideSettingsSchema = z.object({
  overrideWindowHours: z
    .number()
    .min(1, 'Override window must be at least 1 hour')
    .max(24, 'Override window cannot exceed 24 hours'),
});
```

### Override Eligibility Calculation

```typescript
interface OverrideEligibility {
  canOverride: boolean;
  reason: string;
  timeRemaining: number;
  windowExpiresAt: number;
}

const calculateOverrideEligibility = (
  session: AttendanceSession,
  lecturerSettings: LecturerSettings,
  currentTime: number,
): OverrideEligibility => {
  // Session must be complete
  if (session.status !== 'complete') {
    return {
      canOverride: false,
      reason: 'Session is still active',
      timeRemaining: 0,
      windowExpiresAt: 0,
    };
  }

  // Check time window
  const windowHours = lecturerSettings.overrideWindowHours || 24;
  const windowMs = windowHours * 60 * 60 * 1000;
  const sessionEndTime = session.endedAt || session._creationTime;
  const windowExpiresAt = sessionEndTime + windowMs;

  if (currentTime > windowExpiresAt) {
    return {
      canOverride: false,
      reason: 'Override window has expired',
      timeRemaining: 0,
      windowExpiresAt,
    };
  }

  return {
    canOverride: true,
    reason: 'Override available',
    timeRemaining: windowExpiresAt - currentTime,
    windowExpiresAt,
  };
};
```

## Error Handling

### Error Message Mapping

```typescript
const getErrorMessage = (
  errorType: OverrideErrorType,
  context?: any,
): string => {
  const errorMessages = {
    [OverrideErrorType.SESSION_STILL_ACTIVE]:
      'Manual overrides are only available after the session ends',
    [OverrideErrorType.TIME_WINDOW_EXPIRED]: `Override window has expired. Overrides must be made within ${context?.windowHours || 24} hours of session end`,
    [OverrideErrorType.STUDENT_ALREADY_PRESENT]:
      'This student is already marked as present',
    [OverrideErrorType.INSUFFICIENT_JUSTIFICATION]:
      'Please provide a clear, descriptive reason (minimum 15 characters)',
    [OverrideErrorType.PERMISSION_DENIED]:
      'You do not have permission to override attendance for this session',
  } as const;

  return (
    errorMessages[errorType] ||
    'An unexpected error occurred. Please try again.'
  );
};
```

## Testing Strategy

### Unit Tests

1. **Override Eligibility Logic**
   - Test time window calculations with various scenarios
   - Validate session status requirements
   - Test lecturer settings integration

2. **Validation Functions**
   - Test justification note validation with edge cases
   - Validate settings ranges and constraints
   - Test permission checking logic

3. **Hook Testing**
   - Test TanStack Query integration
   - Validate cache invalidation patterns
   - Test error handling in hooks

### Integration Tests

1. **End-to-End Override Flow**
   - Complete override process from UI to database
   - Real-time UI updates after override
   - Audit log creation and retrieval

2. **Mobile Responsiveness**
   - Modal to Drawer transition on mobile
   - Touch interactions and accessibility
   - Layout adaptation across screen sizes

## Security Considerations

### Authorization and Access Control

1. **Lecturer Verification**
   - Verify lecturer owns the course
   - Validate session belongs to lecturer
   - Check lecturer permissions for override actions

2. **Time-Based Security**
   - Enforce override time windows strictly
   - Log all override attempts (successful and failed)
   - Prevent backdating or timestamp manipulation

3. **Audit Trail Integrity**
   - Immutable audit logs
   - Comprehensive logging of all override actions
   - Tamper-evident log entries with timestamps

## Performance Considerations

### TanStack Query Optimization

1. **Efficient Caching**
   - Leverage TanStack Query's built-in caching
   - Implement proper cache invalidation strategies
   - Use optimistic updates where appropriate

2. **Query Optimization**
   - Use existing Convex indexes for fast lookups
   - Implement proper query dependencies
   - Minimize unnecessary re-fetches

### UI Performance

1. **Component Optimization**
   - Use Shadcn UI components for consistency
   - Implement proper memoization patterns
   - Optimize re-render cycles with proper dependencies

2. **Mobile Performance**
   - Responsive design with proper breakpoints
   - Touch-friendly interface elements
   - Smooth animations and transitions
