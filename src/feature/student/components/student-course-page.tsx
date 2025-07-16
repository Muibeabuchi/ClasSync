import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, BookOpen, Users, Clock, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const StudentCoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  //   const { toast } = useToast();

  // Mock enrolled courses
  const enrolledCourses = [
    {
      id: 1,
      name: 'Advanced Database Systems',
      code: 'CS401',
      lecturer: 'Prof. Sarah Johnson',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      attendance: 92,
      totalSessions: 24,
      attendedSessions: 22,
      status: 'active',
      department: 'Computer Science',
    },
    {
      id: 2,
      name: 'Software Engineering',
      code: 'CS301',
      lecturer: 'Dr. Michael Brown',
      schedule: 'Tue, Thu - 2:00 PM',
      attendance: 88,
      totalSessions: 18,
      attendedSessions: 16,
      status: 'active',
      department: 'Computer Science',
    },
    {
      id: 3,
      name: 'Machine Learning',
      code: 'CS451',
      lecturer: 'Engr. Lisa Chen',
      schedule: 'Wed, Fri - 11:00 AM',
      attendance: 95,
      totalSessions: 20,
      attendedSessions: 19,
      status: 'active',
      department: 'Computer Science',
    },
  ];

  const handleExitCourse = (courseName: string) => {
    toast.success(
      `Your request to exit ${courseName} has been submitted for approval.`,
    );
  };

  const filteredCourses = enrolledCourses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.lecturer.toLowerCase().includes(searchTerm.toLowerCase()),
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
                  {enrolledCourses.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-chart-2/10 rounded-lg">
                <Clock className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Attendance
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    enrolledCourses.reduce(
                      (acc, course) => acc + course.attendance,
                      0,
                    ) / enrolledCourses.length,
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
              <div className="p-2 bg-chart-4/10 rounded-lg">
                <Users className="h-6 w-6 text-chart-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Courses
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {
                    enrolledCourses.filter(
                      (course) => course.status === 'active',
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription>
                    {course.code} • {course.department}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{course.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {course.lecturer
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{course.lecturer}</p>
                  <p className="text-xs text-muted-foreground/80">
                    {course.schedule}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Attendance</span>
                  <span
                    className={`font-medium ${
                      course.attendance >= 90
                        ? 'text-chart-2'
                        : course.attendance >= 75
                          ? 'text-chart-5'
                          : 'text-destructive'
                    }`}
                  >
                    {course.attendance}% ({course.attendedSessions}/
                    {course.totalSessions})
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      course.attendance >= 90
                        ? 'bg-chart-2'
                        : course.attendance >= 75
                          ? 'bg-chart-5'
                          : 'bg-destructive'
                    }`}
                    style={{ width: `${course.attendance}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleExitCourse(course.name)}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-3 w-3" />
                  Exit Course
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
