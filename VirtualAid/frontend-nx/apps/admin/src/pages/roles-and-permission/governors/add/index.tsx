// ** React Imports
import { useState } from 'react'

// ** Next Imports
import NextLink from 'next/link'

// ** Mui Imports
import Breadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

// ** App Components Imports
import GovernorAddEditForm from 'src/views/apps/roles-and-permission/governor/add-edit/GovernorAddEditForm'

// ** React hook form Imports
import { UseFormReset } from 'react-hook-form'

// ** Types Imports
import { GovernorFormType } from 'src/types/governor'

// ** Axios API call Imports
import { postNewGovernor } from 'src/api-services/GovernorApi'
import { isAxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

const GovernorAddPage = () => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [openDialog, setOpenDialog] = useState(false)

  const defaultFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    contact: ''
  }
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const onSubmit = async (data: GovernorFormType, reset?: UseFormReset<GovernorFormType>) => {
    try {
      setLoading(true)
      const dataToSend = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNumber: data.contact
      }
      const response = await postNewGovernor(dataToSend)
      if (response.status === 200) {
        setLoading(false)
        setErrorMsg('')
        if (reset) {
          reset()
        }
        setOpenDialog(true)
      } else {
        setLoading(false)
        setErrorMsg(t('common:emailExistsError'))
      }
    } catch (error) {
      setLoading(false)
      if (isAxiosError(error)) {
        if (error?.response?.data?.error?.code === 409 || error?.response?.data?.error?.code === '409') {
          setErrorMsg(t('common:emailExistsError'))
        } else {
          setErrorMsg(t('common:emailExistsError'))
        }
      } else {
        setErrorMsg(t('common:emailExistsError'))
      }
    }
  }

  return (
    <>
      <Breadcrumbs sx={{ mb: 6 }}>
        <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/roles-and-permission/governors`}>
          {t('common:governerText')}
        </MuiLink>
        <Typography>{t('common:addNewGovernerText')}</Typography>
      </Breadcrumbs>
      {/* {CompanyForm()} */}
      <GovernorAddEditForm
        formDefaultValues={defaultFormValues}
        onSubmitClick={onSubmit}
        loading={loading}
        errorMsg={errorMsg}
      />

      <Dialog open={openDialog} maxWidth={'sm'} fullWidth onClose={() => setOpenDialog(!openDialog)} sx={{ p: 4 }}>
        <DialogContent>{t('common:governerAddSuccessText')}</DialogContent>
        <DialogActions>
          <Button variant='contained' LinkComponent={NextLink} href={`/roles-and-permission/governors`}>
            {t('common:goToGovernerText')}
          </Button>
          <Button variant='tonal' color={'secondary'} onClick={() => setOpenDialog(!openDialog)}>
            {t('common:addAnotherGovText')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

GovernorAddPage.acl = {
  action: 'create',
  subject: 'governor'
}

export default GovernorAddPage
