import TextField, { TextFieldProps } from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { mobileRegex } from '@virtual-aid-frontend/utils';
import { useContext, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';
import { InfoContext } from '../../../contexts/InfoContext';

import axios from 'axios';

import { useTranslation } from 'next-i18next';
import { TextareaAutosize, styled } from '@mui/material';
import { useRouter } from 'next/router';

type CompanyPersonalFormType = {
  companyName: string;
  companyEmail: string;
  companyContact: string;
  companySlogan: string;
  companyNoOfEmployees: number;
  companyBio: string;
};

type CompanyPersonalFormPropsType = {
  onCancelClick: () => void;
};
const TextFieldStyled = styled(TextareaAutosize)<TextFieldProps>(({ theme }) => ({
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
}));

const CompanyPersonalForm = (props: CompanyPersonalFormPropsType) => {
  const { onCancelClick } = props;

  const { companyInfo, changeCompanyInfo } = useContext(InfoContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter();
  const defaultFormValues: CompanyPersonalFormType = {
    companyName: companyInfo.companyName,
    companyEmail: companyInfo.email,
    companyContact: companyInfo.contactNumber,
    companySlogan: companyInfo.slogan, 
    companyNoOfEmployees: companyInfo.noOfEmployees,
    companyBio: companyInfo.bio
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyPersonalFormType>({
    defaultValues: defaultFormValues,
  });

  // Method to submit data for company info
  // @param: data for company personal info
  const onSubmit = async (data: CompanyPersonalFormType) => {
    try {
      setIsSubmitting(true);
      setIsSubmitSuccess(false);
      setIsSubmitError(false);
      setSubmitMessage('');
      const dataToSend = {
        ...companyInfo,
        companyName: data.companyName,
        email: data.companyEmail,
        contactNumber: data.companyContact,
        slogan: data.companySlogan,
        noOfEmployees: data.companyNoOfEmployees,
        bio: data.companyBio,
        address1: '',
        address2: '',
        address3: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        creatorId: '',
      };
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company/edit-public-profile-details-for-company`,
        dataToSend,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setIsSubmitting(false);
        setSubmitMessage(t('common:message.infoUpdated'));
        setIsSubmitSuccess(true);
        changeCompanyInfo(response.data);
        onCancelClick();
      }
    } catch (error) {
      setIsSubmitting(false);
      setIsSubmitSuccess(false);
      setIsSubmitError(true);
      setSubmitMessage(t('common:error.unspecific'));
    }
  };

  if (!ready) {
    return <></>;
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="companyName"
          rules={{
            required: { value: true, message: t('companyNameRequiredMsg') },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label={t('companyNameLabel')}
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
              label={t('companyEmailLabel')}
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
              message: t('companyContactRequiredMsg'),
            },
            pattern: {
              value: mobileRegex,
              message: t('companyContactInvalidMsg'),
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="tel"
              label={t('companyContactLabel')}
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
        <Controller
          control={control}
          name="companyBio"
          render={({ field }) => (
            <><label className='label-dialog' style={{
              color: 'rgba(0, 0, 0, 0.6)',
              fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
              fontWeight: '400',
              fontSize: '1rem !important',
              fontSizeAdjust: '1rem !important',
              lineHeight: '1.4375em'
            }}>{t('enterCompanyBioLabel')}</label><TextFieldStyled
                {...field}
                
                type="text"
                label={t('tellSomething')}
                required
                disabled={isSubmitting}

                sx={{ mb: '20px', fontFamily: '"Roboto","Helvetica","Arial",sans-serif', }} /></>
          )}
        />
         <Controller
          control={control}
          name="companySlogan"
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="text"
              label={t('companySloganText')}
              required
              disabled={isSubmitting}
              sx={{mb: '20px'}}
            />
          )}
        />
         <Controller
          control={control}
          name="companyNoOfEmployees"
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label={t('companyNoOfEmpText')}
              required
              disabled={isSubmitting}
              sx={{ mb: '20px' }}
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

        <Box>
          <Button
            variant="gradient"
            type="submit"
            sx={{ mr: '20px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size="1.75rem" />
            ) : (
              t('common:action.submit')
            )}
          </Button>
          <Button
            variant="text"
            disabled={isSubmitting}
            onClick={onCancelClick}
          >
            {t('common:action.cancel')}
          </Button>
        </Box>
      </form>
    </>
  );
};

export default CompanyPersonalForm;
