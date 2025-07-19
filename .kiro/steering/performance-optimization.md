# Performance Optimization Guide for ClassSync

## Performance Philosophy

### 1. Measure First, Optimize Second

- Use performance profiling tools before making optimizations
- Focus on actual bottlenecks, not perceived ones
- Set performance budgets and monitor them

### 2. User-Centric Performance

- Prioritize perceived performance over technical metrics
- Optimize for the critical user journey (attendance check-in)
- Consider mobile and low-end device performance

### 3. Progressive Enhancement

- Ensure core functionality works on all devices
- Add performance enhancements for capable devices
- Graceful degradation for slower connections

## React Performance Optimization

### Component Memoization

```tsx
// Memoize expensive components
import { memo, useMemo, useCallback } from 'react';

// Memoize components that receive stable props
const AttendeeCard = memo(({ attendee, onSelect }: AttendeeCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{attendee.name}</p>
          <p className="text-sm text-muted-foreground">
            {attendee.registrationNumber}
          </p>
        </div>
        <Badge
          variant={attendee.status === 'present' ? 'success' : 'secondary'}
        >
          {attendee.status}
        </Badge>
      </div>
    </Card>
  );
});

// Memoize expensive calculations
const AttendanceStats = ({ sessions }: { sessions: AttendanceSession[] }) => {
  const stats = useMemo(() => {
    return {
      totalSessions: sessions.length,
      averageAttendance:
        sessions.reduce((acc, session) => acc + session.attendeeCount, 0) /
        sessions.length,
      completionRate:
        (sessions.filter((s) => s.status === 'complete').length /
          sessions.length) *
        100,
    };
  }, [sessions]);

  return <StatsDisplay stats={stats} />;
};

// Memoize event handlers
const AttendanceList = ({
  attendees,
  onStudentSelect,
}: AttendanceListProps) => {
  const handleStudentSelect = useCallback(
    (studentId: string) => {
      onStudentSelect(studentId);
    },
    [onStudentSelect],
  );

  return (
    <div className="space-y-2">
      {attendees.map((attendee) => (
        <AttendeeCard
          key={attendee.id}
          attendee={attendee}
          onSelect={handleStudentSelect}
        />
      ))}
    </div>
  );
};
```

### Virtual Scrolling for Large Lists

```tsx
// components/VirtualizedAttendanceList.tsx
import { FixedSizeList as List } from 'react-window';

interface VirtualizedAttendanceListProps {
  attendees: Attendee[];
  height: number;
  itemHeight: number;
}

const AttendeeRow = ({ index, style, data }: any) => (
  <div style={style}>
    <AttendeeCard attendee={data[index]} />
  </div>
);

export const VirtualizedAttendanceList = ({
  attendees,
  height,
  itemHeight,
}: VirtualizedAttendanceListProps) => (
  <List
    height={height}
    itemCount={attendees.length}
    itemSize={itemHeight}
    itemData={attendees}
  >
    {AttendeeRow}
  </List>
);
```

### Lazy Loading and Code Splitting

```tsx
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const AttendanceAnalytics = lazy(() => import('./AttendanceAnalytics'));
const CourseReports = lazy(() => import('./CourseReports'));

// Route-based code splitting
const AttendanceHistoryPage = lazy(
  () => import('./pages/AttendanceHistoryPage'),
);

// Component with lazy loading
const Dashboard = () => (
  <div className="space-y-6">
    <QuickStats />

    <Suspense fallback={<AnalyticsSkeleton />}>
      <AttendanceAnalytics />
    </Suspense>

    <Suspense fallback={<ReportsSkeleton />}>
      <CourseReports />
    </Suspense>
  </div>
);
```

## Convex Query Optimization

### Efficient Query Patterns

```typescript
// convex/attendance.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

// Use specific indexes for fast queries
export const getActiveSessions = query({
  args: { lecturerId: v.id('userProfiles') },
  handler: async (ctx, args) => {
    // Use composite index for efficient filtering
    return await ctx.db
      .query('attendanceSessions')
      .withIndex('by_lecturerId_status', (q) =>
        q.eq('lecturerId', args.lecturerId).eq('status', 'active'),
      )
      .collect();
  },
});

// Paginated queries for large datasets
export const getPaginatedAttendanceHistory = query({
  args: {
    courseId: v.id('courses'),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let query = ctx.db
      .query('attendanceSessions')
      .withIndex('by_courseId', (q) => q.eq('courseId', args.courseId))
      .order('desc');

    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field('_creationTime'), args.cursor));
    }

    const sessions = await query.take(limit + 1);
    const hasMore = sessions.length > limit;

    return {
      sessions: sessions.slice(0, limit),
      nextCursor: hasMore ? sessions[limit]._creationTime : null,
      hasMore,
    };
  },
});

// Aggregate data efficiently
export const getCourseAttendanceStats = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    // Get all sessions for the course
    const sessions = await ctx.db
      .query('attendanceSessions')
      .withIndex('by_courseId', (q) => q.eq('courseId', args.courseId))
      .collect();

    // Get all attendance records for these sessions
    const sessionIds = sessions.map((s) => s._id);
    const records = await Promise.all(
      sessionIds.map((sessionId) =>
        ctx.db
          .query('attendanceRecords')
          .withIndex('by_attendanceSessionId', (q) =>
            q.eq('attendanceSessionId', sessionId),
          )
          .collect(),
      ),
    );

    const flatRecords = records.flat();

    return {
      totalSessions: sessions.length,
      totalAttendance: flatRecords.length,
      averageAttendancePerSession: flatRecords.length / sessions.length || 0,
      attendanceBySession: sessions.map((session) => ({
        sessionId: session._id,
        date: session._creationTime,
        attendeeCount: flatRecords.filter(
          (r) => r.attendanceSessionId === session._id,
        ).length,
      })),
    };
  },
});
```

### Query Caching Strategies

```tsx
// hooks/useOptimizedQueries.ts
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';

// Cache frequently accessed data
export const useCachedCourses = (lecturerId: string) => {
  return useQuery(api.courses.getLecturerCourses, { lecturerId });
};

// Prefetch related data
export const useAttendanceSessionWithPrefetch = (sessionId: string) => {
  const session = useQuery(api.attendance.getAttendanceSession, { sessionId });

  // Prefetch attendees when session loads
  const attendees = useQuery(
    api.attendance.getSessionAttendees,
    session ? { sessionId } : 'skip',
  );

  return { session, attendees };
};

// Optimistic updates for better UX
export const useOptimisticAttendance = () => {
  const [optimisticRecords, setOptimisticRecords] = useState<
    AttendanceRecord[]
  >([]);
  const checkIn = useMutation(api.attendance.checkInToAttendance);

  const optimisticCheckIn = useCallback(
    async (data: CheckInData) => {
      // Add optimistic record immediately
      const optimisticRecord = {
        id: `temp-${Date.now()}`,
        studentId: data.studentId,
        sessionId: data.sessionId,
        status: 'present' as const,
        checkInTime: Date.now(),
      };

      setOptimisticRecords((prev) => [...prev, optimisticRecord]);

      try {
        await checkIn(data);
        // Remove optimistic record on success
        setOptimisticRecords((prev) =>
          prev.filter((r) => r.id !== optimisticRecord.id),
        );
      } catch (error) {
        // Remove optimistic record on error
        setOptimisticRecords((prev) =>
          prev.filter((r) => r.id !== optimisticRecord.id),
        );
        throw error;
      }
    },
    [checkIn],
  );

  return { optimisticCheckIn, optimisticRecords };
};
```

## Image and Asset Optimization

### Image Optimization

```tsx
// components/OptimizedImage.tsx
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  fallback = '/placeholder-avatar.png',
  loading = 'lazy',
}: OptimizedImageProps) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!loaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
      <img
        src={error ? fallback : src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
};
```

### Asset Preloading

```tsx
// hooks/usePreloadAssets.ts
import { useEffect } from 'react';

export const usePreloadAssets = (assets: string[]) => {
  useEffect(() => {
    const preloadPromises = assets.map((asset) => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = asset;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    });

    Promise.all(preloadPromises).catch(console.error);
  }, [assets]);
};
```

## Bundle Optimization

### Webpack Bundle Analysis

```javascript
// vite.config.ts optimization
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';

export default defineConfig({
  plugins: [
    // ... other plugins
    process.env.ANALYZE && analyzer(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {om '@radix-ui/react-dialog';

// Instead of
// import * as Dialog from '@radix-ui/react-dialog';
```

## Network Performance

### Request Optimization

```tsx
// utils/requestOptimization.ts
class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear() {
    this.cache.clear();
  }
}

export const requestCache = new RequestCache();

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

export const deduplicateRequest = async <T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};
```

### Service Worker for Caching

```javascript
// public/sw.js
const CACHE_NAME = 'classsync-v1';
const STATIC_ASSETS = ['/', '/manifest.json', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-first strategy for static assets
  if (event.request.url.includes('/assets/')) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => response || fetch(event.request)),
    );
  }

  // Network-first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    );
  }
});
```

## Performance Monitoring

### Performance Metrics

```tsx
// utils/performanceMonitoring.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  measureRender(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const end = performance.now();

    console.log(`${componentName} render time: ${end - start}ms`);

    // Send to analytics service
    this.sendMetric('component_render', {
      component: componentName,
      duration: end - start,
    });
  }

  measureQuery(queryName: string, queryFn: () => Promise<any>) {
    const start = performance.now();

    return queryFn().finally(() => {
      const end = performance.now();
      console.log(`${queryName} query time: ${end - start}ms`);

      this.sendMetric('query_duration', {
        query: queryName,
        duration: end - start,
      });
    });
  }

  private sendMetric(event: string, data: Record<string, any>) {
    // Send to your analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, data);
    }
  }
}

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  return PerformanceMonitor.getInstance();
};
```

### Core Web Vitals Monitoring

```tsx
// hooks/useWebVitals.ts
import { useEffect } from 'react';

export const useWebVitals = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
          // Send to analytics
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          const fid = entry.processingStart - entry.startTime;
          console.log('FID:', fid);
          // Send to analytics
        }
      }
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    return () => {
      observer.disconnect();
      fidObserver.disconnect();
    };
  }, []);
};
```

## Performance Best Practices Summary

1. **Measure before optimizing** - Use profiling tools to identify bottlenecks
2. **Optimize critical paths** - Focus on attendance check-in flow performance
3. **Use proper memoization** - Memoize expensive calculations and components
4. **Implement virtual scrolling** - For large lists of students/sessions
5. **Optimize Convex queries** - Use proper indexes and pagination
6. **Lazy load components** - Split code by routes and features
7. **Cache frequently accessed data** - Implement smart caching strategies
8. **Monitor performance metrics** - Track Core Web Vitals and custom metrics
9. **Optimize images and assets** - Use proper formats and lazy loading
10. **Minimize bundle size** - Tree shake unused code and split chunks
    // Separate vendor chunks
    vendor: ['react', 'react-dom'],
    ui: ['@radix-ui/react-dialog', '@radix-ui/react-button'],
    utils: ['date-fns', 'clsx', 'tailwind-merge'],
    },
    },
    },
    // Enable compression
    minify: 'terser',
    terserOptions: {
    compress: {
    drop_console: true,
    drop_debugger: true,
    },
    },
    },
    });

````

### Tree Shaking Optimization

```tsx
// Import only what you need
import { format } from 'date-fns/format';
import { isAfter } from 'date-fns/isAfter';

// Instead of
// import * as dateFns from 'date-fns';

// Use specific imports for Radix UI
import { Dialog, DialogContent, DialogTrigger } fr
````
