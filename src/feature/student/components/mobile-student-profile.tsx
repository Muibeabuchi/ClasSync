import { useState } from 'react';
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  TrendingUp,
  Edit3,
  Save,
  Camera,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

interface MobileStudentProfileProps {
  onOpenSettings?: () => void;
}

const MobileStudentProfile = ({
  onOpenSettings,
}: MobileStudentProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Mock student data
  const [studentData, setStudentData] = useState({
    fullName: 'John Doe',
    regNumber: '20CS/2021/1234',
    email: 'john.doe@student.futo.edu.ng',
    phone: '+234 801 234 5678',
    department: 'Computer Science',
    faculty: 'School of Physical Sciences',
    yearLevel: '400',
    address: 'Block A, Room 15, Student Hostel',
    dateOfBirth: '1999-05-15',
    gender: 'Male',
    profileImage: '',
  });

  const academicInfo = {
    currentGPA: '3.85',
    totalCourses: 3,
    averageAttendance: 92,
    academicYear: '2024/2025',
    semester: 'Harmattan',
  };

  const handleSave = () => {
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleImageUpload = () => {
    toast.info('Image upload feature coming soon');
  };

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
            >
              {isEditing ? (
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
                  <AvatarImage src={studentData.profileImage} />
                  <AvatarFallback className="text-2xl">
                    {studentData.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={handleImageUpload}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <h2 className="mobile-text-xl font-bold">
                  {studentData.fullName}
                </h2>
                <p className="mobile-text-base text-muted-foreground">
                  {studentData.regNumber}
                </p>
                <Badge variant="secondary" className="mobile-text-sm">
                  {studentData.yearLevel} Level
                </Badge>
              </div>

              <div className="text-center space-y-1">
                <p className="mobile-text-sm font-medium">
                  {studentData.department}
                </p>
                <p className="mobile-text-xs text-muted-foreground">
                  {studentData.faculty}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="mobile-text-2xl font-bold">
                  {academicInfo.totalCourses}
                </p>
                <p className="mobile-text-sm text-muted-foreground">Courses</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="mobile-text-2xl font-bold">
                  {academicInfo.averageAttendance}%
                </p>
                <p className="mobile-text-sm text-muted-foreground">
                  Attendance
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Academic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="mobile-text-lg">
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="mobile-p-sm bg-primary/5 rounded-lg">
                <p className="mobile-text-xs text-muted-foreground mb-1">
                  Academic Year
                </p>
                <p className="mobile-text-sm font-semibold text-primary">
                  {academicInfo.academicYear}
                </p>
              </div>
              <div className="mobile-p-sm bg-green-50 rounded-lg">
                <p className="mobile-text-xs text-muted-foreground mb-1">
                  Semester
                </p>
                <p className="mobile-text-sm font-semibold text-green-700">
                  {academicInfo.semester}
                </p>
              </div>
              <div className="mobile-p-sm bg-blue-50 rounded-lg">
                <p className="mobile-text-xs text-muted-foreground mb-1">
                  Current GPA
                </p>
                <p className="mobile-text-sm font-semibold text-blue-700">
                  {academicInfo.currentGPA}
                </p>
              </div>
              <div className="mobile-p-sm bg-purple-50 rounded-lg">
                <p className="mobile-text-xs text-muted-foreground mb-1">
                  Year Level
                </p>
                <p className="mobile-text-sm font-semibold text-purple-700">
                  {studentData.yearLevel} Level
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
                  value={studentData.fullName}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      fullName: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="pl-10 min-h-[48px]"
                />
              </div>
            </div>

            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="regNumber" className="mobile-text-sm font-medium">
                Registration Number
              </Label>
              <Input
                id="regNumber"
                value={studentData.regNumber}
                disabled
                className="bg-muted touch-target-min"
              />
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
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={studentData.email}
                  onChange={(e) =>
                    setStudentData({ ...studentData, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className="pl-10 touch-target-min"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="mobile-text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={studentData.phone}
                  onChange={(e) =>
                    setStudentData({ ...studentData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className="pl-10 touch-target-min"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label
                htmlFor="dateOfBirth"
                className="mobile-text-sm font-medium"
              >
                Date of Birth
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={studentData.dateOfBirth}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      dateOfBirth: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="pl-10 touch-target-min"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="mobile-text-sm font-medium">
                Gender
              </Label>
              <Input
                id="gender"
                type="text"
                inputMode="text"
                value={studentData.gender}
                onChange={(e) =>
                  setStudentData({ ...studentData, gender: e.target.value })
                }
                disabled={!isEditing}
                className="touch-target-min"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="mobile-text-sm font-medium">
                Address
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  type="text"
                  inputMode="text"
                  autoComplete="street-address"
                  value={studentData.address}
                  onChange={(e) =>
                    setStudentData({ ...studentData, address: e.target.value })
                  }
                  disabled={!isEditing}
                  className="pl-10 touch-target-min"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileStudentProfile;
