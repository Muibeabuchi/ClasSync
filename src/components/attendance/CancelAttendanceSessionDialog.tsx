import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { X, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useCancelAttendanceSession } from '@/feature/attendance/api';
import { useNavigate } from '@tanstack/react-router';
import type { Id } from 'convex/_generated/dataModel';
import { cn } from '@/lib/utils';

interface CancelAttendanceSessionDialogProps {
  sessionId: Id<'attendanceSessions'>;
  courseId: Id<'courses'>;
  courseName: string;
  courseCode: string;
  timeRemaining: number;
  canCancel: boolean;
  reason?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const CancelAttendanceSessionDialog = ({
  sessionId,
  courseId,
  courseName,
  courseCode,
  timeRemaining,
  canCancel,
  reason,
  className,
  variant = 'destructive',
  size = 'default',
}: CancelAttendanceSessionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const cancelSessionMutation = useCancelAttendanceSession();

  const formatTimeRemaining = (seconds: number) => {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  const handleCancel = async () => {
    if (!canCancel) {
      toast.error('Cannot cancel session', {
        description: reason || 'Session cannot be cancelled at this time.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await cancelSessionMutation.mutateAsync({
        courseId,
        attendanceSessionId: sessionId,
      });

      toast.success('Session cancelled successfully', {
        description: `${result.courseCode} attendance session has been cancelled and marked as cancelled.`,
      });

      // Navigate back to course page
      navigate({
        to: '/dashboard/lecturer/$courseId',
        params: { courseId },
      });
    } catch (error) {
      console.error('Failed to cancel session:', error);
      toast.error('Failed to cancel session', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'transition-all duration-200',
            !canCancel && 'opacity-50 cursor-not-allowed',
            className,
          )}
          disabled={!canCancel}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel Session
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-left">
                Cancel Attendance Session?
              </AlertDialogTitle>
            </div>
          </div>

          <AlertDialogDescription className="text-left space-y-3">
            <div className="space-y-2">
              <p>You are about to cancel the attendance session for:</p>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium text-foreground">
                  {courseCode} - {courseName}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Session ID: {sessionId.slice(-8)}
                </div>
              </div>
            </div>

            {canCancel && timeRemaining > 0 && (
              <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-lg border border-warning/20">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-sm text-warning-foreground">
                  Time remaining to cancel: {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <p className="font-medium text-foreground">This action will:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Mark the attendance session as cancelled</li>
                <li>• Prevent students from checking in</li>
                <li>• Show as cancelled in attendance history</li>
                <li>• Cannot be undone</li>
              </ul>
            </div>

            {!canCancel && (
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive-foreground">
                    Cannot Cancel
                  </span>
                </div>
                <p className="text-sm text-destructive-foreground mt-1">
                  {reason || 'The session cannot be cancelled at this time.'}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto" disabled={isLoading}>
            Keep Session
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={!canCancel || isLoading}
            className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 focus:ring-destructive"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel Session
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Compact version for mobile/small spaces
export const CancelAttendanceSessionButton = ({
  sessionId,
  courseId,
  courseName,
  courseCode,
  timeRemaining,
  canCancel,
  reason,
  className,
}: CancelAttendanceSessionDialogProps) => {
  return (
    <CancelAttendanceSessionDialog
      sessionId={sessionId}
      courseId={courseId}
      courseName={courseName}
      courseCode={courseCode}
      timeRemaining={timeRemaining}
      canCancel={canCancel}
      reason={reason}
      variant="destructive"
      size="sm"
      className={cn('text-xs', className)}
    />
  );
};
