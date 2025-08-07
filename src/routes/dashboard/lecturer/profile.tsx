import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Calendar,
  //  Settings,
  LogOut,
} from 'lucide-react';
import { useLecturerDashboardRedirect } from '@/feature/onboarding/hooks/use-lecturer-dashboard-redirect';
import { useSignOut } from '@/feature/auth/hooks/use-google-auth';
// import { ThemeDropdownToggle } from '@/components/theme-dropdown-toggle';

export const Route = createFileRoute('/dashboard/lecturer/profile')({
  component: LecturerProfilePage,
});

function LecturerProfilePage() {
  const { data: userData } = useLecturerDashboardRedirect();
  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut();
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData.userImage} />
              <AvatarFallback className="text-lg">
                {userData.fullName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{userData.fullName}</h2>
              <Badge variant="secondary">Lecturer</Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {/* {userData.email} */}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {/* {new Date(userData._creationTime).toLocaleDateString()} */}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <ThemeDropdownToggle />
          </div>
        </CardContent>
      </Card> */}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
