import React, { useState } from 'react';
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
  // Timer,
  Target,
  MapPinOff,
  Radar,
} from 'lucide-react';
import { SessionTimer } from '@/components/attendance/SessionTimer';
import { toast } from 'sonner';
import { useGetStudentCoursesWithActiveAttendance } from '@/feature/course/api/get-student-courses-with-active-attendance';
import { useGeolocated } from 'react-geolocated';
import { useStudentTakeAttendance } from '@/feature/attendance/api';
import { cn } from '@/lib/utils';
import type { Id } from 'convex/_generated/dataModel';
import MobilePageContainer from '@/components/mobile/MobilePageContainer';
import type { GetCoursesWithActiveAttendanceReturnType } from 'convex/schema';

// Utility function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

interface CompactGPSStatusProps {
  isAvailable: boolean;
  isEnabled: boolean;
  // isLoading: boolean;
  error?: string;
}

const CompactGPSStatus: React.FC<CompactGPSStatusProps> = ({
  isAvailable,
  isEnabled,
  // isLoading,
  error,
}) => {
  const getStatusInfo = () => {
    if (!isAvailable || !isEnabled || error) {
      return {
        icon: MapPinOff,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        text: 'GPS Off',
      };
    }

    return {
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      text: 'GPS Ready',
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full border shadow-sm',
        status.bgColor,
        status.borderColor,
      )}
    >
      <StatusIcon className={cn('h-3 w-3', status.color)} />
      <span className={cn('text-xs font-medium', status.color)}>
        {status.text}
      </span>
    </div>
  );
};

interface DistanceIndicatorProps {
  distance: number | null;
  maxDistance: number;
  isWithinRange: boolean;
}

const DistanceIndicator: React.FC<DistanceIndicatorProps> = ({
  distance,
  maxDistance,
  isWithinRange,
}) => {
  if (distance === null) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
        <Radar className="h-4 w-4 text-gray-500" />
        <span className="mobile-text-sm text-gray-600">
          Calculating distance...
        </span>
      </div>
    );
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getStatusInfo = () => {
    if (isWithinRange) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        message: 'Within range',
      };
    }

    return {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      message: 'Too far from session',
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;
  const excessDistance = Math.max(0, distance - maxDistance);

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border',
        status.bgColor,
        status.borderColor,
      )}
    >
      <div className="flex items-center gap-2">
        <StatusIcon className={cn('h-4 w-4', status.color)} />
        <span className={cn('mobile-text-sm font-medium', status.color)}>
          {status.message}
        </span>
      </div>
      <div className="text-right">
        <div className={cn('mobile-text-sm font-mono', status.color)}>
          {formatDistance(distance)}
        </div>
        {!isWithinRange && excessDistance > 0 && (
          <div className="mobile-text-xs text-muted-foreground">
            Move {formatDistance(excessDistance)} closer
          </div>
        )}
      </div>
    </div>
  );
};

interface CourseSessionCardProps {
  course: NonNullable<GetCoursesWithActiveAttendanceReturnType[number]>; // Type from API
  onCheckIn: (sessionId: Id<'attendanceSessions'>, code?: string) => void;
  isLoading: boolean;
  gpsReady: boolean;
  attendanceCode: string;
  setAttendanceCode: React.Dispatch<React.SetStateAction<string>>;
  userLocation: { latitude: number; longitude: number } | null;
  distance: number | null;
  isWithinRange: boolean;
}

const CourseSessionCard: React.FC<CourseSessionCardProps> = ({
  course,
  onCheckIn,
  isLoading,
  gpsReady,
  attendanceCode,
  setAttendanceCode,
  userLocation,
  distance,
  isWithinRange,
}) => {
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleCheckIn = () => {
    if (course?.session.attendanceCode && !showCodeInput) {
      setShowCodeInput(true);
      return;
    }
    onCheckIn(course.session._id!, attendanceCode);
  };

  const canCheckIn =
    course?.session.status === 'active' &&
    gpsReady &&
    !isLoading &&
    isWithinRange &&
    (!course?.session.attendanceCode ||
      !showCodeInput ||
      (showCodeInput && attendanceCode.trim().length > 0));

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
              course?.session.status === 'complete' &&
                'bg-gray-100 text-gray-800',
            )}
          >
            {course?.session.status === 'active' && 'Active'}
            {course?.session.status === 'pending' && 'Starting Soon'}
            {course?.session.status === 'complete' && 'Ended'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Timer */}
        <div className="flex justify-center">
          <SessionTimer
            endTime={course?.session.endedAt || 0}
            creationTime={course?.session._creationTime}
            status={course?.session.status || 'complete'}
            variant="circular"
            size="sm"
          />
        </div>

        {/* Distance Indicator - Only show for active sessions with GPS */}
        {course?.session.status === 'active' && gpsReady && userLocation && (
          <DistanceIndicator
            distance={distance}
            maxDistance={course?.session.radius || 100}
            isWithinRange={isWithinRange}
          />
        )}

        {/* Attendance Code Input */}
        {course?.session.attendanceCode && showCodeInput && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <Label
                htmlFor="attendance-code"
                className="mobile-text-sm font-medium text-blue-800"
              >
                Attendance Code Required
              </Label>
            </div>
            <p className="mobile-text-xs text-blue-700 mb-2">
              Please enter the attendance code provided by your lecturer before
              taking attendance.
            </p>
            <Input
              id="attendance-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
              className="text-center font-mono text-xl h-12 border-blue-300 focus:border-blue-500"
              maxLength={6}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && attendanceCode.trim()) {
                  handleCheckIn();
                }
              }}
            />
            <p className="mobile-text-xs text-blue-600">
              Ask your lecturer for the 6-digit attendance code if you
              don&apos;t have it.
            </p>
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
            !isWithinRange &&
              course?.session.status === 'active' &&
              gpsReady &&
              'bg-red-600 hover:bg-red-700',
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
          ) : course?.session.status === 'complete' ? (
            <>
              <AlertCircle className="h-5 w-5 mr-2" />
              Session Ended
            </>
          ) : !gpsReady ? (
            <>
              <Navigation className="h-5 w-5 mr-2" />
              Waiting for GPS
            </>
          ) : !isWithinRange ? (
            <>
              <MapPin className="h-5 w-5 mr-2" />
              Move Closer to Check In
            </>
          ) : course?.session.attendanceCode && !showCodeInput ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Take Attendance
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
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600" />
            <p className="mobile-text-sm text-yellow-800">
              Session will be available for check-in shortly
            </p>
          </div>
        )}

        {!gpsReady && course?.session.status === 'active' && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
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
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [isWithinRange, setIsWithinRange] = useState<Record<string, boolean>>(
    {},
  );

  const { mutateAsync: takeAttendance } = useStudentTakeAttendance();

  // Calculate distances and range status for all active sessions
  const calculateDistancesAndRange = (coords: GeolocationCoordinates) => {
    if (!coords || activeCourses.length === 0) return;

    const newDistances: Record<string, number> = {};
    const newRangeStatus: Record<string, boolean> = {};

    activeCourses.forEach((course) => {
      if (course?.session?.location && course.session.status === 'active') {
        const distance = calculateDistance(
          coords.latitude,
          coords.longitude,
          course.session.location.lat,
          course.session.location.long,
        );

        const maxDistance = course.session.radius || 100;

        newDistances[course.session._id] = distance;
        newRangeStatus[course.session._id] = distance <= maxDistance;
      }
    });

    setDistances(newDistances);
    setIsWithinRange(newRangeStatus);
  };

  const {
    isGeolocationAvailable,
    isGeolocationEnabled,
    getPosition,
    coords,
    positionError,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    },
    userDecisionTimeout: 5000,
    suppressLocationOnMount: false,
    watchPosition: true, // Enable continuous tracking
    onSuccess: (position) => {
      // Calculate distances whenever location updates
      calculateDistancesAndRange(position.coords);
    },
    onError: (error) => {
      console.error('Geolocation error:', error);
      // Clear distances on error
      setDistances({});
      setIsWithinRange({});
    },
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

    if (!isWithinRange[sessionId]) {
      toast.error('Too far from session', {
        description: 'Move closer to the classroom to check in.',
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
      <div className="flex-1 p-4 pt-16 space-y-6">
        {/* Active Sessions Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="mobile-text-lg font-semibold">Active Sessions</h2>
            </div>
            <CompactGPSStatus
              isAvailable={isGeolocationAvailable}
              isEnabled={isGeolocationEnabled}
              // isLoading={isGeolocationLoading}
              error={positionError?.message}
            />
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
              {activeCourses.map((course) => {
                if (course) {
                  return (
                    <CourseSessionCard
                      key={course?.courseId}
                      course={course}
                      onCheckIn={handleCheckIn}
                      isLoading={
                        isCheckingIn && selectedSession === course?.session._id
                      }
                      attendanceCode={attendanceCode}
                      gpsReady={gpsReady}
                      setAttendanceCode={setAttendanceCode}
                      userLocation={
                        coords
                          ? {
                              latitude: coords.latitude,
                              longitude: coords.longitude,
                            }
                          : null
                      }
                      distance={distances[course.session._id!] || null}
                      isWithinRange={
                        isWithinRange[course.session._id!] || false
                      }
                    />
                  );
                }
              })}
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
