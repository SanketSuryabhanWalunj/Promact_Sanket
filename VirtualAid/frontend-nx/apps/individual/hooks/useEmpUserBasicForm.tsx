import Box from '@mui/material/Box';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { useForm, Controller } from 'react-hook-form';

import { emailRegex, mobileRegex } from '@virtual-aid-frontend/utils';
import { useContext, useMemo, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { TextareaAutosize, styled } from '@mui/material';
import { InfoContext } from '../contexts/InfoContext';

type EmployeeFormType = {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  designation: string;
  bio: string;
};

type onCancelClickType = () => void;

type onSubmitClickType = (data: EmployeeFormType) => void;
const TextFieldStyled = styled(TextareaAutosize)<TextFieldProps>(
  ({ theme }) => ({
    height: '100px !important',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: '10px !important',
    width: '100%',
    padding: '16.5px 14px',

    '& .MuiInputBase-root': {
      height: '120px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      height: '120px',
    },
  })
);

const useEmpUserBasicForm = (
  defaultValues: EmployeeFormType,
  onSubmitClick: onSubmitClickType,
  onCancelClick?: onCancelClickType
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [submitErrMsg, setSubmitErrMsg] = useState('');
  const { isCompany } = useContext(InfoContext);
  const { t, ready } = useTranslation(['individualAuth','company', 'common']);

  const formDefaultValues = useMemo(
    () => ({
      firstName: defaultValues.firstName,
      lastName: defaultValues.lastName,
      email: defaultValues.email,
      contact: defaultValues.contact,
      designation: defaultValues.designation,
      bio: defaultValues.bio,
    }),
    [
      defaultValues.contact,
      defaultValues.email,
      defaultValues.firstName,
      defaultValues.lastName,
      defaultValues.designation,
      defaultValues.bio,
    ]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormType>({
    defaultValues: formDefaultValues,
  });

  const onSubmit = async (data: EmployeeFormType) => {
    onSubmitClick(data);
  };

  const basicForm = () => {
    if (!ready) {
      return <></>;
    }

    return (
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
              disabled
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
        {!isCompany && (
          <>
            <Controller
              control={control}
              name="designation"
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="text"
                  label={t('roleText')}
                  required
                  disabled={isSubmitting}
                  sx={{ mb: '20px' }}
                />
              )}
            />
            <Controller
              control={control}
              name="bio"
              render={({ field }) => (
                <>
                  <label>{t('company:bioText')}</label>
                  <TextFieldStyled
                    {...field}
                    fullWidth
                    type="text"
                    label={t('tellSomething')}
                    required
                    disabled={isSubmitting}
                    sx={{
                      mb: '20px',
                      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                    }}
                  />
                </>
              )}
            />
          </>
        )}

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
          {onCancelClick && (
            <Button
              onClick={() => {
                onCancelClick();
              }}
              sx={{ color: '#666666' }}
              disabled={isSubmitting}
            >
              {t('common:action.cancel')}
            </Button>
          )}
        </Box>
      </form>
    );
  };

  return {
    basicForm,
    setIsSubmitting,
    setIsSubmitError,
    setSubmitErrMsg,
    isSubmitting,
    isSubmitError,
    submitErrMsg,
  };
};

export default useEmpUserBasicForm;
