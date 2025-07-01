import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  //   CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface LecturerStudentsPageProps {
  onBack: () => void;
  onStudentClick: (studentId: string) => void;
}

const LecturerStudentsPage = ({
  onBack,
  onStudentClick,
}: LecturerStudentsPageProps) => {
  const [courseFilter, setCourseFilter] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState('all');

  // Mock data for all students across courses
  const mockStudents = [
    {
      id: '1',
      name: 'Alice Johnson',
      regNumber: 'CS/2024/001',
      attendance: 98,
      courses: ['Advanced Database Systems', 'Software Engineering'],
      department: 'Computer Science',
    },
    {
      id: '2',
      name: 'Bob Smith',
      regNumber: 'CS/2024/002',
      attendance: 85,
      courses: ['Advanced Database Systems'],
      department: 'Computer Science',
    },
    {
      id: '3',
      name: 'Carol Davis',
      regNumber: 'CS/2024/003',
      attendance: 72,
      courses: ['Software Engineering', 'Machine Learning'],
      department: 'Software Engineering',
    },
    {
      id: '4',
      name: 'David Wilson',
      regNumber: 'CS/2024/004',
      attendance: 45,
      courses: ['Advanced Database Systems', 'Machine Learning'],
      department: 'Computer Science',
    },
    {
      id: '5',
      name: 'Emma Brown',
      regNumber: 'CS/2024/005',
      attendance: 91,
      courses: ['Software Engineering'],
      department: 'Software Engineering',
    },
    {
      id: '6',
      name: 'Frank Miller',
      regNumber: 'CS/2024/006',
      attendance: 38,
      courses: ['Machine Learning'],
      department: 'Data Science',
    },
  ];

  const mockCourses = [
    'Advanced Database Systems',
    'Software Engineering',
    'Machine Learning',
  ];

  // Filter students based on selected filters
  const filteredStudents = mockStudents.filter((student) => {
    const courseMatch =
      courseFilter === 'all' || student.courses.includes(courseFilter);
    let attendanceMatch = true;

    if (attendanceFilter === 'excellent') {
      attendanceMatch = student.attendance >= 90;
    } else if (attendanceFilter === 'good') {
      attendanceMatch = student.attendance >= 75 && student.attendance < 90;
    } else if (attendanceFilter === 'poor') {
      attendanceMatch = student.attendance < 50;
    }

    return courseMatch && attendanceMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:scale-110 transition-transform"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
          <p className="text-gray-600">
            Manage students across all your courses
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filter Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by Course
              </Label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {mockCourses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by Attendance
              </Label>
              <Select
                value={attendanceFilter}
                onValueChange={setAttendanceFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attendance range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                  <SelectItem value="good">Good (75-89%)</SelectItem>
                  <SelectItem value="poor">
                    Needs Attention (&lt;50%)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Count */}
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-gray-600" />
        <span className="text-gray-600">
          Showing {filteredStudents.length} of {mockStudents.length} students
        </span>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card
            key={student.id}
            className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {student.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-600">{student.regNumber}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Attendance
                </span>
                <Badge
                  variant={
                    student.attendance >= 90
                      ? 'default'
                      : student.attendance >= 75
                        ? 'secondary'
                        : student.attendance >= 50
                          ? 'outline'
                          : 'destructive'
                  }
                >
                  {student.attendance}%
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Courses
                </p>
                <div className="flex flex-wrap gap-1">
                  {student.courses.map((course, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {course}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Department:</span>{' '}
                  {student.department}
                </p>
              </div>

              <Button
                onClick={() => onStudentClick(student.id)}
                className="w-full hover:scale-105 transition-transform"
                size="sm"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No students found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to see more results
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setCourseFilter('all');
              setAttendanceFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default LecturerStudentsPage;
