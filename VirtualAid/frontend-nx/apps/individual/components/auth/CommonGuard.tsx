/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jwt_decode from 'jwt-decode';

import { getUtcUnixTimeStampInSeconds } from '@virtual-aid-frontend/utils';
import { decodedToken } from '../../types/jwt';
import FullPageSpinner from '../spinner/FullPageSpinner';

const CommonPageGuard = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    useEffect(() => {
        const userData = localStorage.getItem(process.env.NEXT_PUBLIC_USER!);
    
        const currentUTCSeconds = getUtcUnixTimeStampInSeconds();
    
       
      }, [router]);
    return <>{children}</>;
  
};

export default CommonPageGuard;
