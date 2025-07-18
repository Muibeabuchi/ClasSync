import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Settings,
  Clock,
  MapPin,
  Bell,
  Shield,
  Save,
  ArrowLeft,
  Info,
  AlertTriangle,
} from 'lucide-react';
// import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// import { toast } from "sonner";

interface EnhancedSettingsPageProps {
  onBack: () => void;
}

const EnhancedSettingsPage = ({ onBack }: EnhancedSettingsPageProps) => {
  const [settings, setSettings] = useState({
    // Attendance Settings
    defaultDuration: 60, // seconds
    gpsRadius: 50, // meters
    requireLocation: true,
    allowLateCheckin: false,

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    joinRequestAlerts: 'immediate',
    attendanceReminders: true,

    // Security Settings
    requireAttendanceCode: false,
    autoGenerateCode: true,
    sessionTimeout: 300, // seconds

    // System Settings
    darkMode: true,
    language: 'en',
    timezone: 'UTC',
  });

  const [isSystemLocked] = useState({
    duration: false,
    gpsRadius: false,
  });

  // const { toast } = useToast();

  const handleSave = () => {
    // Validate settings
    if (settings.defaultDuration < 60) {
      // toast({
      //   title: "Invalid Duration",
      //   description: "Minimum attendance duration is 1 minute (60 seconds).",
      //   variant: "destructive"
      // });
      return;
    }

    if (settings.gpsRadius < 50) {
      // toast({
      //   title: "Invalid GPS Radius",
      //   description: "Minimum GPS radius is 50 meters.",
      //   variant: "destructive"
      // });
      return;
    }

    // toast({
    //   title: "Settings Saved",
    //   description: "Your preferences have been updated successfully.",
    // });
  };

  const resetToDefaults = () => {
    setSettings({
      defaultDuration: 60,
      gpsRadius: 50,
      requireLocation: true,
      allowLateCheckin: false,
      emailNotifications: true,
      pushNotifications: true,
      joinRequestAlerts: 'immediate',
      attendanceReminders: true,
      requireAttendanceCode: false,
      autoGenerateCode: true,
      sessionTimeout: 300,
      darkMode: true,
      language: 'en',
      timezone: 'UTC',
    });

    // toast({
    //   title: "Settings Reset",
    //   description: "All settings have been reset to default values.",
    // });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-slide-in-bottom">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Settings</h1>
              <p className="text-muted-foreground">
                Configure your ClassSync preferences
              </p>
            </div>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attendance Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Attendance Settings
              </CardTitle>
              <CardDescription>
                Configure default attendance session parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Duration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="duration">Default Session Duration</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How long attendance sessions stay active</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="space-y-2">
                  <Slider
                    value={[settings.defaultDuration]}
                    onValueChange={([value]) =>
                      setSettings({ ...settings, defaultDuration: value })
                    }
                    max={300}
                    min={60}
                    step={30}
                    disabled={isSystemLocked.duration}
                    className="flex-1"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>1 min</span>
                    <span className="font-medium">
                      {Math.floor(settings.defaultDuration / 60)}:
                      {(settings.defaultDuration % 60)
                        .toString()
                        .padStart(2, '0')}
                    </span>
                    <span>5 min</span>
                  </div>
                </div>

                {isSystemLocked.duration && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">
                      Duration locked by system administrator
                    </span>
                  </div>
                )}
              </div>

              {/* GPS Radius */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gps-radius">GPS Check-in Radius</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Students must be within this distance to check in</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="space-y-2">
                  <Slider
                    value={[settings.gpsRadius]}
                    onValueChange={([value]) =>
                      setSettings({ ...settings, gpsRadius: value })
                    }
                    max={300}
                    min={50}
                    step={10}
                    disabled={isSystemLocked.gpsRadius}
                    className="flex-1"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>50m</span>
                    <span className="font-medium">{settings.gpsRadius}m</span>
                    <span>300m</span>
                  </div>
                </div>

                {isSystemLocked.gpsRadius && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">
                      GPS radius locked by system administrator
                    </span>
                  </div>
                )}
              </div>

              {/* Location & Late Check-in */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-chart-2" />
                    <div>
                      <Label htmlFor="require-location">
                        Require Location Verification
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Students must be physically present to check in
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="require-location"
                    checked={settings.requireLocation}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, requireLocation: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="allow-late">Allow Late Check-in</Label>
                    <p className="text-sm text-muted-foreground">
                      Students can check in after session ends
                    </p>
                  </div>
                  <Switch
                    id="allow-late"
                    checked={settings.allowLateCheckin}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, allowLateCheckin: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-chart-1" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email & Push Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="push-notif">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser/mobile push notifications
                    </p>
                  </div>
                  <Switch
                    id="push-notif"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pushNotifications: checked })
                    }
                  />
                </div>
              </div>

              {/* Join Request Alerts */}
              <div className="space-y-2">
                <Label>Join Request Alerts</Label>
                <Select
                  value={settings.joinRequestAlerts}
                  onValueChange={(value) =>
                    setSettings({ ...settings, joinRequestAlerts: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly digest</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                    <SelectItem value="weekly">Weekly digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Attendance Reminders */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="attendance-reminders">
                    Attendance Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Remind you to take attendance
                  </p>
                </div>
                <Switch
                  id="attendance-reminders"
                  checked={settings.attendanceReminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, attendanceReminders: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-chart-3" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and authentication options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="require-code">
                    Require Attendance Code by Default
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    New sessions will require attendance codes
                  </p>
                </div>
                <Switch
                  id="require-code"
                  checked={settings.requireAttendanceCode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireAttendanceCode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="auto-generate">
                    Auto-generate Attendance Codes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create new codes for each session
                  </p>
                </div>
                <Switch
                  id="auto-generate"
                  checked={settings.autoGenerateCode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoGenerateCode: checked })
                  }
                  disabled={!settings.requireAttendanceCode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">
                  Session Timeout (minutes)
                </Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min="5"
                  max="60"
                  value={Math.floor(settings.sessionTimeout / 60)}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sessionTimeout: parseInt(e.target.value) * 60,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Automatically end sessions after this duration
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-chart-4" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme throughout the application
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, darkMode: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    setSettings({ ...settings, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings({ ...settings, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">
                      Eastern Time
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedSettingsPage;
