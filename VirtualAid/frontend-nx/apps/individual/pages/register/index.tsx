/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AuthLayout from '../../layouts/components/AuthLayout';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import MuiTabList, { TabListProps } from '@mui/lab/TabList';

import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { styled } from '@mui/material/styles';

import { Controller, useForm } from 'react-hook-form';
import { ReactNode, SyntheticEvent, useState } from 'react';

import { emailRegex, mobileRegex } from '@virtual-aid-frontend/utils';
import Link from 'next/link';

import axios, { isAxiosError } from 'axios';
import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';

import LocaleDropdown from '../../components/locale-dropdown/LocaleDropdown';

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  borderBottom: '0 !important',
  color: 'rgba(51, 51, 51, 0.5)',
  '&, & .MuiTabs-scroller': {
    boxSizing: 'content-box',
    borderBottom: 'none',
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .Mui-selected': {
    backgroundColor: 'rgba(234, 234, 234, 1)',
    opacity: '1',

  },
  '& .MuiTab-root': {
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      color: theme.palette.common.black,
    },
  },
  '& button': {
    // marginRight: 10,
    margin: '24px 0 30px 0',
    fontSize: theme.typography.body2,
    padding: '11px 54px',
    lineHeight: '19px',
    backgroundColor: 'rgba(234, 234, 234, 0.4)',
    borderRadius: '10px !important',
  },
  '& button:not(:last-child)': {
    marginRight: 20,
  },
}));

interface CompanyFormInterface {
  companyName: string;
  companyEmail: string;
  companyContact: string;
}

interface EmployeeFormInterface {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
}

const Register = () => {
  const [currentTabValue, setCurrentTabValue] = useState('1');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const router = useRouter();

  const { t, ready } = useTranslation(['individualAuth', 'common']);

  const defaultCompanyFormValues: CompanyFormInterface = {
    companyName: '',
    companyEmail: '',
    companyContact: '',
  };

  const defaultEmployeeFormValues: EmployeeFormInterface = {
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
  };

  const {
    handleSubmit: companyHandleSubmit,
    control: companyControl,
    formState: { errors: companyErrors },
  } = useForm<CompanyFormInterface>({
    defaultValues: defaultCompanyFormValues,
  });

  const {
    handleSubmit: employeeHandleSubmit,
    control: employeeControl,
    formState: { errors: employeeErrors },
  } = useForm<EmployeeFormInterface>({
    defaultValues: defaultEmployeeFormValues,
  });

  const handleTabChange = (event: SyntheticEvent, newValue: string) => {
    setCurrentTabValue(newValue);
    setIsSubmitError(false);
  };

  const companyOnSubmit = async (data: CompanyFormInterface) => {
    try {
      setIsSubmitting(true);
      const dataToSend = {
        companyName: data.companyName,
        email: data.companyEmail,
        contactNumber: data.companyContact,
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/auth-company-account/company-registration/`,
        dataToSend,
        {
          params: {
            culture:  router.locale,
          },
        }
      );
      if (response.status === 200) {
        window.localStorage.setItem(
          process.env.NEXT_PUBLIC_REGISTER_EMAIL!,
          data.companyEmail
        );
        router.push('/login');
      }
    } catch (error) {
      setIsSubmitting(false);
      setIsSubmitError(true);
      if (isAxiosError(error)) {
        if (
          error.response?.data?.error?.code === 409 ||
          error.response?.data?.error?.code === '409'
        ) {
          setErrorMsg(t('emailAlreadyRegistered'));
        } else {
          setErrorMsg(t('common:error.unspecific'));
        }
      } else {
        setErrorMsg(t('common:error.unspecific'));
      }
    }
  };

 
  const employeeOnSubmit = async (data: EmployeeFormInterface) => {
    try {
      setIsSubmitting(true);
      const dataToSend = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNumber: data.contact,
      };
    
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/auth-user-account/user-registration`,
        dataToSend,
        {
          params: {
            culture:  router.locale,
          },
        }
      );
      if (response.status === 200) {
        window.localStorage.setItem(
          process.env.NEXT_PUBLIC_REGISTER_EMAIL!,
          data.email
        );
        router.push('/login');
      }
    } catch (error) {
      setIsSubmitting(false);
      setIsSubmitError(true);
      if (isAxiosError(error)) {
        if (
          error.response?.data?.error?.code === 409 ||
          error.response?.data?.error?.code === '409'
        ) {
          setErrorMsg(t('emailAlreadyRegistered'));
        } else {
          setErrorMsg(t('common:error.unspecific'));
        }
      } else {
        setErrorMsg(t('common:error.unspecific'));
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
          py: 1,
        }}
      >
        <Box sx={{ width: { xs: '90%', sm: '50%', md: '280px', lg: '380px' } }}>
          <Box sx={{ mb: { xs: '0', md: '2', lg: '4' } }}>
            <img src="/logo.png" alt="logo" />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ width: '100%', mb: 2 }}>
            <LocaleDropdown />
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography
            component="div"
            variant="h6"
            sx={{ mb: 1, fontWeight: 'bold' }}
          >
            {ready && t('signupTitle')}
          </Typography>
          <TabContext value={currentTabValue}>
            <TabList onChange={handleTabChange} variant="fullWidth">
              <Tab
                value="1"
                label={ready ? t('company') : ''}
                disabled={isSubmitting}
              />
              <Tab
                value="2"
                label={ready ? t('user') : ''}
                disabled={isSubmitting}
              />
            </TabList>
            <TabPanel value="1" sx={{ padding: 0 }}>
              <form
                onSubmit={companyHandleSubmit(companyOnSubmit)}
              >
                <Box
                  sx={{ mb: companyErrors['companyName'] ? '40px' : '20px' }}
                >
                  <Controller
                    control={companyControl}
                    name="companyName"
                    rules={{
                      required: {
                        value: true,
                        message: ready ? t('companyNameRequiredMsg') : '',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="text"
                        label={ready ? t('companyNameLabel') : ''}
                        required
                        disabled={isSubmitting}
                        error={!!companyErrors['companyName']}
                        helperText={
                          companyErrors['companyName']
                            ? companyErrors['companyName'].message
                            : ''
                        }
                      />
                    )}
                  />
                </Box>
                <Box
                  sx={{ mb: companyErrors['companyEmail'] ? '40px' : '20px' }}
                >
                  <Controller
                    control={companyControl}
                    name="companyEmail"
                    rules={{
                      required: {
                        value: true,
                        message: ready ? t('companyEmailRequiredMsg') : '',
                      },
                      pattern: {
                        value: emailRegex,
                        message: ready ? t('companyEmailInvalidMsg') : '',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="email"
                        label={ready ? t('companyEmailLabel') : ''}
                        required
                        disabled={isSubmitting}
                        error={!!companyErrors['companyEmail']}
                        helperText={
                          companyErrors['companyEmail']
                            ? companyErrors['companyEmail'].message
                            : ''
                        }
                      />
                    )}
                  />
                </Box>
                <Box
                  sx={{
                    mb: companyErrors['companyContact']
                      ? '40px'
                      : isSubmitError
                      ? '40px'
                      : '40px',
                  }}
                >
                  <Controller
                    control={companyControl}
                    name="companyContact"
                    rules={{
                      required: {
                        value: true,
                        message: ready ? t('companyContactRequiredMsg') : '',
                      },
                      pattern: {
                        value: mobileRegex,
                        message: ready ? t('companyContactInvalidMsg') : '',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="tel"
                        label={ready ? t('companyContactLabel') : ''}
                        required
                        disabled={isSubmitting}
                        error={!!companyErrors['companyContact']}
                        helperText={
                          companyErrors['companyContact']
                            ? companyErrors['companyContact'].message
                            : ''
                        }
                      />
                    )}
                  />
                </Box>

                {isSubmitError && (
                  <Alert
                    severity="error"
                    sx={{ mb: { lg: '60px', md: '30px', xs: '10px' } }}
                  >
                    {errorMsg}
                  </Alert>
                )}

                <Button
                  fullWidth
                  type="submit"
                  variant="gradient"
                  sx={{ mb: '30px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size="1.75rem" />
                  ) : ready ? (
                    t('common:action.submit')
                  ) : (
                    ''
                  )}
                </Button>
              </form>
            </TabPanel>
            <TabPanel value="2" sx={{ padding: 0 }}>
              <form
                onSubmit={employeeHandleSubmit(
                  employeeOnSubmit
                )}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    mb:
                      employeeErrors['firstName'] || employeeErrors['lastName']
                        ? '40px'
                        : '20px',
                  }}
                >
                  <Controller
                    control={employeeControl}
                    name="firstName"
                    rules={{
                      required: {
                        value: true,
                        message: ready ? t('firstNameRequiredMsg') : '',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="text"
                        label={ready ? t('firstNameLabel') : ''}
                        required
                        disabled={isSubmitting}
                        sx={{ width: '47.36%' }}
                        error={!!employeeErrors['firstName']}
                        helperText={
                          employeeErrors['firstName']
                            ? employeeErrors['firstName'].message
                            : ''
                        }
                      />
                    )}
                  />
                  <Controller
                    control={employeeControl}
                    name="lastName"
                    rules={{
                      required: {
                        value: true,
                        message: ready ? t('lastNameRequiredMsg') : '',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="text"
                        label={ready ? t('lastNameLabel') : ''}
                        required
                        disabled={isSubmitting}
                        sx={{ width: '47.36%' }}
                        error={!!employeeErrors['lastName']}
                        helperText={
                          employeeErrors['lastName']
                            ? employeeErrors['lastName'].message
                            : ''
                        }
                      />
                    )}
                  />
                </Box>
                <Box sx={{ mb: employeeErrors['email'] ? '40px' : '20px' }}>
                  <Controller
                    control={employeeControl}
                    name="email"
                    rules={{
                      required: {
                        value: true,
                        message: ready ? t('emailAddressRequiredMsg') : '',
                      },
                      pattern: {
                        value: emailRegex,
                        message: ready ? t('emailAddressInvalidMsg') : '',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        // size="small"
                        type="email"
                        label={ready ? t('emailAddressLabel') : ''}
                        required
                        disabled={isSubmitting}
                        error={!!employeeErrors['email']}
                        helperText={
                          employeeErrors['email']
                            ? employeeErrors['email'].message
                            : ''
                        }
                      />
                    )}
                  />
                </Box>
                <Box
                  sx={{
                    mb: employeeErrors['contact']
                      ? '40px'
                      : isSubmitError
                      ? '40px'
                      : '40px',
                  }}
                >
                  <Controller
                    control={employeeControl}
                    name="contact"
                    rules={{
                      required: {
                        value: true,
                        message: ready ? t('contactRequiredMsg') : '',
                      },
                      pattern: {
                        value: mobileRegex,
                        message: ready ? t('contactInvalidMsg') : '',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        // size="small"
                        type="tel"
                        label={ready ? t('contactLabel') : ''}
                        required
                        disabled={isSubmitting}
                        error={!!employeeErrors['contact']}
                        helperText={
                          employeeErrors['contact']
                            ? employeeErrors['contact'].message
                            : ''
                        }
                      />
                    )}
                  />
                </Box>

                {isSubmitError && (
                  <Alert
                    // variant="outlined"
                    severity="error"
                    sx={{ mb: '60px' }}
                  >
                    {errorMsg}
                  </Alert>
                )}

                <Button
                  variant="gradient"
                  fullWidth
                  type="submit"
                  sx={{ mb: '30px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size="1.75rem" />
                  ) : ready ? (
                    t('common:action.submit')
                  ) : (
                    ''
                  )}
                </Button>
              </form>
            </TabPanel>
          </TabContext>

          <Box>
            <center>
              <Typography variant="subtitle1" component="span">
                {ready && t('haveAccount')}
              </Typography>
              <Typography
                variant="subtitle1"
                component="span"
                sx={{ marginLeft: '5px' }}
              >
                <Link href="/login">{ready && t('login')}</Link>
              </Typography>
            </center>
          </Box>
        </Box>
      </Box>
    </>
  );
};

Register.getLayout = (page: ReactNode) => <AuthLayout>{page}</AuthLayout>;

Register.guestGuard = true;

export default Register;
