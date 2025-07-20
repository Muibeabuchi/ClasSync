import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  BookOpen,
  Users,
  Clock,
  // Eye,
  // MoreVertical,
} from 'lucide-react';
import { useGetStudentCourses } from '@/feature/course/api/get-student-courses';
import { Input } from '@/components/ui/input';
import CourseCard from './stuent-course-card';

const StudentCoursesPage = () => {
  const { data: enrolledCourses } = useGetStudentCourses();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock enrolled courses with new structure
  // const mockCourses: Course[] = [
  //   {
  //     id: '1',
  //     courseName: 'Advanced Database Systems',
  //     courseCode: 'CS401',
  //     status: 'active',
  //     lecturer: {
  //       id: 'lec1',
  //       name: 'Sarah Johnson',
  //       title: 'Prof.',
  //     },
  //     attendanceStats: {
  //       attendanceRate: 0.92,
  //       totalSessions: 24,
  //       attendedSessions: 22,
  //     },
  //     hasActiveSession: true,
  //     activeSession: {
  //       id: 'session1',
  //       status: 'active',
  //       endedAt: null,
  //     },
  //   },
  //   {
  //     id: '2',
  //     courseName: 'Software Engineering',
  //     courseCode: 'CS301',
  //     status: 'active',
  //     lecturer: {
  //       id: 'lec2',
  //       name: 'Michael Brown',
  //       title: 'Dr.',
  //     },
  //     attendanceStats: {
  //       attendanceRate: 0.88,
  //       totalSessions: 18,
  //       attendedSessions: 16,
  //     },
  //     hasActiveSession: false,
  //     activeSession: null,
  //   },
  //   {
  //     id: '3',
  //     courseName: 'Machine Learning',
  //     courseCode: 'CS451',
  //     status: 'active',
  //     lecturer: {
  //       id: 'lec3',
  //       name: 'Lisa Chen',
  //       title: 'Engr.',
  //     },
  //     attendanceStats: {
  //       attendanceRate: 0.95,
  //       totalSessions: 20,
  //       attendedSessions: 19,
  //     },
  //     hasActiveSession: false,
  //     activeSession: null,
  //   },
  // ];

  const filteredCourses = enrolledCourses.filter(
    (course) =>
      course?.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course?.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course?.lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">Manage your enrolled courses</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses by name, code, or lecturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {enrolledCourses?.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Attendance
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    filteredCourses?.reduce((acc, course) => {
                      if (!course) return acc;
                      return (
                        acc + course?.attendanceStats?.attendanceRate * 100
                      );
                    }, 0) / enrolledCourses?.length,
                  )}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {
                    filteredCourses?.filter(
                      (course) => course?.hasActiveSession,
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {enrolledCourses && enrolledCourses.length > 0
          ? filteredCourses.map((course) => {
              if (!course) return;
              return <CourseCard key={course.id} course={course} />;
            })
          : null}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No courses found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentCoursesPage;
