import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
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
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Loader2,
  MapPin,
  Navigation,
  Radar,
  Users,
  Calendar,
  Target,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { SessionTimer } from '@/components/attendance/SessionTimer';
import { StudentFaceAttendanceDrawer } from '@/components/face-verification/StudentFaceAttendanceDrawer';
import { toast } from 'sonner';
import { useStudentTakeAttendance } from '@/feature/attendance/api';
import { useGetStudentCourseDetail } from '@/feature/course/api/get-student-course-detail';
import { useAttendanceGPS } from '@/hooks/useAttendanceGPS';
import { MobilePageContainer } from '@/components/mobile/MobilePageContainer';
import type { Id } from 'convex/_generated/dataModel';
import { cn } from '@/lib/utils';

const MobileStudentCourseDetailPage = () => {
  const { courseId } = useParams({
    from: '/dashboard/student/courses/$courseId',
  });
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isFaceVerificationDrawerOpen, setIsFaceVerificationDrawerOpen] =
    useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const { mutateAsync: takeAttendance } = useStudentTakeAttendance();
  const { data: courseData } = useGetStudentCourseDetail(
    courseId as Id<'courses'>,
  );

  // Use the new GPS hook for better session handling
  const {
    coords,
    distance,
    isWithinRange,
    gpsStatus,
    hasActiveSession,
    refreshGPS,
    isCalculationStale,
  } = useAttendanceGPS({
    session: courseData.session,
    enabled: true,
  });

  const handleCheckInClick = () => {
    if (!courseData.session) return;

    // Check if face verification is required
    if (courseData.session.verificationMethod === 'gps_face_verification') {
      setIsFaceVerificationDrawerOpen(true);
      return;
    }

    // Show code modal if session requires a code
    if (courseData.session.attendanceCode) {
      setIsCodeModalOpen(true);
      return;
    }

    // Otherwise, proceed directly with check-in
    handleCheckIn();
  };

  const handleCheckIn = async (code?: string) => {
    if (!courseData.session) return;

    // Show warning if distance has been calculated and student is too far
    if (
      hasActiveSession &&
      gpsStatus.isReady &&
      distance !== null &&
      !isWithinRange
    ) {
      toast.warning('Distance Warning', {
        description:
          'You appear to be far from the session location. The server will verify your location.',
      });
    }

    setIsCheckingIn(true);

    try {
      let currentCoords = coords;

      // If we don't have coordinates, try to get them
      if (!currentCoords) {
        if (!gpsStatus.isAvailable) {
          throw new Error('GPS is not available on this device');
        }

        if (!gpsStatus.isEnabled) {
          throw new Error('Please enable location services in your browser');
        }

        toast.info('Getting your location...', {
          description: 'Please wait while we determine your position.',
        });

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
        attendanceSessionId: courseData.session._id,
        gpsCoordinates: {
          lat: currentCoords.latitude,
          long: currentCoords.longitude,
        },
        attendanceCode: code || attendanceCode || undefined,
      });

      toast.success('Check-in successful!', {
        description: `You've been marked present for ${courseData.courseName}`,
      });

      // Reset form
      setAttendanceCode('');
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
  };

  const canCheckIn =
    hasActiveSession &&
    gpsStatus.isReady &&
    isWithinRange &&
    !isCheckingIn &&
    !courseData.session?.hasCheckedIn;

  return (
    <>
      <MobilePageContainer
        showHeader={true}
        headerTitle={courseData.courseName}
        headerSubtitle={courseData.courseCode}
        // headerActions={
        //   <Button
        //     variant="ghost"
        //     size="icon"
        //     asChild
        //     className="touch-target-min"
        //   >
        //     <Link to="/dashboard/student/courses">
        //       <ArrowLeft className="h-4 w-4" />
        //     </Link>
        //   </Button>
        // }
        className="bg-background"
      >
        <div className="flex flex-col h-full space-y-4 px-4 pb-4">
          {/* Active Session Card - Only show if session is active and student hasn't checked in */}
          {hasActiveSession && !courseData.session?.hasCheckedIn && (
            <Card className="border-primary/20 bg-primary/5 mobile-tap-feedback">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <CardTitle className="mobile-text-lg">
                      Live Session
                    </CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-800 mobile-text-xs">
                    Active
                  </Badge>
                </div>
                <CardDescription className="mobile-text-sm">
                  Mark your attendance before the session ends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Session Timer */}
                <div className="flex justify-center">
                  <SessionTimer
                    endTime={courseData.session.endedAt || 0}
                    creationTime={courseData.session._creationTime}
                    status={courseData.session.status}
                    variant="circular"
                    size="md"
                  />
                </div>

                {/* GPS Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="mobile-text-sm font-medium">
                      Location Status
                    </span>
                    <div
                      className={cn(
                        'flex items-center gap-2 px-2 py-1 rounded-full mobile-text-xs font-medium',
                        gpsStatus.isReady
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800',
                      )}
                    >
                      <Navigation className="h-3 w-3" />
                      {gpsStatus.isReady ? 'GPS Ready' : 'Getting GPS...'}
                    </div>
                  </div>

                  {/* Distance Indicator */}
                  {gpsStatus.isReady && coords && distance !== null && (
                    <div
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        isWithinRange
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isWithinRange ? (
                          <Target className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={cn(
                            'mobile-text-sm font-medium',
                            isWithinRange ? 'text-green-800' : 'text-red-800',
                          )}
                        >
                          {isWithinRange ? 'Within range' : 'Too far away'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            'mobile-text-sm font-mono',
                            isWithinRange ? 'text-green-600' : 'text-red-600',
                          )}
                        >
                          {distance < 1000
                            ? `${Math.round(distance)}m`
                            : `${(distance / 1000).toFixed(1)}km`}
                        </div>
                        {!isWithinRange && (
                          <div className="mobile-text-xs text-muted-foreground">
                            Move{' '}
                            {Math.max(
                              0,
                              distance - (courseData.session.radius || 100),
                            ) < 1000
                              ? `${Math.round(Math.max(0, distance - (courseData.session.radius || 100)))}m`
                              : `${(Math.max(0, distance - (courseData.session.radius || 100)) / 1000).toFixed(1)}km`}{' '}
                            closer
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* GPS Error or Loading */}
                  {!gpsStatus.isReady && hasActiveSession && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Radar className="h-4 w-4 text-yellow-600" />
                      <span className="mobile-text-sm text-yellow-800">
                        {gpsStatus.hasError
                          ? gpsStatus.errorMessage || 'GPS error occurred'
                          : !gpsStatus.isAvailable
                            ? 'GPS not available'
                            : !gpsStatus.isEnabled
                              ? 'Enable location services'
                              : 'Getting your location...'}
                      </span>
                      {gpsStatus.isAvailable && gpsStatus.isEnabled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={refreshGPS}
                          className="ml-auto mobile-text-xs touch-target-min"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Show refresh button if calculation seems stale */}
                  {isCalculationStale && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="mobile-text-sm text-amber-800">
                        GPS calculation may be outdated
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={refreshGPS}
                        className="ml-auto mobile-text-xs touch-target-min"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  )}
                </div>

                {/* Check-in Button */}
                <Button
                  className={cn(
                    'w-full h-12 touch-target-min mobile-tap-feedback',
                    canCheckIn && 'bg-green-600 hover:bg-green-700 text-white',
                    courseData.session?.hasCheckedIn &&
                      'bg-green-600 text-white cursor-default',
                  )}
                  disabled={!canCheckIn && !courseData.session?.hasCheckedIn}
                  onClick={
                    courseData.session?.hasCheckedIn
                      ? undefined
                      : handleCheckInClick
                  }
                >
                  {courseData.session?.hasCheckedIn ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Already Checked In
                    </>
                  ) : isCheckingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking In...
                    </>
                  ) : !gpsStatus.isReady ? (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Waiting for GPS
                    </>
                  ) : distance === null ? (
                    <>
                      <Radar className="h-4 w-4 mr-2" />
                      Calculating Distance...
                    </>
                  ) : !isWithinRange ? (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Move Closer to Check In
                    </>
                  ) : (
                    <>
                      {courseData.session.verificationMethod ===
                      'gps_face_verification' ? (
                        <Eye className="h-4 w-4 mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {courseData.session.verificationMethod ===
                      'gps_face_verification'
                        ? 'Verify Face & Check In'
                        : courseData.session.attendanceCode
                          ? 'Enter Code & Check In'
                          : 'Check In Now'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Course Statistics - Mobile 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="mobile-tap-feedback">
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="mobile-text-lg font-bold">
                      {courseData.attendanceStats.totalSessions}
                    </p>
                    <p className="mobile-text-xs text-muted-foreground">
                      Total Sessions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mobile-tap-feedback">
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="mobile-text-lg font-bold">
                      {courseData.attendanceStats.attendedSessions}
                    </p>
                    <p className="mobile-text-xs text-muted-foreground">
                      Attended
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mobile-tap-feedback">
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="mobile-text-lg font-bold">
                      {courseData.attendanceStats.attendancePercentage}%
                    </p>
                    <p className="mobile-text-xs text-muted-foreground">
                      Attendance Rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mobile-tap-feedback">
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="mobile-text-sm font-bold">
                      {courseData.attendanceStats.lastAttended
                        ? new Date(
                            courseData.attendanceStats.lastAttended,
                          ).toLocaleDateString()
                        : 'Never'}
                    </p>
                    <p className="mobile-text-xs text-muted-foreground">
                      Last Attended
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance History */}
          <Card className="mobile-tap-feedback">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 mobile-text-lg">
                <Clock className="h-4 w-4" />
                Attendance History
              </CardTitle>
              <CardDescription className="mobile-text-sm">
                Your attendance record for all sessions in this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courseData.attendanceHistory &&
              courseData.attendanceHistory.length > 0 ? (
                <div className="space-y-3">
                  {courseData.attendanceHistory.map((session, index) => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted mobile-text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="mobile-text-sm font-medium">
                            Session {index + 1}
                          </p>
                          <p className="mobile-text-xs text-muted-foreground">
                            {new Date(
                              session._creationTime,
                            ).toLocaleDateString()}{' '}
                            at{' '}
                            {new Date(session._creationTime).toLocaleTimeString(
                              [],
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {session.attended ? (
                          <>
                            <Badge className="bg-green-100 text-green-800 border-green-200 mobile-text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Present
                            </Badge>
                            {session.isManualOverride && (
                              <Badge
                                variant="outline"
                                className="text-amber-600 border-amber-200 mobile-text-xs"
                              >
                                Manual
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800 border-red-200 mobile-text-xs"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Absent
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="mobile-text-lg font-medium text-foreground mb-2">
                    No Sessions Yet
                  </h3>
                  <p className="mobile-text-sm text-muted-foreground">
                    No attendance sessions have been held for this course yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Information */}
          <Card className="mobile-tap-feedback">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 mobile-text-lg">
                <BookOpen className="h-4 w-4" />
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div>
                  <Label className="mobile-text-sm font-medium">
                    Course Name
                  </Label>
                  <p className="mobile-text-sm text-muted-foreground">
                    {courseData.courseName}
                  </p>
                </div>
                <div>
                  <Label className="mobile-text-sm font-medium">
                    Course Code
                  </Label>
                  <p className="mobile-text-sm text-muted-foreground">
                    {courseData.courseCode}
                  </p>
                </div>
                <div>
                  <Label className="mobile-text-sm font-medium">Lecturer</Label>
                  <p className="mobile-text-sm text-muted-foreground">
                    {courseData.lecturer.name}
                  </p>
                </div>
                <div>
                  <Label className="mobile-text-sm font-medium">Email</Label>
                  <p className="mobile-text-sm text-muted-foreground">
                    {courseData.lecturer.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* No Active Session Message */}
          {!hasActiveSession && (
            <Card className="mobile-tap-feedback">
              <CardContent className="text-center py-8">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="mobile-text-lg font-medium text-foreground mb-2">
                  No Active Session
                </h3>
                <p className="mobile-text-sm text-muted-foreground">
                  There is no attendance session currently active for this
                  course. Your lecturer will start a session when it&apos;s time
                  to take attendance.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </MobilePageContainer>

      {/* Face Verification Drawer */}
      {courseData.session && (
        <StudentFaceAttendanceDrawer
          isOpen={isFaceVerificationDrawerOpen}
          onClose={() => setIsFaceVerificationDrawerOpen(false)}
          attendanceSessionId={courseData.session._id}
          location={
            coords
              ? { lat: coords.latitude, long: coords.longitude }
              : { lat: 0, long: 0 }
          }
          courseName={courseData.courseName}
          onSuccess={() => {
            // Close the drawer and let the real-time data update the UI
            setIsFaceVerificationDrawerOpen(false);
            toast.success('Attendance marked successfully!', {
              description:
                'Your face has been verified and attendance recorded.',
            });
          }}
        />
      )}

      {/* Attendance Code Modal */}
      <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="mobile-text-lg">
              Attendance Code Required
            </DialogTitle>
            <DialogDescription className="mobile-text-sm">
              Please enter the attendance code provided by your lecturer for{' '}
              <strong>{courseData.courseName}</strong> before checking in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attendance-code" className="mobile-text-sm">
                Attendance Code
              </Label>
              <Input
                id="attendance-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={attendanceCode}
                onChange={(e) =>
                  setAttendanceCode(e.target.value.toUpperCase())
                }
                className="text-center font-mono mobile-text-lg h-12 touch-target-min"
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
                className="flex-1 h-12 touch-target-min mobile-tap-feedback"
                onClick={handleModalClose}
                disabled={isCheckingIn}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-12 touch-target-min mobile-tap-feedback"
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

export default MobileStudentCourseDetailPage;
