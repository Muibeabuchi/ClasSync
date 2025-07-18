import { useState } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import LecturerSidebar from './lecturer-sidebar';
import LecturerDashboardContent from './lecturer-dashboard-content';
import MyCoursesPage from './MyCoursesPage';
import CourseAnalyticsPage from '@/components/courseDetails/course-analytics-page';
import LecturerStudentsPage from './lecturer-students-page';
import JoinRequestsPage from './join-requests-page';
import JoinRequestsLinkingPage from './join-request-linking-page';
// import MyCoursesPage from './my-courses-page';
// import CourseDetailPage from './course-detail-page';
// import CreateCoursePage from './create-course-page';
// import LecturerSettingsPage from './lecturer-settings-page';
// import EnhancedStudentDetailSection from './enhanced-details-section';
// import LecturerNotifications from './lecturer-notifications';
// import LecturerAttendanceSection from './lecturer-attendance-section';
import LecturerProfile from './lecturer-profile';
import StudentDetailsPage from './student-details-page';
import LecturerClassListsPage from './lecturer-classlist-page';
import EnhancedCourseCreation from './EnhancedCourseCreation';
import ClassListManagement from './ClassListManagement';
import AttendanceSessionSetup from './AttendanceSessionSetup';
import LiveAttendancePage from './LiveAttendancePage';
import AttendanceHistoryPage from './AttendanceHistoryPage';
import EnhancedSettingsPage from './EnhancedSettingsPage';
import NotificationInbox from './NotificationInbox';
import LecturerAttendancePage from './LecturerAttendancePage';
import EnhancedStudentDetailsPage from './EnhancedStudentDetailsPage';
import EditClassListPage from './EditClassListPage';
import CourseDetailPage from './CourseDetailPage';
import { Outlet } from '@tanstack/react-router';

interface LecturerDashboardProps {
  userData: any;
}

const LecturerDashboard = ({ userData }: LecturerDashboardProps) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedClassListId, setSelectedClassListId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarState = (value: boolean) => {
    setSidebarOpen(value);
  };

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setActivePage('student-details');
  };

  const handleStudentDetailsClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActivePage('enhanced-student-details');
  };

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActivePage('course-detail');
  };

  const handleCourseAnalyticsClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActivePage('course-analytics');
  };

  const handleAttendanceClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActivePage('course-attendance');
  };

  const handleBackToDashboard = () => {
    setActivePage('dashboard');
    setSelectedStudent(null);
    setSelectedCourseId('');
    setSelectedStudentId('');
  };

  const handleBackToCourses = () => {
    setActivePage('courses');
    setSelectedCourseId('');
  };

  const handleEditClassList = (classListId: string) => {
    setSelectedClassListId(classListId);
    setActivePage('edit-classlist');
  };

  const handleBackToStudents = () => {
    setActivePage('all-students');
    setSelectedStudentId('');
  };

  const handleLiveAttendanceClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActivePage('live-attendance');
  };

  const handleAttendanceHistoryClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActivePage('attendance-history');
  };

  // const renderContent = () => {
  //   switch (activePage) {
  //     case 'dashboard':
  //       return (
  //         <LecturerDashboardContent
  //           userData={userData}
  //           onCourseClick={handleCourseClick}
  //           onAttendanceClick={handleAttendanceClick}
  //         />
  //       );
  //     case 'courses':
  //       return <MyCoursesPage onCourseClick={handleCourseClick} />;
  //     case 'create-course':
  //       return (
  //         <EnhancedCourseCreation
  //           onBack={handleBackToDashboard}
  //           onSuccess={handleBackToDashboard}
  //         />
  //       );
  //     case 'classlist-management':
  //       return <ClassListManagement onBack={handleBackToDashboard} />;
  //     case 'attendance-session':
  //       return (
  //         <AttendanceSessionSetup
  //           courseId={selectedCourseId}
  //           courseName="Computer Science 101"
  //           onBack={handleBackToDashboard}
  //         />
  //       );
  //     case 'live-attendance':
  //       return <LiveAttendancePage />;
  //     case 'attendance-history':
  //       return <AttendanceHistoryPage />;
  //     case 'settings':
  //       return <EnhancedSettingsPage onBack={handleBackToDashboard} />;
  //     case 'notifications':
  //       return <NotificationInbox onBack={handleBackToDashboard} />;
  //     case 'course-detail':
  //       return (
  //         <CourseDetailPage
  //           courseId={selectedCourseId}
  //           onBack={handleBackToCourses}
  //           onStudentClick={handleStudentClick}
  //           onAnalyticsClick={handleCourseAnalyticsClick}
  //           onAttendanceClick={handleAttendanceClick}
  //           onLiveAttendanceClick={handleLiveAttendanceClick}
  //           onAttendanceHistoryClick={handleAttendanceHistoryClick}
  //         />
  //       );
  //     case 'course-analytics':
  //       return (
  //         <CourseAnalyticsPage
  //           courseId={selectedCourseId}
  //           onBack={handleBackToCourses}
  //         />
  //       );
  //     case 'course-attendance':
  //       return (
  //         <LecturerAttendancePage
  //           courseId={selectedCourseId}
  //           onBack={handleBackToCourses}
  //         />
  //       );
  //     case 'all-students':
  //       return (
  //         <LecturerStudentsPage
  //           onBack={handleBackToDashboard}
  //           onStudentClick={handleStudentDetailsClick}
  //         />
  //       );
  //     case 'enhanced-student-details':
  //       return (
  //         <EnhancedStudentDetailsPage
  //           studentId={selectedStudentId}
  //           onBack={handleBackToStudents}
  //         />
  //       );
  //     case 'join-requests':
  //       return <JoinRequestsPage onBack={handleBackToDashboard} />;
  //     case 'join-requests-linking':
  //       return <JoinRequestsLinkingPage onBack={handleBackToDashboard} />;
  //     case 'profile':
  //       return <LecturerProfile userData={userData} />;
  //     // case 'billing':
  //     //   return <BillingPage onBack={handleBackToDashboard} />;
  //     case 'classlists':
  //       return (
  //         <LecturerClassListsPage
  //           onEditClassList={handleEditClassList}
  //           onBack={handleBackToDashboard}
  //         />
  //       );
  //     case 'edit-classlist':
  //       return (
  //         <EditClassListPage
  //           classListId={selectedClassListId || ''}
  //           onBack={() => {}}
  //         />
  //       );
  //     case 'student-details':
  //       return (
  //         <StudentDetailsPage
  //           student={selectedStudent}
  //           onBack={() => setActivePage('course-detail')}
  //         />
  //       );
  //     default:
  //       return (
  //         <LecturerDashboardContent
  //           userData={userData}
  //           onCourseClick={handleCourseClick}
  //           onAttendanceClick={handleAttendanceClick}
  //         />
  //       );
  //   }
  // };

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
