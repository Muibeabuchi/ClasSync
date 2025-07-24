import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LecturerDashboardSkeleton } from '@/feature/lecturer/components/lecturer-dashboard-content';
import LecturerSidebar from '@/feature/lecturer/components/lecturer-sidebar';
import { userOnBoardedQueries } from '@/feature/onboarding/api/api-hooks';
import { useLecturerDashboardRedirect } from '@/feature/onboarding/hooks/use-lecturer-dashboard-redirect';
import { Outlet } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/lecturer')({
  component: RouteComponent,
  async loader({ context }) {
    await context.queryClient.ensureQueryData(
      userOnBoardedQueries.getUserOnboardedStatus,
    );
  },
  pendingComponent: LecturerDashboardSkeleton,
});

function RouteComponent() {
  const { isLoading, data } = useLecturerDashboardRedirect();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return <LecturerDashboardSkeleton />;
  }

  if (data) {
    return (
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="min-h-screen flex w-full">
          <LecturerSidebar
            fullName={data?.fullName}
            profileImage={data?.userImage}
          />
          <SidebarInset className="flex-1">
            <div className="flex items-center gap-2 px-4 py-2 border-b">
              <SidebarTrigger />
            </div>
            <div className="p-6">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (data === null) {
    return <LecturerDashboardSkeleton />;
  }
}
