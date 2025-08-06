import { useState, useEffect } from 'react';
import { Clock, Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SessionTimerProps {
  endTime: number;
  creationTime: number;
  status: 'pending' | 'active' | 'complete';
  className?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'circular';
}

export const SessionTimer = ({
  endTime,
  creationTime,
  status,
  className,
  showProgress = false,
  size = 'md',
  variant = 'default',
}: SessionTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const targetTime = endTime || creationTime + 60000; // 60 seconds default
      const remaining = Math.max(0, targetTime - Date.now());
      setTimeRemaining(remaining / 1000);
    };

    calculateTimeRemaining();

    if (status !== 'complete') {
      const timer = setInterval(calculateTimeRemaining, 1000);
      return () => clearInterval(timer);
    }
  }, [endTime, creationTime, status]);

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    if (variant === 'circular') {
      // For circular variant, show just seconds for better readability
      return `${totalSeconds}`;
    }

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Starts in',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          strokeColor: '#d97706', // yellow-600
          icon: Clock,
        };
      case 'active':
        return {
          label: 'Time left',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          strokeColor: '#16a34a', // green-600
          icon: Timer,
        };
      case 'complete':
        return {
          label: 'Completed',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          strokeColor: '#6b7280', // gray-500
          icon: Clock,
        };
      default:
        return {
          label: 'Session',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          strokeColor: '#6b7280',
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const getSizeClasses = () => {
    if (variant === 'circular') {
      switch (size) {
        case 'sm':
          return {
            container: 'w-16 h-16',
            svg: 'w-16 h-16',
            icon: 'h-3 w-3',
            time: 'text-xs font-mono font-bold',
            label: 'text-xs',
          };
        case 'lg':
          return {
            container: 'w-24 h-24',
            svg: 'w-24 h-24',
            icon: 'h-5 w-5',
            time: 'text-lg font-mono font-bold',
            label: 'text-sm',
          };
        default:
          return {
            container: 'w-20 h-20',
            svg: 'w-20 h-20',
            icon: 'h-4 w-4',
            time: 'text-sm font-mono font-bold',
            label: 'text-xs',
          };
      }
    }

    switch (size) {
      case 'sm':
        return {
          container: 'p-2',
          icon: 'h-3 w-3',
          label: 'text-xs',
          time: 'text-sm font-mono',
        };
      case 'lg':
        return {
          container: 'p-4',
          icon: 'h-5 w-5',
          label: 'text-sm',
          time: 'text-xl font-mono',
        };
      default:
        return {
          container: 'p-3',
          icon: 'h-4 w-4',
          label: 'text-sm',
          time: 'text-lg font-mono',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Calculate progress percentage for sessions
  const getProgressValue = () => {
    const totalDuration = 60; // 60 seconds total
    const elapsed = totalDuration - timeRemaining;
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  // Circular progress calculation
  const getCircularProgress = () => {
    const progress = getProgressValue();
    const radius =
      variant === 'circular' && size === 'sm'
        ? 28
        : variant === 'circular' && size === 'lg'
          ? 44
          : 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return { radius, circumference, strokeDashoffset };
  };

  if (variant === 'circular') {
    const { radius, circumference, strokeDashoffset } = getCircularProgress();
    const center =
      variant === 'circular' && size === 'sm'
        ? 32
        : variant === 'circular' && size === 'lg'
          ? 48
          : 40;

    return (
      <div className={cn('relative flex flex-col items-center', className)}>
        <div className={cn('relative', sizeClasses.container)}>
          <svg
            className={cn('transform -rotate-90', sizeClasses.svg)}
            viewBox={`0 0 ${center * 2} ${center * 2}`}
          >
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            {status !== 'complete' && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke={statusInfo.strokeColor}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-in-out"
              />
            )}
          </svg>

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <StatusIcon
              className={cn(sizeClasses.icon, statusInfo.color, 'mb-1')}
            />
            {status !== 'complete' ? (
              <span className={cn(sizeClasses.time, statusInfo.color)}>
                {formatTime(timeRemaining)}
              </span>
            ) : (
              <span className={cn(sizeClasses.time, 'text-gray-500')}>0</span>
            )}
          </div>
        </div>

        {/* Status label below circle */}
        <span
          className={cn(
            sizeClasses.label,
            statusInfo.color,
            'mt-1 text-center',
          )}
        >
          {status === 'complete' ? 'Ended' : statusInfo.label}
        </span>
      </div>
    );
  }

  // Default variant (existing implementation)
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg border',
        statusInfo.bgColor,
        statusInfo.borderColor,
        sizeClasses.container,
        className,
      )}
    >
      <StatusIcon className={cn(sizeClasses.icon, statusInfo.color)} />
      <div className="flex flex-col items-center">
        <span className={cn(sizeClasses.label, statusInfo.color)}>
          {statusInfo.label}
        </span>
        {status !== 'complete' ? (
          <span
            className={cn(sizeClasses.time, statusInfo.color, 'font-semibold')}
          >
            {formatTime(timeRemaining)}
          </span>
        ) : (
          <span className={cn(sizeClasses.label, 'text-muted-foreground')}>
            Session ended
          </span>
        )}
      </div>

      {showProgress && status === 'active' && (
        <div className="ml-2 w-16">
          <Progress value={getProgressValue()} className="h-1.5" />
        </div>
      )}
    </div>
  );
};

export default SessionTimer;
