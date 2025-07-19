import { PlanFeatures } from '@/types/subscription-plan';

export const plans: PlanFeatures[] = [
  {
    name: 'Free',
    monthlyFee: 0,
    maxCourses: 2,
    maxStudentsPerCourse: 50,
    attendanceSessionsPerMonth: 5,
    pushNotifications: false,
    csvUpload: false,
  },
  {
    name: 'Basic',
    monthlyFee: 3999,
    maxCourses: 5,
    maxStudentsPerCourse: 100,
    attendanceSessionsPerMonth: 50,
    pushNotifications: true,
    csvUpload: true,
  },
  {
    name: 'Pro',
    monthlyFee: 7999,
    maxCourses: Infinity,
    maxStudentsPerCourse: Infinity,
    attendanceSessionsPerMonth: Infinity,
    pushNotifications: true,
    csvUpload: true,
  },
];
