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
import { Bell, Shield, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const StudentSettings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      attendanceReminders: true,
      courseUpdates: true,
      joinRequestUpdates: true,
      generalAnnouncements: false,
    },
    preferences: {
      theme: 'light',
      language: 'english',
      timeFormat: '12h',
    },
    privacy: {
      profileVisibility: 'friends',
      showAttendanceStats: true,
      allowMessages: true,
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

  const updatePreferenceSetting = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key: string, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.preferences.theme}
                onValueChange={(value) =>
                  updatePreferenceSetting('theme', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.preferences.language}
                onValueChange={(value) =>
                  updatePreferenceSetting('language', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hausa">Hausa</SelectItem>
                  <SelectItem value="igbo">Igbo</SelectItem>
                  <SelectItem value="yoruba">Yoruba</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select
                value={settings.preferences.timeFormat}
                onValueChange={(value) =>
                  updatePreferenceSetting('timeFormat', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-chart-4" />
            <CardTitle>Privacy & Security</CardTitle>
          </div>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select
              value={settings.privacy.profileVisibility}
              onValueChange={(value) =>
                updatePrivacySetting('profileVisibility', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-stats">Show Attendance Statistics</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your attendance statistics
              </p>
            </div>
            <Switch
              id="show-stats"
              checked={settings.privacy.showAttendanceStats}
              onCheckedChange={(checked) =>
                updatePrivacySetting('showAttendanceStats', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow-messages">Allow Messages</Label>
              <p className="text-sm text-muted-foreground">
                Allow lecturers and students to message you
              </p>
            </div>
            <Switch
              id="allow-messages"
              checked={settings.privacy.allowMessages}
              onCheckedChange={(checked) =>
                updatePrivacySetting('allowMessages', checked)
              }
            />
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
              Change Password
            </Button>
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
