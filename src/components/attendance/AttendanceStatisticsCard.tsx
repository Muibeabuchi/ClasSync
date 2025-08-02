import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { OverrideSummaryIndicator } from './OverrideStatusIndicators';
import {
  TimeWindowStatusBadge,
  TimeWindowWarningAlert,
  type TimeWindowInfo,
  type TimeWindowStatus,
} from './TimeWindowWarnings';
import { cn } from '@/lib/utils';

/**
 * Parse time string to milliseconds
 * Supports formats like "2h 30m", "45m", "1h", etc.
 */
const parseTimeString = (timeString: string): number => {
  const hourMatch = timeString.match(/(\d+)h/);
  const minuteMatch = timeString.match(/(\d+)m/);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

  return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
};

interface AttendanceStatistics {
  totalEnrolledStudents: number;
  totalAttendanceRecords: number;
  automaticCheckIns: number;
  manualOverrides: number;
  absentStudents: number;
  overallAttendancePercentage: number;
  overrideWindowRemaining?: string;
  canPerformOverrides: boolean;
  overrideWindowExpired?: boolean;
}

interface AttendanceStatisticsCardProps {
  statistics: AttendanceStatistics;
  className?: string;
}

/**
 * AttendanceStatisticsCard component displays comprehensive attendance statistics
 * Requirements: 2.1, 2.2, 2.4, 6.3 - Display statistics breakdown and override window status
 */
export const AttendanceStatisticsCard = ({
  statistics,
  className,
}: AttendanceStatisticsCardProps) => {
  const {
    totalEnrolledStudents,
    totalAttendanceRecords,
    automaticCheckIns,
    manualOverrides,
    absentStudents,
    overallAttendancePercentage,
    overrideWindowRemaining,
    canPerformOverrides,
    overrideWindowExpired,
  } = statistics;

  // Calculate attendance percentage safely
  const attendancePercentage =
    totalEnrolledStudents > 0
      ? Math.round((totalAttendanceRecords / totalEnrolledStudents) * 100)
      : 0;

  // Determine override status styling
  const getOverrideStatusVariant = () => {
    if (overrideWindowExpired) return 'destructive';
    if (canPerformOverrides) return 'default';
    return 'secondary';
  };

  const getOverrideStatusText = () => {
    if (overrideWindowExpired) return 'Override window expired';
    if (canPerformOverrides && overrideWindowRemaining) {
      return `Override window: ${overrideWindowRemaining}`;
    }
    if (canPerformOverrides) return 'Overrides available';
    return 'No overrides available';
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Attendance Overview
          </CardTitle>
          <div className="flex items-center gap-3">
            <OverrideSummaryIndicator
              automaticCheckIns={automaticCheckIns}
              manualOverrides={manualOverrides}
              absentStudents={absentStudents}
              totalStudents={totalEnrolledStudents}
            />
            {(canPerformOverrides || overrideWindowExpired) && (
              <Badge
                variant={getOverrideStatusVariant()}
                className="text-xs flex items-center gap-1"
              >
                {overrideWindowExpired ? (
                  <AlertCircle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {getOverrideStatusText()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Attendance Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Attendance</span>
            <span className="text-sm font-bold text-primary">
              {attendancePercentage}%
            </span>
          </div>
          <Progress
            value={attendancePercentage}
            className="h-2"
            aria-label={`${attendancePercentage}% attendance rate`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{totalAttendanceRecords} present</span>
            <span>{totalEnrolledStudents} total enrolled</span>
          </div>
        </div>

        {/* Detailed Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">
                  Automatic Check-ins
                </span>
              </div>
              <span className="font-semibold text-green-600">
                {automaticCheckIns}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-muted-foreground">
                  Manual Overrides
                </span>
              </div>
              <span className="font-semibold text-amber-600">
                {manualOverrides}
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">
                  Total Enrolled
                </span>
              </div>
              <span className="font-semibold text-blue-600">
                {totalEnrolledStudents}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" />
                <span className="text-sm text-muted-foreground">Absent</span>
              </div>
              <span className="font-semibold text-red-600">
                {absentStudents}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Time Window Warnings */}
        {(canPerformOverrides || overrideWindowExpired) && (
          <TimeWindowWarningAlert
            timeWindowInfo={{
              status: overrideWindowExpired ? 'expired' : 'active',
              canPerformOverrides,
              remainingTimeMs: overrideWindowRemaining
                ? parseTimeString(overrideWindowRemaining)
                : undefined,
              windowHours: 24, // Default window hours
            }}
            showProgress={true}
            className="mt-4"
          />
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Skeleton component for loading state
 */
export const AttendanceStatisticsCardSkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-5 w-24 bg-muted rounded-full animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section Skeleton */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-8 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-2 w-full bg-muted rounded animate-pulse" />
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Statistics Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-4 w-6 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-4 w-6 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Warning Section Skeleton */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceStatisticsCard;
