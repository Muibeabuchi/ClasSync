import { createFileRoute } from '@tanstack/react-router';
import LecturerProfilePage from '@/feature/lecturer/components/lecturer-profile-page';

export const Route = createFileRoute('/dashboard/lecturer/profile')({
  component: LecturerProfilePage,
});
