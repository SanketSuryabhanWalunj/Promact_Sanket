// ** React import
import { useEffect } from 'react'

// ** Next imports

// ** Mui imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// ** Icon imports
import Icon from 'src/@core/components/icon'

// ** React hook form imports
import { Controller, UseFormReset, useForm } from 'react-hook-form'

// ** Custom components import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Common UTIL lib import
import { emailRegex, mobileRegex } from '@virtual-aid-frontend/utils'

// ** Types imports
import { AdminFormType } from 'src/types/admin'
import { useTranslation } from 'react-i18next'

interface AdminAddEditFormType {
  formDefaultValues: AdminFormType
  onSubmitClick: (data: AdminFormType, reset?: UseFormReset<AdminFormType>) => void
  loading: boolean
  errorMsg: string
}

const AdminAddEditForm = (props: AdminAddEditFormType) => {
  const { formDefaultValues, onSubmitClick, loading, errorMsg } = props
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<AdminFormType>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      contact: ''
    }
  })

  useEffect(() => {
    setValue('firstName', formDefaultValues.firstName)
    setValue('lastName', formDefaultValues.lastName)
    setValue('email', formDefaultValues.email)
    setValue('contact', formDefaultValues.contact)
  }, [
    formDefaultValues.contact,
    formDefaultValues.email,
    formDefaultValues.firstName,
    formDefaultValues.lastName,
    setValue
  ])

  const onSubmit = (data: AdminFormType) => {
    onSubmitClick(data, reset)
  }

  return (
    <>
      <Card sx={{ px: 6, py: 8 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6.5}>
            <Grid item xs={12} md={6}>
              <Controller
                control={control}
                name='firstName'
                rules={{
                  required: {
                    value: true,
                    message:  t('firstNameRequiredMsg')
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    required
                    label={t('firstNameLabel')}
                    placeholder={t('enterFirstName')}
                    error={Boolean(errors.firstName)}
                    {...(errors.firstName && { helperText: errors.firstName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                control={control}
                name='lastName'
                rules={{
                  required: {
                    value: true,
                    message: t('lastNameRequiredMsg')
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    required
                    label={t('lastNameLabel')}
                    placeholder={t('enterLastName')}
                    error={Boolean(errors.lastName)}
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                control={control}
                name='email'
                rules={{
                  required: {
                    value: true,
                    message: t('emailAddressRequiredMsg')
                  },
                  pattern: {
                    value: emailRegex,
                    message: t('emailAddressInvalidMsg')
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    required
                    label={t('emailLabel')}
                    placeholder={t('enterEmailAddress')}
                    disabled={!!formDefaultValues.email}
                    error={Boolean(errors.email)}
                    {...(errors.email && { helperText: errors.email.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                control={control}
                name='contact'
                rules={{
                  required: {
                    value: true,
                    message: t('contactRequiredMsg')
                  },
                  pattern: {
                    value: mobileRegex,
                    message: t('validContactNum')
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    required
                    label={t('contactLabel')}
                    placeholder={t('enterContactNumber')}
                    error={Boolean(errors.contact)}
                    {...(errors.contact && { helperText: errors.contact.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              {errorMsg && <Alert severity='error'>{errorMsg}</Alert>}
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant='contained'
                sx={{ display: 'flex', alignItems: 'center', width: '6.3681rem' }}
                type='submit'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size='1.375rem' sx={{ ml: 1, color: '#fff !important' }} />
                  </>
                ) : (
                  <>
                     {t('saveText')}
                    <Icon icon='tabler:arrow-right' />
                  </>
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>
    </>
  )
}

export default AdminAddEditForm
