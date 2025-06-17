import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { mobileRegex } from '@virtual-aid-frontend/utils';

import { InfoContext } from '../contexts/InfoContext';
import { useTranslation } from 'react-i18next';

type CompanyFormType = {
  companyName: string;
  companyEmail: string;
  companyContact: string;
};

type onCancelClickType = () => void;

type onSubmitClickType = (data: CompanyFormType) => void;

const useCompanyBasicForm = (
  //   defaultValues: CompanyFormType,
  onSubmitClick: onSubmitClickType,
  onCancelClick?: onCancelClickType
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [submitErrMsg, setSubmitErrMsg] = useState('');

  const { companyInfo } = useContext(InfoContext);

  const defaultFormValues: CompanyFormType = {
    companyName: companyInfo.companyName,
    companyEmail: companyInfo.email,
    companyContact: companyInfo.contactNumber,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormType>({
    defaultValues: defaultFormValues,
  });

  const onSubmit = async (data: CompanyFormType) => {
    onSubmitClick(data);
  };
  const { t, ready } = useTranslation(['company', 'common']);

  const CompanyForm = () => {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="companyName"
          rules={{
            required: { value: true, message: t('companyNameRequired') },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label={t('companyName')}
              required
              disabled={isSubmitting}
              error={!!errors['companyName']}
              helperText={
                errors['companyName'] ? errors['companyName'].message : ''
              }
              sx={errors['companyName'] ? { mb: '40px' } : { mb: '20px' }}
            />
          )}
        />
        <Controller
          control={control}
          name="companyEmail"
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="email"
              label={t('companyEmail')}
              required
              disabled
              sx={{ mb: '20px' }}
            />
          )}
        />
        <Controller
          control={control}
          name="companyContact"
          rules={{
            required: {
              value: true,
              message: t('companyEmailRequired'),
            },
            pattern: {
              value: mobileRegex,
              message: t('validMobileNum'),
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="tel"
              label={t('mobileNumberText')}
              required
              disabled={isSubmitting}
              error={!!errors['companyContact']}
              helperText={
                errors['companyContact'] ? errors['companyContact'].message : ''
              }
              sx={errors['companyContact'] ? { mb: '40px' } : { mb: '20px' }}
            />
          )}
        />

        {isSubmitError && (
          <Alert severity="error" sx={{ mb: '20px' }}>
            {submitErrMsg}
          </Alert>
        )}

       

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="gradient"
            type="submit"
            sx={{ mr: '20px' }}
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size="1.75rem" /> : t('common:action.submit')}
          </Button>
          <Button
            variant="text"
            fullWidth
            disabled={isSubmitting}
            onClick={onCancelClick}
          >
            {t('common:action.cancel')}
          </Button>
        </Box>
      </form>
    );
  };

  return {
    CompanyForm,
    isSubmitting,
    isSubmitError,
    submitErrMsg,
    setIsSubmitting,
    setIsSubmitError,
    setSubmitErrMsg,
  };
};

export default useCompanyBasicForm;
