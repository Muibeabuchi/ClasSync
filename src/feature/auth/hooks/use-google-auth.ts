import { authClient } from '@/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';

export const useGoogleSignIn = () => {
  async function signIn() {
    await authClient.signIn.social({
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
    return await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await navigate({
            to: '/login',
          }); // redirect to login page
        },
      },
    });
  }

  return signOut;
};
