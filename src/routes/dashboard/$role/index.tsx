import { createFileRoute } from '@tanstack/react-router';
import LecturerDashboardContent from '@/feature/lecturer/components/lecturer-dashboard-content';

const userData = {
  fullName: 'Dachiksta',
  regNumber: '20201248252',
  department: 'SOE',
  yearLevel: '200',
};

export const Route = createFileRoute('/dashboard/$role/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <LecturerDashboardContent userData={userData} />;
}
