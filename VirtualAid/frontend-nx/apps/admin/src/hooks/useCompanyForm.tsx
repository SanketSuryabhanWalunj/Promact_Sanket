// ** React import
import { useMemo } from 'react'

// ** Next imports

// ** Mui imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'

// ** Icon imports
import Icon from 'src/@core/components/icon'

// ** React hook form imports
import { Controller, useForm } from 'react-hook-form'

// ** Custom components import
import CustomTextField from 'src/@core/components/mui/text-field'

// Common UTIL lib import
import { emailRegex, mobileRegex } from '@virtual-aid-frontend/utils'

import { FullCompanyFormType } from 'src/types/company'

const defaultEmptyFormValues = {
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

const useCompanyForm = (defaultFormValues: FullCompanyFormType = defaultEmptyFormValues) => {
  

  const defaultValue = useMemo(() => {
    return {
      companyName: defaultFormValues.companyName,
      companyEmail: defaultFormValues.companyEmail,
      companyContact: defaultFormValues.companyContact,
      addressLine1: defaultFormValues.addressLine1,
      addressLine2: defaultFormValues.addressLine2,
      addressLine3: defaultFormValues.addressLine3,
      country: defaultFormValues.country,
      state: defaultFormValues.state,
      city: defaultFormValues.city,
      postalCode: defaultFormValues.postalCode
    }
  }, [
    defaultFormValues.addressLine1,
    defaultFormValues.addressLine2,
    defaultFormValues.addressLine3,
    defaultFormValues.city,
    defaultFormValues.companyContact,
    defaultFormValues.companyEmail,
    defaultFormValues.companyName,
    defaultFormValues.country,
    defaultFormValues.postalCode,
    defaultFormValues.state
  ])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FullCompanyFormType>({
    defaultValues: {
      companyName: defaultFormValues.companyName,
      companyEmail: defaultFormValues.companyEmail,
      companyContact: defaultFormValues.companyContact,
      addressLine1: defaultFormValues.addressLine1,
      addressLine2: defaultFormValues.addressLine2,
      addressLine3: defaultFormValues.addressLine3,
      country: defaultFormValues.country,
      state: defaultFormValues.state,
      city: defaultFormValues.city,
      postalCode: defaultFormValues.postalCode
    }
  })

  const onSubmit = async (data: FullCompanyFormType) => {
    try {
    
    } catch (error) {
      //
    }
  }

  const CompanyForm = () => {
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
                      message: 'Company name is required.'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      required
                      label='Company Name'
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
                      message: 'Company Email is required.'
                    },
                    pattern: {
                      value: emailRegex,
                      message: 'Enter valid email address.'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      required
                      label='Company Email'
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
                      message: 'Company contact number is required.'
                    },
                    pattern: {
                      value: mobileRegex,
                      message: 'Enter valid contact number.'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      required
                      label='Company Contact'
                      error={Boolean(errors.companyContact)}
                      {...(errors.companyContact && { helperText: errors.companyContact.message })}
                    />
                  )}
                />
              </Grid>
              <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  control={control}
                  name='addressLine1'
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Address Line 1'
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
                      label='Address Line 2'
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
                      label='Address Line 3'
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
                      label='Country'
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
                      label='State / Province / Region'
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
                      label='City'
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
                      label='Zip / Postal Code'
                      error={Boolean(errors.postalCode)}
                      {...(errors.postalCode && { helperText: errors.postalCode.message })}
                    />
                  )}
                />
              </Grid>
              <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
              <Grid item xs={12} md={6}>
                <Button variant='contained' sx={{ display: 'flex', alignItems: 'center' }} type='submit'>
                  Save
                  <Icon icon='tabler:arrow-right' />
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </>
    )
  }

  return { CompanyForm }
}

export default useCompanyForm
