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
export function useDashboardRedirect() {
  const navigate = useNavigate();

  // Use useQuery to fetch the onboard status
  const {
    data: onboardStatus,
    isLoading,
    isError,
    error,
  } = useQuery(
    convexQuery(api.userProfile.getUserOnboardedStatus, {}),
    // queryKey: ['userOnboardStatus'], // Unique key for this query
    // queryFn: getUserOnboardStatusAction, // The function to fetch the data
    // staleTime: Infinity, // Keep data fresh indefinitely for authentication status
    // cacheTime: Infinity, // Keep data in cache indefinitely
    // // Add any other useQuery options as needed, e.g., refetchOnWindowFocus: false
  );

  useEffect(() => {
    // Only proceed with redirection logic if data has been fetched and is not loading
    if (!isLoading) {
      if (onboardStatus === null) {
        navigate({
          to: '/login',
        });
      } else if (onboardStatus !== null) {
        if (onboardStatus === false) {
          navigate({
            to: '/onboard',
          });
        }
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
