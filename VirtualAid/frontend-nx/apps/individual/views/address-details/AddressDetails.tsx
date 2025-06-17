import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { InfoContext } from './../../contexts/InfoContext';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

type AddressFormType = {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

type AddressDetailsPropType = {
  onCancelClick: () => void;
};

const AddressDetails = (props: AddressDetailsPropType) => {
  const { onCancelClick } = props;
  const { companyInfo, changeCompanyInfo } = useContext(InfoContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const defaultAddressFormValue = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormType>({
    defaultValues: defaultAddressFormValue,
  });

  const onSubmit = async () => {
    // Submit address form integration
    try {
      setIsSubmitting(true);
      // To do: Integrate API for the Address update
      setIsSubmitting(false);
      setIsSubmitSuccess(true);
      setSubmitMessage('');
    } catch (error) {
      setIsSubmitError(true);
      setSubmitMessage(t('somethingWentWrong'));
    }
  };
  const { t, ready } = useTranslation(['company', 'common']);
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="addressLine1"
          rules={{
            required: { value: true, message: t('addressLine1Text') },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label="Address line 1"
              required
              disabled={isSubmitting}
              error={!!errors['addressLine1']}
              helperText={
                errors['addressLine1'] ? errors['addressLine1'].message : ''
              }
              sx={errors['addressLine1'] ? { mb: '40px' } : { mb: '20px' }}
            />
          )}
        />

        <Controller
          control={control}
          name="addressLine2"
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label="Address line 2"
              disabled={isSubmitting}
              error={!!errors['addressLine2']}
              helperText={
                errors['addressLine2'] ? errors['addressLine2'].message : ''
              }
              sx={errors['addressLine2'] ? { mb: '40px' } : { mb: '20px' }}
            />
          )}
        />

        <Controller
          control={control}
          name="addressLine3"
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label="Address line 3"
              disabled={isSubmitting}
              error={!!errors['addressLine3']}
              helperText={
                errors['addressLine3'] ? errors['addressLine3'].message : ''
              }
              sx={errors['addressLine3'] ? { mb: '40px' } : { mb: '20px' }}
            />
          )}
        />

        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label="Country"
              required
              disabled={isSubmitting}
              error={!!errors['country']}
              helperText={errors['country'] ? errors['country'].message : ''}
              sx={errors['country'] ? { mb: '40px' } : { mb: '20px' }}
            />
          )}
        />

        <Controller
          control={control}
          name="state"
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label="State"
              required
              disabled={isSubmitting}
              error={!!errors['state']}
              helperText={errors['state'] ? errors['state'].message : ''}
              sx={errors['state'] ? { mb: '40px' } : { mb: '20px' }}
            />
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label="City"
              required
              disabled={isSubmitting}
              error={!!errors['city']}
              helperText={errors['city'] ? errors['city'].message : ''}
              sx={errors['city'] ? { mb: '40px' } : { mb: '20px' }}
            />
          )}
        />

        <Controller
          control={control}
          name="postalCode"
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label="Postal Code"
              required
              disabled={isSubmitting}
              error={!!errors['postalCode']}
              helperText={
                errors['postalCode'] ? errors['postalCode'].message : ''
              }
              sx={errors['postalCode'] ? { mb: '40px' } : { mb: '20px' }}
            />
          )}
        />

        {isSubmitError && (
          <Alert severity="error" sx={{ mb: '20px' }}>
            {submitMessage}
          </Alert>
        )}

        {isSubmitSuccess && (
          <Alert severity="success" sx={{ mb: '20px' }}>
            {submitMessage}
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
            {isSubmitting ? <CircularProgress size="1.75rem" /> : 'Submit'}
          </Button>
          <Button
            variant="text"
            fullWidth
            disabled={isSubmitting}
            onClick={onCancelClick}
          >
            {t('common:cancelText')}
          </Button>
        </Box>
      </form>
    </>
  );
};

export default AddressDetails;
