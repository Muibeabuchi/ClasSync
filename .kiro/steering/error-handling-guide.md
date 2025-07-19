# Error Handling Guide for ClassSync

## Error Handling Philosophy

### 1. User-Centric Error Messages

- Provide clear, actionable error messages to users
- Avoid technical jargon in user-facing errors
- Offer solutions or next steps when possible

### 2. Graceful Degradation

- Application should continue to function when non-critical features fail
- Provide fallback UI states for failed data loads
- Cache data when possible to handle network issues

### 3. Comprehensive Logging

- Log all errors for debugging and monitoring
- Include relevant context (user ID, session ID, etc.)
- Use structured logging for better analysis

## Client-Side Error Handling

### React Error Boundaries

```tsx
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error; retry: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Send to error reporting service (e.g., Sentry)
    console.error('Application Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  };

  private retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback = ({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
    <p className="text-muted-foreground mb-4 max-w-md">
      We encountered an unexpected error. Please try again or contact support if
      the problem persists.
    </p>
    <Button onClick={retry}>Try Again</Button>
  </div>
);
```

### Async Error Handling

```tsx
// hooks/useAsyncError.ts
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useAsyncError = () => {
  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);

    if (error instanceof Error) {
      // Handle known error types
      if (error.message.includes('Unauthorized')) {
        toast.error('Session expired', {
          description: 'Please log in again to continue.',
        });
        // Redirect to login
        return;
      }

      if (error.message.includes('Network')) {
        toast.error('Connection problem', {
          description: 'Please check your internet connection and try again.',
        });
        return;
      }

      // Generic error with specific message
      toast.error('Operation failed', {
        description: error.message,
      });
    } else {
      // Unknown error type
      toast.error('Unexpected error', {
        description: 'Something went wrong. Please try again.',
      });
    }
  }, []);

  return { handleError };
};
```

### Form Error Handling

```tsx
// components/forms/FormField.tsx
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  [key: string]: any;
}

export const FormField = ({
  name,
  label,
  error,
  required,
  className,
  ...props
}: FormFieldProps) => (
  <div className="space-y-2">
    <Label
      htmlFor={name}
      className={
        required ? "after:content-['*'] after:text-destructive after:ml-1" : ''
      }
    >
      {label}
    </Label>
    <Input
      id={name}
      name={name}
      className={cn(
        'transition-colors',
        error && 'border-destructive focus:border-destructive',
        className,
      )}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      {...props}
    />
    {error && (
      <p
        id={`${name}-error`}
        className="text-sm text-destructive flex items-center gap-1"
      >
        <AlertCircle className="h-4 w-4" />
        {error}
      </p>
    )}
  </div>
);
```

## Server-Side Error Handling (Convex)

### Mutation Error Patterns

```typescript
// convex/attendance.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const createAttendanceSession = mutation({
  args: {
    courseId: v.id('courses'),
    requireCode: v.optional(v.string()),
    radiusMeters: v.number(),
    gpsCoordinates: v.object({
      lat: v.number(),
      long: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Authentication check
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error('Authentication required');
      }

      // 2. Authorization check
      const course = await ctx.db.get(args.courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      if (course.lecturerId !== identity.subject) {
        throw new Error(
          'Access denied: You are not the lecturer for this course',
        );
      }

      // 3. Business logic validation
      const existingActiveSession = await ctx.db
        .query('attendanceSessions')
        .withIndex('by_courseId', (q) => q.eq('courseId', args.courseId))
        .filter((q) => q.eq(q.field('status'), 'active'))
        .first();

      if (existingActiveSession) {
        throw new Error(
          'An active attendance session already exists for this course',
        );
      }

      // 4. Input validation
      if (args.radiusMeters < 10 || args.radiusMeters > 1000) {
        throw new Error('Radius must be between 10 and 1000 meters');
      }

      // 5. Create session
      const sessionId = await ctx.db.insert('attendanceSessions', {
        courseId: args.courseId,
        lecturerId: identity.subject as Id<'userProfiles'>,
        attendanceCode: args.requireCode,
        location: {
          lat: args.gpsCoordinates.lat,
          long: args.gpsCoordinates.long,
        },
        status: 'pending',
        endedAt: undefined,
      });

      return sessionId;
    } catch (error) {
      // Log error with context
      console.error('Failed to create attendance session:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        courseId: args.courseId,
        lecturerId: identity?.subject,
        timestamp: new Date().toISOString(),
      });

      // Re-throw to let client handle
      throw error;
    }
  },
});
```

### Query Error Handling

```typescript
// convex/attendance.ts
export const getAttendanceSession = query({
  args: { sessionId: v.id('attendanceSessions') },
  handler: async (ctx, args) => {
    try {
      const session = await ctx.db.get(args.sessionId);

      if (!session) {
        // Return null instead of throwing for missing data
        return null;
      }

      // Check if user has access to this session
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error('Authentication required');
      }

      // Lecturers can see their own sessions
      if (session.lecturerId === identity.subject) {
        return session;
      }

      // Students can see sessions for courses they're enrolled in
      const enrollment = await ctx.db
        .query('courseAttendanceList')
        .withIndex('by_courseId_by_studentId', (q) =>
          q.eq('courseId', session.courseId).eq('studentId', identity.subject),
        )
        .first();

      if (!enrollment) {
        throw new Error('Access denied: You are not enrolled in this course');
      }

      return session;
    } catch (error) {
      console.error('Failed to get attendance session:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: args.sessionId,
        userId: identity?.subject,
      });
      throw error;
    }
  },
});
```

## Network Error Handling

### Retry Logic

```tsx
// hooks/useRetry.ts
import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

export const useRetry = (options: UseRetryOptions = {}) => {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;
  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        setAttempts(attempt + 1);
        setIsRetrying(attempt > 0);

        const result = await fn();
        setIsRetrying(false);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < maxAttempts - 1) {
          const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    setIsRetrying(false);
    throw lastError!;
  }, [maxAttempts, delay, backoff]);

  return { retry, attempts, isRetrying };
};
```

### Offline Handling

```tsx
// hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// components/OfflineIndicator.tsx
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground p-2 text-center z-50">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">You are currently offline</span>
      </div>
    </div>
  );
};
```

## Error Types and Classifications

### Custom Error Classes

```typescript
// lib/errors.ts
export class AttendanceError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>,
  ) {
    super(message);
    this.name = 'AttendanceError';
  }
}

export class ValidationError extends AttendanceError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends AttendanceError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', context);
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends AttendanceError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

export class GeolocationError extends AttendanceError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'GEOLOCATION_ERROR', context);
    this.name = 'GeolocationError';
  }
}
```

### Error Handler Utility

```typescript
// lib/errorHandler.ts
import { toast } from 'sonner';
import {
  AttendanceError,
  ValidationError,
  AuthorizationError,
  NetworkError,
  GeolocationError,
} from './errors';

export const handleError = (error: unknown, context?: string) => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);

  if (error instanceof ValidationError) {
    toast.error('Invalid input', {
      description: error.message,
    });
    return;
  }

  if (error instanceof AuthorizationError) {
    toast.error('Access denied', {
      description: error.message,
    });
    // Potentially redirect to login
    return;
  }

  if (error instanceof NetworkError) {
    toast.error('Connection problem', {
      description: 'Please check your internet connection and try again.',
    });
    return;
  }

  if (error instanceof GeolocationError) {
    toast.error('Location access required', {
      description: error.message,
    });
    return;
  }

  if (error instanceof AttendanceError) {
    toast.error('Operation failed', {
      description: error.message,
    });
    return;
  }

  // Generic error handling
  if (error instanceof Error) {
    toast.error('Something went wrong', {
      description: error.message,
    });
  } else {
    toast.error('Unexpected error', {
      description: 'An unknown error occurred. Please try again.',
    });
  }
};
```

## Loading and Error States

### Loading State Components

```tsx
// components/LoadingStates.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const AttendanceSessionSkeleton = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

export const AttendanceListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-4 p-4 border rounded-lg"
      >
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    ))}
  </div>
);
```

### Error State Components

```tsx
// components/ErrorStates.tsx
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ComponentType<{ className?: string }>;
}

export const ErrorState = ({
  title,
  description,
  action,
  icon: Icon = AlertTriangle,
}: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <Icon className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
    {action && (
      <Button onClick={action.onClick}>
        <RefreshCw className="h-4 w-4 mr-2" />
        {action.label}
      </Button>
    )}
  </div>
);

export const NetworkErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <ErrorState
    title="Connection problem"
    description="Unable to connect to the server. Please check your internet connection and try again."
    action={{ label: 'Try Again', onClick: onRetry }}
    icon={WifiOff}
  />
);

export const NotFoundState = ({ resource }: { resource: string }) => (
  <ErrorState
    title={`${resource} not found`}
    description={`The ${resource.toLowerCase()} you're looking for doesn't exist or has been removed.`}
  />
);
```

## Best Practices Summary

1. **Always validate user input** on both client and server
2. **Provide meaningful error messages** that help users understand what went wrong
3. **Log errors with sufficient context** for debugging
4. **Handle network failures gracefully** with retry logic and offline states
5. **Use error boundaries** to prevent entire app crashes
6. **Show loading states** during async operations
7. **Implement proper fallbacks** for failed operations
8. **Test error scenarios** as thoroughly as success scenarios
