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
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Play,
  CheckCircle,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

// interface AttendanceCheckInProps {
//   onBack: () => void;
// }

const AttendanceCheckIn = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isAttending, setIsAttending] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionDuration] = useState(300); // 5 minutes in seconds
  const [isCompleted, setIsCompleted] = useState(false);

  // Mock enrolled courses
  const enrolledCourses = [
    {
      id: '1',
      name: 'Advanced Database Systems',
      code: 'CS401',
      lecturer: 'Prof. Sarah Johnson',
      isSessionActive: true,
      sessionEndTime: new Date(Date.now() + 4 * 60 * 1000), // 4 minutes from now
    },
    {
      id: '2',
      name: 'Software Engineering',
      code: 'CS301',
      lecturer: 'Dr. Michael Brown',
      isSessionActive: false,
      sessionEndTime: null,
    },
    {
      id: '3',
      name: 'Machine Learning',
      code: 'CS451',
      lecturer: 'Engr. Lisa Chen',
      isSessionActive: true,
      sessionEndTime: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
    },
  ];

  const activeCourses = enrolledCourses.filter(
    (course) => course.isSessionActive,
  );
  const selectedCourseData = enrolledCourses.find(
    (course) => course.id === selectedCourse,
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAttending && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1;

          // Check if student has met the 70% requirement
          if (newTime >= sessionDuration * 0.7 && !isCompleted) {
            setIsCompleted(true);
            toast(
              "You've been successfully marked as present for this session.",
            );
          }

          // Auto-complete at full duration
          if (newTime >= sessionDuration) {
            setIsAttending(false);
            return sessionDuration;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isAttending, isCompleted, sessionDuration]);

  const startAttendance = () => {
    if (!selectedCourse) {
      toast.info('Choose a course with an active attendance session.');

      return;
    }

    setIsAttending(true);
    setTimeElapsed(0);
    setIsCompleted(false);
    toast.info(
      "Stay on this page to be marked present. Don't switch tabs or refresh!",
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (timeElapsed / sessionDuration) * 100;
  };

  const getRequiredTime = () => {
    return Math.ceil(sessionDuration * 0.7);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Attendance Check-In
        </h1>
        <p className="text-gray-600 mt-2">
          Mark your attendance for active course sessions
        </p>
      </div>

      {activeCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Sessions
            </h3>
            <p className="text-gray-600">
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
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {activeCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
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
              </Select>

              {selectedCourseData && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedCourseData.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedCourseData.lecturer}
                      </p>
                    </div>
                    <Badge variant="default">Session Active</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Session */}
          {selectedCourse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                  Attendance Session
                </CardTitle>
                <CardDescription>
                  {isCompleted
                    ? "You've been marked present for this session!"
                    : `Stay active for at least ${formatTime(getRequiredTime())} to be marked present`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isAttending && !isCompleted ? (
                  <div className="text-center">
                    <Button
                      onClick={startAttendance}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Reading Attendance
                    </Button>
                    <p className="text-sm text-gray-600 mt-3">
                      {`⚠️ Don't switch tabs or refresh the page once you start`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Progress Circle */}
                    <div className="text-center">
                      <div className="relative inline-flex items-center justify-center">
                        <div className="w-32 h-32">
                          <Progress
                            value={getProgressPercentage()}
                            className="w-full h-full [&>div]:rounded-full"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {formatTime(timeElapsed)}
                            </div>
                            <div className="text-xs text-gray-600">
                              / {formatTime(sessionDuration)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Messages */}
                    <div className="text-center space-y-2">
                      {isCompleted ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">
                            Attendance Recorded Successfully!
                          </span>
                        </div>
                      ) : timeElapsed >= getRequiredTime() ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">
                            Minimum time reached - Keep going!
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <Clock className="h-5 w-5" />
                          <span>
                            {formatTime(getRequiredTime() - timeElapsed)}{' '}
                            remaining for minimum attendance
                          </span>
                        </div>
                      )}

                      <div className="text-sm text-gray-600">
                        Progress: {Math.round(getProgressPercentage())}%
                      </div>
                    </div>

                    {/* Warning Box */}
                    {isAttending && !isCompleted && (
                      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-800">
                            Stay on this page!
                          </p>
                          <p className="text-yellow-700">
                            Switching tabs, minimizing the window, or refreshing
                            will reset your timer.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceCheckIn;
