// import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';

/**
 * A custom hook that handles user authentication status and redirects
 * the user to the appropriate page based on their onboarding status,
 * using Tanstack Query for data fetching.
 */
export function useStudentDashboardRedirect() {
  const navigate = useNavigate();

  // Use useQuery to fetch the onboard status
  const {
    data: onboardStatus,
    isLoading,
    isError,
    error,
  } = useQuery(convexQuery(api.userProfile.getUserOnboardedStatus, {}));

  if (!isLoading || onboardStatus !== undefined) {
    if (onboardStatus === null) {
      navigate({
        to: '/login',
        replace: true,
      });
    } else if (onboardStatus && onboardStatus.isOnboarded === false) {
      navigate({
        to: '/onboard',
        replace: true,
      });
    }
  }

  return {
    data: onboardStatus,
    isLoading,
    isError,
    error,
  };
}
