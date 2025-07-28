import { MobileBottomNavigation } from '@/components/mobile/MobileBottomNavigation';
import { Outlet } from '@tanstack/react-router';

const MobileStudentDashboard = () => {
  // Mock notification count - replace with real data when available
  const unreadNotifications = 3;

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Main content area with bottom padding for navigation */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Fixed bottom navigation */}
      <MobileBottomNavigation notificationCount={unreadNotifications} />
    </div>
  );
};

export default MobileStudentDashboard;
