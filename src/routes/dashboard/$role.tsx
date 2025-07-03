import LecturerDashboard from '@/feature/lecturer/components/lecturer-dashboard';
import { UserRoleSchema } from '@/feature/onboarding/schema/onboarding-schema';
import StudentDashboard from '@/feature/student/components/student-dashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/$role')({
  params: {
    parse: UserRoleSchema.parse,
  },
  component: RouteComponent,
});

const userData = {
  fullName: 'Dachiksta',
  regNumber: '20201248252',
  department: 'SOE',
  yearLevel: '200',
};

function RouteComponent() {
  const { role } = Route.useParams();

  if (role === 'student') {
    return <StudentDashboard userData={userData} />;
  }

  return <LecturerDashboard userData={userData} />;
}
