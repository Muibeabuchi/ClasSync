import { MobileBottomNavigation } from '@/components/mobile/MobileBottomNavigation';
import { Outlet } from '@tanstack/react-router';
import { useGetPendingJoinRequestsCount } from '../api/join-requests';

const MobileStudentDashboard = () => {
  // Get pending join requests count for badge
  const pendingRequestsCount = useGetPendingJoinRequestsCount();

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Main content area with bottom padding for navigation */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Fixed bottom navigation */}
      <MobileBottomNavigation notificationCount={pendingRequestsCount} />
    </div>
  );
};

export default MobileStudentDashboard;
