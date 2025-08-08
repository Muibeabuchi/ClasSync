import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { GetStudentsCoursesReturnType } from 'convex/schema';
import { Badge, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

type StudentCourseType = NonNullable<GetStudentsCoursesReturnType[number]>;

interface CourseCardProps {
  course: StudentCourseType;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const attendancePercentage = Math.round(
    course.attendanceStats.attendanceRate,
  );

  // Truncate course name to 15 characters
  const truncatedCourseName =
    course.courseName.length > 15
      ? `${course.courseName.substring(0, 15)}...`
      : course.courseName;

  const getStatusColor = (status: StudentCourseType['status']) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'archived':
        return 'bg-muted text-muted-foreground border-border';
      case 'completed':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 0.9) return 'text-success';
    if (rate >= 0.75) return 'text-warning';
    return 'text-destructive';
  };

  // Helper function to format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get next scheduled class
  const getNextClass = () => {
    if (!course.schedule || course.schedule.length === 0) return null;

    const today = new Date();
    const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = today.toTimeString().slice(0, 5); // HH:MM format

    // Find today's classes that haven't started yet
    const todayClasses = course.schedule.filter(
      (s) => s.day === currentDay && s.startTime > currentTime,
    );
    if (todayClasses.length > 0) {
      return todayClasses[0]; // Return the next class today
    }

    // Find next week's classes
    const weekDays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const currentDayIndex = today.getDay();

    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = weekDays[nextDayIndex];
      const nextDayClasses = course.schedule.filter((s) => s.day === nextDay);
      if (nextDayClasses.length > 0) {
        return nextDayClasses[0]; // Return the first class of the next day
      }
    }

    return null;
  };

  const nextClass = getNextClass();

  return (
    <Link
      to="/dashboard/student/courses/$courseId"
      params={{ courseId: course.id }}
      className="group relative block"
    >
      <Card className="h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border-border/50 hover:border-primary cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle
                className="text-lg font-semibold text-foreground"
                title={course.courseName}
              >
                {truncatedCourseName}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-medium">
                {course.courseCode}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 ml-2">
              {course.hasActiveSession && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-success">
                    Live Session
                  </span>
                </div>
              )}
              <Badge
                className={`text-xs capitalize ${getStatusColor(course.status)}`}
              >
                {course.status}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-muted">
              <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                {course.lecturer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {course.lecturer.title} {course.lecturer.name}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Attendance</span>
              <div className="text-right">
                <span
                  className={`text-sm font-semibold ${getAttendanceColor(course.attendanceStats.attendanceRate)}`}
                >
                  {attendancePercentage}%
                </span>
                <p className="text-xs text-muted-foreground">
                  {course.attendanceStats.attendedSessions} of{' '}
                  {course.attendanceStats.totalSessions} sessions
                </p>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  course.attendanceStats.attendanceRate >= 0.9
                    ? 'bg-success'
                    : course.attendanceStats.attendanceRate >= 0.75
                      ? 'bg-warning'
                      : 'bg-destructive'
                }`}
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>

            {/* Next Class Schedule */}
            {nextClass && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    Next: {nextClass.day}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(nextClass.startTime)} -{' '}
                    {formatTime(nextClass.endTime)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Active Session Indicator */}
          {course.hasActiveSession && (
            <div className="flex items-center gap-2 p-2 bg-success/10 rounded-lg border border-success/20">
              <Clock className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">
                Tap to check in to live session
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;
