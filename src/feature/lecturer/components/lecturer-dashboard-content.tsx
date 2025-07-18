import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  Bell,
  ArrowRight,
  // GraduationCap,
  Activity,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetLecturerCourses } from '@/feature/course/api/get-lecturer-courses';
import type { Id } from 'convex/_generated/dataModel';

interface LecturerDashboardContentProps {
  userData: any;
  // onCourseClick: (courseId: string) => void;
  // onAttendanceClick: (courseId: string) => void;
}

const LecturerDashboardContent = ({
  userData,
  // onCourseClick,
  // onAttendanceClick,
}: LecturerDashboardContentProps) => {
  const { data: lecturerCourses } = useGetLecturerCourses();
  const recentCourses = lecturerCourses?.map((course) => ({
    id: course._id,
    name: course.courseName,
  }));
  const navigate = useNavigate();

  const handleCourseNavigation = (courseId: Id<'courses'>) => {
    navigate({
      to: '/dashboard/$role/$courseId',
      params: {
        role: 'lecturer',
        courseId,
      },
    });
  };
  const handleCoursesNavigation = () => {
    navigate({
      to: '/dashboard/$role/courses',
      params: {
        role: 'lecturer',
      },
    });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          Welcome back, {userData?.title} {userData?.fullName}
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

        {/* Today's Schedule */}
        {/* <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {`Today's Schedule`}
              </CardTitle>
              <CardDescription>Your upcoming classes</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary"
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((class_item, index) => (
              <button
                key={class_item.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onAttendanceClick(class_item.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {class_item.course}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {class_item.room}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {class_item.time}
                  </p>
                  <Badge
                    variant={index === 0 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {index === 0 ? 'Next' : 'Upcoming'}
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card> */}
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:scale-[1.02] transition-transform"
            >
              <BookOpen className="h-6 w-6" />
              <span>Create Course</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:scale-[1.02] transition-transform"
            >
              <Users className="h-6 w-6" />
              <span>View Students</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:scale-[1.02] transition-transform"
            >
              <BarChart3 className="h-6 w-6" />
              <span>Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:scale-[1.02] transition-transform"
            >
              <Bell className="h-6 w-6" />
              <span>Notifications</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LecturerDashboardContent;
