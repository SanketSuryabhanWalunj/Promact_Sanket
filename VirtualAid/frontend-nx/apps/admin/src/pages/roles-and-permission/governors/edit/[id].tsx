// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import NextLink from 'next/link'
import { useRouter } from 'next/router'

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
import { GovernorDetailsType, GovernorFormType } from 'src/types/governor'

// ** API axios call
import { getGovernorDetails, putGovernorDetails } from 'src/api-services/GovernorApi'
import { useTranslation } from 'react-i18next'

const EditGovernorPage = () => {
  const [governorDetails, setGovernorDetails] = useState<GovernorDetailsType>({} as GovernorDetailsType)
  const [loadingGovernor, setLoadingGovernor] = useState(false)
  const [errorGovernor, setErrorGovernor] = useState(false)
  const [defaultFormData, setDefaultFormData] = useState<GovernorFormType>({
    firstName: '',
    lastName: '',
    email: '',
    contact: ''
  })
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const [submitting, setSubmitting] = useState(false)
  const [errorSubmitMsg, setErrorSubmitMsg] = useState('')

  const router = useRouter()

  const getGovernorFilledData = async (govId: string) => {
    try {
      const response = await getGovernorDetails(govId)

      if (response.status === 200) {
        const temp = {
          firstName: response.data?.firstName,
          lastName: response.data?.lastName,
          email: response.data?.email,
          contact: response.data?.contactNumber
        }
        setGovernorDetails(response.data)
        setDefaultFormData(temp)
        setLoadingGovernor(false)
        setErrorGovernor(false)
      } else {
        setLoadingGovernor(false)
        setErrorGovernor(true)
      }
    } catch (error) {
      setLoadingGovernor(false)
      setErrorGovernor(true)
    }
  }

  useEffect(() => {
    if (router.isReady) {
      getGovernorFilledData(router.query.id as string)
    }
  }, [router.isReady, router.query.id])

  const onSubmit = async (data: GovernorFormType, reset?: UseFormReset<GovernorFormType>) => {
    try {
      setSubmitting(true)
      const dataToSend = {
        ...governorDetails,
        firstName: data?.firstName,
        lastName: data?.lastName,
        email: data?.email,
        contact: data?.contact
      }
      const response = await putGovernorDetails(dataToSend)
      if (response.status === 200) {
        router.push(`/roles-and-permission/governors/`)

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
      {loadingGovernor ? (
        <></>
      ) : (
        <>
          {errorGovernor ? (
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
                  {t('common:governerText')}
                </MuiLink>

                <Typography>{t('common:editNewGovernerText')}</Typography>
              </Breadcrumbs>
              <GovernorAddEditForm
                formDefaultValues={defaultFormData}
                onSubmitClick={onSubmit}
                loading={submitting}
                errorMsg={errorSubmitMsg}
              />
            </>
          )}
        </>
      )}
    </>
  )
}

EditGovernorPage.acl = {
  action: 'update',
  subject: 'governor'
}

export default EditGovernorPage
