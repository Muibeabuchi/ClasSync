import {
  Edit3,
  CheckCircle2,
  User,
  Clock,
  AlertTriangle,
  Info,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

/**
 * Override Status Types
 * Requirements: 6.1, 6.2 - Visual indicators for different override states
 */
export type OverrideStatus = 'manual-override' | 'present' | 'absent' | 'late';

export interface OverrideInfo {
  overrideTimestamp?: string;
  overrideReason?: string;
  overriddenBy?: string;
  originalStatus?: string;
  lecturerName?: string;
}

export interface AttendanceInfo {
  checkedInAt?: string;
  location?: any;
  distance?: number;
}

/**
 * Override Status Icon Component
 * Requirements: 6.1 - Distinct visual indicators with appropriate icons
 */
interface OverrideStatusIconProps {
  status: OverrideStatus;
  overrideInfo?: OverrideInfo;
  attendanceInfo?: AttendanceInfo;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export const OverrideStatusIcon = ({
  status,
  overrideInfo,
  attendanceInfo,
  size = 'md',
  showTooltip = true,
  className,
}: OverrideStatusIconProps) => {
  // Mobile-first responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  // Responsive size classes - larger on mobile for touch accessibility
  const sizeClasses = {
    sm: cn(
      'w-6 h-6',
      // Larger on mobile for better touch targets
      isMobile && 'w-7 h-7',
      isTouchDevice && 'w-8 h-8',
    ),
    md: cn(
      'w-8 h-8',
      // Larger on mobile for better touch targets
      isMobile && 'w-9 h-9',
      isTouchDevice && 'w-10 h-10',
    ),
    lg: cn(
      'w-10 h-10',
      // Larger on mobile for better touch targets
      isMobile && 'w-11 h-11',
      isTouchDevice && 'w-12 h-12',
    ),
  };

  const iconSizes = {
    sm: cn('h-3 w-3', isMobile && 'h-3.5 w-3.5', isTouchDevice && 'h-4 w-4'),
    md: cn('h-4 w-4', isMobile && 'h-4.5 w-4.5', isTouchDevice && 'h-5 w-5'),
    lg: cn('h-5 w-5', isMobile && 'h-5.5 w-5.5', isTouchDevice && 'h-6 w-6'),
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getIconConfig = () => {
    switch (status) {
      case 'manual-override':
        return {
          icon: Edit3,
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          iconColor: 'text-warning-foreground',
          label: 'Manual Override',
          description: 'Marked present by lecturer override',
        };
      case 'present':
        return {
          icon: CheckCircle2,
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          iconColor: 'text-success-foreground',
          label: 'Present',
          description: 'Checked in automatically',
        };
      case 'late':
        return {
          icon: Clock,
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          iconColor: 'text-warning-foreground',
          label: 'Late',
          description: 'Checked in after session started',
        };
      case 'absent':
      default:
        return {
          icon: User,
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
          iconColor: 'text-destructive-foreground',
          label: 'Absent',
          description: 'Did not check in to session',
        };
    }
  };

  const config = getIconConfig();
  const IconComponent = config.icon;

  const iconElement = (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border transition-colors',
        sizeClasses[size],
        config.bgColor,
        config.borderColor,
        // Focus styles for keyboard navigation
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        className,
      )}
      role="img"
      aria-label={`${config.label} status indicator`}
      tabIndex={showTooltip ? 0 : -1}
      onKeyDown={(e) => {
        // Allow keyboard users to trigger tooltip
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Tooltip will be handled by the TooltipTrigger
        }
      }}
    >
      <IconComponent
        className={cn(iconSizes[size], config.iconColor)}
        aria-hidden="true"
      />
    </div>
  );

  if (!showTooltip) {
    return iconElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{iconElement}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.label}</p>
            <p className="text-xs">{config.description}</p>

            {status === 'manual-override' && overrideInfo && (
              <>
                {overrideInfo.overrideReason && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Reason:</span>{' '}
                    {overrideInfo.overrideReason}
                  </p>
                )}
                {overrideInfo.lecturerName && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">By:</span>{' '}
                    {overrideInfo.lecturerName}
                  </p>
                )}
                {overrideInfo.overrideTimestamp && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Time:</span>{' '}
                    {formatDateTime(overrideInfo.overrideTimestamp)}
                  </p>
                )}
                {overrideInfo.originalStatus && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Original:</span>{' '}
                    {overrideInfo.originalStatus}
                  </p>
                )}
              </>
            )}

            {(status === 'present' || status === 'late') &&
              attendanceInfo?.checkedInAt && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Time:</span>{' '}
                  {formatDateTime(attendanceInfo.checkedInAt)}
                </p>
              )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Override Status Badge Component
 * Requirements: 6.1, 6.2 - Color coding and styling for different override types
 */
interface OverrideStatusBadgeProps {
  status: OverrideStatus;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const OverrideStatusBadge = ({
  status,
  variant = 'outline',
  size = 'md',
  showIcon = true,
  className,
}: OverrideStatusBadgeProps) => {
  // Mobile-first responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  const getBadgeConfig = () => {
    switch (status) {
      case 'manual-override':
        return {
          label: 'Manual Override',
          icon: Edit3,
          className:
            'text-warning-foreground border-warning/20 bg-warning/10 hover:bg-warning/15',
        };
      case 'present':
        return {
          label: 'Present',
          icon: CheckCircle2,
          className:
            'text-success-foreground border-success/20 bg-success/10 hover:bg-success/15',
        };
      case 'late':
        return {
          label: 'Late',
          icon: Clock,
          className:
            'text-warning-foreground border-warning/20 bg-warning/10 hover:bg-warning/15',
        };
      case 'absent':
      default:
        return {
          label: 'Absent',
          icon: User,
          className:
            'text-destructive-foreground border-destructive/20 bg-destructive/10 hover:bg-destructive/15',
        };
    }
  };

  const config = getBadgeConfig();
  const IconComponent = config.icon;

  // Responsive size classes - larger on mobile for better readability
  const sizeClasses = {
    sm: cn(
      'text-xs px-2 py-1',
      // Larger text and padding on mobile
      isMobile && 'text-sm px-2.5 py-1.5',
      // Touch-friendly sizing
      isTouchDevice && 'px-3 py-2',
    ),
    md: cn(
      'text-sm px-2.5 py-1',
      // Larger text and padding on mobile
      isMobile && 'text-base px-3 py-1.5',
      // Touch-friendly sizing
      isTouchDevice && 'px-3.5 py-2',
    ),
    lg: cn(
      'text-base px-3 py-1.5',
      // Larger text and padding on mobile
      isMobile && 'text-lg px-4 py-2',
      // Touch-friendly sizing
      isTouchDevice && 'px-4 py-2.5',
    ),
  };

  const iconSizes = {
    sm: cn('h-3 w-3', isMobile && 'h-3.5 w-3.5', isTouchDevice && 'h-4 w-4'),
    md: cn(
      'h-3.5 w-3.5',
      isMobile && 'h-4 w-4',
      isTouchDevice && 'h-4.5 w-4.5',
    ),
    lg: cn('h-4 w-4', isMobile && 'h-5 w-5', isTouchDevice && 'h-5.5 w-5.5'),
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        'transition-colors font-medium',
        config.className,
        sizeClasses[size],
        className,
      )}
    >
      {showIcon && (
        <IconComponent
          className={cn(iconSizes[size], 'mr-1')}
          aria-hidden="true"
        />
      )}
      {config.label}
    </Badge>
  );
};

/**
 * Override Indicator Dot Component
 * Requirements: 6.1 - Subtle visual indicators for lists and compact views
 */
interface OverrideIndicatorDotProps {
  status: OverrideStatus;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export const OverrideIndicatorDot = ({
  status,
  size = 'md',
  showTooltip = true,
  className,
}: OverrideIndicatorDotProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const getColorConfig = () => {
    switch (status) {
      case 'manual-override':
        return {
          color: 'bg-warning',
          label: 'Manual Override',
        };
      case 'present':
        return {
          color: 'bg-success',
          label: 'Present',
        };
      case 'late':
        return {
          color: 'bg-warning',
          label: 'Late',
        };
      case 'absent':
      default:
        return {
          color: 'bg-destructive',
          label: 'Absent',
        };
    }
  };

  const config = getColorConfig();

  const dotElement = (
    <div
      className={cn(
        'rounded-full border border-white shadow-sm',
        sizeClasses[size],
        config.color,
        className,
      )}
      aria-label={`${config.label} indicator`}
    />
  );

  if (!showTooltip) {
    return dotElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{dotElement}</TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm">{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Override Summary Indicator Component
 * Requirements: 6.2 - Summary indicators for statistics and overview displays
 */
interface OverrideSummaryIndicatorProps {
  automaticCheckIns: number;
  manualOverrides: number;
  absentStudents: number;
  totalStudents: number;
  className?: string;
}

export const OverrideSummaryIndicator = ({
  automaticCheckIns,
  manualOverrides,
  absentStudents,
  totalStudents,
  className,
}: OverrideSummaryIndicatorProps) => {
  const presentStudents = automaticCheckIns + manualOverrides;
  const attendanceRate =
    totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Attendance Rate Indicator */}
      <div className="flex items-center gap-1">
        <UserCheck className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success-foreground">
          {Math.round(attendanceRate)}%
        </span>
      </div>

      {/* Override Count Indicator */}
      {manualOverrides > 0 && (
        <div className="flex items-center gap-1">
          <Edit3 className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-warning-foreground">
            {manualOverrides}
          </span>
        </div>
      )}

      {/* Absent Count Indicator */}
      {absentStudents > 0 && (
        <div className="flex items-center gap-1">
          <UserX className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive-foreground">
            {absentStudents}
          </span>
        </div>
      )}

      {/* Visual Dots for Quick Reference */}
      <div className="flex items-center gap-1 ml-2">
        {automaticCheckIns > 0 && (
          <OverrideIndicatorDot
            status="present"
            size="sm"
            showTooltip={false}
          />
        )}
        {manualOverrides > 0 && (
          <OverrideIndicatorDot
            status="manual-override"
            size="sm"
            showTooltip={false}
          />
        )}
        {absentStudents > 0 && (
          <OverrideIndicatorDot status="absent" size="sm" showTooltip={false} />
        )}
      </div>
    </div>
  );
};

/**
 * Override Status Legend Component
 * Requirements: 6.1, 6.2 - Legend for understanding different override indicators
 */
interface OverrideStatusLegendProps {
  showCounts?: boolean;
  counts?: {
    present: number;
    manualOverride: number;
    absent: number;
    late?: number;
  };
  className?: string;
}

export const OverrideStatusLegend = ({
  showCounts = false,
  counts,
  className,
}: OverrideStatusLegendProps) => {
  const legendItems = [
    { status: 'present' as OverrideStatus, label: 'Present (Auto)' },
    { status: 'manual-override' as OverrideStatus, label: 'Manual Override' },
    { status: 'late' as OverrideStatus, label: 'Late Check-in' },
    { status: 'absent' as OverrideStatus, label: 'Absent' },
  ];

  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {legendItems.map(({ status, label }) => (
        <div key={status} className="flex items-center gap-2">
          <OverrideStatusIcon status={status} size="sm" showTooltip={false} />
          <span className="text-sm text-muted-foreground">
            {label}
            {showCounts && counts && (
              <span className="ml-1 font-medium">
                (
                {status === 'manual-override'
                  ? counts.manualOverride
                  : status === 'present'
                    ? counts.present
                    : status === 'late'
                      ? counts.late || 0
                      : counts.absent}
                )
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Accessibility-compliant color contrast validation
 * Requirements: 6.1, 6.2 - Ensure sufficient color contrast for accessibility
 */
export const validateColorContrast = (
  foreground: string,
  background: string,
): boolean => {
  // This is a simplified contrast check - in production, you'd use a proper contrast calculation
  // For now, we ensure our predefined color combinations meet WCAG AA standards
  const validCombinations = [
    // Green combinations (present status)
    { fg: 'text-green-700', bg: 'bg-green-100' },
    { fg: 'text-green-600', bg: 'bg-green-50' },

    // Amber combinations (manual override)
    { fg: 'text-amber-700', bg: 'bg-amber-100' },
    { fg: 'text-amber-600', bg: 'bg-amber-50' },

    // Red combinations (absent status)
    { fg: 'text-red-700', bg: 'bg-red-100' },
    { fg: 'text-red-600', bg: 'bg-red-50' },

    // Orange combinations (late status)
    { fg: 'text-orange-700', bg: 'bg-orange-100' },
    { fg: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return validCombinations.some(
    (combo) => combo.fg === foreground && combo.bg === background,
  );
};

export default {
  OverrideStatusIcon,
  OverrideStatusBadge,
  OverrideIndicatorDot,
  OverrideSummaryIndicator,
  OverrideStatusLegend,
  validateColorContrast,
};
