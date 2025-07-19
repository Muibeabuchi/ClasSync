import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Users,
  Plus,
  MoreVertical,
  FileText,
  // UserCheck,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from '@tanstack/react-router';
import CreateCourseModal from './CreateCourseModal';
import type { Doc, Id } from 'convex/_generated/dataModel';
import { useGetLecturerCoursesWithStats } from '@/feature/course/api/get-lecturer-course-with-stats';

// Course Card Component
const CourseCard = ({
  course,
  handleCourseNavigate,
}: {
  course: Doc<'courses'> & {
    stats: {
      classlistCount: number;
      totalStudents: number;
      sessionsHeld: number;
      pendingRequests: number;
    };
  };
  handleCourseNavigate: (value: Id<'courses'>) => void;
}) => {
  // const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewCourse = () => {
    handleCourseNavigate(course._id);
  };

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {course.courseName}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">
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
            <div className="flex items-center justify-center w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg mx-auto mb-1">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {course.stats?.classlistCount || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Classlists
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg mx-auto mb-1">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {course.stats?.totalStudents || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Students
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg mx-auto mb-1">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {course.stats?.sessionsHeld || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Sessions
            </div>
          </div>
        </div>

        {/* Pending Requests Alert */}
        {course.stats?.pendingRequests > 0 && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              {course.stats.pendingRequests} pending request
              {course.stats.pendingRequests !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleViewCourse}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Course
        </Button>
      </CardContent>
    </Card>
  );
};

// Loading Skeleton Component
const CourseCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
            <Skeleton className="h-5 w-8 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </CardContent>
  </Card>
);

const MyCoursesPage = () => {
  const navigate = useNavigate();

  const { data: lecturerCoursesWithStats, isLoading: loadingCoursesWithStats } =
    useGetLecturerCoursesWithStats();

  const isLoading =
    loadingCoursesWithStats || lecturerCoursesWithStats === undefined;
  // const isLoading = coursesWithStats === undefined;
  // const courses = lecturerCoursesWithStats || [];

  const handleCourseNavigate = (courseId: Id<'courses'>) => {
    navigate({
      to: '/dashboard/$role/$courseId',
      params: { role: 'lecturer', courseId },
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and view all your courses
          </p>
        </div>
        <CreateCourseModal>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </CreateCourseModal>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : lecturerCoursesWithStats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {lecturerCoursesWithStats.map((course) => (
            <CourseCard
              handleCourseNavigate={handleCourseNavigate}
              key={course._id}
              course={course}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No courses yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Create your first course to start managing attendance and connecting
            with students
          </p>
          <CreateCourseModal>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Button>
          </CreateCourseModal>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
