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
import AdminAddEditForm from 'src/views/apps/roles-and-permission/admins/add-edit/AdminAddEditForm'

// ** React hook form Imports
import { UseFormReset } from 'react-hook-form'

// ** Types Imports
import { AdminFormType } from 'src/types/admin'

// ** Axios API call Imports
import { postAddNewAdmin } from 'src/api-services/AdminApi'
import { isAxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

const AdminAddPage = () => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter()
  const defaultFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    contact: ''
  }

  const onSubmit = async (data: AdminFormType, reset?: UseFormReset<AdminFormType>) => {
    try {
      setLoading(true)
      const dataToSend = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNumber: data.contact,
      }
      const culture = router.locale as string;
      const response = await postAddNewAdmin(dataToSend, culture)
      if (response.status === 200) {
        setLoading(false)
        setErrorMsg('')
        if (reset) {
          reset()
        }
        setOpenDialog(true)
      } else {
        setLoading(false)
        setErrorMsg(t('common:error.unspecific'))
      }
    } catch (error) {
      setLoading(false)
      if (isAxiosError(error)) {
        if (error?.response?.data?.error?.code === 409 || error?.response?.data?.error?.code === '409') {
          setErrorMsg(t('common:emailExistsError'))
        } else {
          setErrorMsg(t('common:error.unspecific'))
        }
      } else {
        setErrorMsg(t('common:error.unspecific'))
      }
    }
  }

  return (
    <>
      <Breadcrumbs sx={{ mb: 6 }}>
        <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/roles-and-permission/admins`}>
          {t('common:adminsText')}
        </MuiLink>
        <Typography>{t('common:addNewAdminText')}</Typography>
      </Breadcrumbs>
      {/* {CompanyForm()} */}
      <AdminAddEditForm
        formDefaultValues={defaultFormValues}
        onSubmitClick={onSubmit}
        loading={loading}
        errorMsg={errorMsg}
      />

      <Dialog open={openDialog} maxWidth={'sm'} fullWidth onClose={() => setOpenDialog(!openDialog)} sx={{ p: 4 }}>
        <DialogContent>{t('common:adminSuccessfullyText')}</DialogContent>
        <DialogActions>
          <Button variant='contained' LinkComponent={NextLink} href={`/roles-and-permission/admins`}>
            {t('common:goToAdminText')}
          </Button>
          <Button variant='tonal' color={'secondary'} onClick={() => setOpenDialog(!openDialog)}>
           {t('common:addAnotherText')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

AdminAddPage.acl = {
  action: 'create',
  subject: 'admin'
}

export default AdminAddPage
function userRouter() {
  throw new Error('Function not implemented.')
}

