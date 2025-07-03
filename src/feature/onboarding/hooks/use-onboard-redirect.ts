import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';

/**
 * A custom hook that handles user authentication status and redirects
 * the user to the appropriate page based on their onboarding status,
 * using Tanstack Query for data fetching.
 */
export function useOnboardRedirect() {
  const navigate = useNavigate();

  // Use useQuery to fetch the onboard status
  const {
    data: onboardStatus,
    isLoading,
    isError,
    error,
  } = useQuery(convexQuery(api.userProfile.getUserOnboardedStatus, {}));

  useEffect(() => {
    // Only proceed with redirection logic if data has been fetched and is not loading
    if (!isLoading) {
      if (onboardStatus === null) {
        navigate({
          to: '/login',
          replace: true,
        });
      }
      if (onboardStatus && onboardStatus.isOnboarded === true) {
        navigate({
          to: '/dashboard',
          replace: true,
        });
      }
    }

    if (isError) {
      console.error('Error checking authentication status:', error);
      // Handle error, e.g., show an error message or navigate to an error page
    }
  }, [onboardStatus, isLoading, isError, error, navigate]); // Dependencies for useEffect

  return {
    data: onboardStatus,
    isLoading,
    isError,
    error,
  };
}
