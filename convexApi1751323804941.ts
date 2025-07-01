import { type FunctionReference, anyApi } from 'convex/server';
// import { type GenericId as Id } from "convex/values";

export const api: PublicApiType = anyApi as unknown as PublicApiType;
export const internal: InternalApiType = anyApi as unknown as InternalApiType;

export type PublicApiType = {
  userProfile: {
    completeUserOnboarding: FunctionReference<
      'mutation',
      'public',
      {
        department?: string;
        faculty?: string;
        fullName: string;
        gender?: 'male' | 'female';
        registrationNumber?: string;
        title?: 'Dr' | 'Prof' | 'Engr' | 'Mr' | 'Mrs';
        yearLevel?: '100' | '200' | '300' | '400' | '500';
      },
      { message: string; success: boolean }
    >;
    getUserOnboardedStatus: FunctionReference<
      'query',
      'public',
      any,
      boolean | null
    >;
    updateUserOnboardedStatus: FunctionReference<
      'mutation',
      'public',
      { isOnboarded: boolean },
      any
    >;
    updateUserRole: FunctionReference<
      'mutation',
      'public',
      { role: 'student' | 'lecturer' },
      'student' | 'lecturer'
    >;
    getAuthenticatedUser: FunctionReference<
      'query',
      'public',
      Record<string, never>,
      any
    >;
    getUserRole: FunctionReference<
      'query',
      'public',
      Record<string, never>,
      'student' | 'lecturer' | null
    >;
  };
};
export type InternalApiType = {};
