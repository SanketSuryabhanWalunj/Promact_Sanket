// React Imports
import { MouseEvent, useEffect, useState } from 'react'

// Next Imports

// Mui Imports
import Grid, { GridProps } from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'

// ** Icons Imports
import Icon from 'src/@core/components/icon'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// App Component Imports
import UserCounterMonthInYearBarChart from 'src/views/apps/report-and-analytics/UserCountPerMonthInYearBarChart'
import CoursesPerMonthInYearRadarChart from 'src/views/apps/report-and-analytics/CoursesPerMonthInYearRadarChart'
import CoursesPerMonthInYearBarChart from 'src/views/apps/report-and-analytics/CoursesPerMonthInYearBarChart'
import CertifiedUserPerMonthInYearBarChart from 'src/views/apps/report-and-analytics/CertifiedUserPerMonthInYearBarChart'
import UserPermissionSemiCircleGauge from 'src/views/apps/report-and-analytics/UserPermissionSemiCircleGauge'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// Types Imports
import { CertifiedUserPerMonthType, PurchasePerMonthType, UserPerMonthType, UserPermissionType } from 'src/types/report'

// Axios API Call
import { getAdminReport } from 'src/api-services/Report'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'

const StyledGrid = styled(Grid)<GridProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

let currentYear = new Date().getFullYear()

const earliestYear = 2020

const yearOptions: number[] = []

while (currentYear >= earliestYear) {
  yearOptions.push(currentYear)
  currentYear = currentYear - 1
}

const ReportAndAnalyticsIndexPage = () => {
  const { settings } = useSettings()
  const { direction } = settings

  const [loadingReport, setLoadingReport] = useState(false)
  const [errorReport, setErrorReport] = useState(false)

  const [selectedYear, setSelectedYear] = useState(yearOptions[0])
  const [yearDropdownAnchorEl, setYearDropdownAnchorEl] = useState<null | HTMLElement>(null)

  const [userPermission, setUserPermission] = useState<UserPermissionType>({} as UserPermissionType)

  const [userCountPerMonth, setUserCountPerMonth] = useState<UserPerMonthType>({} as UserPerMonthType)

  const [certifiedUserCountPerMonth, setCertifiedUserCountPerMonth] = useState<CertifiedUserPerMonthType>(
    {} as CertifiedUserPerMonthType
  )

  const [purchasePerMonth, setPurchasePerMonth] = useState<PurchasePerMonthType>([])
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const getReportData = async (year: number) => {
    try {
      setLoadingReport(true)
      const response = await getAdminReport(year)
      if (response.status === 200) {
        setUserPermission(response.data.userPermission)
        setUserCountPerMonth(response.data.userList)
        setCertifiedUserCountPerMonth(response.data.certifiedList)
        setPurchasePerMonth(response.data.purchaseList)
        setLoadingReport(false)
        setErrorReport(false)
      } else {
        setLoadingReport(false)
        setErrorReport(true)
      }
    } catch (error) {
      setLoadingReport(false)
      setErrorReport(true)
    }
  }

  useEffect(() => {
    getReportData(selectedYear)
  }, [selectedYear])

  const handleYearDropdownButtonClick = (event: MouseEvent<HTMLElement>) => {
    setYearDropdownAnchorEl(event.currentTarget)
  }

  const handleYearDropdownClose = () => {
    setYearDropdownAnchorEl(null)
  }

  const onYearSelect = (year: number) => {
    setSelectedYear(year)
    handleYearDropdownClose()
  }

  const YearDropdown = () => {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Button
            size='small'
            variant='outlined'
            aria-haspopup='true'
            onClick={handleYearDropdownButtonClick}
            sx={{ mb: 9, '& svg': { ml: 0.5 } }}
          >
            {selectedYear}
            <Icon fontSize='1rem' icon='tabler:chevron-down' />
          </Button>
          <Menu
            keepMounted
            anchorEl={yearDropdownAnchorEl}
            onClose={handleYearDropdownClose}
            open={Boolean(yearDropdownAnchorEl)}
            anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
          >
            {yearOptions.map((year: number) => (
              <MenuItem key={year} value={year} onClick={() => onYearSelect(year)}>
                {year}
              </MenuItem>
            ))}
          </Menu>
        </Grid>
      </Grid>
    )
  }

  const LoadingScreen = () => {
    return (
      <>
        <Grid container spacing={6}>
          <Grid item xs={12} lg={4}>
            <Skeleton variant='rounded' width='100%' height={350} />
          </Grid>
          <Grid item xs={12} lg={8}>
            <Skeleton variant='rounded' width='100%' height={350} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant='rounded' width='100%' height={350} />
          </Grid>
          <Grid item xs={12} lg={8}>
            <Skeleton variant='rounded' width='100%' height={350} />
          </Grid>
        </Grid>
      </>
    )
  }

  const ErrorScreen = () => {
    return (
      <Box display='flex' justifyContent='center' alignItems='center'>
       {t('common:error.unspecific')}
      </Box>
    )
  }

  return (
    <>
      <ApexChartWrapper>
        {YearDropdown()}
        {loadingReport ? (
          <>{LoadingScreen()}</>
        ) : (
          <>
            {errorReport ? (
              <>{ErrorScreen()}</>
            ) : (
              <>
                <Grid container spacing={6} className='match-height'>
                  <Grid item xs={12} lg={4}>
                    <Card>
                      <UserPermissionSemiCircleGauge userPermission={userPermission} />
                    </Card>
                  </Grid>
                  <Grid item xs={12} lg={8}>
                    <Card>
                      <Grid container>
                        <StyledGrid item xs={12} sm={9}>
                          <CardHeader title={t('user')} />
                          <CardContent>
                            <UserCounterMonthInYearBarChart userCountPerMonth={userCountPerMonth} />
                          </CardContent>
                        </StyledGrid>
                        <Grid item xs={12} sm={3}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%'
                            }}
                          >
                            <Typography component='div' sx={{ fontSize: '26px', fontWeight: 500 }}>
                            {t('common:totalUserText')}
                            </Typography>
                            <Typography component='div' sx={{ fontSize: '26px', fontWeight: 500 }}>
                              {userCountPerMonth?.totalCount}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>

                  {/* <Grid item xs={12} lg={4}>
                  <Card>
                    <CardHeader title='Courses Purchased' />
                    <CardContent>
                      <CoursesPerMonthInYearRadarChart purchasePerMonth={purchasePerMonth} />
                    </CardContent>
                  </Card>
                </Grid> */}

                  <Grid item xs={12} lg={12}>
                    <CoursesPerMonthInYearBarChart purchasePerMonth={purchasePerMonth} />
                  </Grid>

                  <Grid item xs={12} lg={12}>
                    <Card>
                      <Grid container>
                        <StyledGrid item xs={12} sm={9}>
                          <CardHeader title={t('common:certifiedText')} />
                          <CardContent>
                            <CertifiedUserPerMonthInYearBarChart
                              certifiedUserCountPerMonth={certifiedUserCountPerMonth}
                            />
                          </CardContent>
                        </StyledGrid>
                        <Grid item xs={12} sm={3}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%'
                            }}
                          >
                            <Typography component='div' sx={{ fontSize: '26px', fontWeight: 500 }}>
                              {t('common:totalUserText')}
                            </Typography>
                            <Typography component='div' sx={{ fontSize: '26px', fontWeight: 500 }}>
                              {certifiedUserCountPerMonth?.totalCount}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}
          </>
        )}
      </ApexChartWrapper>
    </>
  )
}

export default ReportAndAnalyticsIndexPage
