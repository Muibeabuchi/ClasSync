import { createFileRoute } from '@tanstack/react-router';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import LecturerSidebar from '@/feature/lecturer/components/lecturer-sidebar';
import { UserRoleSchema } from '@/feature/onboarding/schema/onboarding-schema';
import StudentDashboard from '@/feature/student/components/student-dashboard';
import { Outlet } from '@tanstack/react-router';
import { useState } from 'react';
// import LecturerDashboard from '@/feature/lecturer/components/lecturer-dashboard';

export const Route = createFileRoute('/dashboard/$role')({
  params: {
    parse: UserRoleSchema.parse,
  },
  component: RouteComponent,
});

const userData = {
  fullName: 'Dachiksta',
  regNumber: '20201248252',
  department: 'SOE',
  yearLevel: '200',
};

function RouteComponent() {
  const { role } = Route.useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarState = (value: boolean) => {
    setSidebarOpen(value);
  };

  if (role === 'student') {
    return <StudentDashboard userData={userData} />;
  }

  return (
    <SidebarProvider
      // defaultOpen={sidebarOpen}
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <div className="min-h-screen flex w-full">
        <LecturerSidebar
          userData={userData}
          handleSidebarState={handleSidebarState}
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
