# Testing Standards for ClassSync

## Testing Philosophy

### 1. Test Pyramid Approach

- **Unit Tests (70%)**: Test individual functions and components in isolation
- **Integration Tests (20%)**: Test component interactions and API integrations
- **End-to-End Tests (10%)**: Test critical user journeys

### 2. Testing Priorities

1. **Critical Business Logic**: Attendance calculations, session state management
2. **User Interactions**: Form submissions, button clicks, navigation
3. **Error Handling**: Network failures, validation errors, edge cases
4. **Accessibility**: Screen reader compatibility, keyboard navigation

## Unit Testing Patterns

### Component Testing with React Testing Library

```tsx
// AttendanceSessionCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AttendanceSessionCard } from './AttendanceSessionCard';

const mockSession = {
  id: 'session-1',
  courseName: 'Computer Science 101',
  status: 'active' as const,
  endTime: Date.now() + 30000,
  attendeeCount: 5,
  requiresCode: true,
  code: 'ABC123',
};

describe('AttendanceSessionCard', () => {
  it('displays session information correctly', () => {
    render(<AttendanceSessionCard session={mockSession} />);

    expect(screen.getByText('Computer Science 101')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });

  it('shows timer when session is active', () => {
    render(<AttendanceSessionCard session={mockSession} />);

    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('calls onEndSession when end button is clicked', () => {
    const mockOnEnd = jest.fn();
    render(
      <AttendanceSessionCard session={mockSession} onEndSession={mockOnEnd} />,
    );

    fireEvent.click(screen.getByText('End Session'));
    expect(mockOnEnd).toHaveBeenCalledWith('session-1');
  });
});
```

### Custom Hook Testing

```tsx
// useAttendanceSession.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAttendanceSession } from './useAttendanceSession';

// Mock Convex hooks
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

describe('useAttendanceSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state initially', () => {
    (useQuery as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useAttendanceSession('session-1'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.session).toBeUndefined();
  });

  it('returns session data when loaded', () => {
    const mockSession = { id: 'session-1', status: 'active' };
    (useQuery as jest.Mock).mockReturnValue(mockSession);

    const { result } = renderHook(() => useAttendanceSession('session-1'));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.session).toEqual(mockSession);
  });

  it('handles session ending', async () => {
    const mockEndSession = jest.fn().mockResolvedValue(undefined);
    (useMutation as jest.Mock).mockReturnValue(mockEndSession);

    const { result } = renderHook(() => useAttendanceSession('session-1'));

    await act(async () => {
      await result.current.endSession();
    });

    expect(mockEndSession).toHaveBeenCalledWith({ sessionId: 'session-1' });
  });
});
```

### Utility Function Testing

```tsx
// utils/attendance.test.ts
import {
  calculateDistance,
  calculateAttendancePercentage,
  formatSessionDuration,
} from './attendance';

describe('attendance utilities', () => {
  describe('calculateDistance', () => {
    it('calculates distance between two coordinates', () => {
      const point1 = { lat: 40.7128, long: -74.006 }; // NYC
      const point2 = { lat: 34.0522, long: -118.2437 }; // LA

      const distance = calculateDistance(point1, point2);

      expect(distance).toBeCloseTo(3944, 0); // ~3944 km
    });

    it('returns 0 for identical coordinates', () => {
      const point = { lat: 40.7128, long: -74.006 };

      const distance = calculateDistance(point, point);

      expect(distance).toBe(0);
    });
  });

  describe('calculateAttendancePercentage', () => {
    it('calculates correct percentage', () => {
      expect(calculateAttendancePercentage(10, 8)).toBe(80);
      expect(calculateAttendancePercentage(5, 5)).toBe(100);
      expect(calculateAttendancePercentage(10, 0)).toBe(0);
    });

    it('handles edge cases', () => {
      expect(calculateAttendancePercentage(0, 0)).toBe(0);
      expect(calculateAttendancePercentage(0, 5)).toBe(0);
    });
  });

  describe('formatSessionDuration', () => {
    it('formats duration correctly', () => {
      expect(formatSessionDuration(30)).toBe('30 seconds');
      expect(formatSessionDuration(90)).toBe('1 minute 30 seconds');
      expect(formatSessionDuration(3600)).toBe('1 hour');
    });
  });
});
```

## Integration Testing

### API Integration Testing

```tsx
// api/attendance.test.ts
import { ConvexReactClient } from 'convex/react';
import { api } from 'convex/_generated/api';

// Mock Convex client
const mockConvex = {
  query: jest.fn(),
  mutation: jest.fn(),
} as unknown as ConvexReactClient;

describe('Attendance API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates attendance session successfully', async () => {
    const mockSessionId = 'new-session-id';
    mockConvex.mutation = jest.fn().mockResolvedValue(mockSessionId);

    const sessionData = {
      courseId: 'course-1',
      requireCode: 'ABC123',
      radiusMeters: 150,
      gpsCoordinates: { lat: 40.7128, long: -74.006 },
    };

    const result = await mockConvex.mutation(
      api.attendance.createAttendanceSession,
      sessionData,
    );

    expect(result).toBe(mockSessionId);
    expect(mockConvex.mutation).toHaveBeenCalledWith(
      api.attendance.createAttendanceSession,
      sessionData,
    );
  });

  it('handles session creation errors', async () => {
    const errorMessage = 'Course not found';
    mockConvex.mutation = jest.fn().mockRejectedValue(new Error(errorMessage));

    await expect(
      mockConvex.mutation(api.attendance.createAttendanceSession, {}),
    ).rejects.toThrow(errorMessage);
  });
});
```

### Component Integration Testing

```tsx
// AttendanceSessionSetup.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConvexProvider } from 'convex/react';
import { AttendanceSessionSetup } from './AttendanceSessionSetup';

const mockConvexClient = {
  query: jest.fn(),
  mutation: jest.fn(),
} as unknown as ConvexReactClient;

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ConvexProvider client={mockConvexClient}>{children}</ConvexProvider>
);

describe('AttendanceSessionSetup Integration', () => {
  it('creates session with form data', async () => {
    const mockCreateSession = jest.fn().mockResolvedValue('session-id');
    mockConvexClient.mutation = mockCreateSession;

    render(
      <TestWrapper>
        <AttendanceSessionSetup courseId="course-1" />
      </TestWrapper>,
    );

    // Fill form
    fireEvent.change(screen.getByLabelText('Attendance Code'), {
      target: { value: 'ABC123' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          courseId: 'course-1',
          requireCode: 'ABC123',
        }),
      );
    });
  });
});
```

## End-to-End Testing

### Critical User Journey Testing

```tsx
// e2e/attendance-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Attendance Session Flow', () => {
  test('lecturer can create and manage attendance session', async ({
    page,
  }) => {
    // Login as lecturer
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'lecturer@test.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');

    // Navigate to course
    await page.click('[data-testid=courses-nav]');
    await page.click('[data-testid=course-card]:first-child');

    // Start attendance session
    await page.click('[data-testid=start-attendance]');
    await page.fill('[data-testid=attendance-code]', 'TEST123');
    await page.click('[data-testid=create-session]');

    // Verify session is active
    await expect(page.locator('[data-testid=session-status]')).toContainText(
      'Active',
    );
    await expect(page.locator('[data-testid=attendance-code]')).toContainText(
      'TEST123',
    );

    // End session
    await page.click('[data-testid=end-session]');
    await page.click('[data-testid=confirm-end]');

    // Verify session ended
    await expect(page.locator('[data-testid=session-status]')).toContainText(
      'Ended',
    );
  });

  test('student can check in to active session', async ({ page, context }) => {
    // Create new page for student
    const studentPage = await context.newPage();

    // Login as student
    await studentPage.goto('/login');
    await studentPage.fill('[data-testid=email]', 'student@test.com');
    await studentPage.fill('[data-testid=password]', 'password');
    await studentPage.click('[data-testid=login-button]');

    // Navigate to active session
    await studentPage.click('[data-testid=active-sessions]');
    await studentPage.click('[data-testid=session-card]:first-child');

    // Check in with code
    await studentPage.fill('[data-testid=check-in-code]', 'TEST123');
    await studentPage.click('[data-testid=check-in-button]');

    // Verify successful check-in
    await expect(
      studentPage.locator('[data-testid=check-in-success]'),
    ).toContainText('Successfully checked in');
  });
});
```

## Test Data Management

### Test Fixtures

```tsx
// fixtures/attendance.ts
export const mockAttendanceSession = {
  id: 'session-1',
  courseId: 'course-1',
  courseName: 'Computer Science 101',
  lecturerId: 'lecturer-1',
  status: 'active' as const,
  startTime: Date.now() - 30000,
  endTime: Date.now() + 30000,
  requiresCode: true,
  code: 'ABC123',
  location: { lat: 40.7128, long: -74.006 },
  attendeeCount: 5,
};

export const mockAttendees = [
  {
    id: 'student-1',
    name: 'John Doe',
    checkInTime: Date.now() - 15000,
    status: 'present' as const,
  },
  {
    id: 'student-2',
    name: 'Jane Smith',
    checkInTime: Date.now() - 10000,
    status: 'present' as const,
  },
];

export const createMockSession = (overrides = {}) => ({
  ...mockAttendanceSession,
  ...overrides,
});
```

### Test Utilities

```tsx
// test-utils/render.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ConvexProvider } from 'convex/react';
import { BrowserRouter } from 'react-router-dom';

const mockConvexClient = {
  query: jest.fn(),
  mutation: jest.fn(),
} as unknown as ConvexReactClient;

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ConvexProvider client={mockConvexClient}>{children}</ConvexProvider>
  </BrowserRouter>
);

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## Performance Testing

### Component Performance Testing

```tsx
// performance/AttendanceList.perf.test.tsx
import { render } from '@testing-library/react';
import { AttendanceList } from './AttendanceList';
import { createMockAttendees } from '../fixtures/attendance';

describe('AttendanceList Performance', () => {
  it('renders large list efficiently', () => {
    const largeAttendeeList = Array.from({ length: 1000 }, (_, i) =>
      createMockAttendees({ id: `student-${i}`, name: `Student ${i}` }),
    );

    const startTime = performance.now();
    render(<AttendanceList attendees={largeAttendeeList} />);
    const endTime = performance.now();

    // Should render within 100ms
    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

## Accessibility Testing

### Automated Accessibility Testing

```tsx
// accessibility/AttendanceSessionCard.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AttendanceSessionCard } from './AttendanceSessionCard';

expect.extend(toHaveNoViolations);

describe('AttendanceSessionCard Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <AttendanceSessionCard session={mockAttendanceSession} />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', () => {
    render(<AttendanceSessionCard session={mockAttendanceSession} />);

    const endButton = screen.getByText('End Session');
    endButton.focus();

    expect(endButton).toHaveFocus();

    // Test Enter key activation
    fireEvent.keyDown(endButton, { key: 'Enter' });
    // Assert expected behavior
  });
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Setup

```tsx
// src/test-setup.ts
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock geolocation
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
  },
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console errors in tests
global.console.error = jest.fn();
```
