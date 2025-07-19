// import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Progress } from '@/components/ui/progress';
import {
  Clock,
  // Play,
  // CheckCircle,
  // AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetStudentCoursesWithActiveAttendance } from '@/feature/course/api/get-student-courses-with-active-attendance';
import { useGeolocated } from 'react-geolocated';
import { useState } from 'react';
import { useStudentTakeAttendance } from '@/feature/attendance/api';
import type { Id } from 'convex/_generated/dataModel';

// interface AttendanceCheckInProps {
//   onBack: () => void;
// }

const AttendanceCheckIn = () => {
  const { data: activeCourses } = useGetStudentCoursesWithActiveAttendance();
  const [selectedSession, setSelectedSession] =
    useState<Id<'attendanceSessions'> | null>(null);
  const [attendanceCode, setAttendanceCode] = useState('');

  const { mutateAsync: takeAttendance } = useStudentTakeAttendance();
  // const navigate = useNavigate();
  const { isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
      suppressLocationOnMount: true,
      onSuccess: async ({ coords }) => {
        if (!isGeolocationAvailable && !isGeolocationEnabled) return;
        if (!selectedSession) return;
        const session = activeCourses.find(
          (course) => course?.session._id === selectedSession,
        );
        if (!session) return;
        // if()
        await takeAttendance({
          attendanceSessionId: session.session._id,
          gpsCoordinates: {
            lat: coords.latitude,
            long: coords.longitude,
          },
          attendanceCode,
        });

        // const { sessionId, courseId: CourseId } = await createAttendanceSession(
        //   {
        //     courseId,
        //     requireCode: attendanceCode,
        //     radiusMeters: locationRadius,
        //     gpsCoordinates: {
        //       lat: coords.latitude,
        //       long: coords.longitude,
        //     },
        //   },
        // );
        toast.success('Attendance has been Recorded Successfully');

        // Close modal and trigger navigation

        // navigate({
        //   to: '',
        //   params: {
        //     lecturerCourseId: CourseId,
        //     role: 'lecturer',
        //     attendanceSessionId: sessionId,
        //   },
        // });
      },
      onError() {
        toast.error('Failed to take Attendance');
        setAttendanceCode('');
        setSelectedSession(null);
      },
    });

  const handleStudentAttendance = (
    sessionId: Id<'attendanceSessions'> | undefined,
  ) => {
    if (!sessionId) return;
    setSelectedSession(sessionId);
    getPosition();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Attendance Check-In
        </h1>
        <p className="text-muted-foreground mt-2">
          Mark your attendance for active course sessions
        </p>
      </div>

      {activeCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Active Sessions
            </h3>
            <p className="text-muted-foreground">
              There are no attendance sessions currently active. Please wait for
              your lecturer to start a session.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Select Course
              </CardTitle>
              <CardDescription>
                Choose a course with an active attendance session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {activeCourses.map((course) => (
                    <SelectItem key={course?.courseId} value={course.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {course.name} ({course.code})
                        </span>
                        <Badge variant="secondary" className="ml-2">
                          Active
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}

              {/* {selectedCourseData && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedCourseData.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCourseData.lecturer}
                      </p>
                    </div>
                    <Badge variant="default">Session Active</Badge>
                  </div>
                </div>
              )} */}
            </CardContent>
          </Card>

          {/* Attendance Session */}
          {activeCourses &&
            activeCourses.length > 0 &&
            activeCourses.map((course) => {
              return (
                <Card key={course?.courseId} className="mb-4">
                  <CardHeader>
                    <CardTitle>{course?.courseName}</CardTitle>
                    <CardDescription>{course?.courseCode}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Lecturer: {course?.lecturer.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        Active Session
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Button
                        className="w-full"
                        variant="default"
                        disabled={course?.session.status !== 'active'}
                        onClick={() =>
                          handleStudentAttendance(course?.session._id)
                        }
                      >
                        {course?.session.status === 'pending'
                          ? 'Hold On....'
                          : 'Take Attendance'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </>
      )}
    </div>
  );
};

export default AttendanceCheckIn;
