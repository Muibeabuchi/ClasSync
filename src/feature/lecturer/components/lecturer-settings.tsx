import { useState } from 'react';
// import { useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Settings,
  MapPin,
  // Clock,
  Bell,
  Shield,
  Eye,
  Save,
  TestTube,
  // Smartphone,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
// import { api } from 'convex/_generated/api';
import { FaceVerificationSettings } from '@/components/face-verification/FaceVerificationSettings';
import { useLecturerOverrideSettings } from '@/hooks/useManualAttendanceOverride';

const LecturerSettings = () => {
  // State for various settings
  const [gpsRadius, setGpsRadius] = useState('100');
  const [sessionDuration, setSessionDuration] = useState('15');
  const [overrideWindow, setOverrideWindow] = useState('24');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [faceVerificationEnabled, setFaceVerificationEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState('important');
  const [joinRequestAlerts, setJoinRequestAlerts] = useState('immediate');
  const [showFaceSettings, setShowFaceSettings] = useState(false);

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

      toast.success('Settings saved successfully', {
        description: 'Your preferences have been updated.',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings', {
        description: 'Please try again or contact support.',
      });
    }
  };

  const handleTestNotification = () => {
    if (notificationsEnabled) {
      toast.success('Test notification sent!', {
        description: 'This is how your notifications will appear.',
      });
    } else {
      toast.error('Notifications are disabled', {
        description: 'Enable notifications first to test them.',
      });
    }
  };

  if (showFaceSettings) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <FaceVerificationSettings />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your course and attendance preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Attendance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Attendance Settings
            </CardTitle>
            <CardDescription>
              Configure default settings for attendance sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="session-duration">
                  Default Session Duration
                </Label>
                <Select
                  value={sessionDuration}
                  onValueChange={setSessionDuration}
                >
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
          </CardContent>
        </Card>

        {/* Web Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              Web Push Notifications
            </CardTitle>
            <CardDescription>
              Get real-time notifications about lectures and student activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="notifications-enabled">
                  Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser notifications for important events
                </p>
              </div>
              <Switch
                id="notifications-enabled"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {notificationsEnabled && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
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
                  <p className="text-sm text-muted-foreground">
                    How early to remind you about upcoming lectures
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    What students see if you don&apos;t confirm lecture status
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Test Notification
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Face Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Face Verification
            </CardTitle>
            <CardDescription>
              Enhanced security with facial recognition for attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="face-verification">
                  Enable Face Verification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require students to verify their identity with facial
                  recognition
                </p>
              </div>
              <Switch
                id="face-verification"
                checked={faceVerificationEnabled}
                onCheckedChange={setFaceVerificationEnabled}
              />
            </div>

            {faceVerificationEnabled && (
              <div className="pl-4 border-l-2 border-primary/20">
                <Button
                  variant="outline"
                  onClick={() => setShowFaceSettings(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configure Face Verification
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-600" />
              Communication Preferences
            </CardTitle>
            <CardDescription>
              Configure how you receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your account security and data privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Data Export</Label>
                <p className="text-sm text-muted-foreground">
                  Download your course and attendance data
                </p>
              </div>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isUpdatingOverride}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isUpdatingOverride ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LecturerSettings;
