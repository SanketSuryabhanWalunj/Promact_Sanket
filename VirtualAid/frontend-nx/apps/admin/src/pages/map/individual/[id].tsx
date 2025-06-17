// ** React imports
import { useEffect, useState } from 'react'

// ** Next imports
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// ** Mui Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'

// ** leaflet imports
import { LatLngExpression } from 'leaflet'

import { IndividualDetailsType } from 'src/types/individual'

// ** Axios API call
import { getIndividualLocationDetails } from 'src/api-services/GovernorApi'
import { useTranslation } from 'react-i18next'

const MapWithMarkerComponent = dynamic(() => import('src/views/apps/map/MapWithMarker'), {
  ssr: false
})

type IndividualLocationDetailsType = Omit<
  IndividualDetailsType,
  'isDeleted' | 'currentCompanyId' | 'currentCompanyName'
>

const MapIndividualLocation = () => {
  const router = useRouter()

  const [position, setPosition] = useState<LatLngExpression | null>(null)

  const [individualLocation, setIndividualLocation] = useState<IndividualLocationDetailsType | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationErrMsg, setLocationErrMsg] = useState('')

  const [noLocationMsg, setNoLocationMsg] = useState('')
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const getUserLocation = async (id: string) => {
    try {
      setLocationLoading(true)
      const response = await getIndividualLocationDetails(id)

      if (response.status === 200) {
        setIndividualLocation(response.data)
        if (response.data.latitude !== null && response.data.longitude !== null) {
          setPosition({ lat: response.data.latitude, lng: response.data.longitude })
        } else {
          setNoLocationMsg(t('common:noLocationFoundText'))
        }
        setLocationErrMsg('')
        setLocationLoading(false)
      } else {
        setLocationErrMsg(t('common:error.unspecific'))
        setLocationLoading(false)
      }
    } catch (error) {
      setLocationErrMsg(t('common:error.unspecific'))
      setLocationLoading(false)
    }
  }

  useEffect(() => {
    if (router.isReady) {
      getUserLocation(router.query.id as string)
    }
  }, [router.isReady, router.query.id])

  return (
    <>
      <Grid container spacing={6.5}>
        {noLocationMsg && (
          <Grid item xs={12}>
            <Alert severity='error' variant='filled'>
              {noLocationMsg}
            </Alert>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Box sx={{ width: '100%', height: { xs: '500px', xl: '700px' } }}>
            <MapWithMarkerComponent position={position} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <List>
              <ListItem>
                <Grid container spacing={2} sx={{ margin: '0' }}>
                  <Grid item xs={12} sm={4}>
                    {t('firstNameLabel')}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    {individualLocation?.firstName}
                  </Grid>
                </Grid>
              </ListItem>
              <Divider />

              <ListItem>
                <Grid container spacing={2} sx={{ margin: '0' }}>
                  <Grid item xs={12} sm={4}>
                  {t('lastNameLabel')}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    {individualLocation?.lastName}
                  </Grid>
                </Grid>
              </ListItem>
              <Divider />

              <ListItem>
                <Grid container spacing={2} sx={{ margin: '0' }}>
                  <Grid item xs={12} sm={4}>
                    {t('emailLabel')}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    {individualLocation?.email}
                  </Grid>
                </Grid>
              </ListItem>
              <Divider />

              <ListItem>
                <Grid container spacing={2} sx={{ margin: '0' }}>
                  <Grid item xs={12} sm={4}>
                    {t('contactLabel')}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    {individualLocation?.contactNumber}
                  </Grid>
                </Grid>
              </ListItem>
              <Divider />

              <ListItem>
                <Grid container spacing={2} sx={{ margin: '0' }}>
                  <Grid item xs={12} sm={4}>
                    {t('address')}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    {individualLocation?.address1},
                    {individualLocation?.address2 ? individualLocation?.address2 + ',' : ''}
                    {individualLocation?.address3 ? individualLocation?.address3 + ',' : ''}
                    {individualLocation?.city},{individualLocation?.state},{individualLocation?.country}.
                    {individualLocation?.postalcode}
                  </Grid>
                </Grid>
              </ListItem>
              <Divider />
            </List>
          </Card>
        </Grid>
      </Grid>

      <Backdrop open={locationLoading} sx={{ color: '#fff', zIndex: theme => theme.zIndex.tooltip + 1 }}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </>
  )
}

MapIndividualLocation.acl = {
  action: 'read',
  subject: 'individual-map-location'
}

export default MapIndividualLocation
