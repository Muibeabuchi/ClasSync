import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Loader2,
  MapPin,
  Navigation,
  // Target,
  // MapPinOff,
  Radar,
} from 'lucide-react';
import { SessionTimer } from '@/components/attendance/SessionTimer';
import { toast } from 'sonner';
import { useGetStudentCoursesWithActiveAttendance } from '@/feature/course/api/get-student-courses-with-active-attendance';
import { useGeolocated } from 'react-geolocated';
import { useStudentTakeAttendance } from '@/feature/attendance/api';
import type { Id } from 'convex/_generated/dataModel';
import { cn } from '@/lib/utils';

// interface AttendanceCheckInProps {
//   onBack: () => void;
// }

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

const AttendanceCheckIn = () => {
  const { data: activeCourses = [] } =
    useGetStudentCoursesWithActiveAttendance();
  const [selectedSession, setSelectedSession] =
    useState<Id<'attendanceSessions'> | null>(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [isWithinRange, setIsWithinRange] = useState<Record<string, boolean>>(
    {},
  );

  const { mutateAsync: takeAttendance } = useStudentTakeAttendance();

  // Calculate distances and range status for all active sessions
  const calculateDistancesAndRange = useCallback(
    (coords: GeolocationCoordinates) => {
      if (!coords || activeCourses.length === 0) return;

      const newDistances: Record<string, number> = {};
      const newRangeStatus: Record<string, boolean> = {};

      activeCourses.forEach((course) => {
        if (
          course?.session?.location &&
          (course.session.status === 'pending' ||
            course.session.status === 'active')
        ) {
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
    },
    [activeCourses],
  );

  const {
    isGeolocationAvailable,
    isGeolocationEnabled,
    coords,
    getPosition,
    positionError,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    },
    userDecisionTimeout: 10000,
    suppressLocationOnMount: false,
    watchPosition: true, // Enable continuous tracking
    onSuccess: (position) => {
      console.log('GPS position obtained:', position.coords);
      // Calculate distances whenever location updates
      calculateDistancesAndRange(position.coords);
    },
    onError: (error) => {
      console.error('GPS error:', error);
      // Clear distances on error
      setDistances({});
      setIsWithinRange({});
    },
  });

  // Effect to calculate distances when activeCourses change
  useEffect(() => {
    if (coords && activeCourses.length > 0) {
      calculateDistancesAndRange(coords);
    }
  }, [activeCourses, calculateDistancesAndRange, coords]);

  // More flexible GPS ready check
  const gpsReady =
    isGeolocationAvailable && isGeolocationEnabled && !positionError;

  const handleCheckInClick = (course: any) => {
    if (!course?.session) return;

    setCurrentCourse(course);
    setSelectedSession(course.session._id);

    // Always show the modal first if the session requires a code
    if (course.session.attendanceCode) {
      setIsCodeModalOpen(true);
      return;
    }

    // Otherwise, proceed directly with check-in
    handleCheckIn();
  };

  const handleCheckIn = async (code?: string) => {
    if (!selectedSession || !currentCourse) return;

    // Check if we're within range before proceeding
    if (
      currentCourse.session.status === 'active' &&
      gpsReady &&
      distances[selectedSession] !== undefined &&
      !isWithinRange[selectedSession]
    ) {
      toast.error('Too far from session', {
        description: 'Move closer to the classroom to check in.',
      });
      return;
    }

    setIsCheckingIn(true);

    try {
      let currentCoords = coords;

      // If we don't have coordinates, try to get them
      if (!currentCoords) {
        if (!isGeolocationAvailable) {
          throw new Error('GPS is not available on this device');
        }

        if (!isGeolocationEnabled) {
          throw new Error('Please enable location services in your browser');
        }

        toast.info('Getting your location...', {
          description: 'Please wait while we determine your position.',
        });

        // Try to get position with a promise wrapper
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000,
              });
            },
          );
          currentCoords = position.coords;
        } catch (gpsError) {
          console.error('GPS error:', gpsError);
          throw new Error(
            'Unable to get your location. Please check your GPS settings.',
          );
        }
      }

      if (!currentCoords) {
        throw new Error('Unable to get your location');
      }

      await takeAttendance({
        attendanceSessionId: selectedSession,
        gpsCoordinates: {
          lat: currentCoords.latitude,
          long: currentCoords.longitude,
        },
        attendanceCode: code || attendanceCode || undefined,
      });

      toast.success('Check-in successful!', {
        description: `You've been marked present for ${currentCourse.courseName}`,
      });

      // Reset form
      setAttendanceCode('');
      setSelectedSession(null);
      setCurrentCourse(null);
      setIsCodeModalOpen(false);
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

  const handleCodeSubmit = () => {
    if (!attendanceCode.trim()) {
      toast.error('Please enter the attendance code');
      return;
    }
    handleCheckIn(attendanceCode);
  };

  const handleModalClose = () => {
    setIsCodeModalOpen(false);
    setAttendanceCode('');
    setSelectedSession(null);
    setCurrentCourse(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Attendance Check-In
          </h1>
          <p className="text-muted-foreground mt-2">
            Mark your attendance for active course sessions
          </p>
        </div> */}

        {/* GPS Status and Active Sessions Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Active Sessions</h2>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-full border shadow-sm',
                gpsReady
                  ? 'bg-green-100 border-green-200'
                  : 'bg-yellow-100 border-yellow-200',
              )}
            >
              <Navigation
                className={cn(
                  'h-4 w-4',
                  gpsReady ? 'text-green-600' : 'text-yellow-600',
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  gpsReady ? 'text-green-800' : 'text-yellow-800',
                )}
              >
                {!isGeolocationAvailable
                  ? 'GPS unavailable'
                  : !isGeolocationEnabled
                    ? 'Enable GPS'
                    : positionError
                      ? 'GPS error'
                      : coords
                        ? 'GPS ready'
                        : 'Getting GPS...'}
              </span>
              {coords && (
                <span className="text-xs text-muted-foreground">
                  ±{Math.round(coords.accuracy)}m
                </span>
              )}
            </div>
            {!coords && isGeolocationAvailable && isGeolocationEnabled && (
              <Button
                size="sm"
                variant="outline"
                onClick={getPosition}
                className="text-xs"
              >
                Retry GPS
              </Button>
            )}
          </div>
        </div>

        {activeCourses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Active Sessions
              </h3>
              <p className="text-muted-foreground">
                There are no attendance sessions currently active. Please wait
                for your lecturer to start a session.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Course Selection Description */}
            <Card>
              <CardHeader>
                <CardDescription>
                  Click on a course to check in to its active attendance session
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Active Course Sessions */}
            <div className="space-y-4">
              {activeCourses.map((course) => {
                if (!course) return;
                const isCurrentlyChecking =
                  isCheckingIn && selectedSession === course?.session._id;
                const canCheckIn =
                  course?.session.status === 'active' && !isCheckingIn;

                return (
                  <Card
                    key={course?.courseId}
                    className="transition-all hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {course?.courseName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {course?.courseCode} • {course?.lecturer.name}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            course?.session.status === 'active'
                              ? 'default'
                              : 'secondary'
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
                          {course?.session.status === 'pending' &&
                            'Starting Soon'}
                          {course?.session.status === 'complete' && 'Ended'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Session Timer */}
                        {course?.session && (
                          <div className="flex justify-center">
                            <SessionTimer
                              endTime={course.session.endedAt || 0}
                              creationTime={course.session._creationTime}
                              status={course.session.status}
                              variant="circular"
                              size="md"
                            />
                          </div>
                        )}

                        {/* Distance Indicator - Show for both pending and active sessions with GPS */}
                        {(course?.session.status === 'pending' ||
                          course?.session.status === 'active') &&
                          gpsReady &&
                          coords && (
                            <div className="space-y-2">
                              {distances[course.session._id] !== undefined ? (
                                <div
                                  className={cn(
                                    'flex items-center justify-between p-3 rounded-lg border',
                                    isWithinRange[course.session._id]
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-red-50 border-red-200',
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {isWithinRange[course.session._id] ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <AlertTriangle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span
                                      className={cn(
                                        'text-sm font-medium',
                                        isWithinRange[course.session._id]
                                          ? 'text-green-800'
                                          : 'text-red-800',
                                      )}
                                    >
                                      {isWithinRange[course.session._id]
                                        ? 'Within range'
                                        : 'Too far from session'}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div
                                      className={cn(
                                        'text-sm font-mono',
                                        isWithinRange[course.session._id]
                                          ? 'text-green-600'
                                          : 'text-red-600',
                                      )}
                                    >
                                      {distances[course.session._id] < 1000
                                        ? `${Math.round(distances[course.session._id])}m`
                                        : `${(distances[course.session._id] / 1000).toFixed(1)}km`}
                                    </div>
                                    {!isWithinRange[course.session._id] && (
                                      <div className="text-xs text-muted-foreground">
                                        Move{' '}
                                        {Math.max(
                                          0,
                                          distances[course.session._id] -
                                            (course.session.radius || 100),
                                        ) < 1000
                                          ? `${Math.round(Math.max(0, distances[course.session._id] - (course.session.radius || 100)))}m`
                                          : `${(Math.max(0, distances[course.session._id] - (course.session.radius || 100)) / 1000).toFixed(1)}km`}{' '}
                                        closer
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                  <Radar className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">
                                    Calculating distance...
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Session Info */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Session {course?.session.status}</span>
                          </div>
                          {!!course?.session.attendanceCode && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Code required</span>
                            </div>
                          )}
                        </div>

                        {/* Check-in Button */}
                        <Button
                          className={cn(
                            'w-full',
                            canCheckIn &&
                              gpsReady &&
                              (isWithinRange[course?.session._id] ||
                                distances[course?.session._id] === undefined) &&
                              'bg-green-600 hover:bg-green-700',
                            !isWithinRange[course?.session._id] &&
                              course?.session.status === 'active' &&
                              gpsReady &&
                              distances[course?.session._id] !== undefined &&
                              'bg-red-600 hover:bg-red-700',
                          )}
                          variant={canCheckIn ? 'default' : 'secondary'}
                          disabled={
                            !canCheckIn ||
                            !isGeolocationAvailable ||
                            (course?.session.status === 'active' &&
                              gpsReady &&
                              distances[course?.session._id] !== undefined &&
                              !isWithinRange[course?.session._id])
                          }
                          onClick={() => handleCheckInClick(course)}
                        >
                          {isCurrentlyChecking ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Checking In...
                            </>
                          ) : course?.session.status === 'pending' ? (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Session Starting Soon
                            </>
                          ) : course?.session.status === 'complete' ? (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Session Ended
                            </>
                          ) : !isGeolocationAvailable ? (
                            <>
                              <Navigation className="h-4 w-4 mr-2" />
                              GPS Not Available
                            </>
                          ) : !gpsReady ? (
                            <>
                              <Navigation className="h-4 w-4 mr-2" />
                              Waiting for GPS
                            </>
                          ) : distances[course.session._id] === undefined ? (
                            <>
                              <Radar className="h-4 w-4 mr-2" />
                              Calculating Distance...
                            </>
                          ) : !isWithinRange[course?.session._id] ? (
                            <>
                              <MapPin className="h-4 w-4 mr-2" />
                              Move Closer to Check In
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {course?.session.attendanceCode
                                ? 'Take Attendance'
                                : 'Check In Now'}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Attendance Code Modal */}
      <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Attendance Code Required</DialogTitle>
            <DialogDescription>
              Please enter the attendance code provided by your lecturer for{' '}
              <strong>{currentCourse?.courseName}</strong> before taking
              attendance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attendance-code">Attendance Code</Label>
              <Input
                id="attendance-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={attendanceCode}
                onChange={(e) =>
                  setAttendanceCode(e.target.value.toUpperCase())
                }
                className="text-center font-mono text-lg"
                maxLength={6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCodeSubmit();
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleModalClose}
                disabled={isCheckingIn}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCodeSubmit}
                disabled={!attendanceCode.trim() || isCheckingIn}
              >
                {isCheckingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking In...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check In
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AttendanceCheckIn;
