# React Component Patterns for ClassSync

## Component Architecture Principles

### 1. Composition Over Inheritance

Build complex UIs by composing smaller, focused components rather than creating large monolithic components.

```tsx
// Good: Composed components
const AttendanceSessionCard = ({ session }: { session: AttendanceSession }) => (
  <Card>
    <CardHeader>
      <SessionStatus status={session.status} />
      <SessionTimer endTime={session.endTime} />
    </CardHeader>
    <CardContent>
      <SessionDetails session={session} />
    </CardContent>
    <CardActions>
      <SessionControls session={session} />
    </CardActions>
  </Card>
);

// Avoid: Monolithic components with too many responsibilities
```

### 2. Props Interface Design

Design clear, type-safe props interfaces that make component usage obvious.

```tsx
interface AttendanceSessionModalProps {
  courseId: string;
  courseName: string;
  children: React.ReactNode;
  onStartSession?: (courseId: string) => void;
  onCancel?: () => void;
}

// Use discriminated unions for variant props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

## State Management Patterns

### 1. Server State with Convex

Use Convex queries for server state management and React state for UI-only state.

```tsx
const AttendanceSessionPage = ({ sessionId }: { sessionId: string }) => {
  // Server state - managed by Convex
  const session = useQuery(api.attendance.getAttendanceSession, { sessionId });
  const attendees = useQuery(api.attendance.getSessionAttendees, { sessionId });

  // UI state - managed by React
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Mutations
  const endSession = useMutation(api.attendance.endAttendanceSession);

  if (session === undefined) return <LoadingSpinner />;
  if (session === null) return <NotFound />;

  return (
    <div>
      <SessionHeader session={session} />
      <AttendeesList
        attendees={attendees}
        onStudentSelect={setSelectedStudent}
      />
      <SessionControls
        session={session}
        onEndSession={() => endSession({ sessionId })}
      />
    </div>
  );
};
```

### 2. Form State Management

Use React Hook Form with Zod validation for form handling.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const attendanceSessionSchema = z.object({
  requireCode: z.boolean(),
  code: z.string().optional(),
  radiusMeters: z.number().min(50).max(300),
});

type AttendanceSessionForm = z.infer<typeof attendanceSessionSchema>;

const AttendanceSessionSetup = () => {
  const form = useForm<AttendanceSessionForm>({
    resolver: zodResolver(attendanceSessionSchema),
    defaultValues: {
      requireCode: false,
      radiusMeters: 150,
    },
  });

  const onSubmit = (data: AttendanceSessionForm) => {
    // Handle form submission
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>
  );
};
```

## Custom Hooks Patterns

### 1. Data Fetching Hooks

Create custom hooks to encapsulate data fetching logic.

```tsx
// hooks/useAttendanceSession.ts
export const useAttendanceSession = (sessionId: string) => {
  const session = useQuery(api.attendance.getAttendanceSession, { sessionId });
  const attendees = useQuery(api.attendance.getSessionAttendees, { sessionId });
  const endSession = useMutation(api.attendance.endAttendanceSession);

  const isActive = session?.status === 'active';
  const canEnd = session?.status === 'active' || session?.status === 'pending';

  return {
    session,
    attendees,
    isActive,
    canEnd,
    endSession: () => endSession({ sessionId }),
    isLoading: session === undefined || attendees === undefined,
  };
};

// Usage in component
const AttendanceSessionPage = ({ sessionId }: { sessionId: string }) => {
  const { session, attendees, isActive, endSession, isLoading } =
    useAttendanceSession(sessionId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <SessionStatus active={isActive} />
      <AttendeesList attendees={attendees} />
      <Button onClick={endSession}>End Session</Button>
    </div>
  );
};
```

### 2. UI State Hooks

Encapsulate complex UI state logic in custom hooks.

```tsx
// hooks/useModal.ts
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
};

// hooks/useGeolocation.ts
export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
        setError(null);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      },
      { enableHighAccuracy: true },
    );
  }, []);

  return { location, error, loading, getCurrentPosition };
};
```

## Error Handling Patterns

### 1. Error Boundaries

Implement error boundaries for graceful error handling.

```tsx
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error }>;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={AttendanceErrorFallback}>
  <AttendanceSessionPage sessionId={sessionId} />
</ErrorBoundary>;
```

### 2. Mutation Error Handling

Handle mutation errors with user-friendly messages.

```tsx
const useCreateAttendanceSession = () => {
  const createSession = useMutation(api.attendance.createAttendanceSession);

  const handleCreateSession = async (data: CreateSessionData) => {
    try {
      const sessionId = await createSession(data);
      toast.success('Attendance session created successfully');
      return sessionId;
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to create session', {
          description: error.message,
        });
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  };

  return { createSession: handleCreateSession };
};
```

## Performance Optimization Patterns

### 1. Memoization

Use React.memo, useMemo, and useCallback appropriately.

```tsx
// Memoize expensive components
const AttendeeCard = React.memo(({ attendee }: { attendee: Attendee }) => (
  <Card>
    <CardContent>
      <div>{attendee.name}</div>
      <div>{attendee.checkInTime}</div>
    </CardContent>
  </Card>
));

// Memoize expensive calculations
const AttendanceStats = ({ sessions }: { sessions: AttendanceSession[] }) => {
  const stats = useMemo(() => {
    return calculateAttendanceStats(sessions);
  }, [sessions]);

  return <StatsDisplay stats={stats} />;
};

// Memoize event handlers
const AttendeesList = ({ attendees, onSelect }: AttendeeListProps) => {
  const handleSelect = useCallback(
    (attendeeId: string) => {
      onSelect(attendeeId);
    },
    [onSelect],
  );

  return (
    <div>
      {attendees.map((attendee) => (
        <AttendeeCard
          key={attendee.id}
          attendee={attendee}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};
```

### 2. Lazy Loading

Implement lazy loading for route components and heavy components.

```tsx
// Route-based code splitting
const AttendanceHistoryPage = lazy(() => import('./AttendanceHistoryPage'));
const CourseAnalyticsPage = lazy(() => import('./CourseAnalyticsPage'));

// Component lazy loading
const HeavyChart = lazy(() => import('./HeavyChart'));

const Dashboard = () => (
  <div>
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={chartData} />
    </Suspense>
  </div>
);
```

## Accessibility Patterns

### 1. Semantic HTML and ARIA

Use proper semantic HTML and ARIA attributes.

```tsx
const AttendanceSessionStatus = ({ status, endTime }: StatusProps) => (
  <div role="status" aria-live="polite">
    <span className="sr-only">Session status:</span>
    <Badge
      variant={status === 'active' ? 'success' : 'secondary'}
      aria-label={`Session is ${status}`}
    >
      {status}
    </Badge>
    {status === 'active' && (
      <Timer endTime={endTime} aria-label="Time remaining in session" />
    )}
  </div>
);
```

### 2. Keyboard Navigation

Ensure components are keyboard accessible.

```tsx
const AttendanceCodeInput = ({
  onSubmit,
}: {
  onSubmit: (code: string) => void;
}) => {
  const [code, setCode] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit(code);
    }
  };

  return (
    <Input
      value={code}
      onChange={(e) => setCode(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Enter attendance code"
      aria-label="Attendance code"
      maxLength={6}
    />
  );
};
```

## Testing Patterns

### 1. Component Testing

Write focused component tests.

```tsx
// AttendanceSessionCard.test.tsx
import { render, screen } from '@testing-library/react';
import { AttendanceSessionCard } from './AttendanceSessionCard';

const mockSession = {
  id: '1',
  courseName: 'Computer Science 101',
  status: 'active' as const,
  endTime: Date.now() + 30000,
};

describe('AttendanceSessionCard', () => {
  it('displays session information correctly', () => {
    render(<AttendanceSessionCard session={mockSession} />);

    expect(screen.getByText('Computer Science 101')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('shows timer when session is active', () => {
    render(<AttendanceSessionCard session={mockSession} />);

    expect(screen.getByRole('timer')).toBeInTheDocument();
  });
});
```

### 2. Hook Testing

Test custom hooks in isolation.

```tsx
// useAttendanceSession.test.ts
import { renderHook } from '@testing-library/react';
import { useAttendanceSession } from './useAttendanceSession';

describe('useAttendanceSession', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useAttendanceSession('session-1'));

    expect(result.current.isLoading).toBe(true);
  });
});
```
