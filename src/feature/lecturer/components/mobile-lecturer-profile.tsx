import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Edit3,
  Save,
  Camera,
  Settings,
  LogOut,
  Loader2,
  Mail,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetCurrentUser,
  useGetUserProfileImage,
  useUpdateUserProfile,
  useUploadProfileImage,
} from '@/feature/lecturer/api/lecturer-profile';
import { useSignOut } from '@/feature/auth/hooks/use-google-auth';

interface MobileLecturerProfileProps {
  onOpenSettings?: () => void;
}

const MobileLecturerProfile = ({
  onOpenSettings,
}: MobileLecturerProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backend data hooks
  const { data: userData, isLoading: isLoadingUser } = useGetCurrentUser();
  const { data: profileImageUrl, isLoading: isLoadingImage } =
    useGetUserProfileImage();
  const updateProfileMutation = useUpdateUserProfile();
  const uploadImageMutation = useUploadProfileImage();
  const signOut = useSignOut();

  // Form state for editable fields
  const [formData, setFormData] = useState({
    fullName: '',
  });

  // Update form data when user data loads
  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
      });
    }
  }, [userData]);

  const handleSave = async () => {
    if (!userData) return;

    // Check if any data has actually changed
    const hasChanges = formData.fullName !== userData.fullName;

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        fullName: formData.fullName,
      });
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Profile update error:', error);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB.');
      return;
    }

    try {
      await uploadImageMutation.mutateAsync(file);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Image upload error:', error);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // No user data
  if (!userData) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="mobile-text-lg font-semibold">My Profile</h1>
          <div className="flex items-center space-x-2">
            {onOpenSettings && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onOpenSettings}
                className="min-h-[48px] px-3"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="min-h-[48px] px-4"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving
                </>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-6">
        {/* Profile Header Card */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  {isLoadingImage ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <AvatarImage src={profileImageUrl || undefined} />
                  )}
                  <AvatarFallback className="text-2xl">
                    {userData.fullName
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('') || 'L'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-8 w-8 rounded-full p-0"
                  onClick={triggerImageUpload}
                  disabled={uploadImageMutation.isPending}
                >
                  {uploadImageMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-2">
                <h2 className="mobile-text-xl font-bold">
                  {userData.fullName}
                </h2>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Lecturer
                </Badge>
                <p className="mobile-text-base text-muted-foreground">
                  {userData.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="mobile-text-lg">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="mobile-text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  inputMode="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: e.target.value,
                    })
                  }
                  disabled={!isEditing || updateProfileMutation.isPending}
                  className="pl-10 min-h-[48px]"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="mobile-text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={userData.email}
                  disabled
                  className="pl-10 bg-muted min-h-[48px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="mobile-text-sm font-medium">
                Role
              </Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="role"
                  value="Lecturer"
                  disabled
                  className="pl-10 bg-muted min-h-[48px]"
                />
              </div>
            </div>

            {/* Member Since */}
            <div className="space-y-2">
              <Label
                htmlFor="memberSince"
                className="mobile-text-sm font-medium"
              >
                Member Since
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="memberSince"
                  value={new Date(userData._creationTime).toLocaleDateString()}
                  disabled
                  className="pl-10 bg-muted min-h-[48px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="mobile-text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => signOut()}
              className="w-full min-h-[48px] flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileLecturerProfile;
