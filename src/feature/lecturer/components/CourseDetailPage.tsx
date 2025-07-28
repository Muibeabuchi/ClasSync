import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Label } from '@/components/ui/label';
import {
  Users,
  // BookOpen,
  BarChart,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react';
import AttendanceSessionModal from './AttendanceSessionModal';
import { StudentsTable } from './StudentsTable';

import type {
  GetAttendanceSessionsReturnType,
  GetCourseDetailsReturnType,
} from 'convex/schema';
import type { Id } from 'convex/_generated/dataModel';
import { Link } from '@tanstack/react-router';
interface CourseDetailPageProps {
  courseId: Id<'courses'>;
  courseDetails: GetCourseDetailsReturnType;
  attendanceSessions: GetAttendanceSessionsReturnType;
}

const CourseDetailPage = ({
  courseId,
  courseDetails,
  attendanceSessions,
}: CourseDetailPageProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Extract data from courseDetails prop
  const courseData = courseDetails?.course || {
    id: courseId,
    name: 'Loading...',
    code: 'Loading...',
    enrolledCount: 0,
    description: 'Loading...',
  };

  const students = courseDetails?.students || [];

  // Check if there's an active attendance session
  const hasActiveSession = attendanceSessions.some(
    (session) => session.status === 'active' || session.status === 'pending',
  );

  // Analytics calculations - use data from courseDetails.analytics or calculate from students
  const analytics = courseDetails?.analytics || {
    avgAttendance: 0,
    bestStudent: null,
    worstStudent: null,
    lowAttendanceCount: 0,
  };

  const avgAttendance = analytics.avgAttendance;
  const bestStudent = analytics.bestStudent;
  const worstStudent = analytics.worstStudent;
  const lowAttendanceCount = analytics.lowAttendanceCount;

  // Function to refresh data after student operations
  const handleRefresh = () => {
    // This will be handled by TanStack Query's automatic refetching
    // when the mutation succeeds
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {courseData.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 mt-1">
              <span className="font-medium">{courseData.code}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Status: {courseData.status}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                {courseData.enrolledCount}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            // onClick={() => onAttendanceHistoryClick?.(courseId)}
            className="w-full sm:w-auto text-sm"
          >
            View History
          </Button>
          <AttendanceSessionModal
            courseId={courseId}
            courseName={courseData.name}
            disabled={hasActiveSession}
            // onStartSession={handleStartAttendance}
          >
            <Button
              className="w-full sm:w-auto text-sm"
              disabled={hasActiveSession}
              title={
                hasActiveSession
                  ? 'An attendance session is already active for this course'
                  : 'Start a new attendance session'
              }
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              {hasActiveSession ? 'Session Active' : 'Take Attendance'}
            </Button>
          </AttendanceSessionModal>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="overview"
            className="transition-all text-xs sm:text-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="transition-all text-xs sm:text-sm"
          >
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-green-600" />
                  Class Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {courseData.enrolledCount}
                    </p>
                    <p className="text-xs text-gray-600">Total Students</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {avgAttendance}%
                    </p>
                    <p className="text-xs text-gray-600">Avg Attendance</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {bestStudent && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        Best: {bestStudent.name}
                      </span>
                      <Badge variant="secondary">
                        {bestStudent.attendanceRate}%
                      </Badge>
                    </div>
                  )}

                  {worstStudent && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium">
                        Needs Attention: {worstStudent.name}
                      </span>
                      <Badge variant="destructive">
                        {worstStudent.attendanceRate}%
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span>
                      {lowAttendanceCount} students below 50% attendance
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                  Attendance Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* list out and map the attendnace session for the course ,where clicking on each would navigate to the specific attendnaceSession */}

                {/* <div className="space-y-3"> */}
                {/* <h3 className="text-sm font-medium text-gray-700">
                    Recent Attendance Sessions
                  </h3> */}
                {attendanceSessions.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No attendance sessions yet
                  </p>
                ) : (
                  <div className="space-y-2 flex items-center flex-col w-full">
                    {attendanceSessions.map((session) => (
                      <Link
                        to="/dashboard/lecturer/$lecturerCourseId/$attendanceSessionId"
                        params={{
                          attendanceSessionId: session._id,
                          lecturerCourseId: courseId,
                        }}
                        key={session._id}
                        className="  w-full"
                      >
                        <div className="cursor-pointer flex rounded-md  transition-colors w-full border-b pb-1 px-1 justify-between items-center">
                          <div>
                            {/* <h4 className="font-medium text-sm">
                              {'Attendance Session'}
                            </h4> */}
                            <p className="text-xs text-gray-500">
                              {new Date(
                                session._creationTime,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              session.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {/* </div> */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>
                Manage students enrolled in this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentsTable students={students} onRefresh={handleRefresh} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseDetailPage;
