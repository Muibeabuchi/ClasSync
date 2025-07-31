import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, MapPin, Users, Copy } from 'lucide-react';
import type {
  GetAttendanceSessionRecordsReturnType,
  GetAttendanceSessionReturnType,
} from 'convex/schema';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { LecturerLocationStabilityMessage } from '@/components/attendance/LecturerLocationStabilityMessage';

interface LiveAttendancePageProps {
  attendanceSession: GetAttendanceSessionReturnType;
  attendanceSessionRecords: GetAttendanceSessionRecordsReturnType;
}

const LiveAttendancePage = ({
  attendanceSession,
  attendanceSessionRecords,
}: LiveAttendancePageProps) => {
  const sessionState = attendanceSession.status;

  const [timeRemaining, setTimeRemaining] = useState(() => {
    const endTime =
      attendanceSession?.endedAt ?? attendanceSession._creationTime + 60000; // 60 seconds in milliseconds
    return Math.max(0, (endTime - Date.now()) / 1000);
  });

  useEffect(() => {
    if (attendanceSession.status !== 'complete') {
      const timer = setInterval(() => {
        const endTime =
          attendanceSession?.endedAt ?? attendanceSession._creationTime + 60000; // 60 seconds in milliseconds
        const remaining = Math.max(0, (endTime - Date.now()) / 1000);
        setTimeRemaining(remaining);

        // Clear timer when time reaches 0
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    attendanceSession.endedAt,
    attendanceSession._creationTime,
    attendanceSession.status,
  ]);

  const sessionData = {
    courseCode: attendanceSession.courseCode,
    courseName: attendanceSession.courseName.toLocaleUpperCase(),
    startTime: new Date(attendanceSession._creationTime).toLocaleString(),
    locationRadius: attendanceSession.radius,
    attendanceCode: attendanceSession.attendanceCode,
    totalStudents: 50,
  };

  const formatTime = (seconds: number) => {
    // Ensure we don't show negative values
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs.toString().padStart(2, '0')}s`;
  };

  const navigate = useNavigate();

  const copyAttendanceCode = async () => {
    await navigator.clipboard.writeText(sessionData.attendanceCode!);
    toast.info('Code Copied!', {
      description: 'Attendance code copied to clipboard.',
    });
  };

  const handleNavigate = () =>
    navigate({
      to: '/dashboard/lecturer/$courseId',
      params: {
        courseId: attendanceSession.courseId,
      },
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="link"
            className="cursor-pointer hover:bg-muted-foreground"
            onClick={handleNavigate}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Live Attendance Session</h1>
            <p className="text-gray-600">
              {sessionData.courseCode} - {sessionData.courseName}
            </p>
          </div>
        </div>

        {/* {attendanceSession.status === 'complete' && (
          // <Button onClick={handleEndSession}>View Full Log</Button>
        )} */}
      </div>

      {/* Location Stability Message - Show during active sessions */}
      <LecturerLocationStabilityMessage
        isVisible={sessionState === 'pending' || sessionState === 'active'}
        variant="default"
      />

      {/* Session State Card */}
      <Card
        className={`${
          sessionState === 'pending'
            ? 'border-yellow-500'
            : sessionState === 'active'
              ? 'border-green-500'
              : 'border-gray-500'
        } transition-all duration-500`}
      >
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${
                  sessionState === 'pending'
                    ? 'bg-yellow-100'
                    : sessionState === 'active'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                }`}
              >
                <Clock
                  className={`h-4 w-4 ${
                    sessionState === 'pending'
                      ? 'text-yellow-600'
                      : sessionState === 'active'
                        ? 'text-green-600'
                        : 'text-gray-600'
                  }`}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  {sessionState === 'pending' && 'Starts in:'}
                  {sessionState === 'active' && 'Time left:'}
                  {sessionState === 'complete' && 'Completed'}
                </h3>
                {sessionState !== 'complete' && (
                  <p className="text-lg font-bold text-primary">
                    {formatTime(timeRemaining)}
                  </p>
                )}
                {sessionState === 'complete' && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(attendanceSession._creationTime).toLocaleString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      },
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-1 text-right">
              <div className="flex items-center space-x-1 justify-end">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {sessionData.locationRadius}m
                </span>
              </div>
              <div className="flex items-center space-x-1 justify-end">
                <span className="text-xs font-medium">CODE:</span>
                <Badge
                  variant="outline"
                  className="font-mono text-xs px-1 py-0"
                >
                  {sessionData.attendanceCode}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAttendanceCode}
                  className="h-5 w-5 p-0"
                >
                  <Copy className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          </div>

          {sessionState !== 'complete' && (
            <Progress value={(timeRemaining / 60) * 100} className="h-1.5" />
          )}
        </CardContent>
      </Card>

      {/* Real-Time Student Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Check-ins
              </CardTitle>
              <CardDescription>
                {/* {checkedInStudents.length} of {sessionData.totalStudents}{' '} */}
                students have checked in
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {/* {checkedInStudents.filter((s) => s.status === 'present').length}{' '} */}
              Present
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {attendanceSessionRecords.length === 0 ? (
            <div className="text-center py-8">
              <div
                className={sessionState === 'complete' ? '' : 'animate-pulse'}
              >
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  {sessionState === 'pending'
                    ? 'Waiting for session to begin...'
                    : sessionState === 'complete'
                      ? 'Session has ended - No students marked attendance'
                      : 'Waiting for students to check in...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceSessionRecords.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-4 border rounded-lg  transition-colors animate-scale-in"
                >
                  <div className="flex items-center space-x-4">
                    {/* {getStatusIcon(student.)} */}
                    <div>
                      <div className="font-medium">
                        {student.student.fullName}
                      </div>
                      <div className="text-sm ">
                        {student.student.registrationNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      {/* <div>{student.distance}m</div> */}
                      <div className="text-gray-500">
                        {/* {student.}% accuracy */}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>
                        {new Date(student.checkedInAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </div>
                      {/* {student.overridden && (
                        <div className="text-xs text-blue-600">
                          Manual Override
                        </div>
                      )} */}
                    </div>
                    {/* {getStatusBadge(student.)} */}

                    {/* {student.status !== 'present' && !student.overridden && (
                      <Dialog
                        open={isOverrideDialogOpen}
                        onOpenChange={setIsOverrideDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedStudent(student)}
                          >
                            Override
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manual Override</DialogTitle>
                            <DialogDescription>
                              Mark {selectedStudent?.name} as present for this
                              session.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="reason">
                                Reason for override (required)
                              </Label>
                              <Textarea
                                id="reason"
                                placeholder="e.g., Student was present but GPS was inaccurate..."
                                value={overrideReason}
                                onChange={(e) =>
                                  setOverrideReason(e.target.value)
                                }
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsOverrideDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleOverride}
                                disabled={!overrideReason.trim()}
                              >
                                Mark Present
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )} */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveAttendancePage;

export const LiveAttendancePageSkeleton = () => {
  return (
    <div className="space-y-4 md:space-y-6 animate-pulse p-4 md:p-0">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="w-16 h-8 sm:w-24 sm:h-10 bg-gray-200 rounded-md"></div>
          <div className="flex-1">
            <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-200 rounded-md mb-2"></div>
            <div className="h-3 sm:h-4 w-32 sm:w-48 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Session State Card Skeleton */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 rounded-full bg-gray-200">
                <div className="h-4 w-4 sm:h-6 sm:w-6"></div>
              </div>
              <div>
                <div className="h-5 sm:h-6 w-32 sm:w-48 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-6 sm:h-8 w-16 sm:w-24 bg-gray-200 rounded-md"></div>
              </div>
            </div>

            <div className="flex flex-col sm:text-right space-y-2">
              <div className="flex items-center space-x-2 sm:justify-end">
                <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded-full"></div>
                <div className="h-3 sm:h-4 w-16 sm:w-24 bg-gray-200 rounded-md"></div>
              </div>
              <div className="flex items-center space-x-2 sm:justify-end">
                <div className="h-3 sm:h-4 w-8 sm:w-12 bg-gray-200 rounded-md"></div>
                <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded-md"></div>
                <div className="h-5 sm:h-6 w-5 sm:w-6 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>

          <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full"></div>
        </CardContent>
      </Card>

      {/* Real-Time Student Panel Skeleton */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 sm:h-5 sm:w-5 bg-gray-200 rounded-full"></div>
                <div className="h-5 sm:h-6 w-32 sm:w-40 bg-gray-200 rounded-md"></div>
              </div>
              <div className="h-3 sm:h-4 w-40 sm:w-56 bg-gray-200 rounded-md mt-2"></div>
            </div>
            <div className="h-5 sm:h-6 w-16 sm:w-24 bg-gray-200 rounded-full"></div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-200 rounded-md mb-2"></div>
                    <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 rounded-md"></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4">
                  <div className="flex justify-between sm:block sm:text-right">
                    <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 rounded-md mb-1"></div>
                    <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 rounded-md"></div>
                  </div>
                  <div className="flex justify-between sm:block sm:text-right">
                    <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 rounded-md mb-1"></div>
                    <div className="h-2 sm:h-3 w-16 sm:w-24 bg-gray-200 rounded-md"></div>
                  </div>
                  <div className="flex justify-between sm:justify-end items-center gap-2">
                    <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded-full"></div>
                    <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
