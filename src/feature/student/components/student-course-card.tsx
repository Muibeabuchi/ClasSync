import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { GetStudentsCoursesReturnType } from 'convex/schema';
import {
  Badge,
  // Eye,
  // MoreVertical,
  Clock,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// import { toast } from 'sonner';

type StudentCourseType = NonNullable<GetStudentsCoursesReturnType[number]>;

interface CourseCardProps {
  course: StudentCourseType;
  onAttendanceClick?: () => void;
}

const CourseCard = ({ course, onAttendanceClick }: CourseCardProps) => {
  const attendancePercentage = Math.round(
    course.attendanceStats.attendanceRate,
  );

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

  // Helper function to format time range
  const formatTimeRange = (startTime: string, endTime: string): string => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
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
    <article className="group relative">
      <Card className="h-full  transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border-border/50 hover:border-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle
                className="text-lg font-semibold text-foreground truncate"
                title={course.courseName}
              >
                {course.courseName}
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
                    Session in progress
                  </span>
                </div>
              )}
              <Badge
                // variant="outline"
                className={`text-xs capitalize ${getStatusColor(course.status)}`}
              >
                {course.status}
              </Badge>
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
                    {formatTimeRange(nextClass.startTime, nextClass.endTime)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 gap-2">
            {course.hasActiveSession ? (
              <Button
                onClick={onAttendanceClick}
                size="sm"
                className="flex-1 bg-success cursor-pointer hover:bg-success/90 text-success-foreground transition-colors"
              >
                <Clock className="h-4 w-4 mr-1.5" />
                Check In Now
              </Button>
            ) : null}
            {/* <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <MoreVertical className="h-4 w-4" />
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </article>
  );
};

export default CourseCard;
