import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  Activity,
  Plus,
  Bell,
  //   Settings,
  LogOut,
  //   ChevronRight,
  //   Zap,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import {
  useLecturerDashboardStats,
  useLecturerRecentCourses,
} from '@/feature/lecturer/api/dashboard';
import { useSignOut } from '@/feature/auth/hooks/use-google-auth';
import type { Id } from 'convex/_generated/dataModel';

interface MobileLecturerHomeProps {
  fullName: string | undefined;
  userImage?: string;
}

export const MobileLecturerHome: React.FC<MobileLecturerHomeProps> = ({
  fullName,
  userImage,
}) => {
  const { data: dashboardStats } = useLecturerDashboardStats();
  const { data: recentCourses } = useLecturerRecentCourses(3);
  const navigate = useNavigate();
  const signOut = useSignOut();

  const handleCourseNavigation = (courseId: Id<'courses'>) => {
    navigate({
      to: '/dashboard/lecturer/$courseId',
      params: { courseId },
    });
  };

  const handleCoursesNavigation = () => {
    navigate({ to: '/dashboard/lecturer/courses' });
  };

  const handleCreateCourse = () => {
    navigate({ to: '/dashboard/lecturer/courses' });
  };

  const handleJoinRequests = () => {
    navigate({ to: '/dashboard/lecturer/joinRequests' });
  };

  const handleProfile = () => {
    navigate({ to: '/dashboard/lecturer/profile' });
  };

  const handleSignOut = () => {
    signOut();
  };

  const truncatedCourseName = (courseName: string) => {
    return courseName.length > 20
      ? `${courseName.substring(0, 18)}...`
      : courseName;
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={userImage} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {fullName
                ?.split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Hi, {fullName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={handleJoinRequests}
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-full bg-blue-500/10">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {dashboardStats?.activeCourses} active
              </Badge>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {dashboardStats?.totalCourses || 0}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              Total Courses
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-full bg-green-500/10">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                All courses
              </Badge>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {dashboardStats?.totalStudents || 0}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 font-medium">
              Students
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Average
              </Badge>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {dashboardStats?.averageAttendanceRate || 0}%
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
              Attendance
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-full bg-orange-500/10">
                <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Today
              </Badge>
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {dashboardStats?.todaysClasses || 0}
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
              Classes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* <div className="px-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleCreateCourse}
            className="h-14 flex-col gap-1 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">New Course</span>
          </Button>
          <Button
            onClick={handleCoursesNavigation}
            variant="outline"
            className="h-14 flex-col gap-1"
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">View Courses</span>
          </Button>
        </div>
      </div> */}

      {/* Recent Courses */}
      <div className="px-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Courses
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 text-sm"
            onClick={handleCoursesNavigation}
          >
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {!recentCourses || recentCourses.length === 0 ? (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium mb-1">
                No courses yet
              </p>
              <p className="text-sm text-muted-foreground/75 text-center mb-4">
                Create your first course to get started
              </p>
              <Button onClick={handleCreateCourse} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentCourses.map((course) => (
              <Card
                key={course.id}
                className="border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200 active:scale-[0.98]"
              >
                <CardContent className="p-4">
                  <button
                    onClick={() => handleCourseNavigation(course.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            course.hasActiveSession
                              ? 'bg-green-500 shadow-lg shadow-green-500/50'
                              : course.progress > 0
                                ? 'bg-blue-500'
                                : 'bg-gray-400'
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {truncatedCourseName(course.name)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course.students} students enrolled
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {course.hasActiveSession && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-500"
                          >
                            Live
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {course.progress}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      {dashboardStats?.nextClassTime && (
        <div className="px-1">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Today&apos;s Schedule
          </h2>
          <Card className="border-0 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Next Class</p>
                  <p className="text-sm text-muted-foreground">
                    {dashboardStats.nextClassTime}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MobileLecturerHome;
