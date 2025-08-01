import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import {
  useLecturerDashboardStats,
  useLecturerRecentCourses,
} from '@/feature/lecturer/api/dashboard';
import type { Id } from 'convex/_generated/dataModel';

interface LecturerDashboardContentProps {
  fullName: string | undefined;
}

const LecturerDashboardContent = ({
  fullName,
}: LecturerDashboardContentProps) => {
  const { data: dashboardStats } = useLecturerDashboardStats();
  const { data: recentCourses } = useLecturerRecentCourses(5);
  const navigate = useNavigate();

  // useEffect(() => {
  //   async function fetchIp() {
  //     const ip = await fetch('https://api.ipify.org?format=json')
  //       .then((res) => res.json())
  //       .then((data) => data.ip);

  //     console.log({ ip });
  //   }

  //   fetchIp();
  // }, []);

  const handleCourseNavigation = (courseId: Id<'courses'>) => {
    navigate({
      to: '/dashboard/lecturer/$courseId',
      params: {
        courseId,
      },
    });
  };
  const handleCoursesNavigation = () => {
    navigate({
      to: '/dashboard/lecturer/courses',
    });
  };

  const truncatedCourseName = (course: { courseName: string }) => {
    return course.courseName.length > 30
      ? `${course.courseName.substring(0, 25)}...`
      : course.courseName;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          Welcome back <strong className="text-primary"> {fullName}</strong>
        </h1>
        <p className="text-muted-foreground text-lg">
          {`Here's what's happening with your courses today`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card hover:scale-[1.02] transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Courses
            </CardTitle>
            <div className="p-1.5 rounded-full bg-primary/10">
              <BookOpen className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground mb-1">
              {dashboardStats.totalCourses}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {dashboardStats.activeCourses} active
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-[1.02] transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <div className="p-1.5 rounded-full bg-primary/10">
              <Users className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground mb-1">
              {dashboardStats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-[1.02] transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Avg Attendance
            </CardTitle>
            <div className="p-1.5 rounded-full bg-primary/10">
              <Activity className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground mb-1">
              {dashboardStats.averageAttendanceRate}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3 text-blue-500" />
              {dashboardStats.completedSessions} sessions held
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-[1.02] transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {`Today's Classes`}
            </CardTitle>
            <div className="p-1.5 rounded-full bg-primary/10">
              <Calendar className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground mb-1">
              {dashboardStats.todaysClasses}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              {dashboardStats.nextClassTime
                ? `Next at ${dashboardStats.nextClassTime}`
                : 'No more classes today'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {/* <BookOpen className="h-5 w-5 text-primary" /> */}
                Recent Courses
              </CardTitle>
              <CardDescription className="text-xs sm:text-base">
                Your most active courses this week
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary text-xs sm:text-sm"
              onClick={handleCoursesNavigation}
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col">
            {recentCourses?.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No courses yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first course to get started
                </p>
              </div>
            ) : (
              recentCourses?.map((course) => (
                <button
                  key={course.id}
                  className="space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer text-left"
                  onClick={() => handleCourseNavigation(course.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          course.hasActiveSession
                            ? 'bg-green-500'
                            : course.progress > 0
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-foreground text-xs sm:text-base">
                          {truncatedCourseName({ courseName: course.name })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {course.students} students
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {course.hasActiveSession && (
                        <Badge variant="default" className="text-xs">
                          Active Session
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {course.progress}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LecturerDashboardContent;

export const LecturerDashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-2/3" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Courses Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3 p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
