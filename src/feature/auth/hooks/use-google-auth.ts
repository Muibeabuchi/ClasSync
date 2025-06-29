import { authClient } from '@/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';

export const useGoogleSignIn = () => {
  async function signIn() {
    return await authClient.signIn.social({
      provider: 'google',
      newUserCallbackURL: '/onboard',
      callbackURL: '/dashboard',
    });
  }
  return signIn;
};

export const useSignOut = () => {
  const navigate = useNavigate();
  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: '/login',
          }); // redirect to login page
        },
      },
    });
  }

  return signOut;
};
