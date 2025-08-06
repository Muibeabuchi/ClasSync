import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Bell, Smartphone, Moon, Sun, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';

const StudentSettings = () => {
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    notifications: {
      attendanceReminders: true,
      courseUpdates: true,
      joinRequestUpdates: true,
      generalAnnouncements: false,
    },
  });

  const handleSave = () => {
    toast.success('Your preferences have been updated successfully.');
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Customize your ClassSync experience
          </p>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Control which notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="attendance-reminders">Attendance Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when attendance sessions are active
              </p>
            </div>
            <Switch
              id="attendance-reminders"
              checked={settings.notifications.attendanceReminders}
              onCheckedChange={(checked) =>
                updateNotificationSetting('attendanceReminders', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="course-updates">Course Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your enrolled courses
              </p>
            </div>
            <Switch
              id="course-updates"
              checked={settings.notifications.courseUpdates}
              onCheckedChange={(checked) =>
                updateNotificationSetting('courseUpdates', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="join-requests">Join Request Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about join request status changes
              </p>
            </div>
            <Switch
              id="join-requests"
              checked={settings.notifications.joinRequestUpdates}
              onCheckedChange={(checked) =>
                updateNotificationSetting('joinRequestUpdates', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="announcements">General Announcements</Label>
              <p className="text-sm text-muted-foreground">
                Receive general announcements from the system
              </p>
            </div>
            <Switch
              id="announcements"
              checked={settings.notifications.generalAnnouncements}
              onCheckedChange={(checked) =>
                updateNotificationSetting('generalAnnouncements', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-chart-2" />
            <CardTitle>App Preferences</CardTitle>
          </div>
          <CardDescription>
            Customize how the app looks and behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={theme}
              onValueChange={(value) =>
                setTheme(value as 'light' | 'dark' | 'system')
              }
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getThemeIcon(theme)}
                    <span className="capitalize">{theme}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1">
              Download My Data
            </Button>
            <Button variant="destructive" className="flex-1">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSettings;
