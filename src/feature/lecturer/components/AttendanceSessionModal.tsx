import { useState, useEffect } from 'react';
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
import {
  Copy,
  RefreshCw,
  MapPin,
  Clock,
  Code,
  Loader2,
  AlertTriangle,
  Navigation,
  MapPinOff,
  CheckCircle,
} from 'lucide-react';
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
}: AttendanceSessionModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requireCode, setRequireCode] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [locationRadius, setLocationRadius] = useState(50);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { mutateAsync: createAttendanceSession } = useCreateAttendanceSession();

  // Enhanced GPS handling with proper error states
  const {
    isGeolocationAvailable,
    isGeolocationEnabled,
    coords,
    positionError,
    getPosition,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    },
    userDecisionTimeout: 10000,
    suppressLocationOnMount: true,
    watchPosition: false,
    onSuccess: async (position) => {
      setGpsError(null);

      try {
        const { sessionId, courseId: CourseId } = await createAttendanceSession(
          {
            courseId,
            requireCode: attendanceCode,
            radiusMeters: locationRadius,
            gpsCoordinates: {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            },
          },
        );

        toast.success('Attendance Session Starting', {
          description: '30-second preparation phase has begun.',
        });

        // Close modal and navigate
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
    onError: (error) => {
      setIsCreatingSession(false);

      let errorMessage =
        'Location access is required to start an attendance session.';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage =
            'Location permission denied. Please enable location access in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage =
            'Location information is unavailable. Please check your GPS settings.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage =
            'Unable to get your location. Please check your GPS settings and try again.';
      }

      setGpsError(errorMessage);
      toast.error('Location Error', {
        description: errorMessage,
      });
    },
  });

  // Check GPS status
  const gpsStatus = {
    isAvailable: isGeolocationAvailable,
    isEnabled: isGeolocationEnabled,
    hasError: !!positionError || !!gpsError,
    errorMessage: gpsError || positionError?.message,
    isReady:
      isGeolocationAvailable &&
      isGeolocationEnabled &&
      !positionError &&
      !gpsError,
  };

  // Reset GPS error when modal opens
  useEffect(() => {
    if (isOpen) {
      setGpsError(null);
    }
  }, [isOpen]);

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
    // Prevent starting session without GPS
    if (!gpsStatus.isReady) {
      toast.error('GPS Required', {
        description:
          'Please enable location services before starting a session.',
      });
      return;
    }

    setIsCreatingSession(true);
    setGpsError(null);
    getPosition();
  };

  const handleOpenChange = (open: boolean) => {
    if (disabled && open) {
      return;
    }
    setIsOpen(open);

    // Reset states when closing
    if (!open) {
      setIsCreatingSession(false);
      setGpsError(null);
    }
  };

  // Check if start button should be disabled
  const isStartDisabled =
    !gpsStatus.isReady ||
    (requireCode && !attendanceCode.trim()) ||
    isCreatingSession;

  // GPS Status Component
  const GPSStatusIndicator = () => {
    if (!gpsStatus.isAvailable) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <MapPinOff className="h-4 w-4 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              GPS Not Available
            </p>
            <p className="text-xs text-red-600">
              Your device doesn't support location services
            </p>
          </div>
        </div>
      );
    }

    if (!gpsStatus.isEnabled) {
      return (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Location Access Required
            </p>
            <p className="text-xs text-yellow-600">
              Please enable location services to start a session
            </p>
          </div>
        </div>
      );
    }

    if (gpsStatus.hasError) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Location Error</p>
            <p className="text-xs text-red-600">{gpsStatus.errorMessage}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">GPS Ready</p>
          <p className="text-xs text-green-600">
            Location services are enabled and working
          </p>
        </div>
      </div>
    );
  };

  // Shared content component for both dialog and drawer
  const SessionContent = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* GPS Status */}
      <GPSStatusIndicator />

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
              disabled={!gpsStatus.isReady}
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
            disabled={!gpsStatus.isReady}
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
                disabled={!gpsStatus.isReady}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateCode}
                className="h-12 w-12 sm:h-10 sm:w-10 shrink-0"
                disabled={!gpsStatus.isReady}
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
                  disabled={!gpsStatus.isReady}
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
          disabled={isStartDisabled}
        >
          {isCreatingSession ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="hidden sm:inline">Creating Session...</span>
              <span className="sm:hidden">Creating...</span>
            </>
          ) : !gpsStatus.isReady ? (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Enable GPS to Start</span>
              <span className="sm:hidden">Enable GPS</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Start Session
            </>
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
