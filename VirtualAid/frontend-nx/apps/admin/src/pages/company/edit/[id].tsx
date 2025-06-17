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
import { CompanyDetailsType, FullCompanyFormType } from 'src/types/company'

// ** Axios API call imports
import { getCompanyDetails, postCompanyDetailsUpdate } from 'src/api-services/CompanyApi'
import CompanyAddEditForm from 'src/views/apps/company/add-edit/CompanyAddEditForm'
import { useTranslation } from 'react-i18next'

const EditCompanyPage = () => {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetailsType>({} as CompanyDetailsType)
  const [loadingCompany, setLoadingCompany] = useState(false)
  const [errorCompany, setErrorCompany] = useState(false)
  const [defaultFormData, setDefaultFormData] = useState<FullCompanyFormType>({
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
  })

  const [submitting, setSubmitting] = useState(false)
  const [errorSubmitMsg, setErrorSubmitMsg] = useState('')

  const router = useRouter()

  // method to get all company details
  //@param: companyId is used for companywise details
  const getCompanyFilledData = async (companyId: string) => {
    try {
      setLoadingCompany(true)
    
      const response = await getCompanyDetails(companyId)
      if (response.status === 200) {
        const temp = {
          companyName: response.data?.companyName,
          companyEmail: response.data?.email,
          companyContact: response.data?.contactNumber,
          addressLine1: response.data?.address1 ? response.data?.address1 : '',
          addressLine2: response.data?.address2 ? response.data?.address2 : '',
          addressLine3: response.data?.address3 ? response.data?.address3 : '',
          country: response.data?.country ? response.data?.country : '',
          state: response.data?.state ? response.data?.state : '',
          city: response.data?.country ? response.data.country : '',
          postalCode: response.data?.postalcode ? response.data?.postalcode : ''
        }
        setCompanyDetails(response.data)
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
      getCompanyFilledData(router.query.id as string)
    }
  }, [router.isReady, router.query.id])
  const { t, ready } = useTranslation(['company', 'common']);
  //Method to submit edited company details
  const onSubmit = async (data: FullCompanyFormType, reset?: UseFormReset<FullCompanyFormType>) => {
    try {
      setSubmitting(true)
      const dataToSend = {
        ...companyDetails,
        companyName: data.companyName,
        email: data.companyEmail,
        contactNumber: data.companyContact,
        address1: data.addressLine1,
        address2: data.addressLine2,
        address3: data.addressLine3,
        country: data.country,
        state: data.state,
        city: data.city,
        postalCode: data.postalCode
      }
      const response = await postCompanyDetailsUpdate(dataToSend)
      if (response.status === 200) {
        router.push(`/company/view/${router.query.id}`)
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
            <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/company/list`}>
            {t('companiesText')}
            </MuiLink>
            <MuiLink
              underline='hover'
              color='inherit'
              component={NextLink as any}
              href={`/company/view/${companyDetails?.id}`}
            >
              {companyDetails?.companyName}
            </MuiLink>
            <Typography>{t('editCompanyText')}</Typography>
          </Breadcrumbs>
          <CompanyAddEditForm
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

export default EditCompanyPage
