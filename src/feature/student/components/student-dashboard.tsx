import { useState } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Clock,
  Bell,
  Plus,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import StudentSidebar from './student-sidebar';
import StudentCoursesPage from './student-course-page';
import JoinCoursePage from './join-course-page';
import AttendanceCheckIn from './attendance-check-in';
import StudentNotifications from './student-notifications';
import StudentProfile from './student-profile';
import StudentSettings from './student-settings';
// import { toast } from 'sonner';

interface StudentDashboardProps {
  userData: any;
}

type ActivePage =
  | 'dashboard'
  | 'courses'
  | 'join-course'
  | 'attendance'
  | 'notifications'
  | 'profile'
  | 'settings';

const StudentDashboard = ({ userData }: StudentDashboardProps) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  // Mock data
  const mockCourses = [
    {
      id: 1,
      name: 'Advanced Database Systems',
      code: 'CS401',
      lecturer: 'Prof. Sarah Johnson',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      attendance: 92,
      totalSessions: 24,
      attendedSessions: 22,
      status: 'active',
    },
    {
      id: 2,
      name: 'Software Engineering',
      code: 'CS301',
      lecturer: 'Dr. Michael Brown',
      schedule: 'Tue, Thu - 2:00 PM',
      attendance: 88,
      totalSessions: 18,
      attendedSessions: 16,
      status: 'active',
    },
    {
      id: 3,
      name: 'Machine Learning',
      code: 'CS451',
      lecturer: 'Engr. Lisa Chen',
      schedule: 'Wed, Fri - 11:00 AM',
      attendance: 95,
      totalSessions: 20,
      attendedSessions: 19,
      status: 'active',
    },
  ];

  const mockNotifications = [
    {
      id: 1,
      type: 'attendance',
      title: 'Attendance Session Active',
      message: 'CS401 - Advanced Database Systems attendance is now open',
      timestamp: '5 minutes ago',
      isRead: false,
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message from Prof. Johnson',
      message: 'Assignment 3 deadline has been extended to next Friday',
      timestamp: '2 hours ago',
      isRead: false,
    },
    {
      id: 3,
      type: 'join',
      title: 'Join Request Approved',
      message:
        'Your request to join CS451 - Machine Learning has been approved',
      timestamp: '1 day ago',
      isRead: true,
    },
  ];

  const mockStats = {
    totalCourses: 3,
    avgAttendance: 92,
    totalSessions: 62,
    attendedSessions: 57,
  };

  const renderContent = () => {
    switch (activePage) {
      case 'courses':
        return <StudentCoursesPage />;
      case 'join-course':
        return <JoinCoursePage />;
      case 'attendance':
        return <AttendanceCheckIn />;
      case 'notifications':
        return <StudentNotifications />;
      case 'profile':
        return <StudentProfile />;
      case 'settings':
        return <StudentSettings />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userData?.fullName}
                </h1>
                <p className="text-gray-600">
                  {userData?.regNumber} • {userData?.department} •{' '}
                  {userData?.yearLevel} Year
                </p>
              </div>
              <Avatar className="h-12 w-12">
                <AvatarImage src={userData?.profileImage} />
                <AvatarFallback>
                  {userData?.fullName
                    ?.split(' ')
                    // @ts-expect-error: initial data
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Enrolled Courses
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockStats.totalCourses}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg Attendance
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockStats.avgAttendance}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Sessions Attended
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockStats.attendedSessions}/{mockStats.totalSessions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Bell className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Unread Notifications
                      </p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setActivePage('join-course')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Join New Course
              </Button>
              <Button
                variant="outline"
                onClick={() => setActivePage('attendance')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Check In to Class
              </Button>
              <Button
                variant="outline"
                onClick={() => setActivePage('notifications')}
              >
                <Bell className="h-4 w-4 mr-2" />
                View Notifications (3)
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>
                    Your enrolled courses and attendance summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCourses.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{course.name}</h3>
                            <p className="text-sm text-gray-600">
                              {course.code} • {course.lecturer}
                            </p>
                            <p className="text-xs text-gray-500">
                              {course.schedule}
                            </p>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {course.attendedSessions}/{course.totalSessions}{' '}
                            sessions
                          </span>
                          <span
                            className={`font-medium ${
                              course.attendance >= 90
                                ? 'text-green-600'
                                : course.attendance >= 75
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {course.attendance}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full ${
                              course.attendance >= 90
                                ? 'bg-green-500'
                                : course.attendance >= 75
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${course.attendance}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>
                    Stay updated with your courses and messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border rounded-lg ${
                          !notification.isRead
                            ? 'border-l-4 border-l-blue-500 bg-blue-50'
                            : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-1 rounded-full ${
                              notification.type === 'attendance'
                                ? 'bg-green-100'
                                : notification.type === 'message'
                                  ? 'bg-blue-100'
                                  : 'bg-purple-100'
                            }`}
                          >
                            {notification.type === 'attendance' ? (
                              <Clock className="h-3 w-3 text-green-600" />
                            ) : notification.type === 'message' ? (
                              <Bell className="h-3 w-3 text-blue-600" />
                            ) : (
                              <CheckCircle className="h-3 w-3 text-purple-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <Badge variant="default" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StudentSidebar
          activePage={activePage}
          onPageChange={setActivePage}
          userData={userData}
        />
        <SidebarInset>
          <div className="flex items-center gap-2 px-4 py-2 border-b">
            <SidebarTrigger />
          </div>
          <div className="flex-1 p-6">{renderContent()}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;
