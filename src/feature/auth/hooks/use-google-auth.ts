import { authClient } from '@/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';

export const useGoogleSignIn = () => {
  async function signIn() {
    return await authClient.signIn.social({
      provider: 'google',
      newUserCallbackURL: '/onboard',
    });
  }
  return signIn;
};

export const useSignOut = () => {
  // const router = useRouter()
  const navigate = useNavigate();
  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: '/',
          }); // redirect to login page
        },
      },
    });
  }

  return signOut;
};
