import { Link } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      Hello !
      <button className="ml-auto bg-red-400 p-3">
        <Link to="/login">Log in</Link>
      </button>
    </div>
  );
}
