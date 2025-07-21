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
import {
  Bell,
  Shield,
  Smartphone,
  ChevronRight,
  Moon,
  Globe,
  Clock,
  Eye,
  MessageSquare,
  BarChart3,
  Key,
  Download,
  Trash2,
  Save,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface MobileStudentSettingsProps {
  onBack?: () => void;
}

const MobileStudentSettings = ({ onBack }: MobileStudentSettingsProps) => {
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
    toast.success('Settings saved successfully');
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

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    children,
    action,
  }: {
    icon: any;
    title: string;
    description?: string;
    children?: React.ReactNode;
    action?: () => void;
  }) => (
    <div
      className={`flex items-center justify-between p-4 ${
        action ? 'cursor-pointer active:bg-muted/50' : ''
      } transition-colors`}
      onClick={action}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className="p-2 bg-muted rounded-full">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {children}
        {action && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onBack}
                className="min-h-[48px] px-3"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
          <Button size="sm" onClick={handleSave} className="min-h-[48px] px-4">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="pb-20">
        {/* Notifications Section */}
        <div className="mt-4">
          <div className="px-4 py-2">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Control which notifications you receive
            </p>
          </div>

          <Card className="mx-4 mb-6">
            <CardContent className="p-0">
              <SettingItem
                icon={Bell}
                title="Attendance Reminders"
                description="Get notified when attendance sessions are active"
              >
                <Switch
                  checked={settings.notifications.attendanceReminders}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting('attendanceReminders', checked)
                  }
                />
              </SettingItem>

              <div className="border-t border-border">
                <SettingItem
                  icon={BookOpen}
                  title="Course Updates"
                  description="Receive updates about your enrolled courses"
                >
                  <Switch
                    checked={settings.notifications.courseUpdates}
                    onCheckedChange={(checked) =>
                      updateNotificationSetting('courseUpdates', checked)
                    }
                  />
                </SettingItem>
              </div>

              <div className="border-t border-border">
                <SettingItem
                  icon={MessageSquare}
                  title="Join Request Updates"
                  description="Get notified about join request status changes"
                >
                  <Switch
                    checked={settings.notifications.joinRequestUpdates}
                    onCheckedChange={(checked) =>
                      updateNotificationSetting('joinRequestUpdates', checked)
                    }
                  />
                </SettingItem>
              </div>

              <div className="border-t border-border">
                <SettingItem
                  icon={Smartphone}
                  title="General Announcements"
                  description="Receive general announcements from the system"
                >
                  <Switch
                    checked={settings.notifications.generalAnnouncements}
                    onCheckedChange={(checked) =>
                      updateNotificationSetting('generalAnnouncements', checked)
                    }
                  />
                </SettingItem>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Preferences Section */}
        <div>
          <div className="px-4 py-2">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">App Preferences</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Customize how the app looks and behaves
            </p>
          </div>

          <Card className="mx-4 mb-6">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-muted rounded-full">
                    <Moon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="font-medium text-sm">Theme</Label>
                  </div>
                </div>
                <Select
                  value={settings.preferences.theme}
                  onValueChange={(value) =>
                    updatePreferenceSetting('theme', value)
                  }
                >
                  <SelectTrigger className="min-h-[48px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-border p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-muted rounded-full">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="font-medium text-sm">Language</Label>
                  </div>
                </div>
                <Select
                  value={settings.preferences.language}
                  onValueChange={(value) =>
                    updatePreferenceSetting('language', value)
                  }
                >
                  <SelectTrigger className="min-h-[48px]">
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

              <div className="border-t border-border p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-muted rounded-full">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="font-medium text-sm">Time Format</Label>
                  </div>
                </div>
                <Select
                  value={settings.preferences.timeFormat}
                  onValueChange={(value) =>
                    updatePreferenceSetting('timeFormat', value)
                  }
                >
                  <SelectTrigger className="min-h-[48px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 Hour</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy & Security Section */}
        <div>
          <div className="px-4 py-2">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">Privacy & Security</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Control your privacy and data sharing preferences
            </p>
          </div>

          <Card className="mx-4 mb-6">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-muted rounded-full">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label className="font-medium text-sm">
                      Profile Visibility
                    </Label>
                  </div>
                </div>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) =>
                    updatePrivacySetting('profileVisibility', value)
                  }
                >
                  <SelectTrigger className="min-h-[48px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-border">
                <SettingItem
                  icon={BarChart3}
                  title="Show Attendance Statistics"
                  description="Allow others to see your attendance statistics"
                >
                  <Switch
                    checked={settings.privacy.showAttendanceStats}
                    onCheckedChange={(checked) =>
                      updatePrivacySetting('showAttendanceStats', checked)
                    }
                  />
                </SettingItem>
              </div>

              <div className="border-t border-border">
                <SettingItem
                  icon={MessageSquare}
                  title="Allow Messages"
                  description="Allow lecturers and students to message you"
                >
                  <Switch
                    checked={settings.privacy.allowMessages}
                    onCheckedChange={(checked) =>
                      updatePrivacySetting('allowMessages', checked)
                    }
                  />
                </SettingItem>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions Section */}
        <div>
          <div className="px-4 py-2">
            <h2 className="text-lg font-semibold mb-2">Account Actions</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account settings
            </p>
          </div>

          <Card className="mx-4 mb-6">
            <CardContent className="p-0">
              <SettingItem
                icon={Key}
                title="Change Password"
                description="Update your account password"
                action={() => toast.info('Password change feature coming soon')}
              />

              <div className="border-t border-border">
                <SettingItem
                  icon={Download}
                  title="Download My Data"
                  description="Export your personal data"
                  action={() => toast.info('Data export feature coming soon')}
                />
              </div>

              <div className="border-t border-border">
                <SettingItem
                  icon={Trash2}
                  title="Delete Account"
                  description="Permanently delete your account"
                  action={() =>
                    toast.error('Account deletion requires confirmation')
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MobileStudentSettings;
