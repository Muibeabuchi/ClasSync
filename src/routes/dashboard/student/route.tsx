import StudentDashboard from '@/feature/student/components/student-dashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/student')({
  component: RouteComponent,
});

const userData = {
  fullName: 'Dachiksta',
  regNumber: '20201248252',
  department: 'SOE',
  yearLevel: '200',
};

function RouteComponent() {
  return <StudentDashboard userData={userData} />;
}
