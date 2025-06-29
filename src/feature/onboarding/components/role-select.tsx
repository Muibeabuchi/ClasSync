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
import { UserRoleType } from '../schema/onboarding-schema';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ClassSync
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to ClassSync
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Choose your role to get started with smart attendance management
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Lecturer Card */}
            <Card
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-indigo-300 dark:hover:border-indigo-600"
              onClick={() => handleRoleSelect('lecturer')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-xl">👨‍🏫 Lecturer</CardTitle>
                <CardDescription className="text-base">
                  Manage courses, track attendance, and engage with students
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                    Create and manage courses
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                    Track student attendance
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
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
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-green-300 dark:hover:border-green-600"
              onClick={() => handleRoleSelect('student')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">🎓 Student</CardTitle>
                <CardDescription className="text-base">
                  Join courses, mark attendance, and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                    Join courses with unique codes
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                    Mark your attendance
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                    View attendance history
                  </li>
                </ul>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
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
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
