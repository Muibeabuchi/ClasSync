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
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  // CheckCircle,
  // XCircle,
  // AlertTriangle,
  Copy,
} from 'lucide-react';
import type {
  GetAttendanceSessionRecordsReturnType,
  GetAttendanceSessionReturnType,
} from 'convex/schema';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

interface LiveAttendancePageProps {
  attendanceSession: GetAttendanceSessionReturnType;
  attendanceSessionRecords: GetAttendanceSessionRecordsReturnType;
}

const LiveAttendancePage = ({
  attendanceSession,
  attendanceSessionRecords,
}: LiveAttendancePageProps) => {
  // const [sessionState, setSessionState] = useState<'prep' | 'active' | 'ended'>(
  //   'prep',
  // );
  const sessionState = attendanceSession.status;

  // useEffect(()=>{

  const [timeRemaining, setTimeRemaining] = useState(
    ((attendanceSession?.endedAt ?? attendanceSession._creationTime + 60) -
      Date.now()) /
      1000,
  );

  useEffect(() => {
    if (attendanceSession.status !== 'complete') {
      const timer = setInterval(() => {
        setTimeRemaining(
          ((attendanceSession?.endedAt ??
            attendanceSession._creationTime + 60) -
            Date.now()) /
            1000,
        );
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    attendanceSession.endedAt,
    attendanceSession._creationTime,
    attendanceSession.status,
  ]);
  // },[])

  // const [timeRemaining, setTimeRemaining] = useState(60); // Total 60 seconds
  // const [checkedInStudents, setCheckedInStudents] = useState<StudentCheckIn[]>(
  //   [],
  // );
  // const [selectedStudent, setSelectedStudent] = useState<StudentCheckIn | null>(
  //   null,
  // );
  // const [overrideReason, setOverrideReason] = useState('');
  // const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);

  // Mock session data
  const sessionData = {
    courseCode: attendanceSession.courseCode,
    courseName: attendanceSession.courseName.toLocaleUpperCase(),
    startTime: new Date(attendanceSession._creationTime).toLocaleString(),
    locationRadius: attendanceSession.radius,
    attendanceCode: attendanceSession.attendanceCode,
    totalStudents: 50,
  };

  const formatTime = (seconds: number) => {
    // const mins = Math.floor(seconds / 60);
    const secs = Math.floor((seconds - 1) % 60);
    return `${secs.toString().padStart(2, '0')}`;
  };

  const navigate = useNavigate();
  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'present':
  //       return <CheckCircle className="h-4 w-4 text-green-600" />;
  //     case 'outside_radius':
  //       return <XCircle className="h-4 w-4 text-red-600" />;
  //     default:
  //       return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  //   }
  // };

  // const getStatusBadge = (status: string) => {
  //   switch (status) {
  //     case 'present':
  //       return <Badge className="bg-green-100 text-green-800">Present</Badge>;
  //     case 'outside_radius':
  //       return <Badge variant="destructive">Outside Radius</Badge>;
  //     default:
  //       return <Badge variant="secondary">GPS Error</Badge>;
  //   }
  // };

  // const handleOverride = () => {
  //   if (selectedStudent && overrideReason.trim()) {
  //     setCheckedInStudents((prev) =>
  //       prev.map((student) =>
  //         student.id === selectedStudent.id
  //           ? { ...student, status: 'present' as const, overridden: true }
  //           : student,
  //       ),
  //     );

  //     // toast({
  //     //   title: "Student Marked Present",
  //     //   description: `${selectedStudent.name} has been manually marked present.`,
  //     // });

  //     setIsOverrideDialogOpen(false);
  //     setOverrideReason('');
  //     setSelectedStudent(null);
  //   }
  // };

  const copyAttendanceCode = () => {
    navigator.clipboard.writeText(sessionData.attendanceCode!);
    toast.info('Code Copied!', {
      description: 'Attendance code copied to clipboard.',
    });
  };

  const handleNavigate = () =>
    navigate({
      to: '/dashboard/$role/$courseId',
      params: {
        role: 'lecturer',
        courseId: attendanceSession.courseId,
      },
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleNavigate}>
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Live Attendance Session
            </h1>
            <p className="text-gray-600">
              {sessionData.courseCode} - {sessionData.courseName}
            </p>
          </div>
        </div>

        {/* {attendanceSession.status === 'complete' && (
          // <Button onClick={handleEndSession}>View Full Log</Button>
        )} */}
      </div>

      {/* Session State Card */}
      <Card
        className={`${
          sessionState === 'pending'
            ? 'border-yellow-500 bg-yellow-50'
            : sessionState === 'active'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-500 bg-gray-50'
        } transition-all duration-500`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-full ${
                  sessionState === 'pending'
                    ? 'bg-yellow-100'
                    : sessionState === 'active'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                }`}
              >
                <Clock
                  className={`h-6 w-6 ${
                    sessionState === 'pending'
                      ? 'text-yellow-600'
                      : sessionState === 'active'
                        ? 'text-green-600'
                        : 'text-gray-600'
                  }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {sessionState === 'pending' && 'Attendance starts in:'}
                  {sessionState === 'active' && 'Time remaining:'}
                  {sessionState === 'complete' && 'Session Completed'}
                </h3>
                {sessionState !== 'complete' && (
                  <p className="text-2xl font-bold text-primary">
                    {formatTime(timeRemaining)}
                  </p>
                )}
                {sessionState === 'complete' && (
                  <p className="text-gray-600">
                    Started at {sessionData.startTime}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Radius: {sessionData.locationRadius}m
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">CODE:</span>
                <Badge variant="outline" className="font-mono">
                  {sessionData.attendanceCode}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAttendanceCode}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {sessionState !== 'complete' && (
            <Progress
              // value={((60 - timeRemaining) / 60) * 100}
              value={timeRemaining}
              className="h-2"
            />
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
              <div className="animate-pulse">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  {sessionState === 'pending'
                    ? 'Waiting for session to begin...'
                    : 'Waiting for students to check in...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceSessionRecords.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors animate-scale-in"
                >
                  <div className="flex items-center space-x-4">
                    {/* {getStatusIcon(student.)} */}
                    <div>
                      <div className="font-medium">
                        {student.student.fullName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {student.student.registrationNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <div>{student.distance}m</div>
                      <div className="text-gray-500">
                        {/* {student.}% accuracy */}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>{student.checkedInAt}</div>
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
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-10 bg-gray-200 rounded-md"></div>
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded-md mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Session State Card Skeleton */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-gray-200">
                <div className="h-6 w-6"></div>
              </div>
              <div>
                <div className="h-6 w-48 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="flex items-center space-x-2 justify-end">
                <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
              </div>
              <div className="flex items-center space-x-2 justify-end">
                <div className="h-4 w-12 bg-gray-200 rounded-md"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-md"></div>
                <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>

          <div className="h-2 bg-gray-200 rounded-full"></div>
        </CardContent>
      </Card>

      {/* Real-Time Student Panel Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
              </div>
              <div className="h-4 w-56 bg-gray-200 rounded-md mt-2"></div>
            </div>
            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-5 w-32 bg-gray-200 rounded-md mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="h-4 w-16 bg-gray-200 rounded-md mb-1"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-16 bg-gray-200 rounded-md mb-1"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded-md"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
