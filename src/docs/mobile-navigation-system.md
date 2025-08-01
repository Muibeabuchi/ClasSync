# Mobile Navigation System for Student Dashboard

## Overview

The mobile navigation system implements a native app-like navigation pattern where:

1. **Main pages** show a bottom navigation bar
2. **Nested/deeper pages** show a back button instead of bottom navigation

## Main Pages (Bottom Navigation)

These pages show the bottom navigation bar:

- `/dashboard/student` - Home/Dashboard
- `/dashboard/student/courses` - My Courses
- `/dashboard/student/attendance` - Check In
- `/dashboard/student/join-requests` - Join Requests
- `/dashboard/student/profile` - Profile

## Nested Pages (Back Button)

These pages show a back button and hide the bottom navigation:

- `/dashboard/student/notifications` → Back to Home
- `/dashboard/student/settings` → Back to Profile

## Implementation

### Core Components

1. **`useMobileNavigation` Hook** (`src/hooks/useMobileNavigation.ts`)
   - Determines whether to show bottom nav or back button
   - Provides back route and page title logic
   - Handles route mapping for nested pages

2. **`MobileBackButton` Component** (`src/components/mobile/MobileBackButton.tsx`)
   - Renders the back button with proper styling
   - Includes page title display
   - Handles navigation back to parent route

3. **`MobileStudentDashboard` Component** (`src/feature/student/components/mobile-student-dashboard.tsx`)
   - Main container that conditionally renders navigation
   - Manages bottom padding based on navigation type

### Route Configuration

```typescript
// Main pages that show bottom navigation
const BOTTOM_NAV_ROUTES = [
  '/dashboard/student',
  '/dashboard/student/',
  '/dashboard/student/courses',
  '/dashboard/student/attendance',
  '/dashboard/student/join-requests',
  '/dashboard/student/profile',
];

// Back navigation mapping for nested pages
const BACK_NAVIGATION_MAP = {
  '/dashboard/student/notifications': '/dashboard/student',
  '/dashboard/student/settings': '/dashboard/student/profile',
};
```

## Adding New Routes

### For Main Pages (Bottom Navigation)

1. Add the route to `BOTTOM_NAV_ROUTES` in `useMobileNavigation.ts`
2. Add corresponding navigation item to `MobileBottomNavigation.tsx`

### For Nested Pages (Back Button)

1. Add route mapping to `BACK_NAVIGATION_MAP` in `useMobileNavigation.ts`
2. Add page title to `PAGE_TITLES` object
3. The back button will automatically appear

## Features

- **Automatic Detection**: Routes are automatically categorized as main or nested
- **Proper Back Navigation**: Each nested page knows its logical parent
- **Consistent Styling**: Back button matches the app's design system
- **Touch Friendly**: All navigation elements are optimized for mobile touch
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Example Usage

```typescript
// In a new nested route component
const MyNestedPage = () => {
  const { shouldShowBackButton, getBackRoute, getPageTitle } = useMobileNavigation();

  // The navigation is handled automatically by MobileStudentDashboard
  // Just focus on your page content

  return (
    <div>
      <h1>My Nested Page Content</h1>
      {/* Content here */}
    </div>
  );
};
```

## Benefits

1. **Native App Feel**: Mimics iOS/Android navigation patterns
2. **Clear Hierarchy**: Users always know how to go back
3. **Reduced Clutter**: Nested pages don't show unnecessary navigation
4. **Consistent UX**: All pages follow the same navigation logic
5. **Easy Maintenance**: Adding new routes requires minimal configuration
