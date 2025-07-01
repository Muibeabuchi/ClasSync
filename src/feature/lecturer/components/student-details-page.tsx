import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  BookOpen,
  //   Calendar,
  TrendingUp,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface StudentDetailsPageProps {
  student: any;
  onBack: () => void;
}

const StudentDetailsPage = ({ student, onBack }: StudentDetailsPageProps) => {
  // Mock data for student details
  const studentData = student || {
    id: 1,
    regNumber: 'CS/2024/001',
    fullName: 'John Doe',
    email: 'john.doe@university.edu',
    gender: 'Male',
    department: 'Computer Science',
    profileImage: '',
  };

  const mockCourses = ['Advanced Database Systems', 'Software Engineering'];
  const mockAttendance = {
    totalSessions: 24,
    attended: 22,
    percentage: 92,
    lastAttended: '2024-01-15T14:30:00Z',
  };

  const handleRemoveFromList = () => {
    toast.success(
      `Student Removed ${studentData.fullName} has been removed from the attendance list.`,
    );
  };

  const handleKickFromCourse = () => {
    toast.success(
      `Student Removed from Course ${studentData.fullName} has been removed from the course.`,
    );
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
          <p className="text-gray-600">View and manage student information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Profile */}
        <Card className="lg:col-span-1 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={studentData.profileImage} />
                <AvatarFallback className="text-lg">
                  {studentData.fullName
                    .split(' ')
                    // @ts-expect-error: temporary data
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {studentData.fullName}
                </h3>
                <p className="text-gray-600">{studentData.regNumber}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm">{studentData.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="text-sm">{studentData.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="text-sm">{studentData.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Information */}
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Course Enrollment
            </CardTitle>
            <CardDescription>
              Courses this student is enrolled in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCourses.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BookOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">{course}</span>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Statistics */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Attendance Statistics
          </CardTitle>
          <CardDescription>
            Student attendance performance across all courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {mockAttendance.totalSessions}
              </p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {mockAttendance.attended}
              </p>
              <p className="text-sm text-gray-600">Attended</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {mockAttendance.percentage}%
              </p>
              <p className="text-sm text-gray-600">Attendance Rate</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Last Attended</p>
              <p className="text-xs text-gray-600">Jan 15, 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="border-red-200 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Student Management Actions
          </CardTitle>
          <CardDescription>
            {`Manage this student's enrollment and access`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Remove from Attendance List
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="animate-scale-in">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Remove from Attendance List
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {studentData.fullName} from the attendance
                    list but they will remain enrolled in the course.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveFromList}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="hover:scale-105 transition-transform"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Kick from Course
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="animate-scale-in">
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove from Course</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove {studentData.fullName} from the
                    course. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleKickFromCourse}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remove from Course
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetailsPage;
