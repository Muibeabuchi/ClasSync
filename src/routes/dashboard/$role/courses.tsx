import MyCoursesPage from '@/feature/lecturer/components/MyCoursesPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/$role/courses')({
  component: RouteComponent,
});

function RouteComponent() {
  return <MyCoursesPage />;
}
