// ** React Imports
import { Dispatch, SetStateAction } from 'react'

// ** Next Imports

// ** Mui Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// ** React hook form imports
import { Controller, UseFormReset, useForm } from 'react-hook-form'

// ** Custom components import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Types Imports
import { AdminFormType } from 'src/types/admin'

import { emailRegex, mobileRegex } from '@virtual-aid-frontend/utils'
import { useTranslation } from 'react-i18next'

interface AdminAddEditFormDialogPropsType {
  openDialog: boolean
  setOpenDialog: Dispatch<SetStateAction<boolean>>
  dialogTitle: string
  formDefaultValues: AdminFormType
  onSubmitClick: (data: AdminFormType, reset?: UseFormReset<AdminFormType>) => void
  loading: boolean
  errorMsg: string
}

const AdminAddEditFormDialog = (props: AdminAddEditFormDialogPropsType) => {
  const { openDialog, setOpenDialog, dialogTitle, formDefaultValues, onSubmitClick, loading, errorMsg } = props
  const { t, ready } = useTranslation(['individualAuth', 'common']);
 

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      firstName: formDefaultValues.firstName,
      lastName: formDefaultValues.lastName,
      email: formDefaultValues.email,
      contact: formDefaultValues.contact
    }
  })

  const onSubmit = async (data: AdminFormType) => {
    onSubmitClick(data, reset)
  }

  const onDialogClose = (event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setOpenDialog(false)
    }
  }

  return (
    <>
      <Dialog fullWidth maxWidth='md' scroll='body' onClose={onDialogClose} open={openDialog} disableEscapeKeyDown>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle
            component='div'
            sx={{
              textAlign: 'center',
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <Typography variant='h3'>{dialogTitle}</Typography>
          </DialogTitle>
          <DialogContent
            sx={{
              pb: theme => `${theme.spacing(5)} !important`,
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
            }}
          >
            <Grid container spacing={6.5}>
              <Grid item xs={12} md={6}>
                <Controller
                  control={control}
                  name='firstName'
                  rules={{ required: { value: true, message: t('firstNameRequiredMsg') } }}
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
                  rules={{ required: { value: true, message: t('lastNameRequiredMsg') } }}
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
                    required: { value: true, message: t('emailAddressRequiredMsg') },
                    pattern: { value: emailRegex, message: t('emailAddressInvalidMsg') }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      required
                      label={t('emailLabel')}
                      placeholder={t('enterEmailAddress')}
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
                    required: { value: true, message: t('contactRequiredMsg') },
                    pattern: { value: mobileRegex, message: t('validContactNum') }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      required
                      label={t('contactLabel')}
                      placeholder={t('validContactNum')}
                      error={Boolean(errors.contact)}
                      {...(errors.contact && { helperText: errors.contact.message })}
                    />
                  )}
                />
              </Grid>
              {/* <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Button variant='contained' type='submit' disabled={loading} sx={{ width: '5.837875rem' }}>
                  {loading ? (
                    <CircularProgress
                      size='0.9375rem'
                      sx={theme => ({
                        color:
                          theme.palette.mode != 'dark'
                            ? `${theme.palette.customColors.darkPaperBg} !important`
                            : `${theme.palette.customColors.lightPaperBg} !important`
                      })}
                    />
                  ) : (
                    'Submit'
                  )}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button color='secondary' variant='tonal' disabled={loading} onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
              </Grid> */}
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: 'center',
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <Button variant='contained' type='submit' disabled={loading} sx={{ width: '5.837875rem' }}>
              {loading ? (
                <CircularProgress
                  size='0.9375rem'
                  sx={theme => ({
                    color:
                      theme.palette.mode != 'dark'
                        ? `${theme.palette.customColors.darkPaperBg} !important`
                        : `${theme.palette.customColors.lightPaperBg} !important`
                  })}
                />
              ) : (
                t('common:action.submit')

              )}
            </Button>
            <Button color='secondary' variant='tonal' disabled={loading} onClick={() => setOpenDialog(false)}>
              {t('common:action.cancel')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default AdminAddEditFormDialog
