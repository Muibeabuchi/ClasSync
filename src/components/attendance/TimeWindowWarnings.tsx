import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Timer,
  Hourglass,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Time Window Status Types
 * Requirements: 5.4, 6.3, 6.4 - Different states of override time windows
 */
export type TimeWindowStatus =
  | 'active'
  | 'expiring-soon'
  | 'expired'
  | 'unavailable'
  | 'session-active';

export interface TimeWindowInfo {
  status: TimeWindowStatus;
  remainingTimeMs?: number;
  totalWindowMs?: number;
  expiresAt?: number;
  sessionEndTime?: number;
  windowHours?: number;
  canPerformOverrides: boolean;
}

/**
 * Time Window Status Badge Component
 * Requirements: 5.4, 6.3 - Visual indicators for time window status
 */
interface TimeWindowStatusBadgeProps {
  timeWindowInfo: TimeWindowInfo;
  size?: 'sm' | 'md' | 'lg';
  showCountdown?: boolean;
  className?: string;
}

export const TimeWindowStatusBadge = ({
  timeWindowInfo,
  size = 'md',
  showCountdown = true,
  className,
}: TimeWindowStatusBadgeProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Mobile-first responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return '0m';

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getBadgeConfig = () => {
    const { status, remainingTimeMs, expiresAt } = timeWindowInfo;
    const actualRemainingMs = expiresAt
      ? Math.max(0, expiresAt - currentTime)
      : remainingTimeMs || 0;

    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          icon: Clock,
          label:
            showCountdown && actualRemainingMs > 0
              ? `${formatTimeRemaining(actualRemainingMs)} left`
              : 'Override Available',
          className: 'text-blue-600 border-blue-200 bg-blue-50',
        };
      case 'expiring-soon':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          label:
            showCountdown && actualRemainingMs > 0
              ? `${formatTimeRemaining(actualRemainingMs)} left`
              : 'Expiring Soon',
          className: 'text-orange-600 border-orange-200 bg-orange-50',
        };
      case 'expired':
        return {
          variant: 'secondary' as const,
          icon: XCircle,
          label: 'Override Expired',
          className: 'text-red-600 border-red-200 bg-red-50',
        };
      case 'session-active':
        return {
          variant: 'secondary' as const,
          icon: Timer,
          label: 'Session Active',
          className: 'text-gray-600 border-gray-200 bg-gray-50',
        };
      case 'unavailable':
      default:
        return {
          variant: 'secondary' as const,
          icon: XCircle,
          label: 'Unavailable',
          className: 'text-gray-600 border-gray-200 bg-gray-50',
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
      variant={config.variant}
      className={cn(
        'transition-colors font-medium flex items-center gap-1',
        // Focus styles for keyboard navigation
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        config.className,
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label={`Time window status: ${config.label}`}
      tabIndex={0}
    >
      <IconComponent className={cn(iconSizes[size])} aria-hidden="true" />
      <span aria-live="polite">{config.label}</span>
    </Badge>
  );
};

/**
 * Time Window Warning Alert Component
 * Requirements: 5.4, 6.3, 6.4 - Visual warnings for time window status
 */
interface TimeWindowWarningAlertProps {
  timeWindowInfo: TimeWindowInfo;
  onDismiss?: () => void;
  showProgress?: boolean;
  className?: string;
}

export const TimeWindowWarningAlert = ({
  timeWindowInfo,
  onDismiss,
  showProgress = true,
  className,
}: TimeWindowWarningAlertProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Mobile-first responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getAlertConfig = () => {
    const { status, remainingTimeMs, totalWindowMs, expiresAt, windowHours } =
      timeWindowInfo;
    const actualRemainingMs = expiresAt
      ? Math.max(0, expiresAt - currentTime)
      : remainingTimeMs || 0;
    const progressPercentage =
      totalWindowMs && actualRemainingMs > 0
        ? (actualRemainingMs / totalWindowMs) * 100
        : 0;

    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          icon: Info,
          title: 'Override Window Active',
          description: `You can manually mark absent students as present. Window closes in ${formatTimeRemaining(actualRemainingMs)}.`,
          progressPercentage,
          showAlert: true,
        };
      case 'expiring-soon':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          title: 'Override Window Expiring Soon',
          description: `Manual overrides will no longer be available in ${formatTimeRemaining(actualRemainingMs)}. Complete any pending overrides now.`,
          progressPercentage,
          showAlert: true,
        };
      case 'expired':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          title: 'Override Window Expired',
          description: `Manual overrides are no longer available for this session. The ${windowHours || 24}-hour window has closed.`,
          progressPercentage: 0,
          showAlert: true,
        };
      case 'session-active':
        return {
          variant: 'default' as const,
          icon: Timer,
          title: 'Session Still Active',
          description:
            'Manual overrides will be available after the attendance session ends.',
          progressPercentage: 0,
          showAlert: true,
        };
      case 'unavailable':
      default:
        return {
          variant: 'default' as const,
          icon: Info,
          title: 'Override Not Available',
          description:
            'Manual overrides are not currently available for this session.',
          progressPercentage: 0,
          showAlert: false,
        };
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return '0 minutes';

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const config = getAlertConfig();
  const IconComponent = config.icon;

  if (!config.showAlert) {
    return null;
  }

  return (
    <Alert
      variant={config.variant}
      className={cn(
        'relative',
        // Mobile-first responsive padding and spacing
        'p-3 sm:p-4',
        // Touch-friendly spacing
        isTouchDevice && 'p-4',
        className,
      )}
    >
      <IconComponent
        className={cn(
          'h-4 w-4',
          // Larger icons on mobile for better visibility
          isMobile && 'h-5 w-5',
          isTouchDevice && 'h-5 w-5',
        )}
      />
      <AlertTitle
        className={cn(
          'flex items-center justify-between',
          // Responsive text sizing
          'text-sm sm:text-base',
          // Better line height for mobile
          isMobile && 'leading-relaxed',
        )}
      >
        {config.title}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className={cn(
              'h-6 w-6 p-0 hover:bg-transparent',
              // Touch-friendly sizing
              isTouchDevice && 'h-8 w-8 min-h-[44px] min-w-[44px]',
            )}
            aria-label="Dismiss alert"
          >
            <XCircle className={cn('h-4 w-4', isTouchDevice && 'h-5 w-5')} />
            <span className="sr-only">Dismiss alert</span>
          </Button>
        )}
      </AlertTitle>
      <AlertDescription
        className={cn(
          'space-y-3',
          // Responsive text sizing
          'text-sm sm:text-base',
          // Better line height for mobile readability
          isMobile && 'leading-relaxed',
        )}
      >
        <p>{config.description}</p>

        {showProgress && config.progressPercentage > 0 && (
          <div className="space-y-2">
            <div
              className={cn(
                'flex justify-between text-sm',
                // Responsive text sizing
                isMobile && 'text-base',
              )}
            >
              <span>Time Remaining</span>
              <span>{Math.round(config.progressPercentage)}%</span>
            </div>
            <Progress
              value={config.progressPercentage}
              className={cn(
                'h-2',
                // Thicker progress bar on mobile for better visibility
                isMobile && 'h-3',
                isTouchDevice && 'h-3',
                config.progressPercentage < 25 && 'bg-red-100',
                config.progressPercentage < 50 &&
                  config.progressPercentage >= 25 &&
                  'bg-orange-100',
              )}
            />
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

/**
 * Countdown Timer Component
 * Requirements: 5.4, 6.3 - Display remaining time for override window
 */
interface CountdownTimerProps {
  expiresAt: number;
  onExpired?: () => void;
  showProgress?: boolean;
  totalDurationMs?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CountdownTimer = ({
  expiresAt,
  onExpired,
  showProgress = false,
  totalDurationMs,
  size = 'md',
  className,
}: CountdownTimerProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [hasExpired, setHasExpired] = useState(false);

  // Mobile-first responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      if (now >= expiresAt && !hasExpired) {
        setHasExpired(true);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, hasExpired, onExpired]);

  const remainingMs = Math.max(0, expiresAt - currentTime);
  const progressPercentage =
    totalDurationMs && remainingMs > 0
      ? (remainingMs / totalDurationMs) * 100
      : 0;

  const formatTime = (ms: number): string => {
    if (ms <= 0) return '00:00:00';

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Responsive size classes - larger on mobile for better readability
  const sizeClasses = {
    sm: cn(
      'text-sm',
      // Larger text on mobile
      isMobile && 'text-base',
      isTouchDevice && 'text-lg',
    ),
    md: cn(
      'text-lg',
      // Larger text on mobile
      isMobile && 'text-xl',
      isTouchDevice && 'text-2xl',
    ),
    lg: cn(
      'text-2xl',
      // Larger text on mobile
      isMobile && 'text-3xl',
      isTouchDevice && 'text-4xl',
    ),
  };

  const getTimerColor = () => {
    if (remainingMs <= 0) return 'text-red-600';
    if (progressPercentage < 25) return 'text-red-600';
    if (progressPercentage < 50) return 'text-orange-600';
    return 'text-blue-600';
  };

  return (
    <div
      className={cn('space-y-2', className)}
      role="region"
      aria-label="Override window countdown timer"
    >
      <div className="flex items-center gap-2">
        <Hourglass
          className={cn('h-4 w-4', getTimerColor())}
          aria-hidden="true"
        />
        <span
          className={cn(
            'font-mono font-bold',
            sizeClasses[size],
            getTimerColor(),
            // Focus styles for keyboard navigation
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          )}
          role="timer"
          aria-live="polite"
          aria-label={`Time remaining for override window: ${formatTime(remainingMs)}`}
          tabIndex={0}
        >
          {formatTime(remainingMs)}
        </span>
      </div>

      {showProgress && totalDurationMs && (
        <div
          className="space-y-1"
          role="progressbar"
          aria-valuenow={Math.round(progressPercentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Override window progress: ${Math.round(progressPercentage)}% remaining`}
        >
          <Progress
            value={progressPercentage}
            className={cn(
              'h-1',
              // Thicker progress bar on mobile for better visibility
              isMobile && 'h-2',
              isTouchDevice && 'h-2',
              progressPercentage < 25 && '[&>div]:bg-red-500',
              progressPercentage < 50 &&
                progressPercentage >= 25 &&
                '[&>div]:bg-orange-500',
              progressPercentage >= 50 && '[&>div]:bg-blue-500',
            )}
            aria-hidden="true"
          />
          <div
            className={cn(
              'flex justify-between text-xs text-muted-foreground',
              // Responsive text sizing
              isMobile && 'text-sm',
            )}
          >
            <span>Override Window</span>
            <span aria-live="polite">
              {Math.round(progressPercentage)}% remaining
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Override Window Status Card Component
 * Requirements: 5.4, 6.3, 6.4 - Comprehensive status display for override windows
 */
interface OverrideWindowStatusCardProps {
  timeWindowInfo: TimeWindowInfo;
  sessionName?: string;
  onRefresh?: () => void;
  className?: string;
}

export const OverrideWindowStatusCard = ({
  timeWindowInfo,
  sessionName,
  onRefresh,
  className,
}: OverrideWindowStatusCardProps) => {
  const { status, expiresAt, totalWindowMs, windowHours, canPerformOverrides } =
    timeWindowInfo;

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'expiring-soon':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'session-active':
        return <Timer className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'active':
        return 'Override Window Active';
      case 'expiring-soon':
        return 'Override Window Expiring Soon';
      case 'expired':
        return 'Override Window Expired';
      case 'session-active':
        return 'Session Still Active';
      default:
        return 'Override Status';
    }
  };

  return (
    <div className={cn('border rounded-lg p-4 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold">{getStatusTitle()}</h3>
            {sessionName && (
              <p className="text-sm text-muted-foreground">{sessionName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TimeWindowStatusBadge
            timeWindowInfo={timeWindowInfo}
            size="md"
            showCountdown={true}
          />
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <Clock className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {(status === 'active' || status === 'expiring-soon') && expiresAt && (
        <CountdownTimer
          expiresAt={expiresAt}
          totalDurationMs={totalWindowMs}
          showProgress={true}
          size="md"
        />
      )}

      <div className="text-sm text-muted-foreground">
        {status === 'active' && (
          <p>
            Manual overrides are available for absent students. Window duration:{' '}
            {windowHours || 24} hours.
          </p>
        )}
        {status === 'expiring-soon' && (
          <p>
            Complete any pending overrides soon. The window will close
            automatically.
          </p>
        )}
        {status === 'expired' && (
          <p>
            The {windowHours || 24}-hour override window has closed. Manual
            overrides are no longer available.
          </p>
        )}
        {status === 'session-active' && (
          <p>
            Override functionality will be available after the attendance
            session ends.
          </p>
        )}
        {status === 'unavailable' && (
          <p>Manual overrides are not available for this session.</p>
        )}
      </div>
    </div>
  );
};

/**
 * Toast Notification Functions
 * Requirements: 6.4 - Toast notifications for successful override operations
 */
export const showOverrideSuccessToast = (studentName: string) => {
  toast.success('Student marked as present', {
    description: `${studentName} has been successfully marked as present via manual override.`,
    duration: 4000,
    action: {
      label: 'View',
      onClick: () => {
        // Could navigate to attendance details or refresh view
      },
    },
  });
};

export const showOverrideErrorToast = (error: string, studentName?: string) => {
  toast.error('Override failed', {
    description: studentName
      ? `Failed to mark ${studentName} as present: ${error}`
      : `Override operation failed: ${error}`,
    duration: 5000,
  });
};

export const showTimeWindowExpiringToast = (remainingMinutes: number) => {
  toast.warning('Override window expiring soon', {
    description: `Manual overrides will no longer be available in ${remainingMinutes} minutes.`,
    duration: 6000,
    action: {
      label: 'View Session',
      onClick: () => {
        // Could navigate to session details
      },
    },
  });
};

export const showTimeWindowExpiredToast = () => {
  toast.error('Override window expired', {
    description: 'Manual overrides are no longer available for this session.',
    duration: 5000,
  });
};

export default {
  TimeWindowStatusBadge,
  TimeWindowWarningAlert,
  CountdownTimer,
  OverrideWindowStatusCard,
  showOverrideSuccessToast,
  showOverrideErrorToast,
  showTimeWindowExpiringToast,
  showTimeWindowExpiredToast,
};
