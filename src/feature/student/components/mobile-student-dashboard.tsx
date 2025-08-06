import { MobileBottomNavigation } from '@/components/mobile/MobileBottomNavigation';
import { MobileBackButton } from '@/components/mobile/MobileBackButton';
import { Outlet } from '@tanstack/react-router';
import { useGetPendingJoinRequestsCount } from '../api/join-requests';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';

const MobileStudentDashboard = () => {
  // Get pending join requests count for badge
  const pendingRequestsCount = useGetPendingJoinRequestsCount();

  // Determine navigation state
  const {
    shouldShowBottomNav,
    shouldShowBackButton,
    getBackRoute,
    getPageTitle,
  } = useMobileNavigation();

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Back button for nested routes */}
      {shouldShowBackButton && (
        <MobileBackButton to={getBackRoute()} title={getPageTitle()} />
      )}

      {/* Main content area with conditional bottom padding */}
      <div
        className={`flex-1 overflow-y-auto ${shouldShowBottomNav ? 'pb-20' : ''}`}
      >
        <Outlet />
      </div>

      {/* Fixed bottom navigation - only show on main pages */}
      {shouldShowBottomNav && (
        <MobileBottomNavigation notificationCount={pendingRequestsCount} />
      )}
    </div>
  );
};

export default MobileStudentDashboard;
