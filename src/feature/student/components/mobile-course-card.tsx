import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { GetStudentsCoursesReturnType } from 'convex/schema';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

type StudentCourseType = NonNullable<GetStudentsCoursesReturnType[number]>;

interface MobileCourseCardProps {
  course: StudentCourseType;
}

const MobileCourseCard = ({ course }: MobileCourseCardProps) => {
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
      className="block"
    >
      <Card
        className={cn(
          'w-full mobile-tap-feedback cursor-pointer',
          'transition-all duration-200',
          'hover:shadow-md active:shadow-sm',
          'border-border/50 hover:border-primary/30',
          'touch-target-min',
        )}
      >
        {/* Header Section */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle
                className="mobile-text-lg font-semibold text-foreground"
                title={course.courseName}
              >
                {truncatedCourseName}
              </CardTitle>
              <CardDescription className="mobile-text-sm text-muted-foreground font-medium">
                {course.courseCode}
              </CardDescription>
            </div>

            {/* Status and Active Session Indicator */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {course.hasActiveSession && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="mobile-text-xs font-medium text-success">
                    Live
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Badge
                  className={cn(
                    'mobile-text-xs capitalize',
                    getStatusColor(course.status),
                  )}
                >
                  {course.status}
                </Badge>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Lecturer Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-muted">
              <AvatarFallback className="mobile-text-sm font-medium bg-muted text-muted-foreground">
                {course.lecturer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="mobile-text-sm font-medium text-foreground truncate">
                {course.lecturer.title} {course.lecturer.name}
              </p>
              <p className="mobile-text-xs text-muted-foreground">
                Course Lecturer
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Clock className="h-3 w-3 text-primary" />
              </div>
              <div>
                <p className="mobile-text-xs text-muted-foreground">
                  Attendance
                </p>
                <p
                  className={cn(
                    'mobile-text-sm font-semibold',
                    getAttendanceColor(course.attendanceStats.attendanceRate),
                  )}
                >
                  {attendancePercentage}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-secondary/50 rounded-md">
                <Users className="h-3 w-3 text-secondary-foreground" />
              </div>
              <div>
                <p className="mobile-text-xs text-muted-foreground">Sessions</p>
                <p className="mobile-text-sm font-semibold text-foreground">
                  {course.attendanceStats.attendedSessions}/
                  {course.attendanceStats.totalSessions}
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="mobile-text-xs text-muted-foreground">
                Progress
              </span>
              <span className="mobile-text-xs text-muted-foreground">
                {course.attendanceStats.attendedSessions} of{' '}
                {course.attendanceStats.totalSessions} attended
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  course.attendanceStats.attendanceRate >= 0.9
                    ? 'bg-success'
                    : course.attendanceStats.attendanceRate >= 0.75
                      ? 'bg-warning'
                      : 'bg-destructive',
                )}
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>

          {/* Next Class Schedule */}
          {nextClass && (
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/30">
              <div className="p-1 bg-primary/10 rounded-md">
                <Calendar className="h-3 w-3 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mobile-text-xs font-medium text-foreground">
                  Next: {nextClass.day}
                </p>
                <p className="mobile-text-xs text-muted-foreground">
                  {formatTime(nextClass.startTime)} -{' '}
                  {formatTime(nextClass.endTime)}
                </p>
              </div>
            </div>
          )}

          {/* Active Session Indicator */}
          {course.hasActiveSession && (
            <div className="flex items-center gap-2 p-2 bg-success/10 rounded-lg border border-success/20">
              <Clock className="h-4 w-4 text-success" />
              <span className="mobile-text-sm font-medium text-success">
                Tap to check in to live session
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default MobileCourseCard;
