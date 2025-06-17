// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import NextLink from 'next/link'

// ** Mui Imports
import Grid from '@mui/material/Grid'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'

// ** React hook form imports
import { UseFormReset } from 'react-hook-form'

import IndividualAddEditForm from 'src/views/apps/individual/add-edit/IndividualAddEditForm'

// ** Auth config
import authConfig from 'src/configs/auth'

// ** Types Imports
import { FullIndividualFormType, IndividualDetailsType } from 'src/types/individual'

// ** Axios API call imports
import { putIndividualDetailsUpdate } from 'src/api-services/IndividualApi'
import { useTranslation } from 'react-i18next'

const EditProfilePage = () => {
  const [currentUserDetails, setCurrentUserDetails] = useState<IndividualDetailsType>({} as IndividualDetailsType)
  const [userDetailsLoading, setUserDetailsLoading] = useState<boolean>(false)

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
  const [submitErrMsg, setSubmitErrMsg] = useState('')
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter()

  useEffect(() => {
    setUserDetailsLoading(true)
    const userDataFromLocalStorage = window.localStorage.getItem(authConfig.storageUserDataKeyName)
    if (userDataFromLocalStorage) {
      const parsedData = JSON.parse(userDataFromLocalStorage)
      delete parsedData.role
      setCurrentUserDetails(parsedData)
      setDefaultFormData({
        firstName: parsedData.firstName,
        lastName: parsedData.lastName,
        email: parsedData.email,
        contact: parsedData.contactNumber,
        addressLine1: parsedData.address1,
        addressLine2: parsedData.address2,
        addressLine3: parsedData.address3,
        country: parsedData.country,
        state: parsedData.state,
        city: parsedData.city,
        postalCode: parsedData.postalCode
      })
      setUserDetailsLoading(false)
    } else {
      setUserDetailsLoading(false)
    }
  }, [])

  const onSubmit = async (data: FullIndividualFormType, reset?: UseFormReset<FullIndividualFormType>) => {
    try {
      setSubmitting(true)
      const dataToSend = {
        ...currentUserDetails,
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
        postalcode: data.postalCode
      }

      const response = await putIndividualDetailsUpdate(dataToSend)

      if (response.status === 200) {
        const userDataFromLocalStorage = window.localStorage.getItem(authConfig.storageUserDataKeyName)
        if (userDataFromLocalStorage) {
          const parsedData = JSON.parse(userDataFromLocalStorage)
          const userData = response.data
          userData.role = parsedData.role
          window.localStorage.setItem(authConfig.storageUserDataKeyName, JSON.stringify(userData))
          router.replace('/settings')
        }
      } else {
        setSubmitting(false)
        setSubmitErrMsg(t('common:error.unspecific'))
      }
    } catch (error) {
      setSubmitting(false)
      setSubmitErrMsg(t('common:error.unspecific'))
    }
  }

  return (
    <>
      {userDetailsLoading ? (
        <></>
      ) : (
        <>
          <Grid container spacing={6.5}>
            <Grid item xs={12}>
              <Breadcrumbs>
                <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/settings/edit-profile`}>
                  {t('common:settingsText')}
                </MuiLink>
                <Typography>{t('edit')}</Typography>
              </Breadcrumbs>
            </Grid>
            <Grid item xs={12}>
              <IndividualAddEditForm
                formDefaultValues={defaultFormData}
                onSubmitClick={onSubmit}
                loading={submitting}
                errorMsg={submitErrMsg}
                showAddressFields={true}
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}

export default EditProfilePage
