import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, MapPin, Clock, Code, Loader2 } from 'lucide-react';
import { useCreateAttendanceSession } from '@/feature/attendance/api';
import type { Id } from 'convex/_generated/dataModel';
import { toast } from 'sonner';
import { useGeolocated } from 'react-geolocated';
import { useNavigate } from '@tanstack/react-router';
import { LecturerLocationStabilityMessage } from '@/components/attendance/LecturerLocationStabilityMessage';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface AttendanceSessionModalProps {
  courseId: Id<'courses'>;
  courseName: string;
  children: React.ReactNode;
  disabled?: boolean;
  onStartSession?: (courseId: string) => void;
}

const AttendanceSessionModal = ({
  courseId,
  courseName,
  children,
  disabled = false,
  // onStartSession,
}: AttendanceSessionModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requireCode, setRequireCode] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [locationRadius, setLocationRadius] = useState(50);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { mutateAsync: createAttendanceSession } = useCreateAttendanceSession();
  const { isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
      suppressLocationOnMount: true,
      onSuccess: async ({ coords }) => {
        if (!isGeolocationAvailable && !isGeolocationEnabled) {
          setIsCreatingSession(false);
          return;
        }

        try {
          const { sessionId, courseId: CourseId } =
            await createAttendanceSession({
              courseId,
              requireCode: attendanceCode,
              radiusMeters: locationRadius,
              gpsCoordinates: {
                lat: coords.latitude,
                long: coords.longitude,
              },
            });
          toast.success('Attendance Session Starting', {
            description: '30-second preparation phase has begun.',
          });

          // Close modal and trigger navigation
          setIsOpen(false);
          navigate({
            to: '/dashboard/lecturer/$lecturerCourseId/$attendanceSessionId',
            params: {
              lecturerCourseId: CourseId,
              attendanceSessionId: sessionId,
            },
          });
        } catch (error) {
          toast.error('Failed to create session', {
            description:
              error instanceof Error ? error.message : 'Please try again.',
          });
        } finally {
          setIsCreatingSession(false);
        }
      },
      onError: () => {
        setIsCreatingSession(false);
        toast.error('Location access required', {
          description:
            'Please enable location access to start an attendance session.',
        });
      },
    });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAttendanceCode(result);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(attendanceCode);
    toast.info('Code Copied', {
      description: 'Attendance code copied to clipboard.',
    });
  };

  const handleStartSession = () => {
    setIsCreatingSession(true);
    getPosition();
  };

  const handleOpenChange = (open: boolean) => {
    if (disabled && open) {
      return; // Prevent opening when disabled
    }
    setIsOpen(open);
  };

  // Shared content component for both dialog and drawer
  const SessionContent = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Session Info */}
      <div className="bg-primary/10 p-3 sm:p-4 rounded-lg space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-primary" />
          Session Duration: 1 minute total
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>{`• 30 seconds prep time (students see "Get Ready")`}</div>
          <div>• 30 seconds active time (students can check-in)</div>
        </div>
      </div>

      {/* Location Stability Message */}
      <LecturerLocationStabilityMessage isVisible={true} variant="compact" />

      {/* Location Settings */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4" />
          Location Radius
        </Label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              type="range"
              min="5"
              max="300"
              value={locationRadius}
              onChange={(e) => setLocationRadius(Number(e.target.value))}
              className="flex-1 h-8 sm:h-10"
            />
            <Badge variant="outline" className="min-w-[60px] justify-center">
              {locationRadius}m
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Students must be within this radius to check-in
          </p>
        </div>
      </div>

      {/* Attendance Code */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Code className="h-4 w-4" />
            Require Attendance Code
          </Label>
          <Switch
            checked={requireCode}
            onCheckedChange={setRequireCode}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {requireCode && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex gap-2">
              <Input
                value={attendanceCode}
                onChange={(e) =>
                  setAttendanceCode(e.target.value.toUpperCase())
                }
                placeholder="Enter code or generate"
                maxLength={6}
                className="font-mono text-center text-lg sm:text-base tracking-wider h-12 sm:h-10"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateCode}
                className="h-12 w-12 sm:h-10 sm:w-10 shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              {attendanceCode && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyCode}
                  className="h-12 w-12 sm:h-10 sm:w-10 shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Students will need to enter this code during check-in
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}
          className="flex-1 h-12 sm:h-10 order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleStartSession}
          className="flex-1 h-12 sm:h-10 order-1 sm:order-2"
          disabled={
            (requireCode && !attendanceCode.trim()) || isCreatingSession
          }
        >
          {isCreatingSession ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="hidden sm:inline">Creating Session...</span>
              <span className="sm:hidden">Creating...</span>
            </>
          ) : (
            'Start Session'
          )}
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild disabled={disabled}>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Start Attendance Session
            </DialogTitle>
            <DialogDescription className="truncate">
              Configure your attendance session for{' '}
              <strong>
                {courseName.length > 30
                  ? courseName.substring(0, 30) + '...'
                  : courseName}
              </strong>
            </DialogDescription>
          </DialogHeader>
          <SessionContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild disabled={disabled}>
        {children}
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-left pb-4">
            <DrawerTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Start Attendance Session
            </DrawerTitle>
            <DrawerDescription className="text-sm">
              Configure your attendance session for{' '}
              <strong className="block truncate mt-1">
                {courseName.length > 40
                  ? courseName.substring(0, 40) + '...'
                  : courseName}
              </strong>
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">
            <SessionContent />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AttendanceSessionModal;
