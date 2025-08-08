import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, Users, Clock, Plus } from 'lucide-react';
import { useGetStudentCourses } from '@/feature/course/api/get-student-courses';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MobilePageContainer } from '@/components/mobile/MobilePageContainer';
import { cn } from '@/lib/utils';
import MobileCourseCard from './mobile-course-card';
import JoinCourseSheet from './join-course-sheet';

const MobileStudentCoursesPage = () => {
  const { data: enrolledCourses } = useGetStudentCourses();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses =
    enrolledCourses?.filter(
      (course) =>
        course?.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course?.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course?.lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  // Calculate stats for mobile display
  const totalCourses = enrolledCourses?.length || 0;
  const avgAttendance = Math.round(
    (filteredCourses?.reduce((acc, course) => {
      if (!course) return acc;
      return acc + course?.attendanceStats?.attendanceRate;
    }, 0) || 0) / (totalCourses || 1),
  );
  const activeSessions =
    filteredCourses?.filter((course) => course?.hasActiveSession).length || 0;

  return (
    <MobilePageContainer
      showHeader={true}
      headerTitle="My Courses"
      headerActions={
        <JoinCourseSheet>
          <Button size="icon" className="touch-target-min mobile-tap-feedback">
            <Plus className="size-3 " />
          </Button>
        </JoinCourseSheet>
      }
      className="bg-background mt-2"
    >
      <div className="flex flex-col h-full">
        {/* Search Section - Sticky */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
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
                    <Clock className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="mobile-text-2xl font-bold text-foreground">
                      {avgAttendance}%
                    </p>
                    <p className="mobile-text-xs text-muted-foreground">
                      Avg Attendance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mobile-tap-feedback col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-4">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <Users className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-center">
                    <p className="mobile-text-2xl font-bold text-foreground">
                      {activeSessions}
                    </p>
                    <p className="mobile-text-xs text-muted-foreground">
                      Active Sessions
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
              {filteredCourses.map((course) => {
                if (!course) return null;
                return <MobileCourseCard key={course.id} course={course} />;
              })}
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
                      : 'Join your first course to get started'}
                  </p>
                  {!searchTerm && (
                    <JoinCourseSheet>
                      <Button className="touch-target-min mobile-tap-feedback">
                        <Plus className="h-4 w-4 mr-2" />
                        Join Course
                      </Button>
                    </JoinCourseSheet>
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

export default MobileStudentCoursesPage;
