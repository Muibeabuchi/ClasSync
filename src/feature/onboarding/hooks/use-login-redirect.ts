import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
// import { useQuery } from 'convex/react';

/**
 * A custom hook that handles user authentication status and redirects
 * the user to the appropriate page based on their onboarding status,
 * using Tanstack Query for data fetching.
 *
 * @param {Function} getUserOnboardStatusAction - An async function that
 * returns the user's onboarding status (true, false, or null for unauthenticated).
 */
export function useLoginRedirect() {
  const navigate = useNavigate();

  // Use useQuery to fetch the onboard status
  const {
    data: onboardStatus,
    isError,
    error,
    isLoading,
  } = useQuery(convexQuery(api.userProfile.getUserOnboardedStatus, {}));

  useEffect(() => {
    // Only proceed with redirection logic if data has been fetched and is not loading
    if (!isLoading) {
      if (onboardStatus && onboardStatus.isOnboarded === true) {
        navigate({ to: '/dashboard', replace: true });
      } else if (onboardStatus && onboardStatus.isOnboarded === false) {
        navigate({ to: '/onboard', replace: true });
      }
    }

    // if (isError) {
    //   console.error('Error checking authentication status:', error);
    //   // Handle error, e.g., show an error message or navigate to an error page
    // }
  }, [onboardStatus, isLoading, navigate]); // Dependencies for useEffect

  return {
    onboardStatus,
    isError,
    error,
    isLoading,
  };
}
