import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, TrendingUp, Bell, Play } from 'lucide-react';

interface LecturerDashboardContentProps {
  userData: any;
  onCourseClick: (courseId: string) => void;
  onAttendanceClick: (courseId: string) => void;
}

const LecturerDashboardContent = ({
  userData,
  onCourseClick,
  onAttendanceClick,
}: LecturerDashboardContentProps) => {
  // Mock data
  const mockCourses = [
    {
      id: '1',
      name: 'Advanced Database Systems',
      code: 'CS401',
      students: 45,
      sessions: 24,
      avgAttendance: 89,
      nextClass: 'Mon, 9:00 AM',
      status: 'active',
    },
    {
      id: '2',
      name: 'Software Engineering',
      code: 'CS301',
      students: 38,
      sessions: 18,
      avgAttendance: 82,
      nextClass: 'Tue, 2:00 PM',
      status: 'active',
    },
    {
      id: '3',
      name: 'Machine Learning',
      code: 'CS451',
      students: 32,
      sessions: 20,
      avgAttendance: 91,
      nextClass: 'Wed, 11:00 AM',
      status: 'active',
    },
  ];

  const mockStats = {
    totalCourses: 3,
    totalStudents: 115,
    avgAttendance: 87,
    pendingRequests: 8,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userData?.title} {userData?.fullName}
          </h1>
          <p className="text-gray-600">
            {userData?.department} • Lecturer Dashboard
          </p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarImage src={userData?.profileImage} />
          <AvatarFallback>
            {userData?.fullName
              ?.split(' ')
              .map(
                (
                  // @ts-expect-error : temporary data
                  n,
                ) => n[0],
              )
              .join('')}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockStats.totalCourses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockStats.totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Attendance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockStats.avgAttendance}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Requests
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockStats.pendingRequests}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>
            Manage your active courses and attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCourses.map((course) => (
              <div
                key={course.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{course.name}</h3>
                    <p className="text-sm text-gray-600">
                      {course.code} • {course.students} students
                    </p>
                    <p className="text-xs text-gray-500">
                      Next class: {course.nextClass}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => onAttendanceClick(course.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Take Attendance
                    </Button>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {course.sessions} sessions held
                  </span>
                  <span
                    className={`font-medium ${
                      course.avgAttendance >= 90
                        ? 'text-green-600'
                        : course.avgAttendance >= 75
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {course.avgAttendance}% avg attendance
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      course.avgAttendance >= 90
                        ? 'bg-green-500'
                        : course.avgAttendance >= 75
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${course.avgAttendance}%` }}
                  ></div>
                </div>

                <div className="flex justify-end mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCourseClick(course.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LecturerDashboardContent;
