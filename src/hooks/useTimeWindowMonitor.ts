import { useState, useEffect, useCallback } from 'react';
import {
  showTimeWindowExpiringToast,
  showTimeWindowExpiredToast,
  type TimeWindowInfo,
  type TimeWindowStatus,
} from '../components/attendance/TimeWindowWarnings';
import type { Id } from '../../convex/_generated/dataModel';

interface TimeWindowMonitorOptions {
  sessionId: Id<'attendanceSessions'>;
  sessionEndTime?: number;
  overrideWindowHours?: number;
  onWindowExpiring?: (remainingMinutes: number) => void;
  onWindowExpired?: () => void;
  enableNotifications?: boolean;
  warningThresholds?: number[]; // Minutes before expiry to show warnings
}

/**
 * Hook for monitoring override time window status and providing automatic notifications
 * Requirements: 5.4, 6.3, 6.4 - Time window warnings and notifications
 */
export const useTimeWindowMonitor = (options: TimeWindowMonitorOptions) => {
  const {
    sessionId,
    sessionEndTime,
    overrideWindowHours = 24,
    onWindowExpiring,
    onWindowExpired,
    enableNotifications = true,
    warningThresholds = [60, 30, 15, 5], // Default warnings at 1hr, 30min, 15min, 5min
  } = options;

  const [timeWindowInfo, setTimeWindowInfo] = useState<TimeWindowInfo>({
    status: 'unavailable',
    canPerformOverrides: false,
  });

  const [warningsShown, setWarningsShown] = useState<Set<number>>(new Set());
  const [hasExpiredNotificationShown, setHasExpiredNotificationShown] =
    useState(false);

  // Calculate time window status
  const calculateTimeWindowStatus = useCallback((): TimeWindowInfo => {
    const now = Date.now();

    if (!sessionEndTime) {
      return {
        status: 'unavailable',
        canPerformOverrides: false,
      };
    }

    // If session is still active (hasn't ended yet)
    if (now < sessionEndTime) {
      return {
        status: 'session-active',
        canPerformOverrides: false,
        sessionEndTime,
      };
    }

    // Calculate override window expiry
    const windowDurationMs = overrideWindowHours * 60 * 60 * 1000;
    const windowExpiresAt = sessionEndTime + windowDurationMs;
    const remainingTimeMs = Math.max(0, windowExpiresAt - now);

    // Determine status based on remaining time
    let status: TimeWindowStatus;
    if (remainingTimeMs <= 0) {
      status = 'expired';
    } else if (remainingTimeMs <= 60 * 60 * 1000) {
      // Less than 1 hour remaining
      status = 'expiring-soon';
    } else {
      status = 'active';
    }

    return {
      status,
      remainingTimeMs,
      totalWindowMs: windowDurationMs,
      expiresAt: windowExpiresAt,
      sessionEndTime,
      windowHours: overrideWindowHours,
      canPerformOverrides: remainingTimeMs > 0,
    };
  }, [sessionEndTime, overrideWindowHours]);

  // Update time window info every second
  useEffect(() => {
    const updateTimeWindowInfo = () => {
      const newInfo = calculateTimeWindowStatus();
      setTimeWindowInfo(newInfo);

      // Handle notifications if enabled
      if (enableNotifications && newInfo.remainingTimeMs !== undefined) {
        const remainingMinutes = Math.floor(
          newInfo.remainingTimeMs / (1000 * 60),
        );

        // Check for warning thresholds
        for (const threshold of warningThresholds) {
          if (
            remainingMinutes <= threshold &&
            remainingMinutes > 0 &&
            !warningsShown.has(threshold)
          ) {
            showTimeWindowExpiringToast(remainingMinutes);
            onWindowExpiring?.(remainingMinutes);
            setWarningsShown((prev) => new Set(prev).add(threshold));
            break; // Only show one warning at a time
          }
        }

        // Check for expiry
        if (newInfo.status === 'expired' && !hasExpiredNotificationShown) {
          showTimeWindowExpiredToast();
          onWindowExpired?.();
          setHasExpiredNotificationShown(true);
        }
      }
    };

    // Initial update
    updateTimeWindowInfo();

    // Set up interval for real-time updates
    const interval = setInterval(updateTimeWindowInfo, 1000);

    return () => clearInterval(interval);
  }, [
    calculateTimeWindowStatus,
    enableNotifications,
    warningThresholds,
    warningsShown,
    hasExpiredNotificationShown,
    onWindowExpiring,
    onWindowExpired,
  ]);

  // Reset warnings when session changes
  useEffect(() => {
    setWarningsShown(new Set());
    setHasExpiredNotificationShown(false);
  }, [sessionId, sessionEndTime]);

  // Utility functions
  const formatTimeRemaining = useCallback((ms: number): string => {
    if (ms <= 0) return '0m';

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const getTimeRemainingText = useCallback((): string => {
    if (!timeWindowInfo.remainingTimeMs) return 'No time remaining';
    return formatTimeRemaining(timeWindowInfo.remainingTimeMs);
  }, [timeWindowInfo.remainingTimeMs, formatTimeRemaining]);

  const getStatusMessage = useCallback((): string => {
    switch (timeWindowInfo.status) {
      case 'active':
        return `Override window is active. ${getTimeRemainingText()} remaining.`;
      case 'expiring-soon':
        return `Override window expires soon! ${getTimeRemainingText()} remaining.`;
      case 'expired':
        return 'Override window has expired. Manual overrides are no longer available.';
      case 'session-active':
        return 'Session is still active. Override window will start when session ends.';
      case 'unavailable':
      default:
        return 'Override window is not available for this session.';
    }
  }, [timeWindowInfo.status, getTimeRemainingText]);

  const isWarningState = useCallback((): boolean => {
    return (
      timeWindowInfo.status === 'expiring-soon' ||
      timeWindowInfo.status === 'expired'
    );
  }, [timeWindowInfo.status]);

  const shouldShowUrgentWarning = useCallback((): boolean => {
    if (!timeWindowInfo.remainingTimeMs) return false;
    const remainingMinutes = Math.floor(
      timeWindowInfo.remainingTimeMs / (1000 * 60),
    );
    return remainingMinutes <= 15 && remainingMinutes > 0;
  }, [timeWindowInfo.remainingTimeMs]);

  // Manual refresh function
  const refreshTimeWindow = useCallback(() => {
    const newInfo = calculateTimeWindowStatus();
    setTimeWindowInfo(newInfo);
  }, [calculateTimeWindowStatus]);

  return {
    // Current time window information
    timeWindowInfo,

    // Status helpers
    isActive: timeWindowInfo.status === 'active',
    isExpiringSoon: timeWindowInfo.status === 'expiring-soon',
    isExpired: timeWindowInfo.status === 'expired',
    isSessionActive: timeWindowInfo.status === 'session-active',
    canPerformOverrides: timeWindowInfo.canPerformOverrides,

    // Time formatting helpers
    timeRemainingText: getTimeRemainingText(),
    statusMessage: getStatusMessage(),
    isWarningState: isWarningState(),
    shouldShowUrgentWarning: shouldShowUrgentWarning(),

    // Progress calculation
    progressPercentage:
      timeWindowInfo.totalWindowMs && timeWindowInfo.remainingTimeMs
        ? (timeWindowInfo.remainingTimeMs / timeWindowInfo.totalWindowMs) * 100
        : 0,

    // Control functions
    refreshTimeWindow,

    // Notification state
    warningsShown: Array.from(warningsShown),
    hasExpiredNotificationShown,
  };
};

/**
 * Simplified hook for basic time window status without notifications
 * Useful for components that only need to display status without automatic notifications
 */
export const useTimeWindowStatus = (
  sessionEndTime?: number,
  overrideWindowHours: number = 24,
) => {
  const [timeWindowInfo, setTimeWindowInfo] = useState<TimeWindowInfo>({
    status: 'unavailable',
    canPerformOverrides: false,
  });

  useEffect(() => {
    const calculateStatus = () => {
      const now = Date.now();

      if (!sessionEndTime) {
        return {
          status: 'unavailable' as TimeWindowStatus,
          canPerformOverrides: false,
        };
      }

      if (now < sessionEndTime) {
        return {
          status: 'session-active' as TimeWindowStatus,
          canPerformOverrides: false,
          sessionEndTime,
        };
      }

      const windowDurationMs = overrideWindowHours * 60 * 60 * 1000;
      const windowExpiresAt = sessionEndTime + windowDurationMs;
      const remainingTimeMs = Math.max(0, windowExpiresAt - now);

      let status: TimeWindowStatus;
      if (remainingTimeMs <= 0) {
        status = 'expired';
      } else if (remainingTimeMs <= 60 * 60 * 1000) {
        status = 'expiring-soon';
      } else {
        status = 'active';
      }

      return {
        status,
        remainingTimeMs,
        totalWindowMs: windowDurationMs,
        expiresAt: windowExpiresAt,
        sessionEndTime,
        windowHours: overrideWindowHours,
        canPerformOverrides: remainingTimeMs > 0,
      };
    };

    const updateStatus = () => {
      setTimeWindowInfo(calculateStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [sessionEndTime, overrideWindowHours]);

  return timeWindowInfo;
};

export default useTimeWindowMonitor;
