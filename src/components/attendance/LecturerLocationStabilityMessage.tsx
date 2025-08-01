import { MapPin, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface LecturerLocationStabilityMessageProps {
  isVisible: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export const LecturerLocationStabilityMessage = ({
  isVisible,
  variant = 'default',
  className,
}: LecturerLocationStabilityMessageProps) => {
  if (!isVisible) return null;

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2  border animate-pulse rounded-lg text-sm',
          className,
        )}
      >
        <MapPin className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">
          Stay in position during attendance session
        </span>
      </div>
    );
  }

  return (
    <Alert className={cn('border-blue-200 bg-blue-50', className)}>
      <AlertTriangle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Location Stability:</strong> Please remain in your current
        location while the attendance session is active. Moving around may
        affect students&apos; ability to check in successfully.
      </AlertDescription>
    </Alert>
  );
};
