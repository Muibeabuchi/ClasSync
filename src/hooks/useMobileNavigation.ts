import { useRouterState } from '@tanstack/react-router';

// Define the main pages that should show bottom navigation
const BOTTOM_NAV_ROUTES = [
  '/dashboard/student',
  '/dashboard/student/',
  '/dashboard/student/courses',
  '/dashboard/student/attendance',
  '/dashboard/student/join-requests',
  '/dashboard/student/profile',
];

// Define route mappings for back navigation
const BACK_NAVIGATION_MAP: Record<string, string> = {
  '/dashboard/student/notifications': '/dashboard/student',
  '/dashboard/student/settings': '/dashboard/student/profile',
  // Add more nested routes and their parent routes here as needed
};

export const useMobileNavigation = () => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const shouldShowBottomNav = BOTTOM_NAV_ROUTES.includes(currentPath);
  const shouldShowBackButton = !shouldShowBottomNav;

  const getBackRoute = (): string => {
    return BACK_NAVIGATION_MAP[currentPath] || '/dashboard/student';
  };

  const getPageTitle = (): string => {
    switch (currentPath) {
      case '/dashboard/student/notifications':
        return 'Notifications';
      case '/dashboard/student/settings':
        return 'Settings';
      default:
        return 'Back';
    }
  };

  // Helper function to check if current route is a main bottom nav route
  const isMainRoute = (route: string): boolean => {
    return BOTTOM_NAV_ROUTES.includes(route);
  };

  // Helper function to get the appropriate parent route for any nested route
  const getParentRoute = (route: string): string => {
    // If it's a direct mapping, use it
    if (BACK_NAVIGATION_MAP[route]) {
      return BACK_NAVIGATION_MAP[route];
    }

    // For dynamic routes or unspecified routes, try to infer parent
    const pathSegments = route.split('/').filter(Boolean);

    // If it's a student route, default to dashboard
    if (pathSegments.includes('student')) {
      return '/dashboard/student';
    }

    return '/dashboard/student';
  };

  return {
    shouldShowBottomNav,
    shouldShowBackButton,
    getBackRoute,
    getPageTitle,
    currentPath,
    isMainRoute,
    getParentRoute,
  };
};
