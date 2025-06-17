/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AuthLayout from '../../layouts/components/AuthLayout';
import { ReactNode, useState } from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import { emailRegex } from '@virtual-aid-frontend/utils';

import axios, { isAxiosError } from 'axios';
import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';

import LocaleDropdown from '../../components/locale-dropdown/LocaleDropdown';

interface LoginFormInterface {
  signInEmail: string;
}

const LoginPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSeubmitError] = useState(false);
  const [submitErrorMsg, setSubmitErrorMsg] = useState('');

  const router = useRouter();

  const { t, ready } = useTranslation(['individualAuth', 'common']);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInterface>({
    mode: 'onChange',
    defaultValues: {
      signInEmail: '',
    },
  });

  const onSubmit = async (data: LoginFormInterface) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/log-in-auth-users/generate-otp/${data.signInEmail}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        window.localStorage.setItem(
          process.env.NEXT_PUBLIC_REGISTER_EMAIL!,
          data.signInEmail
        );
        router.push('/verify-account');
      }
    } catch (error) {
      setIsSubmitting(false);
      setIsSeubmitError(true);
      if (isAxiosError(error)) {
        if (
          error?.response?.data?.error?.code === 404 ||
          error?.response?.data?.error?.code === '404'
        ) {
          setSubmitErrorMsg(t('emailNotRegistered'));
        } else if (
          error?.response?.data?.error?.code === 403 ||
          error?.response?.data?.error?.code === '403'
        ) {
          setSubmitErrorMsg(t('accountDisabled'));
        } else if (error?.response?.status === 401) {
          setSubmitErrorMsg(t('accountLocked'));
        } else {
          setSubmitErrorMsg(t('common:error.unspecific'));
        }
      } else {
        setSubmitErrorMsg(t('common:error.unspecific'));
      }
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: { xs: '90%', sm: '50%', md: '280px', lg: '380px' } }}>
          <Box sx={{ mb: { xs: '0', md: '2', lg: '4' } }}>
          <Link href="https://virtualaid.nl/">
            <img src="/logo.png" alt="logo" />
            </Link>
          </Box>
          <Box sx={{ width: '100%', mb: 2 }}>
            <LocaleDropdown />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography
            component="div"
            variant="h6"
            sx={{
              mb: 4,
              fontWeight: 'bold',
              fontSize: '20px',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {ready && t('individualAuth:signinTitle')}
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              rules={{
                required: {
                  value: true,
                  message: t('individualAuth:emailRequiredMsg'),
                },
                pattern: {
                  value: emailRegex,
                  message: t('emailInvalidMsg'),
                },
              }}
              name="signInEmail"
              render={({ field }) => (
                <TextField
                  {...field}
                  label={ready ? t('emailLabel') : ''}
                  fullWidth
                  required
                  sx={{ mb: isSubmitError ? 3 : 7 }}
                  disabled={isSubmitting}
                  error={!!errors['signInEmail']}
                  helperText={
                    errors['signInEmail'] ? errors['signInEmail']?.message : ''
                  }
                />
              )}
            />
            {isSubmitError && (
              <Alert
                severity="error"
                sx={{ mb: { lg: '60px', md: '30px', xs: '10px' } }}
              >
                {submitErrorMsg}
              </Alert>
            )}
            <Button
              type="submit"
              variant="gradient"
              sx={{ width: '100%', mb: 4 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size="1.75rem" />
              ) : ready ? (
                t('getOtp')
              ) : (
                ''
              )}
            </Button>
          </form>

          <Box>
            <center>
              <Typography variant="subtitle1" component="span">
                {ready && t('noAccount')}
              </Typography>
              <Typography
                variant="subtitle1"
                component="span"
                sx={{ marginLeft: '5px' }}
              >
                <Link href="/register">{ready && t('signUp')}</Link>
              </Typography>
            </center>
          </Box>
        </Box>
      </Box>
    </>
  );
};

LoginPage.getLayout = (page: ReactNode) => <AuthLayout>{page}</AuthLayout>;

LoginPage.guestGuard = true;

export default LoginPage;
