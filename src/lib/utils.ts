import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { createServerFn } from '@tanstack/react-start';
import { getCookie, getWebRequest } from '@tanstack/react-start/server';
import {
  fetchSession,
  getCookieName,
} from '@convex-dev/better-auth/react-start';
import { createAuth } from '../../convex/auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Server side session request
export const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const sessionCookieName = await getCookieName(createAuth);
  const token = getCookie(sessionCookieName);
  const request = getWebRequest();
  const { session } = await fetchSession(createAuth, request);
  return {
    userId: session?.user.id,
    token,
  };
});
