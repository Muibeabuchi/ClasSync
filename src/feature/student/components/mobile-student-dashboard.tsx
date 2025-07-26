import { useState } from 'react';
import {
  Card,
  CardContent,
  // CardDescription,
  // CardHeader,
  // CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Clock,
  Bell,
  // Plus,
  TrendingUp,
  CheckCircle,
  // ArrowRight,
} from 'lucide-react';
// import { MobilePageContainer } from '@/components/mobile/MobilePageContainer';
import { MobileBottomNavigation } from '@/components/mobile/MobileBottomNavigation';
import { cn } from '@/lib/utils';
import MobileStudentCoursesPage from './mobile-student-courses-page';
import MobileAttendanceCheckIn from './mobile-attendance-check-in';
import MobileStudentNotifications from './mobile-student-notifications';
import MobileStudentProfileContainer from './mobile-student-profile-container';

interface MobileStudentDashboardProps {
  userData: any;
}

type ActiveTab = 'home' | 'courses' | 'checkin' | 'inbox' | 'profile';

const MobileStudentDashboard = ({ userData }: MobileStudentDashboardProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

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

  const unreadNotifications = mockNotifications.filter((n) => !n.isRead).length;

  const renderHomeContent = () => (
    <div className="space-y-6 p-4">
      {/* Mobile Welcome Header */}
      <div className="text-center mobile-space-md">
        <Avatar className="h-16 w-16 mx-auto mobile-space-sm">
          <AvatarImage src={userData?.profileImage} />
          <AvatarFallback className="mobile-text-lg">
            {userData?.fullName
              ?.split(' ')
              // @ts-expect-error: initial data
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <h1 className="mobile-text-2xl font-bold text-foreground leading-tight">
          Welcome back, {userData?.fullName?.split(' ')[0]}
        </h1>
        <p className="mobile-text-base text-muted-foreground mt-2">
          {userData?.regNumber} • {userData?.department}
        </p>
      </div>

      {/* Mobile Stats Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="mobile-tap-feedback">
          <CardContent className="mobile-p-md">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="mobile-p-sm bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="mobile-text-2xl font-bold text-foreground">
                  {mockStats.totalCourses}
                </p>
                <p className="mobile-text-xs text-muted-foreground">
                  Enrolled Courses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mobile-tap-feedback">
          <CardContent className="mobile-p-md">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="mobile-p-sm bg-chart-2/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="mobile-text-2xl font-bold text-foreground">
                  {mockStats.avgAttendance}%
                </p>
                <p className="mobile-text-xs text-muted-foreground">
                  Avg Attendance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mobile-tap-feedback">
          <CardContent className="mobile-p-md">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="mobile-p-sm bg-chart-4/10 rounded-lg">
                <Clock className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="mobile-text-lg font-bold text-foreground">
                  {mockStats.attendedSessions}/{mockStats.totalSessions}
                </p>
                <p className="mobile-text-xs text-muted-foreground">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mobile-tap-feedback">
          <CardContent className="mobile-p-md">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="mobile-p-sm bg-chart-5/10 rounded-lg">
                <Bell className="h-5 w-5 text-chart-5" />
              </div>
              <div>
                <p className="mobile-text-2xl font-bold text-foreground">
                  {unreadNotifications}
                </p>
                <p className="mobile-text-xs text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Quick Actions */}
      {/* <div className="mobile-space-sm">
        <h2 className="mobile-text-lg font-semibold text-foreground mb-3">
          Quick Actions
        </h2>
        <div className="space-y-3">
          <Button
            onClick={() => setActiveTab('courses')}
            className={cn(
              'w-full touch-target-comfortable justify-between text-left',
              'mobile-tap-feedback',
            )}
            size="lg"
          >
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5" />
              <span className="mobile-text-base font-medium">
                Join New Course
              </span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => setActiveTab('checkin')}
            className={cn(
              'w-full touch-target-comfortable justify-between text-left',
              'mobile-tap-feedback',
            )}
            size="lg"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <span className="mobile-text-base font-medium">
                Check In to Class
              </span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => setActiveTab('inbox')}
            className={cn(
              'w-full touch-target-comfortable justify-between text-left',
              'mobile-tap-feedback',
            )}
            size="lg"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="mobile-text-base font-medium">
                  View Notifications
                </span>
                {unreadNotifications > 0 && (
                  <span className="mobile-text-xs text-muted-foreground">
                    {unreadNotifications} unread
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="mobile-text-xs">
                  {unreadNotifications}
                </Badge>
              )}
              <ArrowRight className="h-4 w-4" />
            </div>
          </Button>
        </div>
      </div> */}

      {/* Mobile Course Cards */}
      <div className="mobile-space-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="mobile-text-lg font-semibold text-foreground">
            My Courses
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('courses')}
            className="text-primary touch-target-min mobile-tap-feedback"
          >
            <span className="mobile-text-sm">View All</span>
          </Button>
        </div>
        <div className="space-y-3">
          {mockCourses.slice(0, 2).map((course) => (
            <Card
              key={course.id}
              className="mobile-tap-feedback touch-manipulation"
            >
              <CardContent className="mobile-p-md">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="mobile-text-base font-semibold leading-tight">
                        {course.name}
                      </h3>
                      <p className="mobile-text-sm text-muted-foreground mt-1">
                        {course.code} • {course.lecturer}
                      </p>
                      <p className="mobile-text-xs text-muted-foreground/80 mt-1">
                        {course.schedule}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 mobile-text-xs"
                    >
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="mobile-text-sm text-muted-foreground">
                      {course.attendedSessions}/{course.totalSessions} sessions
                    </span>
                    <span
                      className={cn(
                        'mobile-text-sm font-medium',
                        course.attendance >= 90
                          ? 'text-chart-2'
                          : course.attendance >= 75
                            ? 'text-chart-5'
                            : 'text-destructive',
                      )}
                    >
                      {course.attendance}%
                    </span>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        course.attendance >= 90
                          ? 'bg-chart-2'
                          : course.attendance >= 75
                            ? 'bg-chart-5'
                            : 'bg-destructive',
                      )}
                      style={{ width: `${course.attendance}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mobile Notification Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="mobile-text-lg font-semibold text-foreground">
            Recent Notifications
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('inbox')}
            className="text-primary touch-target-min mobile-tap-feedback"
          >
            <span className="mobile-text-sm">View All</span>
          </Button>
        </div>
        <div className="space-y-3">
          {mockNotifications.slice(0, 2).map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'transition-all duration-200 active:scale-95 touch-manipulation',
                !notification.isRead &&
                  'border-l-4 border-l-primary bg-primary/5',
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div
                    className={cn(
                      'p-2 rounded-full shrink-0',
                      notification.type === 'attendance'
                        ? 'bg-chart-2/10'
                        : notification.type === 'message'
                          ? 'bg-primary/10'
                          : 'bg-chart-4/10',
                    )}
                  >
                    {notification.type === 'attendance' ? (
                      <Clock className="h-4 w-4 text-chart-2" />
                    ) : notification.type === 'message' ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-chart-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="mobile-text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <Badge
                          variant="default"
                          className="mobile-text-xs shrink-0"
                        >
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="mobile-text-sm text-muted-foreground mt-1 leading-tight">
                      {notification.message}
                    </p>
                    <p className="mobile-text-xs text-muted-foreground/80 mt-2">
                      {notification.timestamp}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <MobileStudentCoursesPage />;
      case 'checkin':
        return <MobileAttendanceCheckIn />;
      case 'inbox':
        return <MobileStudentNotifications />;
      case 'profile':
        return <MobileStudentProfileContainer />;
      default:
        return renderHomeContent();
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Main content area with bottom padding for navigation */}
      <div className="flex-1 overflow-y-auto pb-20">{renderContent()}</div>

      {/* Fixed bottom navigation */}
      <MobileBottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={unreadNotifications}
      />
    </div>
  );
};

export default MobileStudentDashboard;
