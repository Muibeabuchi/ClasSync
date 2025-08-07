import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LecturerDashboardSkeleton } from '@/feature/lecturer/components/lecturer-dashboard-content';
import LecturerSidebar from '@/feature/lecturer/components/lecturer-sidebar';
import MobileLecturerDashboard from '@/feature/lecturer/components/mobile-lecturer-dashboard';
import { userOnBoardedQueries } from '@/feature/onboarding/api/api-hooks';
import { useLecturerDashboardRedirect } from '@/feature/onboarding/hooks/use-lecturer-dashboard-redirect';
import { useIsMobile } from '@/hooks/use-mobile';
import { Outlet } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/lecturer')({
  component: RouteComponent,
  pendingComponent: LecturerDashboardSkeleton,
  async loader({ context }) {
    await context.queryClient.ensureQueryData(
      userOnBoardedQueries.getUserOnboardedStatus,
    );
  },
});

function RouteComponent() {
  const { isLoading, data } = useLecturerDashboardRedirect();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isLoading) {
    return <LecturerDashboardSkeleton />;
  }

  if (data) {
    // Render mobile version for mobile devices
    if (isMobile) {
      return (
        <Authenticated>
          <MobileLecturerDashboard />
        </Authenticated>
      );
    }

    // Render desktop/tablet version for larger screens
    return (
      <Authenticated>
        <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <div className="min-h-screen flex w-full">
            <LecturerSidebar
              fullName={data?.fullName}
              profileImage={data?.userImage}
            />
            <SidebarInset className="flex-1">
              <SidebarTrigger />
              <div className="p-6">
                <Outlet />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </Authenticated>
    );
  }
}
