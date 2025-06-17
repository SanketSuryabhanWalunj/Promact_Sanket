// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import NextLink from 'next/link'

// ** Mui Imports
import Grid, { GridProps } from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Button from '@mui/material/Button'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import { styled } from '@mui/material/styles'

// ** Auth config
import authConfig from 'src/configs/auth'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Types Imports
import { AdminDetailsType } from 'src/types/admin'

// ** Utils Imports
import { getInitials } from 'src/@core/utils/get-initials'
import { useTranslation } from 'react-i18next'

const StyledGrid = styled(Grid)<GridProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  [theme.breakpoints.up('md')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const SettingsIndexPage = () => {
  const [userDetails, setUserDetails] = useState<AdminDetailsType>({} as AdminDetailsType)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  useEffect(() => {
    const userDataFromLocalStorage = window.localStorage.getItem(authConfig.storageUserDataKeyName)
    if (userDataFromLocalStorage) {
      const parsedData = JSON.parse(userDataFromLocalStorage)
      delete parsedData.role
      setUserDetails(parsedData)
    }
  }, [])

  return (
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={12}>
          <Breadcrumbs>
            <Typography color='text.primary'>{t('common:settingsText')}</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ width: 'auto' }}>
            <Grid container sx={{ p: 6 }}>
              <StyledGrid item xs={12} md={4}>
                <CardContent>
                  {
                    <CustomAvatar
                      skin='filled'
                      variant='rounded'
                      sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
                    >
                      {userDetails.firstName && userDetails.lastName
                        ? getInitials(
                            (userDetails?.firstName + userDetails?.lastName)?.split(' ').slice(0, 2).join(' ')
                          )
                        : ''}
                    </CustomAvatar>
                  }
                </CardContent>
              </StyledGrid>
              <Grid item xs={12} md={8} sx={{ pl: { xs: 0, md: 19.5 }, pt: { xs: 4, md: 0 } }}>
                <Typography component='div' variant='body1' sx={{fontWeight: 'bold'}}>
                  {t('detailsText')}
                </Typography>
                <List>
                  <ListItem disableGutters>
                    <Typography component='span' variant='body1' sx={{ fontWeight: 600 }}>
                      {t('detailsText')}:&nbsp;
                    </Typography>
                    <Typography component='span' variant='body1'>
                      {userDetails?.firstName + ' ' + userDetails?.lastName}
                    </Typography>
                  </ListItem>
                  <ListItem disableGutters>
                    <Typography component='span' variant='body1' sx={{ fontWeight: 600 }}>
                      {t('emailLabel')}:&nbsp;
                    </Typography>
                    <Typography component='span' variant='body1'>
                      {userDetails?.email}
                    </Typography>
                  </ListItem>
                  <ListItem disableGutters>
                    <Typography component='span' variant='body1' sx={{ fontWeight: 600 }}>
                      {t('contactLabel')}:&nbsp;
                    </Typography>
                    <Typography component='span' variant='body1'>
                      {userDetails?.contactNumber}
                    </Typography>
                  </ListItem>
                  <ListItem disableGutters>
                    <Typography component='span' variant='body1' sx={{ fontWeight: 600 }}>
                      {t('common:countryText')}:&nbsp;
                    </Typography>
                    <Typography component='span' variant='body1'>
                      {userDetails?.country}
                    </Typography>
                  </ListItem>
                </List>
                <Button variant='contained' LinkComponent={NextLink} href='/settings/edit-profile'>
                  {t('edit')}
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default SettingsIndexPage
