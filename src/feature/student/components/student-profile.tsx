import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetCurrentUser,
  useGetUserProfileImage,
  useUpdateUserProfile,
  useUploadProfileImage,
} from '@/feature/student/api/student-profile';

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backend data hooks
  const { data: userData, isLoading: isLoadingUser } = useGetCurrentUser();
  const { data: profileImageUrl, isLoading: isLoadingImage } =
    useGetUserProfileImage();
  const updateProfileMutation = useUpdateUserProfile();
  const uploadImageMutation = useUploadProfileImage();

  // Form state for editable fields
  const [formData, setFormData] = useState({
    fullName: '',
    registrationNumber: '',
  });

  // Update form data when user data loads
  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        registrationNumber: userData.registrationNumber || '',
      });
    }
  }, [userData]);

  const handleSave = async () => {
    if (!userData) return;

    // Check if any data has actually changed
    const hasChanges =
      formData.fullName !== userData.fullName ||
      formData.registrationNumber !== (userData.registrationNumber || '');

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        fullName: formData.fullName,
        registrationNumber: formData.registrationNumber || undefined,
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // No user data
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Unable to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>
        <Button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          variant={isEditing ? 'default' : 'outline'}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative">
              <Avatar className="w-24 h-24 mx-auto mb-4">
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
                    .join('') || 'U'}
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
            <CardTitle>{userData.fullName}</CardTitle>
            <CardDescription>{userData.email}</CardDescription>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName: e.target.value,
                      })
                    }
                    disabled={!isEditing || updateProfileMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  placeholder="e.g., 202312345"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationNumber: e.target.value,
                    })
                  }
                  disabled={!isEditing || updateProfileMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={userData.gender || 'Not specified'}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
