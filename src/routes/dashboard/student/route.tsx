import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AuthQueryOptions } from '@/feature/auth/api/get-current-user';
import StudentSidebar from '@/feature/student/components/student-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Outlet } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Authenticated } from 'convex/react';
import MobileStudentDashboard from '@/feature/student/components/mobile-student-dashboard';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/dashboard/student')({
  component: RouteComponent,
  async loader({ context }) {
    await context.queryClient.ensureQueryData(AuthQueryOptions.getCurrentUser);
  },
});

function RouteComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: userData } = useQuery(AuthQueryOptions.getCurrentUser);

  const userInfo = {
    fullName: userData?.fullName,
    regNumber: userData?.registrationNumber,
    profileImage: userData?.userImage,
  };

  // Render mobile version for mobile devices
  if (isMobile) {
    return (
      <Authenticated>
        <MobileStudentDashboard />
      </Authenticated>
    );
  }

  // Render desktop version for larger screens
  return (
    <Authenticated>
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="min-h-screen flex w-full">
          <StudentSidebar userData={userInfo} />
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
    </Authenticated>
  );
}
