import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, MapPin, Clock, Code } from 'lucide-react';
// import { useToast } from "@/hooks/use-toast";

interface AttendanceSessionModalProps {
  courseId: string;
  courseName: string;
  children: React.ReactNode;
  onStartSession?: (courseId: string) => void;
}

const AttendanceSessionModal = ({
  courseId,
  courseName,
  children,
  onStartSession,
}: AttendanceSessionModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requireCode, setRequireCode] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [locationRadius, setLocationRadius] = useState(150);

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
    // toast({
    //   title: "Code Copied!",
    //   description: "Attendance code copied to clipboard.",
    // });
  };

  const handleStartSession = () => {
    // Close modal and trigger navigation
    setIsOpen(false);

    // toast({
    //   title: "Attendance Session Starting",
    //   description: "Redirecting to live attendance page...",
    // });

    // Call the callback to navigate to live attendance page
    if (onStartSession) {
      onStartSession(courseId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Start Attendance Session
          </DialogTitle>
          <DialogDescription>
            Configure your attendance session for <strong>{courseName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-blue-600" />
              Session Duration: 1 minute total
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>{`• 30 seconds prep time (students see "Get Ready")`}</div>
              <div>• 30 seconds active time (students can check-in)</div>
            </div>
          </div>

          {/* Location Settings */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Radius
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="range"
                min="50"
                max="300"
                value={locationRadius}
                onChange={(e) => setLocationRadius(Number(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline">{locationRadius}m</Badge>
            </div>
            <p className="text-xs text-gray-500">
              Students must be within this radius to check-in
            </p>
          </div>

          {/* Attendance Code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Require Attendance Code
              </Label>
              <Switch checked={requireCode} onCheckedChange={setRequireCode} />
            </div>

            {requireCode && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={attendanceCode}
                    onChange={(e) =>
                      setAttendanceCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter code or generate"
                    maxLength={6}
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateCode}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {attendanceCode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Students will need to enter this code during check-in
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              disabled={requireCode && !attendanceCode.trim()}
            >
              Start Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceSessionModal;
