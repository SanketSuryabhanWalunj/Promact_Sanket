// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import NextLink from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import DialogContentText from '@mui/material/DialogContentText'
import Skeleton from '@mui/material/Skeleton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Types
import { CompanyProfileType } from 'src/types/company'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Axios API call Imports
import { getCompanyProfile } from 'src/api-services/CompanyApi'
import { useTranslation } from 'react-i18next'

interface CompanyViewLeftProps {
  companyDetails: CompanyProfileType
}

const CompanyViewLeft = () => {
  const router = useRouter()

  const [companyDetails, setCompanyDetails] = useState<CompanyProfileType>({} as CompanyProfileType)
  const [detailsLoading, setDetailsLoading] = useState(true)
  const [detailsErr, setDetailsErr] = useState(false)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const getCompanyData = async (id: string) => {
    try {
      setDetailsLoading(true)
      const culture = router.locale as string;
      const response = await getCompanyProfile(id,culture)

      if (response.status === 200) {
        setCompanyDetails(response.data)
        setDetailsLoading(false)
        setDetailsErr(false)
      } else {
        setDetailsLoading(false)
        setDetailsErr(true)
      }
    } catch (error) {
      setDetailsLoading(false)
      setDetailsErr(true)
    }
  }

  useEffect(() => {
    if (router.isReady) {
      getCompanyData(router.query.id as string)
    }
  }, [router.isReady, router.query.id])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          {detailsLoading ? (
            <>
              <Skeleton variant='rectangular' width='100%' height={579} />
            </>
          ) : (
            <>
              {detailsErr ? (
                <>
                  <Box display='flex' alignItems='center' justifyContent='center'>
                  {t('common:error.unspecific')}
                  </Box>
                </>
              ) : (
                <>
                  <CardContent sx={{ pt: 13.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    {companyDetails.profileImage ? (
                      <CustomAvatar
                        src={companyDetails.profileImage}
                        variant='rounded'
                        alt={companyDetails.companyName}
                        sx={{ width: 100, height: 100, mb: 4 }}
                      />
                    ) : (
                      <CustomAvatar
                        skin='light'
                        variant='rounded'
                        sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
                      >
                        {getInitials(
                          companyDetails.companyName
                            ? companyDetails?.companyName?.split(' ').slice(0, 2).join(' ')
                            : ''
                        )}
                      </CustomAvatar>
                    )}
                    <Typography variant='h4' sx={{ mb: 3 }}>
                      {companyDetails.companyName}
                    </Typography>
                  </CardContent>

                  <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ mr: 8, display: 'flex', alignItems: 'center' }}>
                        <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                          <Icon fontSize='1.75rem' icon='tabler:checkbox' />
                        </CustomAvatar>
                        <div>
                          <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                            {companyDetails.employeesEnrolled}
                          </Typography>
                          <Typography variant='body2'>{t('employeeEnrolled')}</Typography>
                        </div>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                          <Icon fontSize='1.75rem' icon='tabler:briefcase' />
                        </CustomAvatar>
                        <div>
                          <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                            {companyDetails.coursesPurchased}
                          </Typography>
                          <Typography variant='body2'>{t('common:coursesPurchasedText')}</Typography>
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
                        <Typography sx={{ color: 'text.secondary' }}>{companyDetails.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
                        <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>{t('statusText')}:</Typography>
                        <CustomChip
                          rounded
                          skin='light'
                          size='small'
                          label={`${companyDetails.status}`}
                          color={'success'}
                          sx={{
                            textTransform: 'capitalize'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', mb: 3 }}>
                        <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>{t('contactLabel')}:</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>{companyDetails.contactNumber}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', mb: 3 }}>
                        <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>{t('common:countryText')}:</Typography>
                        <Box>
                          <Typography sx={{ color: 'text.secondary' }}>{companyDetails.country}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Button variant='contained' LinkComponent={NextLink} href={`/company/edit/${router.query.id}`}>
                        {t('edit')}
                      </Button>
                    </Box>
                  </CardContent>
                </>
              )}
            </>
          )}
        </Card>
      </Grid>
    </Grid>
  )
}

export default CompanyViewLeft
