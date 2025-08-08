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
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Copy,
  AlertCircle,
  CheckCircle2,
  Timer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CancelAttendanceSessionDialog } from '@/components/attendance/CancelAttendanceSessionDialog';
import { SessionExportDropdown } from '@/components/attendance/SessionExportDropdown';
import { useCanCancelAttendanceSession } from '@/feature/attendance/api';
import type {
  GetAttendanceSessionRecordsReturnType,
  GetAttendanceSessionReturnType,
} from 'convex/schema';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { LecturerLocationStabilityMessage } from '@/components/attendance/LecturerLocationStabilityMessage';
import {
  AttendanceStatisticsCard,
  AttendanceStatisticsCardSkeleton,
} from '@/components/attendance/AttendanceStatisticsCard';
import { StudentAttendanceRow } from '@/components/attendance/StudentAttendanceRow';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface AttendanceStatistics {
  totalEnrolledStudents: number;
  totalAttendanceRecords: number;
  automaticCheckIns: number;
  manualOverrides: number;
  absentStudents: number;
  overallAttendancePercentage: number;
  overrideWindowRemaining?: string;
  canPerformOverrides?: boolean; // Make optional to handle both formats
  overrideWindowExpired?: boolean;
}

interface OverrideEligibility {
  canOverride: boolean;
  reason: string;
  timeRemaining: number;
  windowExpiresAt: number;
}

// Enhanced record format from the override hook
interface EnhancedAttendanceRecord {
  student: {
    _id: any;
    fullName: string;
    email: string;
    registrationNumber: string;
    gender?: string;
  };
  attendanceRecord: any;
  status: 'present' | 'absent' | 'override';
  isPresent: boolean;
  isManualOverride: boolean;
  overrideInfo?: any;
  checkInInfo?: any;
  visualIndicators: any;
}

interface LiveAttendancePageProps {
  attendanceSession: GetAttendanceSessionReturnType;
  attendanceSessionRecords:
    | GetAttendanceSessionRecordsReturnType
    | EnhancedAttendanceRecord[];
  statistics?: AttendanceStatistics | null;
  canPerformOverrides?: boolean;
  overrideEligibility?: OverrideEligibility | null;
}

const LiveAttendancePage = ({
  attendanceSession,
  attendanceSessionRecords,
  statistics,
  canPerformOverrides = false,
  overrideEligibility,
}: LiveAttendancePageProps) => {
  const sessionState = attendanceSession.status;

  // Mobile-first responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 768px)');
  // const isTablet = useMediaQuery('(max-width: 1024px)');
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  // Get cancel session eligibility
  const { data: cancelEligibility } = useCanCancelAttendanceSession({
    attendanceSessionId: attendanceSession._id,
    courseId: attendanceSession.courseId,
  });

  // Collapsible sections for mobile
  const [isStatisticsExpanded, setIsStatisticsExpanded] = useState(!isMobile);
  const [isStudentListExpanded, setIsStudentListExpanded] = useState(true);

  // Simple override time calculation (no monitoring)
  const getSimpleOverrideTimeRemaining = () => {
    if (!overrideEligibility) return null;

    const hours = Math.floor(
      overrideEligibility.timeRemaining / (1000 * 60 * 60),
    );
    const minutes = Math.floor(
      (overrideEligibility.timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const [timeRemaining, setTimeRemaining] = useState(() => {
    const endTime =
      attendanceSession?.endedAt ?? attendanceSession._creationTime + 60000; // 60 seconds in milliseconds
    return Math.max(0, (endTime - Date.now()) / 1000);
  });

  useEffect(() => {
    if (
      attendanceSession.status !== 'complete' &&
      attendanceSession.status !== 'cancelled'
    ) {
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

  // Format override time remaining
  const formatOverrideTimeRemaining = (timeRemaining: number) => {
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        // Mobile-first spacing with safe area support
        'px-4 py-4 pb-safe-bottom',
        'sm:px-6 sm:py-6 lg:px-8 lg:py-8',
        // Responsive container
        'max-w-7xl mx-auto',
        // Smooth animations
        'animate-in fade-in-0 duration-300',
      )}
    >
      {/* Mobile-Native Header */}
      <div
        className={cn(
          'flex flex-col gap-3 mb-6',
          // Desktop layout
          'lg:flex-row lg:items-center lg:justify-between',
          // Mobile: sticky header with native app feel
          isMobile && [
            'sticky top-0 z-50 bg-background/95 backdrop-blur-md',
            '-mx-4 px-4 py-3 border-b',
            'shadow-sm',
          ],
        )}
      >
        {/* Navigation and Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size={isMobile ? 'icon' : 'default'}
            onClick={handleNavigate}
            className={cn(
              'flex-shrink-0 transition-all duration-200',
              // Touch-friendly sizing for mobile
              isTouchDevice && 'h-11 w-11 rounded-full',
              // Native app-like active state
              'active:scale-95',
              // Better visual feedback
              'hover:bg-accent',
            )}
            aria-label="Go back to course dashboard"
          >
            <ArrowLeft className={cn('h-4 w-4', isMobile && 'h-5 w-5')} />
            {!isMobile && <span className="ml-2">Back</span>}
          </Button>

          <div className="flex-1 min-w-0">
            <h1
              className={cn(
                'font-bold text-foreground leading-tight',
                // Responsive text sizing with better mobile hierarchy
                'text-lg sm:text-xl lg:text-2xl',
                // Native app typography
                isMobile && 'text-xl font-extrabold tracking-tight',
              )}
            >
              Live Attendance Session
            </h1>
            <p
              className={cn(
                'text-muted-foreground mt-0.5 truncate',
                // Responsive text sizing
                'text-sm sm:text-base',
                // Better mobile readability
                isMobile && 'text-sm font-medium',
              )}
            >
              {sessionData.courseCode} - {sessionData.courseName}
            </p>
          </div>
        </div>

        {/* Action Buttons and Status - Mobile optimized */}
        <div
          className={cn(
            'flex flex-col gap-2',
            // Desktop layout
            'lg:flex-row lg:items-center lg:gap-3',
            // Mobile: better spacing
            isMobile && 'gap-3',
          )}
        >
          {/* Export Button - Show for completed sessions */}
          {sessionState === 'complete' && (
            <SessionExportDropdown
              attendanceSessionId={attendanceSession._id}
              courseId={attendanceSession.courseId}
              courseName={attendanceSession.courseName}
              courseCode={attendanceSession.courseCode}
              sessionDate={new Date(
                attendanceSession._creationTime,
              ).toLocaleDateString()}
              variant="outline"
              size={isMobile ? 'default' : 'sm'}
              className={cn(
                'transition-all duration-200',
                isMobile && 'w-full',
              )}
            />
          )}

          {/* Override Status Badge */}
          {sessionState === 'complete' && overrideEligibility && (
            <Badge
              variant={
                overrideEligibility.canOverride ? 'default' : 'secondary'
              }
              className={cn(
                'flex items-center gap-2 transition-colors',
                // Mobile-first sizing
                'px-3 py-2 text-sm',
                // Touch-friendly sizing
                isTouchDevice && 'px-4 py-3 text-base',
                // Full width on mobile
                isMobile && 'w-full justify-center',
              )}
            >
              {overrideEligibility.canOverride ? (
                <>
                  <Timer className={cn('h-4 w-4', isMobile && 'h-5 w-5')} />
                  <span className="font-medium">
                    Override:{' '}
                    {formatOverrideTimeRemaining(
                      overrideEligibility.timeRemaining,
                    )}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle
                    className={cn('h-4 w-4', isMobile && 'h-5 w-5')}
                  />
                  <span className="font-medium">Override Expired</span>
                </>
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Location Stability Message - Mobile optimized */}
      <div
        className={cn(
          'mb-4',
          // Hide on mobile when space is limited
          sessionState === 'complete' && isMobile && 'hidden',
        )}
      >
        <LecturerLocationStabilityMessage
          isVisible={sessionState === 'pending' || sessionState === 'active'}
          variant={isMobile ? 'compact' : 'default'}
        />
      </div>

      {/* Mobile-First Session State Card */}
      <Card
        className={cn(
          'transition-all duration-500 mb-6',
          // Status-based border colors using theme variables
          sessionState === 'pending' && 'border-warning bg-warning/5',
          sessionState === 'active' && 'border-success bg-success/5',
          sessionState === 'complete' && 'border-muted bg-muted/20',
          sessionState === 'cancelled' && 'border-destructive bg-destructive/5',
          // Enhanced mobile styling
          isMobile && 'shadow-sm',
        )}
      >
        <CardContent
          className={cn(
            // Mobile-first padding
            'p-4 sm:p-5 lg:p-6',
          )}
        >
          {/* Mobile-optimized layout */}
          <div
            className={cn(
              'flex flex-col gap-4',
              // Desktop: side-by-side layout
              'lg:flex-row lg:items-center lg:justify-between lg:gap-6',
            )}
          >
            {/* Session Status Section */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'p-3 rounded-full transition-colors',
                  // Mobile: larger icon container
                  isMobile && 'p-4',
                  // Status-based styling using theme variables
                  sessionState === 'pending' && 'bg-warning/20',
                  sessionState === 'active' && 'bg-success/20',
                  sessionState === 'complete' && 'bg-muted',
                  sessionState === 'cancelled' && 'bg-destructive/20',
                )}
              >
                <Clock
                  className={cn(
                    'transition-colors',
                    // Responsive icon sizing
                    'h-5 w-5 sm:h-6 w-6',
                    isMobile && 'h-6 w-6',
                    // Status-based colors using theme variables
                    sessionState === 'pending' && 'text-warning-foreground',
                    sessionState === 'active' && 'text-success-foreground',
                    sessionState === 'complete' && 'text-muted-foreground',
                    sessionState === 'cancelled' &&
                      'text-destructive-foreground',
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    'font-semibold text-foreground',
                    // Responsive text sizing
                    'text-base sm:text-lg',
                    isMobile && 'text-lg',
                  )}
                >
                  {sessionState === 'pending' && 'Session Starts In'}
                  {sessionState === 'active' && 'Time Remaining'}
                  {sessionState === 'complete' && 'Session Completed'}
                  {sessionState === 'cancelled' && 'Session Cancelled'}
                </h3>

                {sessionState !== 'complete' &&
                  sessionState !== 'cancelled' && (
                    <p
                      className={cn(
                        'font-bold text-primary mt-1',
                        // Large, prominent timer
                        'text-2xl sm:text-3xl',
                        isMobile && 'text-3xl',
                        // Monospace for better readability
                        'font-mono',
                      )}
                    >
                      {formatTime(timeRemaining)}
                    </p>
                  )}

                {(sessionState === 'complete' ||
                  sessionState === 'cancelled') && (
                  <p
                    className={cn(
                      'text-muted-foreground mt-1',
                      'text-sm sm:text-base',
                      sessionState === 'cancelled' &&
                        'text-destructive font-medium',
                    )}
                  >
                    {sessionState === 'cancelled'
                      ? `Cancelled on ${new Date(
                          attendanceSession.endedAt ||
                            attendanceSession._creationTime,
                        ).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}`
                      : new Date(
                          attendanceSession._creationTime,
                        ).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                  </p>
                )}
              </div>
            </div>

            {/* Session Details Section */}
            <div
              className={cn(
                'flex flex-col gap-3',
                // Mobile: full width, Desktop: auto width
                'w-full lg:w-auto',
                // Mobile: border top for separation
                isMobile && 'pt-4 border-t',
              )}
            >
              {/* Location Info */}
              <div className="flex items-center justify-between lg:justify-end gap-2">
                <div className="flex items-center gap-2">
                  <MapPin
                    className={cn(
                      'text-muted-foreground',
                      'h-4 w-4 sm:h-5 w-5',
                    )}
                  />
                  <span
                    className={cn(
                      'text-muted-foreground font-medium',
                      'text-sm sm:text-base',
                    )}
                  >
                    Radius: {sessionData.locationRadius}m
                  </span>
                </div>
              </div>

              {/* Attendance Code */}
              {sessionData.attendanceCode ? (
                <div className="flex items-center justify-between lg:justify-end gap-2">
                  <span
                    className={cn(
                      'font-medium text-foreground',
                      'text-sm sm:text-base',
                    )}
                  >
                    Attendance Code:
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-mono font-bold border-2',
                        // Mobile: larger, more prominent
                        'px-3 py-1 text-base',
                        isTouchDevice && 'px-4 py-2 text-lg',
                        // Status-based styling using theme variables
                        sessionState === 'active' &&
                          'border-success bg-success/10 text-success-foreground',
                        sessionState === 'pending' &&
                          'border-warning bg-warning/10 text-warning-foreground',
                      )}
                    >
                      {sessionData.attendanceCode}
                    </Badge>
                    <Button
                      variant="ghost"
                      size={isMobile ? 'icon' : 'sm'}
                      onClick={copyAttendanceCode}
                      className={cn(
                        'transition-all duration-200',
                        // Touch-friendly sizing
                        isTouchDevice && 'h-11 w-11',
                        'active:scale-95 hover:bg-accent',
                      )}
                      aria-label="Copy attendance code"
                    >
                      <Copy className={cn('h-4 w-4', isMobile && 'h-5 w-5')} />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Cancel Session Button - Only during prep period */}
          {sessionState === 'pending' && cancelEligibility?.canCancel && (
            <div className="mt-4 pt-4 border-t">
              <div
                className={cn(
                  'flex flex-col gap-3',
                  // Desktop: side-by-side layout
                  'sm:flex-row sm:items-center sm:justify-between',
                )}
              >
                <div className="flex-1">
                  <p
                    className={cn(
                      'text-sm text-muted-foreground',
                      isMobile && 'text-center sm:text-left',
                    )}
                  >
                    You can cancel this session during the preparation period
                  </p>
                  {cancelEligibility.timeRemaining > 0 && (
                    <p
                      className={cn(
                        'text-xs text-warning-foreground font-medium mt-1',
                        isMobile && 'text-center sm:text-left',
                      )}
                    >
                      Time remaining to cancel:{' '}
                      {formatTime(cancelEligibility.timeRemaining / 1000)}
                    </p>
                  )}
                </div>
                <div
                  className={cn(
                    'flex justify-center sm:justify-end',
                    isMobile && 'w-full',
                  )}
                >
                  <CancelAttendanceSessionDialog
                    sessionId={attendanceSession._id}
                    courseId={attendanceSession.courseId}
                    courseName={attendanceSession.courseName}
                    courseCode={attendanceSession.courseCode}
                    timeRemaining={cancelEligibility.timeRemaining / 1000}
                    canCancel={cancelEligibility.canCancel}
                    reason={cancelEligibility.reason}
                    variant="destructive"
                    size={isMobile ? 'default' : 'sm'}
                    className={cn(
                      'transition-all duration-200',
                      isMobile && 'w-full max-w-xs',
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar - Only for active sessions */}
          {sessionState !== 'complete' && sessionState !== 'cancelled' && (
            <div className="mt-6">
              <Progress
                value={(timeRemaining / 60) * 100}
                className={cn(
                  'transition-all duration-300',
                  // Mobile: thicker progress bar
                  'h-2 sm:h-3',
                  isMobile && 'h-3',
                )}
                aria-label={`Session progress: ${Math.round((timeRemaining / 60) * 100)}% remaining`}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Session Progress</span>
                <span>{Math.round((timeRemaining / 60) * 100)}% remaining</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simple Override Status Indicator - Non-obtrusive */}
      {sessionState === 'complete' && overrideEligibility && (
        <div className={cn('mb-6', isMobile && 'mb-4')}>
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              // Mobile-first responsive padding
              'sm:p-4',
              // Status-based styling using theme variables
              overrideEligibility.canOverride
                ? 'bg-warning/10 border-warning text-warning-foreground'
                : 'bg-muted border-muted-foreground/20 text-muted-foreground',
              // Subtle, non-obtrusive appearance
              'text-sm',
            )}
          >
            <Timer
              className={cn(
                'h-4 w-4 flex-shrink-0',
                overrideEligibility.canOverride
                  ? 'text-warning-foreground'
                  : 'text-muted-foreground',
              )}
            />
            <div className="flex-1 min-w-0">
              {overrideEligibility.canOverride ? (
                <span>
                  Manual overrides available for{' '}
                  <span className="font-medium">
                    {getSimpleOverrideTimeRemaining()}
                  </span>{' '}
                  remaining
                </span>
              ) : (
                <span>Manual override window has expired</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Statistics Card with Collapsible Option */}
      <div className="mb-6">
        {isMobile && (
          <Button
            variant="ghost"
            onClick={() => setIsStatisticsExpanded(!isStatisticsExpanded)}
            className={cn(
              'w-full justify-between mb-3 p-4 h-auto',
              'border rounded-lg',
              'hover:bg-accent transition-colors',
            )}
            aria-expanded={isStatisticsExpanded}
            aria-controls="statistics-section"
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <div className="font-semibold text-base">
                  Attendance Statistics
                </div>
                {statistics && (
                  <div className="text-sm text-muted-foreground">
                    {statistics.totalAttendanceRecords}/
                    {statistics.totalEnrolledStudents} present (
                    {Math.round(statistics.overallAttendancePercentage)}%)
                  </div>
                )}
              </div>
            </div>
            {isStatisticsExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        )}

        <div
          id="statistics-section"
          className={cn(
            'transition-all duration-300 ease-in-out',
            isMobile && !isStatisticsExpanded && 'hidden',
          )}
        >
          {statistics ? (
            <AttendanceStatisticsCard statistics={statistics} />
          ) : (
            <AttendanceStatisticsCardSkeleton />
          )}
        </div>
      </div>

      {/* Mobile-First Student Panel */}

      {sessionState !== 'cancelled' && (
        <Card
          className={cn(
            'transition-all duration-300',
            // Enhanced mobile styling
            isMobile && 'shadow-sm',
          )}
        >
          {/* Mobile-optimized header */}
          <CardHeader
            className={cn(
              // Mobile-first padding
              'p-4 sm:p-5 lg:p-6',
            )}
          >
            <div
              className={cn(
                'flex flex-col gap-3',
                // Desktop: side-by-side layout
                'lg:flex-row lg:items-center lg:justify-between',
              )}
            >
              <div className="flex-1 min-w-0">
                <CardTitle
                  className={cn(
                    'flex items-center gap-3',
                    // Responsive text sizing
                    'text-lg sm:text-xl',
                    isMobile && 'text-xl',
                  )}
                >
                  <Users
                    className={cn(
                      'text-muted-foreground',
                      'h-5 w-5 sm:h-6 w-6',
                      isMobile && 'h-6 w-6',
                    )}
                  />
                  Student Attendance
                  {/* Mobile: Show collapsible indicator */}
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setIsStudentListExpanded(!isStudentListExpanded)
                      }
                      className="ml-auto p-1"
                      aria-expanded={isStudentListExpanded}
                      aria-controls="student-list-section"
                    >
                      {isStudentListExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </CardTitle>

                <CardDescription
                  className={cn(
                    'mt-2',
                    // Responsive text sizing
                    'text-sm sm:text-base',
                    // Better line height for mobile
                    isMobile && 'leading-relaxed',
                  )}
                >
                  {statistics ? (
                    <div
                      className={cn(
                        'flex flex-col gap-1',
                        // Desktop: single line
                        'sm:flex-row sm:items-center sm:gap-2',
                      )}
                    >
                      <span>
                        {statistics.totalAttendanceRecords} of{' '}
                        {statistics.totalEnrolledStudents} students have checked
                        in
                      </span>
                      {statistics.manualOverrides > 0 && (
                        <span
                          className={cn(
                            'text-warning-foreground font-medium',
                            // Mobile: new line, Desktop: inline
                            'block sm:inline',
                          )}
                        >
                          ({statistics.manualOverrides} manual override
                          {statistics.manualOverrides !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  ) : (
                    'Loading attendance data...'
                  )}
                </CardDescription>
              </div>

              {/* Status badges - Mobile optimized */}
              <div
                className={cn(
                  'flex items-center gap-2',
                  // Mobile: full width with better spacing
                  isMobile && 'w-full justify-between mt-2',
                )}
              >
                <Badge
                  variant="secondary"
                  className={cn(
                    'transition-colors',
                    // Mobile: larger badges
                    isMobile && 'px-3 py-1 text-sm',
                    isTouchDevice && 'px-4 py-2 text-base',
                  )}
                >
                  <CheckCircle2
                    className={cn('mr-1', 'h-3 w-3', isMobile && 'h-4 w-4')}
                  />
                  {statistics ? statistics.totalAttendanceRecords : 0} Present
                </Badge>

                {statistics && statistics.absentStudents > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-destructive border-destructive/20 bg-destructive/10',
                      // Mobile: larger badges
                      isMobile && 'px-3 py-1 text-sm',
                      isTouchDevice && 'px-4 py-2 text-base',
                    )}
                  >
                    <AlertCircle
                      className={cn('mr-1', 'h-3 w-3', isMobile && 'h-4 w-4')}
                    />
                    {statistics.absentStudents} Absent
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent
            id="student-list-section"
            className={cn(
              // Mobile-first padding
              'p-4 sm:p-5 lg:p-6 pt-0',
              // Collapsible on mobile
              isMobile && !isStudentListExpanded && 'hidden',
            )}
          >
            {!statistics ||
            (attendanceSessionRecords.length === 0 &&
              statistics.absentStudents === 0) ? (
              <div className="text-center py-8">
                <div
                  className={sessionState === 'complete' ? '' : 'animate-pulse'}
                >
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {sessionState === 'pending'
                      ? 'Waiting for session to begin...'
                      : sessionState === 'complete'
                        ? 'Session has ended - No students marked attendance'
                        : sessionState === 'cancelled'
                          ? 'Session was cancelled - No attendance was taken'
                          : 'Waiting for students to check in...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Filter records into present and absent */}
                {(() => {
                  const presentStudents = attendanceSessionRecords.filter(
                    (record) => {
                      // Check if record has enhanced format
                      if ('isPresent' in record) {
                        return record.isPresent === true;
                      }
                      // Legacy format fallback
                      return !!record.checkedInAt;
                    },
                  );

                  const absentStudents = attendanceSessionRecords.filter(
                    (record) => {
                      // Check if record has enhanced format
                      if ('isPresent' in record) {
                        return record.isPresent === false;
                      }
                      // Legacy format fallback
                      return !record.checkedInAt;
                    },
                  );

                  return (
                    <>
                      {/* Present Students Section */}
                      {presentStudents.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            Present Students ({presentStudents.length})
                          </div>
                          <div className="space-y-2">
                            {presentStudents.map((record) => (
                              <StudentAttendanceRow
                                key={record.student?._id || record._id}
                                student={record}
                                canPerformOverrides={canPerformOverrides}
                                sessionId={attendanceSession._id}
                                sessionState={sessionState}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Absent Students Section */}
                      {absentStudents.length > 0 && (
                        <div className="space-y-3">
                          {presentStudents.length > 0 && (
                            <div className="border-t pt-4" />
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              Absent Students ({absentStudents.length})
                            </div>
                            {canPerformOverrides &&
                              overrideEligibility?.canOverride && (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-warning-foreground border-warning/20"
                                >
                                  Override Available
                                </Badge>
                              )}
                          </div>

                          {/* Render absent students */}
                          <div className="space-y-2">
                            {absentStudents.map((record) => (
                              <StudentAttendanceRow
                                key={record.student?._id || record._id}
                                student={record}
                                canPerformOverrides={canPerformOverrides}
                                sessionId={attendanceSession._id}
                                sessionState={sessionState}
                              />
                            ))}
                          </div>

                          {/* Show message if no override capability */}
                          {(!canPerformOverrides ||
                            !overrideEligibility?.canOverride) && (
                            <div
                              className={cn(
                                'text-center py-4 text-muted-foreground rounded-lg',
                                'bg-muted/30 border border-dashed border-muted-foreground/20',
                                // Mobile: better padding and spacing
                                isMobile && 'py-6 mx-2',
                              )}
                            >
                              <div className="space-y-2">
                                <Users
                                  className={cn(
                                    'mx-auto text-muted-foreground',
                                    'h-6 w-6',
                                    isMobile && 'h-8 w-8',
                                  )}
                                />
                                <p
                                  className={cn(
                                    'text-sm sm:text-base',
                                    isMobile && 'text-base',
                                  )}
                                >
                                  {!canPerformOverrides
                                    ? 'Manual overrides are not available'
                                    : 'Override window has expired'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
export default LiveAttendancePage;

export const LiveAttendancePageSkeleton = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  return (
    <div
      className={cn(
        'min-h-screen bg-background animate-pulse',
        // Mobile-first spacing and padding
        'px-4 py-4 pb-safe-bottom sm:px-6 sm:py-6 lg:px-8',
        // Responsive container
        'max-w-7xl mx-auto',
      )}
    >
      {/* Mobile-First Header Skeleton */}
      <div
        className={cn(
          'flex flex-col gap-4 mb-6',
          'lg:flex-row lg:items-center lg:justify-between',
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'bg-muted rounded-md flex-shrink-0',
              isMobile ? 'w-10 h-10' : 'w-12 h-10',
            )}
          />
          <div className="flex-1 min-w-0 space-y-2">
            <div
              className={cn(
                'bg-muted rounded-md',
                'h-6 sm:h-8 lg:h-10',
                'w-48 sm:w-64 lg:w-80',
              )}
            />
            <div
              className={cn(
                'bg-muted rounded-md',
                'h-4 sm:h-5',
                'w-32 sm:w-48 lg:w-56',
              )}
            />
          </div>
        </div>

        {/* Override badge skeleton */}
        <div
          className={cn(
            'bg-muted rounded-full',
            'h-8 sm:h-10',
            'w-32 sm:w-40',
            isMobile && 'w-full',
          )}
        />
      </div>

      {/* Mobile-First Session State Card Skeleton */}
      <Card className={cn('mb-6 border-muted', isMobile && 'shadow-sm')}>
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div
            className={cn(
              'flex flex-col gap-4',
              'lg:flex-row lg:items-center lg:justify-between lg:gap-6',
            )}
          >
            {/* Status section skeleton */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'bg-muted rounded-full',
                  'p-3',
                  isMobile && 'p-4',
                )}
              >
                <div
                  className={cn(
                    'bg-muted-foreground/20 rounded',
                    'h-5 w-5 sm:h-6 w-6',
                    isMobile && 'h-6 w-6',
                  )}
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div
                  className={cn(
                    'bg-muted rounded-md',
                    'h-5 sm:h-6',
                    'w-32 sm:w-40',
                  )}
                />
                <div
                  className={cn(
                    'bg-muted rounded-md',
                    'h-8 sm:h-10',
                    'w-20 sm:w-24',
                  )}
                />
              </div>
            </div>

            {/* Details section skeleton */}
            <div
              className={cn(
                'flex flex-col gap-3 w-full lg:w-auto',
                isMobile && 'pt-4 border-t border-muted',
              )}
            >
              <div className="flex items-center justify-between lg:justify-end gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-muted rounded h-4 w-4 sm:h-5 w-5" />
                  <div className="bg-muted rounded-md h-4 w-20 sm:w-24" />
                </div>
              </div>
              <div className="flex items-center justify-between lg:justify-end gap-2">
                <div className="bg-muted rounded-md h-4 w-24 sm:w-32" />
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'bg-muted rounded-md',
                      'h-6 w-16 sm:h-8 w-20',
                      isTouchDevice && 'h-10 w-24',
                    )}
                  />
                  <div
                    className={cn(
                      'bg-muted rounded-md',
                      isMobile ? 'h-8 w-8' : 'h-6 w-6',
                      isTouchDevice && 'h-10 w-10',
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar skeleton */}
          <div className="mt-6 space-y-2">
            <div
              className={cn(
                'bg-muted rounded-full',
                'h-2 sm:h-3',
                isMobile && 'h-3',
              )}
            />
            <div className="flex justify-between">
              <div className="bg-muted rounded h-3 w-20" />
              <div className="bg-muted rounded h-3 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Statistics Toggle Skeleton */}
      {isMobile && (
        <div className="mb-6">
          <div className="w-full p-4 border border-muted rounded-lg mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded h-5 w-5" />
                <div className="space-y-1">
                  <div className="bg-muted rounded-md h-4 w-32" />
                  <div className="bg-muted rounded-md h-3 w-24" />
                </div>
              </div>
              <div className="bg-muted rounded h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Statistics Card Skeleton */}
      <div className="mb-6">
        <AttendanceStatisticsCardSkeleton />
      </div>

      {/* Mobile-First Student Panel Skeleton */}
      <Card className={cn(isMobile && 'shadow-sm')}>
        <CardHeader className="p-4 sm:p-5 lg:p-6">
          <div
            className={cn(
              'flex flex-col gap-3',
              'lg:flex-row lg:items-center lg:justify-between',
            )}
          >
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'bg-muted rounded',
                    'h-5 w-5 sm:h-6 w-6',
                    isMobile && 'h-6 w-6',
                  )}
                />
                <div
                  className={cn(
                    'bg-muted rounded-md',
                    'h-5 sm:h-6 w-32 sm:w-40',
                    isMobile && 'h-6 w-40',
                  )}
                />
                {isMobile && (
                  <div className="bg-muted rounded ml-auto h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  'bg-muted rounded-md',
                  'h-4 w-40 sm:w-56',
                  isMobile && 'w-56',
                )}
              />
            </div>

            <div
              className={cn(
                'flex items-center gap-2',
                isMobile && 'w-full justify-between mt-2',
              )}
            >
              <div
                className={cn(
                  'bg-muted rounded-full',
                  'h-6 w-20',
                  isMobile && 'h-7 w-24',
                  isTouchDevice && 'h-8 w-28',
                )}
              />
              <div
                className={cn(
                  'bg-muted rounded-full',
                  'h-6 w-16',
                  isMobile && 'h-7 w-20',
                  isTouchDevice && 'h-8 w-24',
                )}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 lg:p-6 pt-0">
          <div className="space-y-4">
            {/* Student rows skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col gap-3 p-3 sm:p-4 border border-muted rounded-lg',
                  'sm:flex-row sm:items-center sm:justify-between',
                )}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-muted rounded-full h-8 w-8" />
                  <div className="space-y-2 flex-1">
                    <div className="bg-muted rounded-md h-4 w-24 sm:w-32" />
                    <div className="bg-muted rounded-md h-3 w-20 sm:w-24" />
                  </div>
                </div>

                <div
                  className={cn(
                    'flex items-center gap-3',
                    'sm:flex-row sm:space-x-4',
                  )}
                >
                  <div className="flex justify-between sm:block sm:text-right space-y-1">
                    <div className="bg-muted rounded-md h-3 w-12 sm:w-16" />
                    <div className="bg-muted rounded-md h-3 w-16 sm:w-20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'bg-muted rounded-full',
                        'h-6 w-16 sm:w-20',
                        isMobile && 'h-7 w-20',
                        isTouchDevice && 'h-8 w-24',
                      )}
                    />
                    <div
                      className={cn(
                        'bg-muted rounded-md',
                        'h-8 w-16 sm:w-20',
                        isTouchDevice && 'h-10 w-24',
                      )}
                    />
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
