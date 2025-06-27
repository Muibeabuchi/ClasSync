import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';

/**
 * A custom hook that handles user authentication status and redirects
 * the user to the appropriate page based on their onboarding status,
 * using Tanstack Query for data fetching.
 *
 * @param {Function} getUserOnboardStatusAction - An async function that
 * returns the user's onboarding status (true, false, or null for unauthenticated).
 */
export function useAuthRedirect() {
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
      console.log({ onboardStatus });

      if (onboardStatus === null) {
        console.log('User is not authenticated');
        // You might navigate to a login page here if that's the desired behavior
      } else if (onboardStatus === true) {
        console.log('User is authenticated and has onboarded');
        navigate({ to: '/dashboard' });
      } else if (onboardStatus === false) {
        console.log('User is authenticated and has not onboarded');
        navigate({ to: '/onboard' });
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
