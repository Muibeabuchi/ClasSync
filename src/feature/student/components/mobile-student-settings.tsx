import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
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
  Smartphone,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Download,
  Trash2,
  // Save,
  BookOpen,
  // ArrowLeft,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';

// interface MobileStudentSettingsProps {
//   onBack?: () => void;
// }

const MobileStudentSettings = () => {
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    notifications: {
      attendanceReminders: true,
      courseUpdates: true,
      joinRequestUpdates: true,
      generalAnnouncements: false,
    },
  });

  // const handleSave = () => {
  //   toast.success('Settings saved successfully');
  // };

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

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    children,
    action,
  }: {
    icon: LucideIcon;
    title: string;
    description?: string;
    children?: React.ReactNode;
    action?: () => void;
  }) => (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={`flex items-center justify-between w-full p-4 ${
        action ? 'cursor-pointer active:bg-muted/50' : ''
      } transition-colors text-left`}
      onClick={action}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="p-2 bg-muted rounded-full flex-shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 leading-tight">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        {children}
        {action && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Mobile Header */}
      {/* <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
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
      </div> */}

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
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-muted rounded-full flex-shrink-0">
                    {getThemeIcon(theme)}
                  </div>
                  <div className="flex-1">
                    <Label className="font-medium text-sm">Theme</Label>
                  </div>
                </div>
                <Select
                  value={theme}
                  onValueChange={(value) =>
                    setTheme(value as 'light' | 'dark' | 'system')
                  }
                >
                  <SelectTrigger className="w-full min-h-[48px]">
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
                icon={Download}
                title="Download My Data"
                description="Export your personal data"
                action={() => toast.info('Data export feature coming soon')}
              />

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
