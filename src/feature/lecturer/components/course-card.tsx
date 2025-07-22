import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Doc, Id } from 'convex/_generated/dataModel';
import {
  BookOpen,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FileText,
  Users,
  Clock,
  AlertCircle,
} from 'lucide-react';

export const CourseCard = ({
  course,
  handleCourseNavigate,
}: {
  course: Doc<'courses'> & {
    stats?: {
      classlistCount: number;
      totalStudents: number;
      sessionsHeld: number;
      pendingRequests: number;
    };
  };
  handleCourseNavigate: (value: Id<'courses'>) => void;
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-800"
          >
            Active
          </Badge>
        );
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      case 'completed':
        return <Badge>Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewCourse = () => {
    handleCourseNavigate(course._id);
  };

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                {course.courseName}
              </CardTitle>
              <CardDescription className="text-sm font-medium mt-0.5">
                {course.courseCode}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(course.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleViewCourse}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Course
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-0">
        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-secondary/20 rounded-lg mx-auto mb-1">
              <FileText className="h-4 w-4 text-secondary" />
            </div>
            <div className="text-lg font-semibold">
              {course.stats?.classlistCount || 0}
            </div>
            <div className="text-xs text-muted-foreground">Classlists</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-lg mx-auto mb-1">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-lg font-semibold">
              {course.stats?.totalStudents || 0}
            </div>
            <div className="text-xs text-muted-foreground">Students</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-accent/20 rounded-lg mx-auto mb-1">
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <div className="text-lg font-semibold">
              {course.stats?.sessionsHeld || 0}
            </div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
        </div>

        {/* Pending Requests Alert */}
        {course?.stats?.pendingRequests &&
        course?.stats?.pendingRequests > 0 ? (
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg mb-4 group-hover:shadow-sm transition-all">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {course.stats.pendingRequests} pending request
                {course.stats.pendingRequests !== 1 ? 's' : ''}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              Review
            </Button>
          </div>
        ) : null}
        {/* Action Button */}
        <Button onClick={handleViewCourse} className="w-full" variant="default">
          <Eye className="h-4 w-4 mr-2" />
          View Course
        </Button>
      </CardContent>
    </Card>
  );
};
