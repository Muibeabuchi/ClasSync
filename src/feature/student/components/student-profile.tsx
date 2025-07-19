import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

const StudentProfile = () => {
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
    toast.success('Your profile information has been saved successfully.');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and academic details
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
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={studentData.profileImage} />
              <AvatarFallback className="text-2xl">
                {studentData.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{studentData.fullName}</CardTitle>
            <CardDescription>{studentData.regNumber}</CardDescription>
            <Badge variant="secondary">{studentData.yearLevel} Level</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {studentData.department}
              </p>
              <p className="text-xs text-muted-foreground/80">
                {studentData.faculty}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <p className="text-lg font-bold text-foreground">
                  {academicInfo.totalCourses}
                </p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                </div>
                <p className="text-lg font-bold text-foreground">
                  {academicInfo.averageAttendance}%
                </p>
                <p className="text-xs text-muted-foreground">Attendance</p>
              </div>
            </div>
          </CardContent>
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
                    value={studentData.fullName}
                    onChange={(e) =>
                      setStudentData({
                        ...studentData,
                        fullName: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <Input
                  id="regNumber"
                  value={studentData.regNumber}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={studentData.email}
                    onChange={(e) =>
                      setStudentData({ ...studentData, email: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={studentData.phone}
                    onChange={(e) =>
                      setStudentData({ ...studentData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={studentData.gender}
                  onChange={(e) =>
                    setStudentData({ ...studentData, gender: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={studentData.address}
                  onChange={(e) =>
                    setStudentData({ ...studentData, address: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
          <CardDescription>
            Your current academic status and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Academic Year
              </p>
              <p className="text-lg font-bold text-primary">
                {academicInfo.academicYear}
              </p>
            </div>
            <div className="text-center p-4 bg-chart-2/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Current Semester
              </p>
              <p className="text-lg font-bold text-chart-2">
                {academicInfo.semester}
              </p>
            </div>
            <div className="text-center p-4 bg-chart-4/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Current GPA</p>
              <p className="text-lg font-bold text-chart-4">
                {academicInfo.currentGPA}
              </p>
            </div>
            <div className="text-center p-4 bg-chart-5/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Year Level</p>
              <p className="text-lg font-bold text-chart-5">
                {studentData.yearLevel} Level
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
