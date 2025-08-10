import { AuthQueryOptions } from '@/feature/auth/api/get-current-user';
import { createFileRoute } from '@tanstack/react-router';
import { Authenticated } from 'convex/react';
import { useQuery } from '@tanstack/react-query';
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
  TrendingUp,
  CheckCircle,
  Settings,
} from 'lucide-react';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { useGetStudentDashboardStats } from '@/feature/course/api/get-student-dashboard-stats';

export const Route = createFileRoute('/dashboard/student/')({
  component: RouteComponent,
  async loader({ context }) {
    // Prefetch student dashboard stats and courses
    context.queryClient.prefetchQuery(
      convexQuery(api.courses.getStudentCourses, {}),
    );
    await context.queryClient.ensureQueryData(
      convexQuery(api.courses.getStudentDashboardStats, {}),
    );
    await context.queryClient.ensureQueryData(AuthQueryOptions.getCurrentUser);
  },
});

function RouteComponent() {
  const { data: userData } = useQuery(AuthQueryOptions.getCurrentUser);
  const { data: dashboardStats } = useGetStudentDashboardStats();
  const isMobile = useIsMobile();

  // Text truncation utility
  const truncateText = (
    text: string,
    mobileLimit: number = 15,
    desktopLimit: number = 25,
  ) => {
    if (text.length <= mobileLimit) return text;

    // For display purposes, we'll show different lengths based on screen size
    // This is handled via CSS classes, but we'll provide both versions
    return {
      mobile:
        text.length > mobileLimit
          ? text.substring(0, mobileLimit) + '...'
          : text,
      desktop:
        text.length > desktopLimit
          ? text.substring(0, desktopLimit) + '...'
          : text,
      full: text,
    };
  };

  // Mock notifications data - will be replaced when notifications API is ready
  const mockNotifications = [
    {
      id: 1,
      type: 'attendance',
      title: 'Attendance Session Active',
      message: 'Check in to your active course sessions',
      timestamp: '5 minutes ago',
      isRead: false,
    },
    {
      id: 2,
      type: 'message',
      title: 'Course Update',
      message: 'New course materials have been uploaded',
      timestamp: '2 hours ago',
      isRead: false,
    },
    {
      id: 3,
      type: 'join',
      title: 'Join Request Approved',
      message: 'Your request to join a course has been approved',
      timestamp: '1 day ago',
      isRead: true,
    },
  ];

  // const unreadNotifications = mockNotifications.filter((n) => !n.isRead).length;

  // Mobile version
  if (isMobile) {
    return (
      <Authenticated>
        <div className="space-y-6 p-4">
          {/* Mobile Header with Avatar and Action Buttons */}
          <div className="flex items-center justify-between mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userData?.userImage} />
              <AvatarFallback className="text-sm">
                {userData?.fullName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="relative p-2 mobile-tap-feedback"
              >
                <Link to="/dashboard/student/notifications">
                  <Bell className="h-5 w-5" />
                  {/* Mock notification badge - replace with real count */}
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-semibold flex items-center justify-center"
                  >
                    3
                  </Badge>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="p-2 mobile-tap-feedback"
              >
                <Link to="/dashboard/student/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile Welcome Header */}
          <div className="text-left mobile-space-md">
            <h1 className="mobile-text-2xl font-bold text-foreground leading-tight">
              Welcome back, {userData?.fullName?.split(' ')[0]}
            </h1>
            <p className="mobile-text-base text-muted-foreground mt-2">
              {userData?.registrationNumber}
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
                      {dashboardStats?.totalCourses || 0}
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
                      {dashboardStats?.avgAttendance || 0}%
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
                      {dashboardStats?.attendedSessions || 0}/
                      {dashboardStats?.totalSessions || 0}
                    </p>
                    <p className="mobile-text-xs text-muted-foreground">
                      Sessions
                    </p>
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
                      {dashboardStats?.activeSessions || 0}
                    </p>
                    <p className="mobile-text-xs text-muted-foreground">
                      Active Sessions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Course Cards */}
          <div className="mobile-space-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="mobile-text-lg font-semibold text-foreground">
                My Courses
              </h2>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-primary touch-target-min mobile-tap-feedback"
              >
                <Link to="/dashboard/student/courses">
                  <span className="mobile-text-sm">View All</span>
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {dashboardStats?.recentCourses &&
              dashboardStats.recentCourses.length > 0 ? (
                dashboardStats.recentCourses.slice(0, 2).map((course) => {
                  if (!course) return null;
                  const courseNameDisplay = truncateText(course.name, 15, 25);

                  return (
                    <Card
                      key={course.id}
                      className="mobile-tap-feedback touch-manipulation"
                    >
                      <CardContent className="mobile-p-md">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              {typeof courseNameDisplay === 'object' ? (
                                <h3
                                  className="text-sm font-semibold leading-tight"
                                  title={courseNameDisplay.full}
                                >
                                  {courseNameDisplay.mobile}
                                </h3>
                              ) : (
                                <h3 className="text-sm font-semibold leading-tight">
                                  {courseNameDisplay}
                                </h3>
                              )}
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {course.code} • {course.lecturer}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="shrink-0 mobile-text-xs"
                            >
                              {course.status === 'active'
                                ? 'Active'
                                : course.status}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="mobile-text-sm text-muted-foreground">
                              {course.attendedSessions}/{course.totalSessions}{' '}
                              sessions
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
                  );
                })
              ) : (
                <Card className="mobile-tap-feedback">
                  <CardContent className="mobile-p-md text-center py-8">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="mobile-text-sm text-muted-foreground">
                      No courses enrolled yet
                    </p>
                  </CardContent>
                </Card>
              )}
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
                asChild
                className="text-primary touch-target-min mobile-tap-feedback"
              >
                <Link to="/dashboard/student/notifications">
                  <span className="mobile-text-sm">View All</span>
                </Link>
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
      </Authenticated>
    );
  }

  // Desktop version
  return (
    <Authenticated>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {userData?.fullName}
            </h1>
            <p className="text-muted-foreground">
              {userData?.registrationNumber}
            </p>
          </div>
          <Avatar className="h-12 w-12">
            <AvatarImage src={userData?.userImage} />
            <AvatarFallback>
              {userData?.fullName
                ?.split(' ')
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
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Enrolled Courses
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardStats?.totalCourses || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-chart-2/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg Attendance
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardStats?.avgAttendance || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-chart-4/10 rounded-lg">
                  <Clock className="h-6 w-6 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sessions Attended
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardStats?.attendedSessions || 0}/
                    {dashboardStats?.totalSessions || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-chart-5/10 rounded-lg">
                  <Bell className="h-6 w-6 text-chart-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Sessions
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardStats?.activeSessions || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                {dashboardStats?.recentCourses &&
                dashboardStats.recentCourses.length > 0 ? (
                  dashboardStats.recentCourses.map((course) => {
                    if (!course) return null;
                    const courseNameDisplay = truncateText(course.name, 15, 25);

                    return (
                      <div
                        key={course.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            {typeof courseNameDisplay === 'object' ? (
                              <h3
                                className="font-semibold"
                                title={courseNameDisplay.full}
                              >
                                {courseNameDisplay.desktop}
                              </h3>
                            ) : (
                              <h3 className="font-semibold">
                                {courseNameDisplay}
                              </h3>
                            )}
                            <p className="text-sm text-muted-foreground truncate">
                              {course.code} • {course.lecturer}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {course.status === 'active'
                              ? 'Active'
                              : course.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {course.attendedSessions}/{course.totalSessions}{' '}
                            sessions
                          </span>
                          <span
                            className={`font-medium ${
                              course.attendance >= 90
                                ? 'text-chart-2'
                                : course.attendance >= 75
                                  ? 'text-chart-5'
                                  : 'text-destructive'
                            }`}
                          >
                            {course.attendance}%
                          </span>
                        </div>

                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full ${
                              course.attendance >= 90
                                ? 'bg-chart-2'
                                : course.attendance >= 75
                                  ? 'bg-chart-5'
                                  : 'bg-destructive'
                            }`}
                            style={{ width: `${course.attendance}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No courses enrolled yet
                    </h3>
                    <p className="text-muted-foreground">
                      Join your first course to get started with attendance
                      tracking.
                    </p>
                  </div>
                )}
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
                        ? 'border-l-4 border-l-primary bg-primary/5'
                        : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-1 rounded-full ${
                          notification.type === 'attendance'
                            ? 'bg-chart-2/10'
                            : notification.type === 'message'
                              ? 'bg-primary/10'
                              : 'bg-chart-4/10'
                        }`}
                      >
                        {notification.type === 'attendance' ? (
                          <Clock className="h-3 w-3 text-chart-2" />
                        ) : notification.type === 'message' ? (
                          <Bell className="h-3 w-3 text-primary" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-chart-4" />
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
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/80 mt-1">
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
    </Authenticated>
  );
}
