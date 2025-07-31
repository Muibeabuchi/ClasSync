import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { GetStudentsCoursesReturnType } from 'convex/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type StudentCourseType = NonNullable<GetStudentsCoursesReturnType[number]>;

interface MobileCourseCardProps {
  course: StudentCourseType;
  onAttendanceClick?: () => void;
}

const MobileCourseCard = ({
  course,
  onAttendanceClick,
}: MobileCourseCardProps) => {
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

  return (
    <Card
      className={cn(
        'w-full mobile-tap-feedback',
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
              className="mobile-text-lg font-semibold text-foreground truncate"
              title={course.courseName}
            >
              {course.courseName}
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
            <Badge
              className={cn(
                'mobile-text-xs capitalize',
                getStatusColor(course.status),
              )}
            >
              {course.status}
            </Badge>
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
              <p className="mobile-text-xs text-muted-foreground">Attendance</p>
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {course.hasActiveSession ? (
            <Button
              onClick={onAttendanceClick}
              size="sm"
              className={cn(
                'flex-1 bg-success hover:bg-success/90 text-success-foreground',
                'transition-colors mobile-tap-feedback',
                'touch-target-min',
              )}
            >
              <Clock className="h-4 w-4 mr-2" />
              Check In Now
            </Button>
          ) : null}

          {/* <Button
            variant="ghost"
            size="sm"
            className={cn(
              'text-muted-foreground hover:text-foreground',
              'transition-colors mobile-tap-feedback',
              'touch-target-min px-3',
            )}
          >
            <MoreVertical className="h-4 w-4" />
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileCourseCard;
