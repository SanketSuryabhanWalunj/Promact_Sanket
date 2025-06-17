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
import { FullIndividualFormType, IndividualDetailsType } from 'src/types/individual'

// ** Axios API call imports
import { getIndividualDetails, putIndividualDetailsUpdate } from 'src/api-services/IndividualApi'

import IndividualAddEditForm from 'src/views/apps/individual/add-edit/IndividualAddEditForm'
import { useTranslation } from 'react-i18next'

const EditCompanyPage = () => {
  const [individualDetails, setIndividualDetails] = useState<IndividualDetailsType>({} as IndividualDetailsType)
  const [loadingCompany, setLoadingCompany] = useState(false)
  const [errorCompany, setErrorCompany] = useState(false)
  const [defaultFormData, setDefaultFormData] = useState<FullIndividualFormType>({
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
  })

  const [submitting, setSubmitting] = useState(false)
  const [errorSubmitMsg, setErrorSubmitMsg] = useState('')
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter()

  const getIndividualFilledData = async (individualId: string) => {
    try {
      setLoadingCompany(true)
      const response = await getIndividualDetails(individualId)
      if (response.status === 200) {
        const temp = {
          firstName: response.data?.firstName,
          lastName: response.data?.lastName,
          email: response.data?.email,
          contact: response.data?.contactNumber,
          addressLine1: response.data?.address1 ? response.data?.address1 : '',
          addressLine2: response.data?.address2 ? response.data?.address2 : '',
          addressLine3: response.data?.address3 ? response.data?.address3 : '',
          country: response.data?.country ? response.data?.country : '',
          state: response.data?.state ? response.data?.state : '',
          city: response.data?.country ? response.data.country : '',
          postalCode: response.data?.postalcode ? response.data?.postalcode : ''
        }
        setIndividualDetails(response.data)
        setDefaultFormData(temp)
        setLoadingCompany(false)
        setErrorCompany(false)
      } else {
        setLoadingCompany(false)
        setErrorCompany(true)
      }
    } catch (error) {
      setLoadingCompany(false)
      setErrorCompany(true)
    }
  }

  useEffect(() => {
    if (router.isReady) {
      getIndividualFilledData(router.query.id as string)
    }
  }, [router.isReady, router.query.id])

  const onSubmit = async (data: FullIndividualFormType, reset?: UseFormReset<FullIndividualFormType>) => {
    try {
      setSubmitting(true)
      const dataToSend = {
        ...individualDetails,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNumber: data.contact,
        address1: data.addressLine1,
        address2: data.addressLine2,
        address3: data.addressLine3,
        country: data.country,
        state: data.state,
        city: data.city,
        postalCode: data.postalCode
      }
      const response = await putIndividualDetailsUpdate(dataToSend)
      if (response.status === 200) {
        router.push(`/individual/view/${router.query.id}`)

        // setSubmitting(false)
        setErrorSubmitMsg('')
      } else {
        setSubmitting(false)
        setErrorSubmitMsg(t('common:somethingWentWrong'))
      }
    } catch (error) {
      setSubmitting(false)
      setErrorSubmitMsg(t('common:somethingWentWrong'))
    }
  }

  return (
    <>
      {loadingCompany ? (
        <></>
      ) : errorCompany ? (
        <></>
      ) : (
        <>
          <Breadcrumbs sx={{ mb: 6 }}>
            <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/individual/list`}>
            {t('individualsText')}
            </MuiLink>
            <MuiLink
              underline='hover'
              color='inherit'
              component={NextLink as any}
              href={`/individual/view/${individualDetails?.id}`}
            >
              {individualDetails?.firstName + ' ' + individualDetails?.lastName}
            </MuiLink>
            <Typography>{t('editIndividualText')}</Typography>
          </Breadcrumbs>
          <IndividualAddEditForm
            formDefaultValues={defaultFormData}
            onSubmitClick={onSubmit}
            loading={submitting}
            errorMsg={errorSubmitMsg}
            showAddressFields={false}
          />
        </>
      )}
    </>
  )
}

export default EditCompanyPage
