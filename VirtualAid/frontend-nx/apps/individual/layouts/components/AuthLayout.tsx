import { ReactNode } from 'react';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslation } from 'next-i18next';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { t, ready } = useTranslation(['individualAuth']);

  return (
    <>
      <Grid
        container
        className="login-layout"
        component="main"
        sx={{ height: '100vh' }}
      >
        <Grid
          item
          xs={false}
          md={7}
          sx={{
            backgroundImage: 'url("/login_bg.png")',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light'
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
          }}
        >
          {ready && (
            <div className="rect">
              <div className="testimonial-content">
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: {
                      xs: '14px',
                      md: '16px',
                      lg: '20px',
                      xl: '26px',
                      fontFamily: "'Open Sans', sans-serif",
                      margin: '0 40px',
                      lineHeight: '30px',
                      fontWeight: 'normal',
                    },
                  }}
                >
                  {t('authPageSideText')}
                   <Typography sx={{marginTop: '15px', fontWeight: 'bold',fontFamily: "'Open Sans', sans-serif"}}>
                       John Smith 
                   </Typography>
                   <Typography sx={{marginTop: '10px',fontFamily: "'Open Sans', sans-serif"}}>Manager, Airbnb</Typography>
                </Typography>
              </div>
            </div>
          )}
          <Box
            className="client-photo"
            sx={{
              position: 'absolute',
              bottom: { md: '0', lg: '0', xl: '-7px' },
              left: '126px',
              display: { xs: 'none', md: 'none', xl: 'block', lg: 'block' },
            }}
          >
            <img src="/person.svg" alt="" />
          </Box>
        </Grid>
        <Grid item xs={12} md={5}>
          {children}
        </Grid>
      </Grid>
    </>
  );
};

export default AuthLayout;
