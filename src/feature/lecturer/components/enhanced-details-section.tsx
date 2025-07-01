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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  User,
  BookOpen,
  BarChart,
  MessageSquare,
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

interface EnhancedStudentDetailsPageProps {
  studentId: string;
  onBack: () => void;
}

const EnhancedStudentDetailSection = ({
  studentId,
  onBack,
}: EnhancedStudentDetailsPageProps) => {
  // Mock detailed student data
  const studentData = {
    id: studentId,
    name: 'Alice Johnson',
    regNumber: 'CS/2024/001',
    email: 'alice.johnson@student.futo.edu.ng',
    gender: 'Female',
    department: 'Computer Science',
    profileImage: '',
    courses: [
      {
        id: 'cs401',
        name: 'Advanced Database Systems',
        attendance: 98,
        sessionsAttended: 23,
        totalSessions: 24,
      },
      {
        id: 'cs301',
        name: 'Software Engineering',
        attendance: 85,
        sessionsAttended: 17,
        totalSessions: 20,
      },
    ],
    overallAttendance: 92,
    joinDate: '2024-01-15',
    lastActive: '2024-01-23',
  };

  const handleRemoveStudent = () => {
    toast.success(
      `Student Removed ${studentData.name} has been removed from the course.`,
    );
  };

  const handleMessageStudent = () => {
    toast.success(`Message Sent Message sent to ${studentData.name}.`);
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
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600">Detailed view and management options</p>
        </div>
      </div>

      {/* Student Header Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="py-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={studentData.profileImage} />
              <AvatarFallback className="text-2xl">
                {studentData.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {studentData.name}
              </h2>
              <p className="text-gray-600 text-lg">{studentData.regNumber}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{studentData.department}</Badge>
                <Badge variant="outline">{studentData.gender}</Badge>
                <Badge
                  variant={
                    studentData.overallAttendance >= 75
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {studentData.overallAttendance}% Overall Attendance
                </Badge>
              </div>
            </div>
            <div className="text-right space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Joined:</span>{' '}
                {studentData.joinDate}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Last Active:</span>{' '}
                {studentData.lastActive}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance" className="transition-all">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="courses" className="transition-all">
            Courses
          </TabsTrigger>
          <TabsTrigger value="actions" className="transition-all">
            Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-600" />
                Attendance Breakdown
              </CardTitle>
              <CardDescription>
                Detailed attendance statistics across all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">
                    {studentData.overallAttendance}%
                  </p>
                  <p className="text-sm text-gray-600">Overall Attendance</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {studentData.courses.reduce(
                      (sum, course) => sum + course.sessionsAttended,
                      0,
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Sessions Attended
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">
                    {studentData.courses.reduce(
                      (sum, course) => sum + course.totalSessions,
                      0,
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                </div>
              </div>

              {/* Attendance Graph Placeholder */}
              <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    Attendance Timeline Chart
                  </p>
                  <p className="text-sm text-gray-500">
                    Visual representation of attendance over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Course Enrollment
              </CardTitle>
              <CardDescription>
                Attendance performance in each enrolled course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">{course.name}</h4>
                        <p className="text-sm text-gray-600">
                          Sessions: {course.sessionsAttended}/
                          {course.totalSessions}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            course.attendance >= 90
                              ? 'default'
                              : course.attendance >= 75
                                ? 'secondary'
                                : course.attendance >= 50
                                  ? 'outline'
                                  : 'destructive'
                          }
                          className="text-lg px-3 py-1"
                        >
                          {course.attendance}%
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          course.attendance >= 75
                            ? 'bg-green-500'
                            : course.attendance >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${course.attendance}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-600" />
                Student Management
              </CardTitle>
              <CardDescription>
                Actions you can perform for this student
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleMessageStudent}
                  className="flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <UserX className="h-4 w-4" />
                      Remove from Course
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="animate-scale-in">
                    <AlertDialogHeader>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        <div>
                          <AlertDialogTitle>Remove Student</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove {studentData.name} from all courses? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </div>
                      </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRemoveStudent}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remove Student
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">
                      Student Performance Alert
                    </p>
                    <p className="text-sm text-yellow-800 mt-1">
                      {studentData.overallAttendance < 50
                        ? 'This student has critically low attendance and may need immediate intervention.'
                        : studentData.overallAttendance < 75
                          ? "This student's attendance is below the recommended threshold."
                          : 'This student is performing well with good attendance.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedStudentDetailSection;
