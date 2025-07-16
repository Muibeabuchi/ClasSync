import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Calendar, Building2 } from 'lucide-react';

interface MyCoursesPageProps {
  onCourseClick: (courseId: string) => void;
}

const MyCoursesPage = ({ onCourseClick }: MyCoursesPageProps) => {
  // Mock courses data
  const mockCourses = [
    {
      id: 'cs401',
      name: 'Advanced Database Systems',
      code: 'CS401',
      departments: ['Computer Science', 'Software Engineering'],
      semester: 'Harmattan',
      academicYear: '2024/2025',
      enrolledCount: 45,
      description: 'Advanced concepts in database design and management',
    },
    {
      id: 'cs301',
      name: 'Software Engineering',
      code: 'CS301',
      departments: ['Computer Science'],
      semester: 'Rain',
      academicYear: '2024/2025',
      enrolledCount: 32,
      description: 'Principles and practices of software development',
    },
    {
      id: 'cs451',
      name: 'Machine Learning',
      code: 'CS451',
      departments: ['Computer Science', 'Data Science'],
      semester: 'Harmattan',
      academicYear: '2024/2025',
      enrolledCount: 28,
      description:
        'Introduction to machine learning algorithms and applications',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground">
          Manage and view all your courses
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <Card
            key={course.id}
            className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {course.semester}
                </Badge>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {course.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {course.code} • {course.academicYear}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">
                    {course.departments.join(', ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolledCount} students enrolled</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{course.academicYear}</span>
                </div>
              </div>

              <Button
                onClick={() => onCourseClick(course.id)}
                className="w-full mt-4 hover:scale-105 transition-transform"
              >
                View Course
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No courses yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first course to get started
          </p>
          <Button>Create Course</Button>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
