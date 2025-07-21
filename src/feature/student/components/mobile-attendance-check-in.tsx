import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Navigation,
  BookOpen,
  Users,
  Timer,
  // Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetStudentCoursesWithActiveAttendance } from '@/feature/course/api/get-student-courses-with-active-attendance';
import { useGeolocated } from 'react-geolocated';
import { useStudentTakeAttendance } from '@/feature/attendance/api';
import { cn } from '@/lib/utils';
import type { Id } from 'convex/_generated/dataModel';
import MobilePageContainer from '@/components/mobile/MobilePageContainer';

interface GPSStatusProps {
  isAvailable: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  accuracy?: number;
  error?: string;
}

const GPSStatusIndicator: React.FC<GPSStatusProps> = ({
  isAvailable,
  isEnabled,
  isLoading,
  accuracy,
  error,
}) => {
  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: Loader2,
        text: 'Getting your location...',
        subtext: 'Please wait while we access GPS',
        variant: 'secondary' as const,
        iconClass: 'animate-spin text-blue-500',
      };
    }

    if (!isAvailable) {
      return {
        icon: WifiOff,
        text: 'GPS not available',
        subtext: 'Your device does not support location services',
        variant: 'destructive' as const,
        iconClass: 'text-red-500',
      };
    }

    if (!isEnabled) {
      return {
        icon: AlertCircle,
        text: 'Location access needed',
        subtext: 'Please enable location services to check in',
        variant: 'destructive' as const,
        iconClass: 'text-red-500',
      };
    }

    if (error) {
      return {
        icon: AlertCircle,
        text: 'Location error',
        subtext: error,
        variant: 'destructive' as const,
        iconClass: 'text-red-500',
      };
    }

    return {
      icon: CheckCircle,
      text: 'GPS ready',
      subtext: accuracy
        ? `Accuracy: ${Math.round(accuracy)}m`
        : 'Location services active',
      variant: 'default' as const,
      iconClass: 'text-green-500',
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                'bg-muted/50 border-2',
                status.variant === 'default' && 'border-green-200 bg-green-50',
                status.variant === 'destructive' && 'border-red-200 bg-red-50',
                status.variant === 'secondary' && 'border-blue-200 bg-blue-50',
              )}
            >
              <StatusIcon className={cn('h-8 w-8', status.iconClass)} />
            </div>
            {status.variant === 'default' && (
              <div className="absolute -top-1 -right-1">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="font-semibold mobile-text-lg">{status.text}</p>
            <p className="mobile-text-sm text-muted-foreground">
              {status.subtext}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SessionTimerProps {
  endTime: number;
  status: 'pending' | 'active' | 'inactive';
}

const SessionTimer: React.FC<SessionTimerProps> = ({ endTime, status }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 p-3 rounded-lg border',
        getStatusColor(),
      )}
    >
      <Timer className="h-4 w-4" />
      <span className="font-mono mobile-text-lg font-semibold">
        {formatTime(timeRemaining)}
      </span>
      <span className="mobile-text-sm capitalize">{status}</span>
    </div>
  );
};

interface CourseSessionCardProps {
  course: any; // Type from API
  onCheckIn: (sessionId: Id<'attendanceSessions'>, code?: string) => void;
  isLoading: boolean;
  gpsReady: boolean;
}

const CourseSessionCard: React.FC<CourseSessionCardProps> = ({
  course,
  onCheckIn,
  isLoading,
  gpsReady,
}) => {
  const [attendanceCode, setAttendanceCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleCheckIn = () => {
    if (course?.session.requiresCode && !showCodeInput) {
      setShowCodeInput(true);
      return;
    }
    onCheckIn(course?.session._id, attendanceCode);
  };

  const canCheckIn =
    course?.session.status === 'active' && gpsReady && !isLoading;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mobile-text-xl mb-1">
              {course?.courseName}
            </CardTitle>
            <p className="mobile-text-sm text-muted-foreground mb-2">
              {course?.courseCode}
            </p>
            <div className="flex items-center gap-2 mobile-text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{course?.lecturer.name}</span>
            </div>
          </div>
          <Badge
            variant={
              course?.session.status === 'active' ? 'default' : 'secondary'
            }
            className={cn(
              course?.session.status === 'active' &&
                'bg-green-100 text-green-800',
              course?.session.status === 'pending' &&
                'bg-yellow-100 text-yellow-800',
              course?.session.status === 'inactive' &&
                'bg-gray-100 text-gray-800',
            )}
          >
            {course?.session.status === 'active' && 'Active'}
            {course?.session.status === 'pending' && 'Starting Soon'}
            {course?.session.status === 'inactive' && 'Ended'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Timer */}
        <SessionTimer
          endTime={course?.session.endTime || Date.now()}
          status={course?.session.status || 'inactive'}
        />

        {/* Attendance Code Input */}
        {course?.session.requiresCode && showCodeInput && (
          <div className="space-y-2">
            <Label
              htmlFor="attendance-code"
              className="mobile-text-sm font-medium"
            >
              Attendance Code
            </Label>
            <Input
              id="attendance-code"
              type="text"
              placeholder="Enter code"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
              className="text-center font-mono text-lg"
              maxLength={6}
            />
          </div>
        )}

        {/* Check-in Button */}
        <Button
          onClick={handleCheckIn}
          disabled={!canCheckIn}
          className={cn(
            'w-full h-14 text-lg font-semibold',
            'mobile-touch-feedback',
            canCheckIn && 'bg-green-600 hover:bg-green-700',
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Checking In...
            </>
          ) : course?.session.status === 'pending' ? (
            <>
              <Clock className="h-5 w-5 mr-2" />
              Session Starting Soon
            </>
          ) : course?.session.status === 'inactive' ? (
            <>
              <AlertCircle className="h-5 w-5 mr-2" />
              Session Ended
            </>
          ) : !gpsReady ? (
            <>
              <Navigation className="h-5 w-5 mr-2" />
              Waiting for GPS
            </>
          ) : course?.session.requiresCode && !showCodeInput ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Enter Code to Check In
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Check In Now
            </>
          )}
        </Button>

        {/* Status Messages */}
        {course?.session.status === 'pending' && (
          <div className="flex items-center gap-2 mobile-p-sm bg-yellow-50 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600" />
            <p className="mobile-text-sm text-yellow-800">
              Session will be available for check-in shortly
            </p>
          </div>
        )}

        {!gpsReady && course?.session.status === 'active' && (
          <div className="flex items-center gap-2 mobile-p-sm bg-blue-50 rounded-lg">
            <Navigation className="h-4 w-4 text-blue-600" />
            <p className="mobile-text-sm text-blue-800">
              Enable location services to check in
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MobileAttendanceCheckIn: React.FC = () => {
  const { data: activeCourses = [] } =
    useGetStudentCoursesWithActiveAttendance();
  const [selectedSession, setSelectedSession] =
    useState<Id<'attendanceSessions'> | null>(null);
  const [
    // attendanceCode,
    setAttendanceCode,
  ] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const { mutateAsync: takeAttendance } = useStudentTakeAttendance();

  const {
    isGeolocationAvailable,
    isGeolocationEnabled,
    getPosition,
    coords,
    // isGeolocationLoading,
    positionError,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    },
    userDecisionTimeout: 5000,
    suppressLocationOnMount: true,
    watchPosition: false,
  });

  const gpsReady =
    isGeolocationAvailable && isGeolocationEnabled && !positionError;

  const handleCheckIn = async (
    sessionId: Id<'attendanceSessions'>,
    code?: string,
  ) => {
    if (!gpsReady) {
      toast.error('GPS not ready', {
        description: 'Please enable location services and try again.',
      });
      return;
    }

    setIsCheckingIn(true);
    setSelectedSession(sessionId);

    try {
      // Get current position if not already available
      if (!coords) {
        getPosition();
        // Wait a moment for position to be available
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!coords) {
        throw new Error('Unable to get your location');
      }

      const session = activeCourses.find(
        (course) => course?.session._id === sessionId,
      );

      if (!session) {
        throw new Error('Session not found');
      }

      await takeAttendance({
        attendanceSessionId: sessionId,
        gpsCoordinates: {
          lat: coords.latitude,
          long: coords.longitude,
        },
        attendanceCode: code || undefined,
      });

      toast.success('Check-in successful!', {
        description: `You've been marked present for ${session.courseName}`,
      });

      // Reset form
      setAttendanceCode('');
      setSelectedSession(null);
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error('Check-in failed', {
        description:
          error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <MobilePageContainer
      showHeader
      headerTitle="Check In"
      className="bg-gradient-to-b from-background to-muted/20"
    >
      <div className="flex-1 p-4 space-y-6">
        {/* GPS Status Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="mobile-text-lg font-semibold">Location Status</h2>
          </div>
          <GPSStatusIndicator
            isAvailable={isGeolocationAvailable}
            isEnabled={isGeolocationEnabled}
            // TODO: look into this later
            isLoading={false}
            accuracy={coords?.accuracy}
            error={positionError?.message}
          />
        </div>

        {/* Active Sessions Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="mobile-text-lg font-semibold">Active Sessions</h2>
          </div>

          {activeCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="mobile-text-lg font-medium mb-2">
                  No Active Sessions
                </h3>
                <p className="text-muted-foreground mobile-text-sm">
                  There are no attendance sessions currently active.
                  <br />
                  Check back when your lecturer starts a session.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeCourses.map((course) => (
                <CourseSessionCard
                  key={course?.courseId}
                  course={course}
                  onCheckIn={handleCheckIn}
                  isLoading={
                    isCheckingIn && selectedSession === course?.session._id
                  }
                  gpsReady={gpsReady}
                />
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <h3 className="font-medium mobile-text-sm">Need Help?</h3>
              <ul className="mobile-text-xs text-muted-foreground space-y-1">
                <li>• Make sure location services are enabled</li>
                <li>• Be within range of your classroom</li>
                <li>• Enter the attendance code if required</li>
                <li>• Check in while the session is active</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobilePageContainer>
  );
};

export default MobileAttendanceCheckIn;
