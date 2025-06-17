/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import AuthLayout from '../../layouts/components/AuthLayout';

import Box, { BoxProps } from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';

import { styled, useTheme } from '@mui/material/styles';

import Cleave from 'cleave.js/react';

import { Controller, useForm } from 'react-hook-form';

import {
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import 'cleave.js/dist/addons/cleave-phone.us';
import Link from 'next/link';

import axios, { isAxiosError } from 'axios';
import { useRouter } from 'next/router';

import { InfoContext } from '../../contexts/InfoContext';

import { useTranslation } from 'next-i18next';

//Otp Input Style
const CleaveInputWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  '& input': {
    width: '100%',
    background: 'none',
    lineHeight: 1.4375,
    padding: '7.5px 13px',
    borderColor: '#ddd',
    color: theme.palette.text.primary,
    borderRadius: 10,
    fontSize: theme.typography.body1.fontSize,
    fontFamily: theme.typography.body1.fontFamily,
    borderStyle: 'solid',
    '&:focus, &:focus-visible': {
      outline: 0,
      boxShadow: theme.shadows[2],
      borderColor: `${theme.palette.primary.main} !important`,
      '&::placeholder': {
        transform: 'translateX(4px)',
      },
    },
  },
}));

//Otp Input Responsive Style
const CleaveInput = styled(Cleave)(({ theme }) => ({
  maxWidth: 48,
  textAlign: 'center',
  height: '48px !important',
  fontSize: '150% !important',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:not(:last-child)': {
    marginRight: theme.spacing(1),
  },
  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    margin: 0,
    WebkitAppearance: 'none',
  },
  [theme.breakpoints.up('sm')]: {
    maxWidth: 56,
    height: '56px !important',
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: 76,
    height: '76px !important',
  },
  [theme.breakpoints.up('lg')]: {
    height: '76px !important',
  },
}));

const VerifyAccount = () => {
  const theme = useTheme();

  const [isBackspace, setIsBackspace] = useState<boolean>(false);

  const [resendOtpDisabled, setResendOtpDisabled] = useState(false);

  const [emailAddress, setEmailAddress] = useState('');

  const [resendOtpLoading, setResendOtpLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isOtpError, setIsOtpError] = useState(false);
  const [otpErrorMsg, setOtpErrorMsg] = useState('');

  const { changeCompanyInfo, changeEmpInfo } = useContext(InfoContext);

  const router = useRouter();

  const { t, ready } = useTranslation(['individualAuth', 'common']);

  const defaultValues: { [key: string]: string } = {
    val1: '',
    val2: '',
    val3: '',
    val4: '',
    val5: '',
    val6: ''
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({ defaultValues, mode: 'onChange' });

  const errorsArray = Object.keys(errors);

  const handleChange = (
    event: ChangeEvent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (...event: any[]) => void
  ) => {
    if (!isBackspace) {
      onChange(event);

      // @ts-ignore
      const form = event.target.form;
      const index = [...form].indexOf(event.target);
      if (form[index].value && form[index].value.length) {
        form.elements[index + 1].focus();
      }
      event.preventDefault();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Backspace') {
      setIsBackspace(true);

      // @ts-ignore
      const form = event.target.form;
      const index = [...form].indexOf(event.target);
      const key = Object.keys(defaultValues)[index];
      setValue(key, '');
      if (index >= 1) {
        if (!(form[index].value && form[index].value.length)) {
          form.elements[index - 1].focus();
        }
      }
    } else {
      setIsBackspace(false);
    }
  };

  const renderInputs = () => {
    return Object.keys(defaultValues).map((val, index) => (
      <Controller
        key={val}
        name={val}
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <Box
            type="tel"
            value={value}
            autoFocus={index === 0}
            component={CleaveInput}
            onKeyDown={handleKeyDown}
            onChange={(event: ChangeEvent) => handleChange(event, onChange)}
            options={{ blocks: [1], numeral: true, numeralPositiveOnly: true }}
            sx={{
              [theme.breakpoints.down('sm')]: {
                px: `${theme.spacing(1)} !important`,
              },
            }}
          />
        )}
      />
    ));
  };

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      try {
        setIsSubmitting(true);
        const dataToSend = {
          emailId: email,
          otpCode: otp,
          culture: router.locale

        };
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/log-in-auth-users/log-in-by-otp/`,
          dataToSend,
          {
            headers: {
              'Accept-Language': router.locale, // Set content type for FormDatas  
            },
          }
        );
        if (response.status === 200) {
          window.localStorage.setItem(
            process.env.NEXT_PUBLIC_USER!,
            JSON.stringify(response.data)
          );
          if (response.data.roles[0].name === 'Company') {
            changeCompanyInfo(response.data.company);
            router.replace('/company/dashboard');
          } else {
            changeEmpInfo(response.data.userDetails);
            router.replace('/user/dashboard');
          }
        }
      } catch (e) {
        setIsSubmitting(false);
        setIsOtpError(true);
        if (isAxiosError(e)) {
          if (
            e?.response?.data?.error?.code === 409 ||
            e?.response?.data?.error?.code === '409'
          ) {
            setOtpErrorMsg(t('incorrectOtp'));
          } else if (
            e?.response?.data?.error?.code === 404 ||
            e?.response?.data?.error?.code === '404'
          ) {
            setOtpErrorMsg(t('notFoundOtp'));
          } else if (
            e?.response?.data?.error?.code === 400 ||
            e?.response?.data?.error?.code === '400'
          ) {
            setOtpErrorMsg(t('accountLocked'));
          } else {
            setOtpErrorMsg(t('common:error.unspecific'));
          }
        } else {
          setOtpErrorMsg(t('common:error.unspecific'));
        }
      }
    },
    [changeCompanyInfo, changeEmpInfo, router, t]
  );

  useEffect(() => {
    if (router.isReady) {
      if (router.query.email && router.query.otp) {
        const email = router.query.email as string;
        const otp = router.query.otp as string;
        window.localStorage.setItem(
          process.env.NEXT_PUBLIC_REGISTER_EMAIL!,
          email
        );
        setEmailAddress(email);
        const splitOtp = otp.split('');
        setValue('val1', splitOtp[0]);
        setValue('val2', splitOtp[1]);
        setValue('val3', splitOtp[2]);
        setValue('val4', splitOtp[3]);
        setValue('val5', splitOtp[4]);
        setValue('val6', splitOtp[5]);
        verifyOtp(email, otp);
      } else {
        const ea = window.localStorage.getItem(
          process.env.NEXT_PUBLIC_REGISTER_EMAIL!
        );
        if (ea) {
          setEmailAddress(ea as string);
        }
      }
    }
  }, [
    router.isReady,
    router.query.email,
    router.query.otp,
    setValue,
    verifyOtp,
  ]);

  const onSubmit = (data: { [key: string]: string }) => {
    const fullOtp = data.val1 + data.val2 + data.val3 + data.val4 + data.val5 + data.val6;
    verifyOtp(emailAddress, fullOtp);
  };

  const onError = () => {
    console.log('errorArray: ', errorsArray);
  };

  const onResendOTP = async () => {
    try {
      setResendOtpLoading(true);
      setResendOtpDisabled(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/log-in-auth-users/generate-otp/${emailAddress}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setIsOtpError(false);
        setResendOtpLoading(false);
        setTimeout(() => {
          setResendOtpDisabled(false);
        }, 30000);
      }
    } catch (e) {
     
      setResendOtpLoading(false);
      setResendOtpDisabled(false);
      setIsOtpError(true);
      if (isAxiosError(e)) {
        if (e?.response?.data?.error?.code == 400) {
          setOtpErrorMsg(t('accountLocked'));
        } else if (e?.response?.data?.error?.code == 404) {
          setOtpErrorMsg(t('notFoundOtp'));
        } else if (e?.response?.data?.error?.code == 409) {
          setOtpErrorMsg(t('incorrectOtp'));
        }
      } else {
        setOtpErrorMsg(t('common:error.unspecific'));
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
        {resendOtpLoading && !ready ? (
          <>
            <CircularProgress size="10vh" />
          </>
        ) : (
          <>
            <Box
              sx={{ width: { xs: '90%', sm: '50%', md: '280px', lg: '380px' } }}
            >
              <Box sx={{ marginBottom: '30px' }}>
                <img src="/logo.png" alt="logo" />
              </Box>
              <Divider sx={{ marginBottom: '36px' }} />
              <Typography
                component="div"
                variant="h6"
                sx={{
                  marginBottom: '10px',
                  fontWeight: '600',
                  fontSize: '20px',
                  fontFamily: "'Outfit', sans-serif",
                  lineHeight: '1',
                }}
              >
                {t('enterOtp')}
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  mb: 4,
                  color: '#666666',
                  fontSize: '18px',
                  fontFamily: "'Open Sans', sans-serif",
                }}
              >
                <Typography component="span" variant="subtitle1">
                  {emailAddress}
                </Typography>
                <Typography
                  component="span"
                  variant="subtitle1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '16px',
                    color: '#666',
                  }}
                >
                  <img
                    src="/Icon feather-edit-3.svg"
                    alt="edit"
                    style={{ width: '13px', marginRight: '10px' }}
                  />
                  <span>
                    <Link href="/login">{t('edit')}</Link>
                  </span>
                </Typography>
              </Box>
              <form onSubmit={handleSubmit(onSubmit, onError)}>
                <CleaveInputWrapper
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    ...(errorsArray.length && {
                      '& .invalid:focus': {
                        borderColor: (theme) =>
                          `${theme.palette.error.main} !important`,
                      },
                    }),
                  }}
                >
                  {renderInputs()}
                </CleaveInputWrapper>
                {errorsArray.length ? (
                  <FormHelperText
                    sx={{
                      color: 'error.main',
                      fontSize: (theme) => theme.typography.body2.fontSize,
                      mb: 1,
                    }}
                  >
                    {t('invalidOtp')}
                  </FormHelperText>
                ) : null}
                <Tooltip
                  title={resendOtpDisabled ? 'Try again after 30 seconds' : ''}
                  arrow
                  placement="right"
                >
                  <Typography
                    component="span"
                    variant="subtitle1"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      mb: 4,
                      color: resendOtpDisabled ? '#999999' : '#666666',
                      cursor: resendOtpDisabled ? 'not-allowed' : 'pointer',
                    }}
                    onClick={
                      resendOtpDisabled
                        ? () => {
                            //
                          }
                        : onResendOTP
                    }
                  >
                    <img
                      src="/Icon feather-repeat.svg"
                      alt="resend"
                      style={{ width: '14px' }}
                    />
                    &nbsp; {t('resendOtp')}
                  </Typography>
                </Tooltip>

                {isOtpError && (
                  <Alert severity="error" sx={{ mb: 4 }}>
                    {otpErrorMsg}
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
                  ) : (
                    <>{t('continue')}</>
                  )}
                </Button>
              </form>
              <Box>
                <center>
                  <Typography variant="subtitle1" component="span">
                    {t('noAccount')}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    component="span"
                    sx={{ marginLeft: '5px' }}
                  >
                    <Link href="/register">{t('signUp')}</Link>
                  </Typography>
                </center>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

VerifyAccount.getLayout = (page: ReactNode) => <AuthLayout>{page}</AuthLayout>;

VerifyAccount.guestGuard = true;

export default VerifyAccount;
