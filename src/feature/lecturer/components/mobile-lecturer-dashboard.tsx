import { MobileLecturerBottomNavigation } from './mobile-lecturer-bottom-navigation';
import { MobileBackButton } from '@/components/mobile/MobileBackButton';
import { Outlet } from '@tanstack/react-router';
import { useMobileLecturerNavigation } from '../hooks/use-mobile-lecturer-navigation';
import { useGetLecturerPendingJoinRequestsCount } from '../api/join-requests';

const MobileLecturerDashboard = () => {
  // Get pending join requests count for badge
  const pendingRequestsCount = useGetLecturerPendingJoinRequestsCount();

  // Determine navigation state
  const {
    shouldShowBottomNav,
    shouldShowBackButton,
    getBackRoute,
    getPageTitle,
  } = useMobileLecturerNavigation();

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Back button for nested routes */}
      {shouldShowBackButton && (
        <MobileBackButton to={getBackRoute()} title={getPageTitle()} />
      )}

      {/* Main content area with conditional bottom padding */}
      <div
        className={`flex-1 px-2 pt-5 mb-10 overflow-y-auto ${shouldShowBottomNav ? 'pb-20' : ''}`}
      >
        <Outlet />
      </div>

      {/* Fixed bottom navigation - only show on main pages */}
      {shouldShowBottomNav && (
        <MobileLecturerBottomNavigation
          notificationCount={pendingRequestsCount}
        />
      )}
    </div>
  );
};

export default MobileLecturerDashboard;
