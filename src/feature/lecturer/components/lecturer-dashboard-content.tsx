import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useGetLecturerCourses } from '@/feature/course/api/get-lecturer-courses';
import type { Id } from 'convex/_generated/dataModel';
import { useEffect } from 'react';

interface LecturerDashboardContentProps {
  fullName: string | undefined;
}

const LecturerDashboardContent = ({
  fullName,
}: LecturerDashboardContentProps) => {
  const { data: lecturerCourses } = useGetLecturerCourses();
  const recentCourses = lecturerCourses?.map((course) => ({
    id: course._id,
    name: course.courseName,
  }));
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchIp() {
      const ip = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip);

      console.log({ ip });
    }

    fetchIp();
  }, []);

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

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          Welcome back {fullName}
        </h1>
        <p className="text-muted-foreground text-lg">
          {`Here's what's happening with your courses today`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Courses
            </CardTitle>
            <BookOpen className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +2 from last semester
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">342</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +18 this month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Attendance
            </CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">87%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +5% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {`Today's Classes`}
            </CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Next at 10:00 AM
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
                <BookOpen className="h-5 w-5 text-primary" />
                Recent Courses
              </CardTitle>
              <CardDescription>
                Your most active courses this week
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary"
              onClick={handleCoursesNavigation}
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col">
            {recentCourses?.map((course) => (
              <button
                key={course.id}
                className="space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleCourseNavigation(course.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full `} />
                    <div>
                      <p className="font-medium text-foreground">
                        {course.name}
                      </p>
                      {/* <p className="text-sm text-muted-foreground">
                        {course.students} students
                      </p> */}
                    </div>
                  </div>
                  {/* <Badge variant="secondary">{course.progress}%</Badge> */}
                </div>
                {/* <Progress value={course.progress} className="h-2" /> */}
              </button>
            ))}
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
