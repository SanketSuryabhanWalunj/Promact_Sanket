import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { ReactNode } from 'react';
import { useRouter } from 'next/router';

import PaymentLayout from '../../../layouts/components/Header';

import { useTranslation } from 'next-i18next';

const PaymentFailed = () => {
  const router = useRouter();

  const { t, ready } = useTranslation(['payment', 'common']);

  const onTryAgainClick = () => {
    router.replace('/cart');
  };

  if (!ready) {
    return <></>;
  }

  return (
    <>
      <Box
        sx={{
          textAlign: 'center',
          height: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <img src="/failed.png" alt="" style={{ marginBottom: '12px' }} />
        <Typography
          sx={{
            color: '#000',
            fontSize: '30px',
            marginBottom: '12px',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            margiBottom: '12px',
          }}
        >
          {t('ohNo')}
        </Typography>

        <Typography
          sx={{
            color: '#666666',
            fontSize: '18px',
            fontFamily: 'Open Sans, Regular',
            marginBottom: '66px',
          }}
        >
          {t('errorInPayment')}
        </Typography>
        <Button
          onClick={onTryAgainClick}
          sx={{
            color: '#ffffff',
            fontSize: '18px',
            fontFamily: "'Outfit', sans-serif",
            minWidth: '320px',
            margin: '0 auto',
            background: '#F35F5F',
            borderRadius: '7px',
            '&:hover': {
              background: '#F35F5F',
              color: '#fff',
            },
          }}
        >
          {t('common:action.tryAgain')}
        </Button>
      </Box>
    </>
  );
};

PaymentFailed.authGuard = true;

PaymentFailed.getLayout = (page: ReactNode) => (
  <PaymentLayout>{page}</PaymentLayout>
);

export default PaymentFailed;
