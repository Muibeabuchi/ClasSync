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
}

export const SessionTimer = ({
  endTime,
  creationTime,
  status,
  className,
  showProgress = false,
  size = 'md',
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
          icon: Clock,
        };
      case 'active':
        return {
          label: 'Time left',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: Timer,
        };
      case 'complete':
        return {
          label: 'Completed',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Clock,
        };
      default:
        return {
          label: 'Session',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const getSizeClasses = () => {
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

  // Calculate progress percentage for active sessions
  const getProgressValue = () => {
    if (status !== 'active') return 0;
    const totalDuration = 60; // 60 seconds total
    const elapsed = totalDuration - timeRemaining;
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

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
