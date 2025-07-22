import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  AuthQueryOptions,
  useGetCurrentUser,
} from '@/feature/auth/api/get-current-user';
import LecturerSidebar from '@/feature/lecturer/components/lecturer-sidebar';
import { Outlet } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/lecturer')({
  component: RouteComponent,
  async loader({ context }) {
    await context.queryClient.ensureQueryData(AuthQueryOptions.getCurrentUser);
  },
});

function RouteComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user } = useGetCurrentUser();
  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="min-h-screen flex w-full">
        <LecturerSidebar fullName={user?.fullName} profileImage={user?.image} />
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
