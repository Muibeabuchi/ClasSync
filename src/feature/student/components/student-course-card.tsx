import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { GetStudentsCoursesReturnType } from 'convex/schema';
import { Badge, Eye, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

// import { toast } from 'sonner';

type StudentCourseType = NonNullable<GetStudentsCoursesReturnType[number]>;

const CourseCard = ({ course }: { course: StudentCourseType }) => {
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
    <article className="group relative">
      <Card className="h-full  transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border-border/50 hover:border-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground truncate">
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
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              View Course
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </article>
  );
};

export default CourseCard;
