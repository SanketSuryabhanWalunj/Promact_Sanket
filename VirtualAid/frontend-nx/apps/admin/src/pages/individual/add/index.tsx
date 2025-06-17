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

// ** Custom Hook Imports
import IndividualAddEditForm from 'src/views/apps/individual/add-edit/IndividualAddEditForm'

// ** React hook form Imports
import { UseFormReset } from 'react-hook-form'

// ** Types Imports
import { FullIndividualFormType } from 'src/types/individual'

// ** Axios API call Imports
import { postNewIndividual } from 'src/api-services/IndividualApi'
import { isAxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

const CompanyAddPage = () => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter()
  const defaultFormValues = {
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

  const onSubmit = async (data: FullIndividualFormType, reset?: UseFormReset<FullIndividualFormType>) => {
    try {
      setLoading(true)
      const dataToSend = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNumber: data.contact
      }
      const culture = router.locale as string;
      const response = await postNewIndividual(dataToSend, culture)
      if (response.status === 200) {
    
        setLoading(false)
        setErrorMsg('')
        if (reset) {
          reset()
        }
        setOpenDialog(true)
      } else {
        setLoading(false)
        setErrorMsg(t('somethingWentWrong'))
      }
    } catch (error) {
      setLoading(false)
      if (isAxiosError(error)) {
        if (error?.response?.data?.error?.code === 409 || error?.response?.data?.error?.code === '409') {
          setErrorMsg(t('common:emailExistsError'))
        } else {
          setErrorMsg(t('common:somethingWentWrong'))
        }
      } else {
        setErrorMsg(t('common:somethingWentWrong'))
      }
    }
  }

  return (
    <>
      <Breadcrumbs sx={{ mb: 6 }}>
        <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/individual/list`}>
          {t('individualsText')}
        </MuiLink>
        <Typography>{t('addIndividualText')}</Typography>
      </Breadcrumbs>
      {/* {CompanyForm()} */}
      <IndividualAddEditForm
        formDefaultValues={defaultFormValues}
        onSubmitClick={onSubmit}
        loading={loading}
        errorMsg={errorMsg}
        showAddressFields={false}
      />

      <Dialog open={openDialog} maxWidth={'sm'} fullWidth onClose={() => setOpenDialog(!openDialog)} sx={{ p: 4 }}>
        <DialogContent>{t('addedSuccessMsg')}</DialogContent>
        <DialogActions>
          <Button variant='contained' LinkComponent={NextLink} href={`/individual/list`}>
            {t('goToIndividualText')}
          </Button>
          <Button variant='tonal' color={'secondary'} onClick={() => setOpenDialog(!openDialog)}>
           {t('addAnotherIndividual')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CompanyAddPage
