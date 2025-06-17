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
import CompanyAddEditForm from 'src/views/apps/company/add-edit/CompanyAddEditForm'

// ** React hook form Imports
import { UseFormReset } from 'react-hook-form'

// ** Types Imports
import { FullCompanyFormType } from 'src/types/company'

// ** Axios API call Imports
import { addNewCompany } from 'src/api-services/CompanyApi'
import { isAxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

const CompanyAddPage = () => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const { t, ready } = useTranslation(['company', 'common']);
  const defaultFormValues = {
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
  const router = useRouter();
  // OnSubmit method to submit company details 
  //@param: data is used for company form type
  //        reset is used for boolean to reset the form 
  const onSubmit = async (data: FullCompanyFormType, reset?: UseFormReset<FullCompanyFormType>) => {
    try {
      setLoading(true)
      const dataToSend = {
        companyName: data.companyName,
        email: data.companyEmail,
        contactNumber: data.companyContact
      }
      const culture = router.locale as string;
      const response = await addNewCompany(dataToSend, culture)
      if (response.status === 200) {
      
        setLoading(false)
        setErrorMsg('')
        if (reset) {
          reset()
        }
        setOpenDialog(true)
      } else {
        setLoading(false)
        setErrorMsg(t(''))
      }
    } catch (error) {
      setLoading(false)
      if (isAxiosError(error)) {
        if (error?.response?.data?.error?.code === 409 || error?.response?.data?.error?.code === '409') {
          setErrorMsg(t('alreadyRegisteredText'))
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
        <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/company/list`}>
          {t('companiesText')}
        </MuiLink>
        <Typography>{t('addCompanyText')}</Typography>
      </Breadcrumbs>
      <CompanyAddEditForm
        formDefaultValues={defaultFormValues}
        onSubmitClick={onSubmit}
        loading={loading}
        errorMsg={errorMsg}
      />

      <Dialog open={openDialog} maxWidth={'sm'} fullWidth onClose={() => setOpenDialog(!openDialog)} sx={{ p: 4 }}>
        <DialogContent>{t('companyAddedText')}</DialogContent>
        <DialogActions>
          <Button variant='contained' LinkComponent={NextLink} href={`/company/list`}>
           {t('goToCompanyText')}
          </Button>
          <Button variant='tonal' color={'secondary'} onClick={() => setOpenDialog(!openDialog)}>
           {t('addAnotherCompany')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CompanyAddPage
