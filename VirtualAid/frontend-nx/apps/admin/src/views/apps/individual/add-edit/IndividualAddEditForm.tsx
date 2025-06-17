// ** React import

// ** Next imports
import { useEffect, useState } from 'react'

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

// Common UTIL lib import
import { emailRegex, mobileRegex } from '@virtual-aid-frontend/utils'

import { FullIndividualFormType } from 'src/types/individual'
import { useTranslation } from 'react-i18next'

interface IndividualAddEditFormType {
  formDefaultValues: FullIndividualFormType
  onSubmitClick: (data: FullIndividualFormType, reset?: UseFormReset<FullIndividualFormType>) => void
  loading: boolean
  errorMsg: string
  showAddressFields: boolean
}

const IndividualAddEditForm = (props: IndividualAddEditFormType) => {
  const { formDefaultValues, onSubmitClick, loading, errorMsg, showAddressFields } = props

  const [showAddressField, setShowAddressField] = useState(false)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FullIndividualFormType>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      contact: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      country: '',
      state: '',
      city: '',
      postalCode: ''
    }
  })

  useEffect(() => {
    if (formDefaultValues) {
      setShowAddressField(showAddressFields)
      setValue('firstName', formDefaultValues.firstName ? formDefaultValues.firstName : '')
      setValue('lastName', formDefaultValues.lastName ? formDefaultValues.lastName : '')
      setValue('email', formDefaultValues.email ? formDefaultValues.email : '')
      setValue('contact', formDefaultValues.contact ? formDefaultValues.contact : '')
      setValue('addressLine1', formDefaultValues.addressLine1 ? formDefaultValues.addressLine1 : '')
      setValue('addressLine2', formDefaultValues.addressLine2 ? formDefaultValues.addressLine2 : '')
      setValue('addressLine3', formDefaultValues.addressLine3 ? formDefaultValues.addressLine3 : '')
      setValue('country', formDefaultValues.country ? formDefaultValues.country : '')
      setValue('state', formDefaultValues.state ? formDefaultValues.state : '')
      setValue('city', formDefaultValues.city ? formDefaultValues.city : '')
      setValue('postalCode', formDefaultValues.postalCode ? formDefaultValues.postalCode : '')
    }
  }, [formDefaultValues, setValue, showAddressFields])

  const onSubmit = (data: FullIndividualFormType) => {
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
                    message: t('firstNameRequiredMsg')
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
                    message: t('lastNameLabel')
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
            {showAddressField && (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    control={control}
                    name='addressLine1'
                    rules={{ required: { value: true, message: t('addressLine1Text') } }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        required
                        label={t('addressLine1')}
                        error={Boolean(errors.addressLine1)}
                        {...(errors.addressLine1 && { helperText: errors.addressLine1.message })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    control={control}
                    name='addressLine2'
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={t('addressLine2')}
                        error={Boolean(errors.addressLine2)}
                        {...(errors.addressLine2 && { helperText: errors.addressLine2.message })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    control={control}
                    name='addressLine3'
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={t('addressLine3')}
                        error={Boolean(errors.addressLine3)}
                        {...(errors.addressLine3 && { helperText: errors.addressLine3.message })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    control={control}
                    name='country'
                    rules={{ required: { value: true, message: 'Country is required.' } }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        required
                        label={t('common:countryText')}
                        error={Boolean(errors.country)}
                        {...(errors.country && { helperText: errors.country.message })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    control={control}
                    name='state'
                    rules={{ required: { value: true, message: t('stateRequired') } }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        required
                        label={t('stateText')}
                        error={Boolean(errors.state)}
                        {...(errors.state && { helperText: errors.state.message })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    control={control}
                    name='city'
                    rules={{ required: { value: true, message: t('cityRequiredText') } }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        required
                        label={t('cityText')}
                        error={Boolean(errors.city)}
                        {...(errors.city && { helperText: errors.city.message })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    control={control}
                    name='postalCode'
                    rules={{ required: { value: true, message: t('zipRequiredText') } }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        required
                        label={t('zipPostalText')}
                        error={Boolean(errors.postalCode)}
                        {...(errors.postalCode && { helperText: errors.postalCode.message })}
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
              </>
            )}
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

// 1.375rem

export default IndividualAddEditForm
