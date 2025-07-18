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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Play,
  Square,
  Clock,
  Users,
  CheckCircle,
} from 'lucide-react';
// import { toast } from "sonner";

interface LecturerAttendancePageProps {
  courseId: string;
  onBack: () => void;
}

const LecturerAttendancePage = ({
  //  courseId,
  onBack,
}: LecturerAttendancePageProps) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(5);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const { toast } = useToast();

  // Mock course data
  const courseData = {
    name: 'Advanced Database Systems',
    code: 'CS401',
    totalStudents: 45,
  };

  // Mock attendance sessions
  const attendanceSessions = [
    {
      id: 1,
      date: '2024-01-15',
      startTime: '09:00',
      duration: 5,
      studentsPresent: 42,
      status: 'completed',
    },
    {
      id: 2,
      date: '2024-01-12',
      startTime: '09:00',
      duration: 5,
      studentsPresent: 38,
      status: 'completed',
    },
  ];

  // Mock active students
  const [activeStudents] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      regNo: 'CS/2022/001',
      joinedAt: '09:01',
      progress: 85,
    },
    {
      id: 2,
      name: 'Bob Wilson',
      regNo: 'CS/2022/002',
      joinedAt: '09:02',
      progress: 72,
    },
    {
      id: 3,
      name: 'Carol Martinez',
      regNo: 'CS/2022/003',
      joinedAt: '09:00',
      progress: 95,
    },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSessionActive && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsSessionActive(false);
            // toast({
            //   title: "Attendance Session Ended",
            //   description: "The attendance session has automatically ended.",
            // });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isSessionActive, remainingTime]);

  const startAttendanceSession = () => {
    setIsSessionActive(true);
    setRemainingTime(sessionDuration * 60);
    setIsDialogOpen(false);
    // toast({
    //   title: "Attendance Session Started",
    //   description: `Session will run for ${sessionDuration} minutes.`,
    // });
  };

  const endAttendanceSession = () => {
    setIsSessionActive(false);
    setRemainingTime(0);
    // toast({
    //   title: "Attendance Session Ended",
    //   description: "The attendance session has been manually ended.",
    // });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance Management
            </h1>
            <p className="text-gray-600">
              {courseData.name} ({courseData.code})
            </p>
          </div>
        </div>

        {!isSessionActive ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Start Attendance Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start Attendance Session</DialogTitle>
                <DialogDescription>
                  Configure the attendance session duration. Students must stay
                  active for at least 70% of the time.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Session Duration (minutes)</Label>
                  <Select
                    value={sessionDuration.toString()}
                    onValueChange={(value) =>
                      setSessionDuration(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 minutes</SelectItem>
                      <SelectItem value="3">3 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="7">7 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={startAttendanceSession}>
                    Start Session
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button variant="destructive" onClick={endAttendanceSession}>
            <Square className="h-4 w-4 mr-2" />
            End Session
          </Button>
        )}
      </div>

      {/* Active Session Status */}
      {isSessionActive && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Session Active
                  </h3>
                  <p className="text-green-700">
                    Time remaining: {formatTime(remainingTime)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-900">
                  {activeStudents.length}
                </div>
                <div className="text-sm text-green-700">Students joined</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={
                  ((sessionDuration * 60 - remainingTime) /
                    (sessionDuration * 60)) *
                  100
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Session
            </CardTitle>
            <CardDescription>
              {isSessionActive
                ? 'Students currently in session'
                : 'No active session'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSessionActive ? (
              <div className="space-y-3">
                {activeStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">
                        {student.regNo}
                      </div>
                      <div className="text-xs text-gray-500">
                        Joined at {student.joinedAt}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${getProgressColor(student.progress)}`}
                      >
                        {student.progress}%
                      </div>
                      {student.progress >= 70 && (
                        <CheckCircle className="h-4 w-4 text-green-600 ml-auto mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start a session to see active students</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session History */}
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>Previous attendance sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{session.date}</div>
                    <div className="text-sm text-gray-600">
                      {session.startTime} • {session.duration} min duration
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {session.studentsPresent}/{courseData.totalStudents}
                    </div>
                    <Badge
                      variant={
                        session.status === 'completed' ? 'secondary' : 'default'
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LecturerAttendancePage;
