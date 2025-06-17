import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import {
  useState,
  type ReactElement,
  type ReactNode,
  useMemo,
  createContext,
  useEffect,
} from 'react';
import Head from 'next/head';
import './styles.css';

import CssBaseline from '@mui/material/CssBaseline';
import { Direction, ThemeProvider } from '@mui/material/styles';
import customTheme from '../theme/theme';
import ContentDirection from '../theme/contentDirection';

import axios from 'axios';
import InfoContextComponent from '../contexts/InfoContext';
import { Provider } from 'react-redux';
import store from './../store/index';

import GuestPageGuard from '../components/auth/GuestPageGuard';
import AuthPageGuard from '../components/auth/AuthPageGuard';
import CompanyPageGuard from '../components/auth/CompanyPageGuard';
import IndiPageGuard from '../components/auth/IndiPageGuard';

import { appWithTranslation } from 'next-i18next';
import nextI18nConfig from '../next-i18next.config';
import CommonPageGuard from '../components/auth/CommonGuard';
import { useRouter } from 'next/router';

// import InitialAPICallWrapper from '../components/wrapper/InitialAPICallWrapper';

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
  guestGuard?: boolean;
  authGuard?: boolean;
  companyGuard?: boolean;
  individualGuard?: boolean;
  commonGuard?:boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

type guardProps = {
  children: ReactNode;
  guestGuard: boolean | undefined;
  authGuard: boolean | undefined;
  companyGuard: boolean | undefined;
  individualGuard: boolean | undefined;
  commonGuard: boolean | undefined;
};

const Guard = ({
  children,
  guestGuard,
  authGuard,
  companyGuard,
  individualGuard,
  commonGuard,
}: guardProps) => {
  if (guestGuard) {
    return <GuestPageGuard>{children}</GuestPageGuard>;
  } else if (authGuard) {
    return <AuthPageGuard>{children}</AuthPageGuard>;
  } else if (companyGuard) {
    return <CompanyPageGuard>{children}</CompanyPageGuard>;
  } else if (individualGuard) {
    return <IndiPageGuard>{children}</IndiPageGuard>;
  } else if (commonGuard) {
    return <CommonPageGuard>{children}</CommonPageGuard>;
  } else {
    return <>No Page</>;
  }
};

export type DirectionContextType = {
  currentDirection: Direction;
  changeCurrentDirection: (newDirection: Direction) => void;
};

export const DirectionContext = createContext<DirectionContextType>({
  currentDirection: 'ltr',
  changeCurrentDirection: () => null,
});

axios.interceptors.request.use((request) => {
  const authToken = localStorage.getItem(process.env.NEXT_PUBLIC_USER!);
  if (authToken) {
    const parsedAuthToken = JSON.parse(authToken);
    request.headers.Authorization = `Bearer ${parsedAuthToken.token}`;
  }
  return request;
});

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(process.env.NEXT_PUBLIC_USER!);
      if (
        window.location.pathname === '/login' ||
        window.location.pathname === 'register' ||
        window.location.pathname === 'verify-account'
      ) {
        return Promise.reject(error);
      } else {
        return window.location.replace('/login');
      }
    } else if (error.response && error.response.status === 404) {
      if (
        error.response.data.error.message ===
          'There is no entity Company with id = !' ||
        error.response.data.error.messgae ===
          'There is no entity User Details with id = !'
      ) {
        localStorage.removeItem(process.env.NEXT_PUBLIC_USER!);
        return window.location.replace('/login');
      } else {
        return Promise.reject(error);
      }
    } else {
      return Promise.reject(error);
    }

    // Commenting out the code for now. After new API of path /me is created, either it will be uncommented or removed.
    //   else if (error.response && error.response.status === 403) {
    //     localStorage.removeItem(process.env.NEXT_PUBLIC_USER!);
    //     if (
    //       window.location.pathname === '/login' ||
    //       window.location.pathname === '/register' ||
    //       window.location.pathname === '/verify-account'
    //     ) {
    //       return Promise.reject(error);
    //     } else {
    //       return window.location.replace('/login');
    //     }
    // }
  }
);

function CustomApp({ Component, pageProps }: AppPropsWithLayout) {
  const [currentDirection, setCurrentDirection] = useState<Direction>('ltr');

  const getLayout = Component.getLayout ?? ((page) => page);

  const guestGuard = Component.guestGuard;

  const authGuard = Component.authGuard;

  const companyGuard = Component.companyGuard;

  const individualGuard = Component.individualGuard;
  
  const commonGuard = Component.commonGuard;
  const router = useRouter();
  const currentTheme = useMemo(() => {
    const theme = customTheme;
    theme.direction = currentDirection;
    return theme;
  }, [currentDirection]);

  const changeCurrentDirection = (newDirection: Direction) => {
    setCurrentDirection(newDirection);
  };
  useEffect(() => {
    
    if (router.isReady) {
      
      // Determine direction based on locale
      const selectedLocale = router.locale
      
      if (router.locale === 'ar') {
        setCurrentDirection("rtl")
        document.body.classList.add('rtl-dir');
      } else {
        setCurrentDirection("ltr")
        document.body.classList.remove('rtl-dir');
      }
    }

  }, [router.isReady, router.locale]);
  return (
    <>
      <Head>
        <title>VirtualAid</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Provider store={store}>
        <InfoContextComponent>
          <DirectionContext.Provider
            value={{ currentDirection, changeCurrentDirection }}
          >
            <ContentDirection direction={currentDirection}>
              <ThemeProvider theme={currentTheme}>
                <CssBaseline />
                <main className="app">
                  <Guard
                    guestGuard={guestGuard}
                    authGuard={authGuard}
                    companyGuard={companyGuard}
                    individualGuard={individualGuard}
                    commonGuard={commonGuard}
                  >
                    {/* <InitialAPICallWrapper> */}
                    {getLayout(<Component {...pageProps} />)}
                    {/* </InitialAPICallWrapper> */}
                  </Guard>
                </main>
              </ThemeProvider>
            </ContentDirection>
          </DirectionContext.Provider>
        </InfoContextComponent>
      </Provider>
    </>
  );
}

export default appWithTranslation(CustomApp, nextI18nConfig);
