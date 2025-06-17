// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Types
import { IndividualProfileType } from 'src/types/individual'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** API requests Imports
import { getIndividualProfile } from 'src/api-services/IndividualApi'
import { useTranslation } from 'react-i18next'

interface PropsType {
  id: string
}

const IndividualEmployeeDetails = (props: PropsType) => {
  const { id } = props

  const [detailsLoading, setDetailsLoading] = useState<boolean>(true)
  const [detailsError, setDetailsError] = useState<boolean>(false)
  const [details, setDetails] = useState<IndividualProfileType>({} as IndividualProfileType)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const getDetails = useCallback(async () => {
    try {
      setDetailsLoading(true)
      const response = await getIndividualProfile(id)
      if (response.status === 200) {
        setDetails(response.data)
        setDetailsLoading(false)
        setDetailsError(false)
      } else {
        setDetailsLoading(false)
        setDetailsError(true)
      }
    } catch (error) {
      setDetailsLoading(false)
      setDetailsError(true)
    }
  }, [id])

  useEffect(() => {
    getDetails()
  }, [getDetails])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            {detailsLoading ? (
              <>
                <Skeleton variant='rectangular' width='100%' height={579} />
              </>
            ) : (
              <>
                {detailsError ? (
                  <></>
                ) : (
                  <>
                    <CardContent sx={{ pt: 13.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                      {details.profileImage ? (
                        <CustomAvatar
                          src={details.profileImage}
                          variant='rounded'
                          alt={details.fullName}
                          sx={{ width: 100, height: 100, mb: 4 }}
                        />
                      ) : (
                        <CustomAvatar
                          skin='light'
                          variant='rounded'
                          sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
                        >
                          {getInitials(details.fullName)}
                        </CustomAvatar>
                      )}
                      <Typography variant='h4' sx={{ mb: 3 }}>
                        {details.fullName}
                      </Typography>
                      {details?.companyName && (
                        <CustomChip
                          rounded
                          skin='light'
                          size='small'
                          label={details?.companyName}
                          color={'secondary'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      )}
                    </CardContent>

                    <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ mr: 8, display: 'flex', alignItems: 'center' }}>
                          <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                            <Icon fontSize='1.75rem' icon='tabler:book' />
                          </CustomAvatar>
                          <div>
                            <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                              {details.noOfCoursesEnrolled}
                            </Typography>
                            <Typography variant='body2'>Course</Typography>
                          </div>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                            <Icon fontSize='1.75rem' icon='tabler:certificate' />
                          </CustomAvatar>
                          <div>
                            <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                              {details.noOfCertificate}
                            </Typography>
                            <Typography variant='body2'>Certificate</Typography>
                          </div>
                        </Box>
                      </Box>
                    </CardContent>

                    <Divider sx={{ my: '0 !important', mx: 6 }} />

                    <CardContent sx={{ pb: 4 }}>
                      <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
                       {t('detailsText')}
                      </Typography>
                      <Box sx={{ pt: 4 }}>
                        <Box sx={{ display: 'flex', mb: 3 }}>
                          <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>{t('emailLabel')}:</Typography>
                          <Typography sx={{ color: 'text.secondary' }}>{details.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
                          <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>{t('statusText')}:</Typography>
                          <CustomChip
                            rounded
                            skin='light'
                            size='small'
                            label={'Active'}
                            color={'success'}
                            sx={{
                              textTransform: 'capitalize'
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', mb: 3 }}>
                          <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>{t('contactLabel')}:</Typography>
                          <Typography sx={{ color: 'text.secondary' }}>{details.contactNumber}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex' }}>
                          <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>{t('common:countryText')}:</Typography>
                          <Box>
                            <Typography sx={{ color: 'text.secondary' }}>{details.country}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </>
                )}
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default IndividualEmployeeDetails
