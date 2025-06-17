// ** React import
import { useEffect, useState } from 'react'

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

// Common UTIL lib import
import { emailRegex, mobileRegex } from '@virtual-aid-frontend/utils'

import { FullCompanyFormType } from 'src/types/company'
import { useTranslation } from 'react-i18next'

interface CompanyAddEditFormType {
  formDefaultValues: FullCompanyFormType
  onSubmitClick: (data: FullCompanyFormType, reset?: UseFormReset<FullCompanyFormType>) => void
  loading: boolean
  errorMsg: string
}

const CompanyAddEditForm = (props: CompanyAddEditFormType) => {
  const { formDefaultValues, onSubmitClick, loading, errorMsg } = props

  const [showAddressField, setShowAddressField] = useState(false)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FullCompanyFormType>({
    defaultValues: {
      companyName: '',
      companyEmail: '',
      companyContact: '',
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
    setShowAddressField(false)
    setValue('companyName', formDefaultValues.companyName)
    setValue('companyEmail', formDefaultValues.companyEmail)
    setValue('companyContact', formDefaultValues.companyContact)
    setValue('addressLine1', formDefaultValues.addressLine1)
    setValue('addressLine2', formDefaultValues.addressLine2)
    setValue('addressLine3', formDefaultValues.addressLine3)
    setValue('country', formDefaultValues.country)
    setValue('state', formDefaultValues.state)
    setValue('city', formDefaultValues.city)
    setValue('postalCode', formDefaultValues.postalCode)
  }, [
    formDefaultValues,
    formDefaultValues.addressLine1,
    formDefaultValues.addressLine2,
    formDefaultValues.addressLine3,
    formDefaultValues.city,
    formDefaultValues.companyContact,
    formDefaultValues.companyEmail,
    formDefaultValues.companyName,
    formDefaultValues.country,
    formDefaultValues.postalCode,
    formDefaultValues.state,
    setValue
  ])

  const onSubmit = (data: FullCompanyFormType) => {
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
                name='companyName'
                rules={{
                  required: {
                    value: true,
                    message: t('companyNameRequiredMsg')
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    required
                    label={t('companyNameLabel')}
                    error={Boolean(errors.companyName)}
                    {...(errors.companyName && { helperText: errors.companyName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                control={control}
                name='companyEmail'
                rules={{
                  required: {
                    value: true,
                    message: t('individualAuth:companyEmailRequiredMsg.')
                  },
                  pattern: {
                    value: emailRegex,
                    message: t('individualAuth:companyEmailInvalidMsg')
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    required
                    label={t('companyEmailLabel')}
                    disabled={!!formDefaultValues.companyEmail}
                    error={Boolean(errors.companyEmail)}
                    {...(errors.companyEmail && { helperText: errors.companyEmail.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                control={control}
                name='companyContact'
                rules={{
                  required: {
                    value: true,
                    message: t('companyContactRequiredMsg')
                  },
                  pattern: {
                    value: mobileRegex,
                    message: t('companyContactInvalidMsg')
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    required
                    label={t('companyContactLabel')}
                    error={Boolean(errors.companyContact)}
                    {...(errors.companyContact && { helperText: errors.companyContact.message })}
                  />
                )}
              />
            </Grid>
            <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
            {showAddressField && (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    control={control}
                    name='addressLine1'
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
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
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
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
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
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
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
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
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={t('zipText')}
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
export default CompanyAddEditForm
