import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Plus } from 'lucide-react';

import CreateCourseModal, {
  CreateCourseLoadingSkeleton,
} from './CreateCourseModal';
import type { Id } from 'convex/_generated/dataModel';
import { Suspense } from 'react';
import type { GetLecturerCoursesWithStatsReturnType } from 'convex/schema';
import { CourseCardSkeleton } from './skeletons/course-card-skeleton';
import { CourseCard } from './course-card';
interface LecturerCoursesPageProps {
  lecturerCoursesWithStats: GetLecturerCoursesWithStatsReturnType;
  handleCourseNavigate: (courseId: Id<'courses'>) => void;
  // isLoading: boolean;
}

const LecturerCoursesPage = ({
  // isLoading,
  lecturerCoursesWithStats,
  handleCourseNavigate,
}: LecturerCoursesPageProps) => {
  return (
    <div className="space-y-6  sm:p-2 max-w-7xl ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your courses
          </p>
        </div>
        <CreateCourseModal>
          <Button variant="outline" className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </CreateCourseModal>
      </div>

      {/* Courses Grid */}
      {lecturerCoursesWithStats.length > 0 ? (
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
          <Suspense fallback={<CreateCourseLoadingSkeleton />}>
            <CreateCourseModal>
              <Button className="">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Course
              </Button>
            </CreateCourseModal>
          </Suspense>
        </div>
      )}
    </div>
  );
};

// Loading skeleton component that mimics the MyCoursesPage structure
export const LecturerCoursesPageSkeleton = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default LecturerCoursesPage;
