import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, X } from 'lucide-react';
import { CancelModal } from './cancel-modal';
import { type UserRoleType } from '../schema/onboarding-schema';
import { useUpdateUserRole } from '../api/api-hooks';
// import { UserRoleType } from '../schema/onboarding-schema';

export const RoleSelect = ({
  handleConfirmCancel,
}: {
  handleConfirmCancel: () => void;
}) => {
  const navigate = useNavigate();
  const { mutateAsync: updateUserRole, isPending: updatingUserRole } =
    useUpdateUserRole();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleRoleSelect = async (role: UserRoleType) => {
    if (updatingUserRole) return;
    // make a call to the backend and store the users role
    await updateUserRole({
      role,
    });
    // navigate the user to the role page
    navigate({
      to: '/role',
    });
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">ClassSync</h1>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome to ClassSync
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose your role to get started with smart attendance management
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Lecturer Card */}
            <Card
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50"
              onClick={() => handleRoleSelect('lecturer')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">👨‍🏫 Lecturer</CardTitle>
                <CardDescription className="text-base">
                  Manage courses, track attendance, and engage with students
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-primary" />
                    Create and manage courses
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-primary" />
                    Track student attendance
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-primary" />
                    Generate reports and analytics
                  </li>
                </ul>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={updatingUserRole}
                >
                  Continue as Lecturer
                </Button>
              </CardContent>
            </Card>

            {/* Student Card */}
            <Card
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-chart-2/50"
              onClick={() => handleRoleSelect('student')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-chart-2" />
                </div>
                <CardTitle className="text-xl">🎓 Student</CardTitle>
                <CardDescription className="text-base">
                  Join courses, mark attendance, and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-chart-2" />
                    Join courses with unique codes
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-chart-2" />
                    Mark your attendance
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-chart-2" />
                    View attendance history
                  </li>
                </ul>
                <Button
                  className="w-full bg-chart-2 hover:bg-chart-2/90"
                  size="lg"
                  disabled={updatingUserRole}
                >
                  Continue as Student
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Cancel Button */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Setup
            </Button>
          </div>
        </div>
      </div>

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};
