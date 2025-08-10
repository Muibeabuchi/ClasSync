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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Eye,
  Shield,
  Smartphone,
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
  const [attendanceCode, setAttendanceCode] = useState('');
  const [locationRadius, setLocationRadius] = useState(50);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<
    'gps_only' | 'gps_face_verification' | 'gps_code'
  >('gps_only');

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
            requireCode:
              verificationMethod === 'gps_code' ? attendanceCode : undefined,
            radiusMeters: locationRadius,
            verificationMethod,
            gpsCoordinates: {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            },
          },
        );

        toast.success('Attendance Session Started', {
          description:
            'Session is now active. Students can check-in immediately.',
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

      const errorMessage =
        'Location access is required to start an attendance session.';

      // switch (error.code) {
      //   case error.PERMISSION_DENIED:
      //     errorMessage =
      //       'Location permission denied. Please enable location access in your browser settings.';
      //     break;
      //   case error.POSITION_UNAVAILABLE:
      //     errorMessage =
      //       'Location information is unavailable. Please check your GPS settings.';
      //     break;
      //   case error.TIMEOUT:
      //     errorMessage = 'Location request timed out. Please try again.';
      //     break;
      //   default:
      //     errorMessage =
      //       'Unable to get your location. Please check your GPS settings and try again.';
      // }

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
    (verificationMethod === 'gps_code' && !attendanceCode.trim()) ||
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
              Your device doesn&apos;t support location services
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

  // Compact verification method options
  const verificationOptions = [
    {
      value: 'gps_only',
      icon: Smartphone,
      label: 'GPS Only',
      description: 'Location-based',
      color: 'blue',
    },
    {
      value: 'gps_face_verification',
      icon: Eye,
      label: 'GPS + Face',
      description: 'Most secure',
      color: 'green',
    },
    {
      value: 'gps_code',
      icon: Code,
      label: 'GPS + Code',
      description: 'Manual entry',
      color: 'orange',
    },
  ] as const;

  // Shared content component for both dialog and drawer
  const SessionContent = () => (
    <ScrollArea className="max-h-[70vh] pr-4">
      <div className="space-y-4">
        {/* GPS Status - Compact */}
        <GPSStatusIndicator />

        {/* Quick Session Info */}
        <div className="bg-primary/5 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Clock className="h-4 w-4" />1 minute active session
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Students can check-in immediately after creation
          </p>
        </div>

        {/* Compact Verification Method Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Verification Method</Label>
          <RadioGroup
            value={verificationMethod}
            onValueChange={(value) =>
              setVerificationMethod(value as typeof verificationMethod)
            }
            className="grid grid-cols-3 gap-2"
          >
            {verificationOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = verificationMethod === option.value;

              return (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className={`
                      flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer
                      transition-all duration-200 hover:bg-muted/50
                      ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border'
                      }
                    `}
                  >
                    <div
                      className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${option.color === 'blue' ? 'bg-blue-100' : ''}
                      ${option.color === 'green' ? 'bg-green-100' : ''}
                      ${option.color === 'orange' ? 'bg-orange-100' : ''}
                    `}
                    >
                      <IconComponent
                        className={`
                        h-4 w-4
                        ${option.color === 'blue' ? 'text-blue-600' : ''}
                        ${option.color === 'green' ? 'text-green-600' : ''}
                        ${option.color === 'orange' ? 'text-orange-600' : ''}
                      `}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Location Radius - Compact */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Radius
            </Label>
            <Badge variant="outline" className="text-xs">
              {locationRadius}m
            </Badge>
          </div>
          <Input
            type="range"
            min="5"
            max="300"
            value={locationRadius}
            onChange={(e) => setLocationRadius(Number(e.target.value))}
            className="w-full h-2"
            disabled={!gpsStatus.isReady}
          />
        </div>

        {/* Conditional Content */}
        {verificationMethod === 'gps_code' && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <Label className="text-sm font-medium">Attendance Code</Label>
            <div className="flex gap-2">
              <Input
                value={attendanceCode}
                onChange={(e) =>
                  setAttendanceCode(e.target.value.toUpperCase())
                }
                placeholder="Generate or enter"
                maxLength={6}
                className="font-mono text-center tracking-wider"
                disabled={!gpsStatus.isReady}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateCode}
                className="shrink-0"
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
                  className="shrink-0"
                  disabled={!gpsStatus.isReady}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {verificationMethod === 'gps_face_verification' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-sm font-medium text-green-800">
              <Eye className="h-4 w-4" />
              Face Verification Active
            </div>
            <p className="text-xs text-green-600 mt-1">
              Students need face verification setup to check-in
            </p>
          </div>
        )}

        {/* Location Stability Message - Compact */}
        <LecturerLocationStabilityMessage isVisible={true} variant="compact" />

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartSession}
            className="flex-1"
            disabled={isStartDisabled}
          >
            {isCreatingSession ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : !gpsStatus.isReady ? (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Enable GPS
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
    </ScrollArea>
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
