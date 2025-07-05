import { useState } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import LecturerSidebar from './lecturer-sidebar';
import LecturerDashboardContent from './lecturer-dashboard-content';
import CreateCoursePage from './create-course-page';
import MyCoursesPage from './my-courses-page';
import CourseDetailPage from './course-detail-page';
import CourseAnalyticsPage from '@/components/courseDetails/course-analytics-page';
import LecturerStudentsPage from './lecturer-students-page';
import JoinRequestsPage from './join-requests-page';
import JoinRequestsLinkingPage from './join-request-linking-page';
import LecturerSettingsPage from './lecturer-settings-page';
import StudentDetailsPage from './student-details-page';
import EnhancedStudentDetailSection from './enhanced-details-section';
import LecturerNotifications from './lecturer-notifications';
import LecturerProfile from './lecturer-profile';
import LecturerAttendanceSection from './lecturer-attendance-section';
import { Button } from '@/components/ui/button';
import { api } from 'convex/_generated/api';
import { useAction } from 'convex/react';
import { toast } from 'sonner';

interface LecturerDashboardProps {
  userData: any;
}

const LecturerDashboard = ({ userData }: LecturerDashboardProps) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

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

  const handleBackToStudents = () => {
    setActivePage('all-students');
    setSelectedStudentId('');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <LecturerDashboardContent
            userData={userData}
            onCourseClick={handleCourseClick}
            onAttendanceClick={handleAttendanceClick}
          />
        );
      case 'courses':
        return <MyCoursesPage onCourseClick={handleCourseClick} />;
      case 'course-detail':
        return (
          <CourseDetailPage
            courseId={selectedCourseId}
            onBack={handleBackToCourses}
            onStudentClick={handleStudentClick}
            onAnalyticsClick={handleCourseAnalyticsClick}
            onAttendanceClick={handleAttendanceClick}
          />
        );
      case 'course-analytics':
        return (
          <CourseAnalyticsPage
            courseId={selectedCourseId}
            onBack={handleBackToCourses}
          />
        );
      case 'course-attendance':
        return (
          <LecturerAttendanceSection
            courseId={selectedCourseId}
            onBack={handleBackToCourses}
          />
        );
      case 'all-students':
        return (
          <LecturerStudentsPage
            onBack={handleBackToDashboard}
            onStudentClick={handleStudentDetailsClick}
          />
        );
      case 'enhanced-student-details':
        return (
          <EnhancedStudentDetailSection
            studentId={selectedStudentId}
            onBack={handleBackToStudents}
          />
        );
      case 'create-course':
        return (
          <CreateCoursePage
            onBack={handleBackToDashboard}
            onStudentClick={handleStudentClick}
          />
        );
      case 'join-requests':
        return <JoinRequestsPage onBack={handleBackToDashboard} />;
      case 'join-requests-linking':
        return <JoinRequestsLinkingPage onBack={handleBackToDashboard} />;
      case 'notifications':
        return <LecturerNotifications />;
      case 'profile':
        return <LecturerProfile userData={userData} />;
      case 'settings':
        return <LecturerSettingsPage onBack={handleBackToDashboard} />;
      case 'student-details':
        return (
          <StudentDetailsPage
            student={selectedStudent}
            onBack={() => setActivePage('course-detail')}
          />
        );
      default:
        return (
          <LecturerDashboardContent
            userData={userData}
            onCourseClick={handleCourseClick}
            onAttendanceClick={handleAttendanceClick}
          />
        );
    }
  };

  // const {} = useMutation(useConvexMutation(api.payment.initializePayment));
  const initializeAction = useAction(api.payment.initializeSubscription);
  const fetchSubscription = useAction(api.payment.fetchSubscription);
  async function handlePayment() {
    const response = await initializeAction({
      plan: 'LECTURER_BASIC_PLAN',
    });
    if (response && response.success) {
      window.location.href = response.data;
    }
    if (!response?.success) {
      toast.error('Failed to initialize transaction. Try again later ');
    }
  }
  async function handleFetchSubscription() {
    const response = await fetchSubscription();
    console.log({ response });
  }

  return (
    <div className="flex items-center justify-between">
      <Button onClick={handlePayment}>Initialize Payment</Button>
      <Button onClick={handleFetchSubscription} variant={'outline'}>
        Fetch Subscription
      </Button>
    </div>
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <LecturerSidebar
          activePage={activePage}
          onPageChange={setActivePage}
          userData={userData}
        />
        <SidebarInset className="flex-1">
          <div className="flex items-center gap-2 px-4 py-2 border-b">
            <SidebarTrigger />
          </div>
          <div className="p-6">{renderContent()}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default LecturerDashboard;
