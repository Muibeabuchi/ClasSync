import { useState } from 'react';
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
import { ArrowLeft, MapPin, Clock, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsPageProps {
  onBack: () => void;
}

const LecturerSettingsPage = ({ onBack }: SettingsPageProps) => {
  const [gpsRadius, setGpsRadius] = useState('20');
  const [timeLimit, setTimeLimit] = useState('15');

  const handleSave = () => {
    toast.success(
      'Settings Saved Your preferences have been updated successfully.',
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:scale-110 transition-transform"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Configure your course and attendance preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Attendance Settings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Attendance Settings
            </CardTitle>
            <CardDescription>
              Configure default settings for attendance check-ins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gps-radius">GPS Check-in Radius</Label>
              <Select value={gpsRadius} onValueChange={setGpsRadius}>
                <SelectTrigger>
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 meters</SelectItem>
                  <SelectItem value="20">20 meters</SelectItem>
                  <SelectItem value="50">50 meters</SelectItem>
                  <SelectItem value="100">100 meters</SelectItem>
                  <SelectItem value="200">200 meters</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Students must be within this distance to check in
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-limit">Session Duration</Label>
              <Select value={timeLimit} onValueChange={setTimeLimit}>
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
              <p className="text-sm text-gray-500">
                How long attendance sessions remain open
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Notifications</Label>
              <Select defaultValue="all">
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
              <Select defaultValue="immediate">
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
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="hover:scale-105 transition-transform"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LecturerSettingsPage;
