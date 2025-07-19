export type PlanName = 'Free' | 'Basic' | 'Pro';

export type PlanFeatures = {
  name: PlanName;
  monthlyFee: number;
  maxCourses: number;
  maxStudentsPerCourse: number;
  attendanceSessionsPerMonth: number;
  pushNotifications: boolean;
  csvUpload: boolean;
};
