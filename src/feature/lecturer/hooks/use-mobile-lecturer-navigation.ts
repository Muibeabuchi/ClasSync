import { useRouterState } from '@tanstack/react-router';

// Define the main pages that should show bottom navigation
const BOTTOM_NAV_ROUTES = [
  '/dashboard/lecturer',
  '/dashboard/lecturer/',
  '/dashboard/lecturer/courses',
  '/dashboard/lecturer/classLists',
  '/dashboard/lecturer/joinRequests',
  '/dashboard/lecturer/profile',
];

// Define route mappings for back navigation
const BACK_NAVIGATION_MAP: Record<string, string> = {
  '/dashboard/lecturer/notifications': '/dashboard/lecturer',
  '/dashboard/lecturer/settings': '/dashboard/lecturer/profile',
  '/dashboard/lecturer/billing': '/dashboard/lecturer',
  // Add more nested routes and their parent routes here as needed
};

export const useMobileLecturerNavigation = () => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const shouldShowBottomNav = BOTTOM_NAV_ROUTES.includes(currentPath);
  const shouldShowBackButton = !shouldShowBottomNav;

  const getBackRoute = (): string => {
    return BACK_NAVIGATION_MAP[currentPath] || '/dashboard/lecturer';
  };

  const getPageTitle = (): string => {
    switch (currentPath) {
      case '/dashboard/lecturer/notifications':
        return 'Notifications';
      case '/dashboard/lecturer/settings':
        return 'Settings';
      case '/dashboard/lecturer/billing':
        return 'Billing';
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

    // If it's a lecturer route, default to dashboard
    if (pathSegments.includes('lecturer')) {
      return '/dashboard/lecturer';
    }

    return '/dashboard/lecturer';
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
