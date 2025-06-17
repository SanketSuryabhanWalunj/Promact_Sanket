import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { useForm, Controller } from 'react-hook-form';

import { emailRegex, mobileRegex } from '@virtual-aid-frontend/utils';
import axios, { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';

import { InfoContext } from '../../../contexts/InfoContext';

import { useTranslation } from 'next-i18next';

type EmployeeFormType = {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
};

type AddSingleEmployeeFormType = {
  onCancelClick: () => void;
};

const AddSingleEmployeeForm = (props: AddSingleEmployeeFormType) => {
  const { onCancelClick } = props;

  const router = useRouter();

  const { t, ready } = useTranslation(['individualAuth', 'common']);

  const { companyInfo } = useContext(InfoContext);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [submitErrMsg, setSubmitErrMsg] = useState('');

  const defaultFormValues: EmployeeFormType = {
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormType>({
    defaultValues: defaultFormValues,
  });
  
 // Method to submit data for employee info
  const onSubmit = async (data: EmployeeFormType) => {
    try {
      setIsSubmitting(true);
      const dataToSend = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNumber: data.contact,
        currentCompanyId: companyInfo.id,
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
        router.reload();
      }
    } catch (error) {
      setIsSubmitting(false);
      setIsSubmitError(true);
      if (isAxiosError(error)) {
        if (
          error.response?.data?.error?.code === 409 ||
          error.response?.data?.error?.code === '409'
        ) {
          setSubmitErrMsg(t('emailAlreadyRegistered'));
        } else {
          setSubmitErrMsg(t('common:error.unspecific'));
        }
      } else {
        setSubmitErrMsg('common:error.unspecific');
      }
    }
  };

  if (!ready) {
    <></>;
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="firstName"
          rules={{
            required: {
              value: true,
              message: t('firstNameRequiredMsg'),
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label={t('firstNameLabel')}
              required
              disabled={isSubmitting}
              error={!!errors['firstName']}
              helperText={
                errors['firstName'] ? errors['firstName'].message : ''
              }
              sx={{ mb: errors['firstName'] ? '40px' : '20px' }}
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          rules={{
            required: {
              value: true,
              message: t('lastNameRequiredMsg'),
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label={t('lastNameLabel')}
              required
              disabled={isSubmitting}
              error={!!errors['lastName']}
              helperText={errors['lastName'] ? errors['lastName'].message : ''}
              sx={{ mb: errors['lastName'] ? '40px' : '20px' }}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          rules={{
            required: {
              value: true,
              message: t('emailAddressRequiredMsg'),
            },
            pattern: {
              value: emailRegex,
              message: t('emailAddressInvalidMsg'),
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="email"
              label={t('emailAddressLabel')}
              required
              disabled={isSubmitting}
              error={!!errors['email']}
              helperText={errors['email'] ? errors['email'].message : ''}
              sx={{ mb: errors['email'] ? '40px' : '20px' }}
            />
          )}
        />
        <Controller
          control={control}
          name="contact"
          rules={{
            required: {
              value: true,
              message: t('contactRequiredMsg'),
            },
            pattern: {
              value: mobileRegex,
              message: t('contactInvalidMsg'),
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="tel"
              label={t('contactLabel')}
              required
              disabled={isSubmitting}
              error={!!errors['contact']}
              helperText={errors['contact'] ? errors['contact'].message : ''}
              sx={{ mb: errors['contact'] ? '40px' : '20px' }}
            />
          )}
        />
        {isSubmitError && (
          <Alert severity="error" sx={{ mb: '20px' }}>
            {submitErrMsg}
          </Alert>
        )}
        <Box>
          <Button variant="gradient" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <CircularProgress size="1.75rem" />
            ) : (
              t('common:action.add')
            )}
          </Button>
          <Button
            onClick={() => {
              onCancelClick();
            }}
            sx={{ color: '#666666' }}
            disabled={isSubmitting}
          >
            {t('common:action.cancel')}
          </Button>
        </Box>
      </form>
    </>
  );
};

export default AddSingleEmployeeForm;
