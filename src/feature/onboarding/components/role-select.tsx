import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Users,
  X,
  CheckCircle,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { CancelModal } from './cancel-modal';
import { type UserRoleType } from '../schema/onboarding-schema';
import { useUpdateUserRole } from '../api/api-hooks';

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
    await updateUserRole({ role });
    navigate({ to: '/role' });
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col">
      <div className="flex-1 px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3">
                <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-accent-foreground rounded-full"></div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Welcome to Classynk! 🎉
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-sm lg:max-w-md mx-auto leading-relaxed">
            Let&apos;s get you set up with the perfect role for your journey
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="max-w-md lg:max-w-4xl mx-auto space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Lecturer Card */}
          <div className="group relative cursor-pointer transition-all duration-300 active:scale-95">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-card border-2 border-border group-hover:border-primary/30 rounded-3xl p-6 shadow-sm group-hover:shadow-xl transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      Lecturer
                    </h3>
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    Create courses, track attendance, and manage your classroom
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      <span>Create & manage courses</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 text-primary" />
                      <span>Track student attendance</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <BarChart3 className="w-3 h-3 text-primary" />
                      <span>Generate detailed reports</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                className="w-full mt-6 rounded-2xl font-semibold transition-all duration-300 group-hover:shadow-lg cursor-pointer"
                size="lg"
                disabled={updatingUserRole}
                onClick={() => handleRoleSelect('lecturer')}
              >
                Continue as Lecturer
              </Button>
            </div>
          </div>

          {/* Student Card */}
          <div className="group relative cursor-pointer transition-all duration-300 active:scale-95">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-secondary/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-card border-2 border-border group-hover:border-secondary/30 rounded-3xl p-6 shadow-sm group-hover:shadow-xl transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      Student
                    </h3>
                    <span className="text-2xl">🎓</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    Join courses, mark attendance, and track your progress
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-secondary-foreground" />
                      <span>Join courses with codes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 text-secondary-foreground" />
                      <span>Mark your attendance</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <BarChart3 className="w-3 h-3 text-secondary-foreground" />
                      <span>View attendance history</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                className="w-full mt-6 cursor-pointer rounded-2xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-300 group-hover:shadow-lg"
                size="lg"
                disabled={updatingUserRole}
                onClick={() => handleRoleSelect('student')}
              >
                Continue as Student
              </Button>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-muted-foreground hover:border-border border-transparent border-2 cursor-pointer hover:text-foreground rounded-2xl transition-all duration-300"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Setup
          </Button>
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
