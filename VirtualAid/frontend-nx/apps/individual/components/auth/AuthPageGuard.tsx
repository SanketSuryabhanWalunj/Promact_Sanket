/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jwt_decode from 'jwt-decode';

import { getUtcUnixTimeStampInSeconds } from '@virtual-aid-frontend/utils';
import { decodedToken } from '../../types/jwt';
import FullPageSpinner from '../spinner/FullPageSpinner';

const AuthPageGuard = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const removeAndRedirect = useCallback(() => {
    window.localStorage.removeItem(process.env.NEXT_PUBLIC_USER!);
    router.replace('/login');
  }, [router]);

  useEffect(() => {
    const userData = localStorage.getItem(process.env.NEXT_PUBLIC_USER!);

    const currentUTCSeconds = getUtcUnixTimeStampInSeconds();

    try {
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData.token) {
          const decodedToken = jwt_decode(parsedUserData.token) as decodedToken;
          if (decodedToken?.exp && decodedToken?.exp > currentUTCSeconds) {
            setLoading(false);
          } else {
            removeAndRedirect();
          }
        } else {
          removeAndRedirect();
        }
      } else {
        removeAndRedirect();
      }
    } catch (error) {
      removeAndRedirect();
    }
  }, [router, removeAndRedirect]);

  if (loading) {
    <FullPageSpinner />;
  } else {
    return <>{children}</>;
  }
};

export default AuthPageGuard;
