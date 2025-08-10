import { useState } from 'react';
// import { useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  // CardDescription,
  // CardHeader,
  // CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  MapPin,
  // Clock,
  Bell,
  Shield,
  Eye,
  Save,
  TestTube,
  // Globe,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
// import { api } from 'convex/_generated/api';
import { FaceVerificationSettings } from '@/components/face-verification/FaceVerificationSettings';
import { useLecturerOverrideSettings } from '@/hooks/useManualAttendanceOverride';
import { useMobileLecturerNavigation } from '@/feature/lecturer/hooks/use-mobile-lecturer-navigation';

const MobileLecturerSettings = () => {
  // Navigation
  const { getBackRoute } = useMobileLecturerNavigation();

  // State for various settings
  const [gpsRadius, setGpsRadius] = useState('100');
  const [sessionDuration, setSessionDuration] = useState('15');
  const [overrideWindow, setOverrideWindow] = useState('24');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [faceVerificationEnabled, setFaceVerificationEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState('important');
  const [joinRequestAlerts, setJoinRequestAlerts] = useState('immediate');
  const [showFaceSettings, setShowFaceSettings] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Hooks
  const { updateSettings, isLoading: isUpdatingOverride } =
    useLecturerOverrideSettings();

  // Get current user for settings
  // const currentUser = useQuery(api.auth.getCurrentUser);

  const handleSaveSettings = async () => {
    try {
      // Update override settings
      await updateSettings(parseInt(overrideWindow));

      // TODO: Add other settings updates here when backend is ready

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleTestNotification = () => {
    if (notificationsEnabled) {
      toast.success('Test notification sent!');
    } else {
      toast.error('Enable notifications first');
    }
  };

  if (showFaceSettings) {
    return (
      <div className="min-h-screen bg-background">
        <FaceVerificationSettings />
      </div>
    );
  }

  // Section detail views
  if (activeSection === 'attendance') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveSection(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Attendance Settings</h1>
        </div>

        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gps-radius">GPS Check-in Radius</Label>
            <Select value={gpsRadius} onValueChange={setGpsRadius}>
              <SelectTrigger>
                <SelectValue placeholder="Select radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 meters</SelectItem>
                <SelectItem value="100">100 meters</SelectItem>
                <SelectItem value="150">150 meters</SelectItem>
                <SelectItem value="200">200 meters</SelectItem>
                <SelectItem value="300">300 meters</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Students must be within this distance to check in
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-duration">Default Session Duration</Label>
            <Select value={sessionDuration} onValueChange={setSessionDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How long attendance sessions remain open by default
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="override-window">Manual Override Window</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="override-window"
                type="number"
                min="1"
                max="24"
                value={overrideWindow}
                onChange={(e) => setOverrideWindow(e.target.value)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
            <p className="text-sm text-muted-foreground">
              How long after a session ends you can manually mark attendance
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'notifications') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveSection(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>

        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications-enabled">
                Web Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get browser notifications for important events
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          {notificationsEnabled && (
            <>
              <Separator />

              <div className="space-y-2">
                <Label>Lecture Reminder Lead Time</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Response for Missed Confirmations</Label>
                <Select defaultValue="hold">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hold">Default to Hold</SelectItem>
                    <SelectItem value="unsure">Default to Unsure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                className="w-full flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Test Notification
              </Button>
            </>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Notifications</Label>
              <Select
                value={emailNotifications}
                onValueChange={setEmailNotifications}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All notifications</SelectItem>
                  <SelectItem value="important">Important only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Join Request Alerts</Label>
              <Select
                value={joinRequestAlerts}
                onValueChange={setJoinRequestAlerts}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily digest</SelectItem>
                  <SelectItem value="weekly">Weekly digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'security') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveSection(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Security & Privacy</h1>
        </div>

        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Face Verification</Label>
              <p className="text-sm text-muted-foreground">
                Enhanced security with facial recognition
              </p>
            </div>
            <Switch
              checked={faceVerificationEnabled}
              onCheckedChange={setFaceVerificationEnabled}
            />
          </div>

          {faceVerificationEnabled && (
            <Button
              variant="outline"
              onClick={() => setShowFaceSettings(true)}
              className="w-full justify-between"
            >
              Configure Face Verification
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Extra security for your account
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Data Export</Label>
                <p className="text-sm text-muted-foreground">
                  Download your data
                </p>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main settings menu
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={getBackRoute}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Settings Menu Items */}
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveSection('attendance')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Attendance Settings</p>
                <p className="text-sm text-muted-foreground">
                  GPS radius, session duration
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveSection('notifications')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Push notifications, email alerts
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveSection('security')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium">Security & Privacy</p>
                <p className="text-sm text-muted-foreground">
                  Face verification, 2FA, data export
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <div className="pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Quick Settings
          </h3>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="quick-notifications">
                    Push Notifications
                  </Label>
                </div>
                <Switch
                  id="quick-notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="quick-face-verification">
                    Face Verification
                  </Label>
                </div>
                <Switch
                  id="quick-face-verification"
                  checked={faceVerificationEnabled}
                  onCheckedChange={setFaceVerificationEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="pt-6">
          <Button
            onClick={handleSaveSettings}
            disabled={isUpdatingOverride}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            <Save className="h-4 w-4" />
            {isUpdatingOverride ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileLecturerSettings;
