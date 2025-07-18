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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
} from 'lucide-react';
// import { toast } from "sonner";

interface StudentCheckIn {
  id: string;
  name: string;
  regNumber: string;
  distance: number;
  accuracy: number;
  checkedInAt: string;
  status: 'present' | 'outside_radius' | 'gps_error';
  overridden?: boolean;
}

const LiveAttendancePage = () => {
  const [sessionState, setSessionState] = useState<'prep' | 'active' | 'ended'>(
    'prep',
  );
  const [timeRemaining, setTimeRemaining] = useState(60); // Total 60 seconds
  const [checkedInStudents, setCheckedInStudents] = useState<StudentCheckIn[]>(
    [],
  );
  const [selectedStudent, setSelectedStudent] = useState<StudentCheckIn | null>(
    null,
  );
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);

  // Mock session data
  const sessionData = {
    courseCode: 'CSC 401',
    courseName: 'Compiler Design',
    startTime: new Date().toLocaleTimeString(),
    locationRadius: 150,
    attendanceCode: 'XT49PL',
    totalStudents: 50,
  };

  // Simulate real-time student check-ins
  useEffect(() => {
    const mockStudents = [
      {
        id: '1',
        name: 'John Doe',
        regNumber: '20210123456',
        distance: 27,
        accuracy: 95,
      },
      {
        id: '2',
        name: 'Jane Smith',
        regNumber: '20210123457',
        distance: 312,
        accuracy: 85,
      },
      {
        id: '3',
        name: 'Anita Ojo',
        regNumber: '20210123499',
        distance: 45,
        accuracy: 92,
      },
      {
        id: '4',
        name: 'Mike Johnson',
        regNumber: '20210123458',
        distance: 89,
        accuracy: 78,
      },
      {
        id: '5',
        name: 'Sarah Wilson',
        regNumber: '20210123459',
        distance: 156,
        accuracy: 88,
      },
    ];

    let studentIndex = 0;
    const interval = setInterval(() => {
      if (sessionState === 'active' && studentIndex < mockStudents.length) {
        const student = mockStudents[studentIndex];
        const newCheckIn: StudentCheckIn = {
          ...student,
          checkedInAt: new Date().toLocaleTimeString(),
          status: student.distance > 150 ? 'outside_radius' : 'present',
        };

        setCheckedInStudents((prev) => [...prev, newCheckIn]);
        studentIndex++;
      }
    }, 3000); // Add a student every 3 seconds during active period

    return () => clearInterval(interval);
  }, [sessionState]);

  // Main countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setSessionState('ended');
          return 0;
        }

        // Switch to active at 30 seconds remaining
        if (prev === 31) {
          setSessionState('active');
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'outside_radius':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'outside_radius':
        return <Badge variant="destructive">Outside Radius</Badge>;
      default:
        return <Badge variant="secondary">GPS Error</Badge>;
    }
  };

  const handleOverride = () => {
    if (selectedStudent && overrideReason.trim()) {
      setCheckedInStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, status: 'present' as const, overridden: true }
            : student,
        ),
      );

      // toast({
      //   title: "Student Marked Present",
      //   description: `${selectedStudent.name} has been manually marked present.`,
      // });

      setIsOverrideDialogOpen(false);
      setOverrideReason('');
      setSelectedStudent(null);
    }
  };

  const copyAttendanceCode = () => {
    navigator.clipboard.writeText(sessionData.attendanceCode);
    // toast({
    //   title: "Code Copied!",
    //   description: "Attendance code copied to clipboard.",
    // });
  };

  const handleEndSession = () => {
    // navigate(`/dashboard/courses/${courseId}/attendance/history`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            //  onClick={() => navigate(`/dashboard/courses/${courseId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
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

        {sessionState === 'ended' && (
          <Button onClick={handleEndSession}>View Full Log</Button>
        )}
      </div>

      {/* Session State Card */}
      <Card
        className={`${
          sessionState === 'prep'
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
                  sessionState === 'prep'
                    ? 'bg-yellow-100'
                    : sessionState === 'active'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                }`}
              >
                <Clock
                  className={`h-6 w-6 ${
                    sessionState === 'prep'
                      ? 'text-yellow-600'
                      : sessionState === 'active'
                        ? 'text-green-600'
                        : 'text-gray-600'
                  }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {sessionState === 'prep' && 'Attendance starts in:'}
                  {sessionState === 'active' && 'Time remaining:'}
                  {sessionState === 'ended' && 'Session Completed'}
                </h3>
                {sessionState !== 'ended' && (
                  <p className="text-2xl font-bold text-primary">
                    {formatTime(timeRemaining)}
                  </p>
                )}
                {sessionState === 'ended' && (
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

          {sessionState !== 'ended' && (
            <Progress
              value={((60 - timeRemaining) / 60) * 100}
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
                {checkedInStudents.length} of {sessionData.totalStudents}{' '}
                students have checked in
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {checkedInStudents.filter((s) => s.status === 'present').length}{' '}
              Present
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {checkedInStudents.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  {sessionState === 'prep'
                    ? 'Waiting for session to begin...'
                    : 'Waiting for students to check in...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {checkedInStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors animate-scale-in"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(student.status)}
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">
                        {student.regNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <div>{student.distance}m</div>
                      <div className="text-gray-500">
                        {student.accuracy}% accuracy
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>{student.checkedInAt}</div>
                      {student.overridden && (
                        <div className="text-xs text-blue-600">
                          Manual Override
                        </div>
                      )}
                    </div>
                    {getStatusBadge(student.status)}

                    {student.status !== 'present' && !student.overridden && (
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
                    )}
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
