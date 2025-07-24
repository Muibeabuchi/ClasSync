import { useGetCurrentUser } from '@/feature/auth/api/get-current-user';
import StudentDashboard from '@/feature/student/components/student-dashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/student')({
  component: RouteComponent,
});

// const userData = {
//   fullName: 'Dachiksta',
//   regNumber: '20201248252',
//   department: 'SOE',
//   yearLevel: '200',
// };

function RouteComponent() {
  const { data } = useGetCurrentUser();
  const userData = {
    fullName: data?.fullName,
    regNumber: data?.registrationNumber,
    profileImage: data?.userImage,
  } as const;

  return <StudentDashboard userData={userData} />;
}
