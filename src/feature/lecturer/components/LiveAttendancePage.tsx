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
        // Mobile-first spacing and padding
        'px-4 py-4 sm:px-6 sm:py-6 lg:px-8',
        // Responsive container
        'max-w-7xl mx-auto',
        // Smooth animations
        'animate-fade-in',
      )}
    >
      {/* Mobile-First Header */}
      <div
        className={cn(
          'flex flex-col gap-4 mb-6',
          // Desktop layout
          'lg:flex-row lg:items-center lg:justify-between',
        )}
      >
        {/* Navigation and Title */}
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size={isMobile ? 'sm' : 'default'}
            onClick={handleNavigate}
            className={cn(
              'flex-shrink-0 transition-all duration-200',
              // Touch-friendly sizing
              isTouchDevice && 'min-h-[44px] min-w-[44px]',
              // Active state for mobile
              'active:scale-95',
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
                // Responsive text sizing
                'text-xl sm:text-2xl lg:text-3xl',
                // Better line height for mobile
                isMobile && 'leading-tight',
              )}
            >
              Live Attendance Session
            </h1>
            <p
              className={cn(
                'text-muted-foreground mt-1 truncate',
                // Responsive text sizing
                'text-sm sm:text-base',
                // Better contrast on mobile
                isMobile && 'text-gray-700',
              )}
            >
              {sessionData.courseCode} - {sessionData.courseName}
            </p>
          </div>
        </div>

        {/* Override Status Badge - Mobile optimized */}
        {sessionState === 'complete' && overrideEligibility && (
          <Badge
            variant={overrideEligibility.canOverride ? 'default' : 'secondary'}
            className={cn(
              'flex items-center gap-2 transition-colors',
              // Mobile-first sizing
              'px-3 py-2 text-sm',
              // Touch-friendly sizing
              isTouchDevice && 'px-4 py-3 text-base',
              // Status-based styling
              overrideEligibility.canOverride
                ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
                : 'bg-gray-100 text-gray-600 border-gray-200',
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
                <AlertCircle className={cn('h-4 w-4', isMobile && 'h-5 w-5')} />
                <span className="font-medium">Override Expired</span>
              </>
            )}
          </Badge>
        )}
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
          // Status-based border colors
          sessionState === 'pending' && 'border-yellow-500 bg-yellow-50/30',
          sessionState === 'active' && 'border-green-500 bg-green-50/30',
          sessionState === 'complete' && 'border-gray-300 bg-gray-50/30',
          sessionState === 'cancelled' && 'border-red-500 bg-red-50/30',
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
                  // Status-based styling
                  sessionState === 'pending' && 'bg-yellow-100',
                  sessionState === 'active' && 'bg-green-100',
                  sessionState === 'complete' && 'bg-gray-100',
                  sessionState === 'cancelled' && 'bg-red-100',
                )}
              >
                <Clock
                  className={cn(
                    'transition-colors',
                    // Responsive icon sizing
                    'h-5 w-5 sm:h-6 w-6',
                    isMobile && 'h-6 w-6',
                    // Status-based colors
                    sessionState === 'pending' && 'text-yellow-600',
                    sessionState === 'active' && 'text-green-600',
                    sessionState === 'complete' && 'text-gray-600',
                    sessionState === 'cancelled' && 'text-red-600',
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
                        'text-red-600 font-medium',
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
                isMobile && 'pt-4 border-t border-border',
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
                      // Status-based styling
                      sessionState === 'active' &&
                        'border-green-500 bg-green-50 text-green-700',
                      sessionState === 'pending' &&
                        'border-yellow-500 bg-yellow-50 text-yellow-700',
                    )}
                  >
                    {sessionData.attendanceCode}
                  </Badge>
                  <Button
                    variant="ghost"
                    size={isMobile ? 'default' : 'sm'}
                    onClick={copyAttendanceCode}
                    className={cn(
                      'transition-all duration-200',
                      // Touch-friendly sizing
                      isTouchDevice && 'min-h-[44px] min-w-[44px]',
                      'active:scale-95 hover:bg-muted',
                    )}
                    aria-label="Copy attendance code"
                  >
                    <Copy className={cn('h-4 w-4', isMobile && 'h-5 w-5')} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Session Button - Only during prep period */}
          {sessionState === 'pending' && cancelEligibility?.canCancel && (
            <div className="mt-4 pt-4 border-t border-border">
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
                        'text-xs text-yellow-600 font-medium mt-1',
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
              // Status-based styling
              overrideEligibility.canOverride
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-gray-50 border-gray-200 text-gray-600',
              // Subtle, non-obtrusive appearance
              'text-sm',
            )}
          >
            <Timer
              className={cn(
                'h-4 w-4 flex-shrink-0',
                overrideEligibility.canOverride
                  ? 'text-amber-600'
                  : 'text-gray-500',
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
              'border border-border rounded-lg',
              'hover:bg-muted/50 transition-colors',
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
                          'text-amber-600 font-medium',
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
                    'text-red-600 border-red-200 bg-red-50',
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
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
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
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
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
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            Absent Students ({absentStudents.length})
                          </div>
                          {canPerformOverrides &&
                            overrideEligibility?.canOverride && (
                              <Badge
                                variant="outline"
                                className="text-xs text-amber-600 border-amber-200"
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
        'px-4 py-4 sm:px-6 sm:py-6 lg:px-8',
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
