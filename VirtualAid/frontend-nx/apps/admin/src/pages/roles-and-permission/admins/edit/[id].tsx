// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import NextLink from 'next/link'

// ** Mui Imports
import Breadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'

// ** React hook form Imports
import { UseFormReset } from 'react-hook-form'

// ** Types Imports
import { AdminFormType, AdminDetailsType } from 'src/types/admin'

// ** Axios API call Imports
import { getAdminDetails, putAdminDetails } from 'src/api-services/AdminApi'

import AdminAddEditForm from 'src/views/apps/roles-and-permission/admins/add-edit/AdminAddEditForm'
import { useTranslation } from 'react-i18next'

const EditAdminPage = () => {
  const [adminDetails, setAdminDetails] = useState<AdminDetailsType>({} as AdminDetailsType)
  const [loadingAdmin, setLoadingAdmin] = useState(false)
  const [errorAdmin, setErrorAdmin] = useState(false)
  const [defaultFormData, setDefaultFormData] = useState<AdminFormType>({
    firstName: '',
    lastName: '',
    email: '',
    contact: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [errorSubmitMsg, setErrorSubmitMsg] = useState('')

  const router = useRouter()
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const getAdminFilledData = async (adminId: string) => {
    try {
      setLoadingAdmin(true)
      const response = await getAdminDetails(adminId)
      if (response.status === 200) {
        const temp = {
          firstName: response.data?.firstName,
          lastName: response.data?.lastName,
          email: response.data?.email,
          contact: response.data?.contactNumber
        }
        setAdminDetails(response.data)
        setDefaultFormData(temp)
        setLoadingAdmin(false)
        setErrorAdmin(false)
      } else {
        setLoadingAdmin(false)
        setErrorAdmin(true)
      }
    } catch (error) {
      setLoadingAdmin(false)
      setErrorAdmin(true)
    }
  }

  useEffect(() => {
    if (router.isReady) {
      getAdminFilledData(router.query.id as string)
    }
  }, [router.isReady, router.query.id])

  const onSubmit = async (data: AdminFormType, reset?: UseFormReset<AdminFormType>) => {
    try {
      setSubmitting(true)
      const dataToSend = {
        ...adminDetails,
        firstName: data?.firstName,
        lastName: data?.lastName,
        email: data?.email,
        contact: data?.contact
      }
      const response = await putAdminDetails(dataToSend)
      if (response.status === 200) {
        router.push(`/roles-and-permission/admins/`)

        // setSubmitting(false)
        setErrorSubmitMsg('')
      } else {
        setSubmitting(false)
        setErrorSubmitMsg(t('common:emailExistsError'))
      }
    } catch (error) {
      setSubmitting(false)
      setErrorSubmitMsg(t('common:emailExistsError'))
    }
  }

  return (
    <>
      {loadingAdmin ? (
        <></>
      ) : errorAdmin ? (
        <></>
      ) : (
        <>
          <Breadcrumbs sx={{ mb: 6 }}>
            <MuiLink
              underline='hover'
              color='inherit'
              component={NextLink as any}
              href={`/roles-and-permission/admins/`}
            >
               {t('common:adminsText')}
            </MuiLink>

            <Typography>{t('common:editAdminText')}</Typography>
          </Breadcrumbs>
          <AdminAddEditForm
            formDefaultValues={defaultFormData}
            onSubmitClick={onSubmit}
            loading={submitting}
            errorMsg={errorSubmitMsg}
          />
        </>
      )}
    </>
  )
}

EditAdminPage.acl = {
  action: 'update',
  subject: 'admin'
}

export default EditAdminPage
