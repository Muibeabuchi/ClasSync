import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { OverrideSummaryIndicator } from './OverrideStatusIndicators';
import {
  // TimeWindowStatusBadge,
  TimeWindowWarningAlert,
  // type TimeWindowInfo,
  // type TimeWindowStatus,
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
    // overallAttendancePercentage,
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

  const getAttendanceColor = () => {
    if (attendancePercentage >= 90) return 'text-emerald-600';
    if (attendancePercentage >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  // const getProgressColor = () => {
  //   if (attendancePercentage >= 90) return 'bg-emerald-500';
  //   if (attendancePercentage >= 75) return 'bg-amber-500';
  //   return 'bg-red-500';
  // };

  return (
    <div className={cn('w-full space-y-4 sm:space-y-0', className)}>
      {/* Mobile-first header card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Attendance Overview</span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <OverrideSummaryIndicator
                automaticCheckIns={automaticCheckIns}
                manualOverrides={manualOverrides}
                absentStudents={absentStudents}
                totalStudents={totalEnrolledStudents}
              />
              {(canPerformOverrides || overrideWindowExpired) && (
                <Badge
                  variant={getOverrideStatusVariant()}
                  className="text-xs flex items-center gap-1 px-2 py-1 rounded-full"
                >
                  {overrideWindowExpired ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">
                    {getOverrideStatusText()}
                  </span>
                  <span className="sm:hidden">
                    {overrideWindowExpired ? 'Expired' : 'Active'}
                  </span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-6">
          {/* Hero attendance metric */}
          <div className="text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Overall Attendance
              </span>
            </div>
            <div
              className={cn(
                'text-4xl sm:text-5xl font-bold mb-2',
                getAttendanceColor(),
              )}
            >
              {attendancePercentage}%
            </div>
            <div className="text-sm text-muted-foreground">
              {totalAttendanceRecords} of {totalEnrolledStudents} students
              present
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-3 mb-6">
            <Progress
              value={attendancePercentage}
              className="h-3 rounded-full"
              aria-label={`${attendancePercentage}% attendance rate`}
            />
          </div>

          {/* Statistics cards grid - mobile optimized */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Automatic Check-ins */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Auto Check-ins
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {automaticCheckIns}
              </div>
            </div>

            {/* Manual Overrides */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <UserCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Manual Overrides
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                {manualOverrides}
              </div>
            </div>

            {/* Total Enrolled */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Total Enrolled
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalEnrolledStudents}
              </div>
            </div>

            {/* Absent Students */}
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <UserX className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-xs font-medium text-red-700 dark:text-red-300">
                  Absent
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                {absentStudents}
              </div>
            </div>
          </div>

          {/* Enhanced Time Window Warnings */}
          {(canPerformOverrides || overrideWindowExpired) && (
            <div className="mt-6">
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
                className="rounded-xl border-0 shadow-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Skeleton component for loading state - mobile optimized
 */
export const AttendanceStatisticsCardSkeleton = () => {
  return (
    <div className="w-full space-y-4 sm:space-y-0">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-muted animate-pulse">
                <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
              </div>
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          {/* Hero metric skeleton */}
          <div className="text-center mb-6 p-6 rounded-2xl bg-muted/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-5 w-5 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-12 w-20 bg-muted rounded animate-pulse mx-auto mb-2" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse mx-auto" />
          </div>

          {/* Progress skeleton */}
          <div className="h-3 w-full bg-muted rounded-full animate-pulse mb-6" />

          {/* Statistics grid skeleton */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-muted animate-pulse">
                    <div className="h-3.5 w-3.5 bg-muted-foreground/20 rounded" />
                  </div>
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 w-8 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Warning section skeleton */}
          <div className="mt-6 p-4 bg-muted/20 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceStatisticsCard;
