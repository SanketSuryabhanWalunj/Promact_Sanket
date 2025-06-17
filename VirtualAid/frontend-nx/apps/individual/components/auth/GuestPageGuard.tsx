/* eslint-disable @typescript-eslint/no-non-null-assertion */
import jwt_decode from 'jwt-decode';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';

import { getUtcUnixTimeStampInSeconds } from '@virtual-aid-frontend/utils';
import FullPageSpinner from '../spinner/FullPageSpinner';
import { decodedToken } from '../../types/jwt';

const GuestPageGuard = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem(process.env.NEXT_PUBLIC_USER!);

    const currentUTCSeconds = getUtcUnixTimeStampInSeconds();

    const removeStorage = () => {
      window.localStorage.removeItem(process.env.NEXT_PUBLIC_USER!);
      setLoading(false);
    };

    try {
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData.token) {
          const decodedToken = jwt_decode(parsedUserData.token) as decodedToken;
          if (decodedToken?.exp && decodedToken?.exp > currentUTCSeconds) {
            router.replace('/');
          } else {
            removeStorage();
          }
        } else {
          removeStorage();
        }
      } else {
        removeStorage();
      }
    } catch (error) {
      removeStorage();
    }
  }, [router]);

  if (loading) {
    <FullPageSpinner />;
  } else {
    return <>{children}</>;
  }
};

export default GuestPageGuard;
