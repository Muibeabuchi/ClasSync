import { useState } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import LecturerSidebar from './lecturer-sidebar';
// import MyCoursesPage from './my-courses-page';
// import CourseDetailPage from './course-detail-page';
// import CreateCoursePage from './create-course-page';
// import LecturerSettingsPage from './lecturer-settings-page';
// import EnhancedStudentDetailSection from './enhanced-details-section';
// import LecturerNotifications from './lecturer-notifications';
// import LecturerAttendanceSection from './lecturer-attendance-section';
import { Outlet } from '@tanstack/react-router';

interface LecturerDashboardProps {
  userData: any;
}

const LecturerDashboard = ({ userData }: LecturerDashboardProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarState = (value: boolean) => {
    setSidebarOpen(value);
  };

  return (
    <SidebarProvider
      // defaultOpen={sidebarOpen}
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <div className="min-h-screen flex w-full">
        <LecturerSidebar
          // activePage={activePage}
          // onPageChange={setActivePage}
          userData={userData}
          handleSidebarState={handleSidebarState}
        />
        <SidebarInset className="flex-1">
          <div className="flex items-center gap-2 px-4 py-2 border-b">
            <SidebarTrigger />
          </div>
          <div className="p-6">
            {/* <LecturerDashboardContent
              userData={userData}
              onCourseClick={handleCourseClick}
              onAttendanceClick={handleAttendanceClick}
            /> */}
            <Outlet />
          </div>
          {/* <div className="p-6">{renderContent()}</div> */}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default LecturerDashboard;
