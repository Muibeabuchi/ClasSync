import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Users,
  Search,
  Plus,
  // MoreVertical,
  // Activity,
  // FileText,
  // Archive,
  // RotateCcw,
  // Trash2,
} from 'lucide-react';
import { MobilePageContainer } from '@/components/mobile/MobilePageContainer';
import { cn } from '@/lib/utils';
import type { Id } from 'convex/_generated/dataModel';
import type { GetLecturerCoursesWithStatsReturnType } from 'convex/schema';
import CreateCourseModal from '../CreateCourseModal';
import MobileCourseCard from './mobile-course-card';

interface MobileLecturerCoursesProps {
  lecturerCoursesWithStats: GetLecturerCoursesWithStatsReturnType;
  handleCourseNavigate: (courseId: Id<'courses'>) => void;
}

export const MobileLecturerCourses: React.FC<MobileLecturerCoursesProps> = ({
  lecturerCoursesWithStats,
  handleCourseNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'archived'
  >('all');

  const filteredCourses =
    lecturerCoursesWithStats?.filter((course) => {
      const matchesSearch =
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'active')
        return matchesSearch && course.status === 'active';
      if (filterStatus === 'archived')
        return matchesSearch && course.status === 'archived';

      return matchesSearch;
    }) || [];

  // Calculate stats for mobile display
  const totalCourses = lecturerCoursesWithStats?.length || 0;
  const activeCourses =
    lecturerCoursesWithStats?.filter((course) => course.status === 'active')
      .length || 0;
  const totalStudents =
    lecturerCoursesWithStats?.reduce(
      (acc, course) => acc + (course.stats?.totalStudents || 0),
      0,
    ) || 0;

  return (
    <MobilePageContainer
      showHeader={true}
      headerTitle="My Courses"
      headerActions={
        <CreateCourseModal>
          <Button size="icon" className="touch-target-min mobile-tap-feedback">
            <Plus className="size-3" />
          </Button>
        </CreateCourseModal>
      }
      className="bg-background pt-2 relative"
    >
      <div className="flex flex-col h-full relative">
        {/* Search Section - Sticky */}
        <div className="sticky top-0 left-0 right-0  bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 pt-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'pl-10 h-12 text-base',
                'touch-target-min',
                'border-input bg-background',
                'focus:border-primary focus:ring-1 focus:ring-primary',
              )}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
              className="flex-1 touch-target-min mobile-tap-feedback"
            >
              All ({totalCourses})
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
              className="flex-1 touch-target-min mobile-tap-feedback"
            >
              Active ({activeCourses})
            </Button>
            <Button
              variant={filterStatus === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('archived')}
              className="flex-1 touch-target-min mobile-tap-feedback"
            >
              Archived ({totalCourses - activeCourses})
            </Button>
          </div>
        </div>

        {/* Stats Cards - Mobile 2x2 Grid */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="mobile-tap-feedback">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="mobile-text-2xl font-bold text-foreground">
                      {totalCourses}
                    </p>
                    <p className="mobile-text-xs text-muted-foreground">
                      Total Courses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mobile-tap-feedback">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Users className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="mobile-text-2xl font-bold text-foreground">
                      {totalStudents}
                    </p>
                    <p className="mobile-text-xs text-muted-foreground">
                      Total Students
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Courses List - Single Column */}
        <div className="flex-1 px-4">
          {filteredCourses.length > 0 ? (
            <div className="space-y-3 pb-4">
              {filteredCourses.map((course) => (
                <MobileCourseCard
                  key={course._id}
                  course={course}
                  onCourseClick={handleCourseNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="w-full max-w-sm mx-auto">
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mobile-text-lg font-medium text-foreground mb-2">
                    {searchTerm ? 'No courses found' : 'No courses yet'}
                  </h3>
                  <p className="text-muted-foreground mobile-text-sm mb-4">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Create your first course to get started'}
                  </p>
                  {!searchTerm && (
                    <CreateCourseModal>
                      <Button className="touch-target-min mobile-tap-feedback">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Course
                      </Button>
                    </CreateCourseModal>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MobilePageContainer>
  );
};

export const MobileLecturerCoursesSkeleton = () => {
  return (
    <MobilePageContainer
      showHeader={true}
      headerTitle="My Courses"
      headerActions={<Skeleton className="h-8 w-8 rounded-full" />}
      className="bg-background mt-2"
    >
      <div className="flex flex-col h-full">
        {/* Search Section Skeleton */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <Skeleton className="h-12 w-full" />
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Courses List Skeleton */}
        <div className="flex-1 px-4">
          <div className="space-y-3 pb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border border-border/50 bg-card/50">
                <CardContent className="p-4">
                  {/* Header Section Skeleton */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="w-2 h-2 rounded-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>

                  {/* Stats Section Skeleton */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center p-2 rounded-lg bg-muted/30"
                      >
                        <Skeleton className="h-3 w-3 mb-1" />
                        <Skeleton className="h-4 w-6 mb-1" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    ))}
                  </div>

                  {/* Footer Skeleton */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobilePageContainer>
  );
};

export default MobileLecturerCourses;
