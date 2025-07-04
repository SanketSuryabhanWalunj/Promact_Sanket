// ** React Imports
import { MouseEvent, useState } from 'react'

// ** Next Imports

// ** MUI Imports
import Grid, { GridProps } from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled, useTheme } from '@mui/material/styles'

// ** Icons Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { useTranslation } from 'react-i18next'

// ** Types Imports

const StyledGrid = styled(Grid)<GridProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const yearOptions = [new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3]

const barSeries = [
  { name: 'Earning', data: [252, 203, 152, 173, 235, 299, 235, 252, 106] },
  { name: 'Expense', data: [-128, -157, -190, -163, -89, -51, -89, -136, -190] }
]

const lineSeries = [
  { name: 'Last Month', data: [20, 10, 30, 16, 24, 5, 30, 23, 28, 5, 30] },
  { name: 'This Month', data: [50, 40, 60, 46, 54, 35, 70, 53, 58, 35, 60] }
]

const radarSeries = [
  { name: 'Sales', data: [32, 27, 27, 30, 25, 25] },
  { name: 'Visits', data: [25, 35, 20, 20, 20, 20] }
]

const SingleCompanyReportPage = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const theme = useTheme()

  const { settings } = useSettings()
  const { direction } = settings
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const barOptions: ApexOptions = {
    chart: {
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 6,
      lineCap: 'round',
      colors: [theme.palette.background.paper]
    },
    colors: [hexToRGBA(theme.palette.primary.main, 1), hexToRGBA(theme.palette.warning.main, 1)],
    legend: {
      offsetY: -5,
      offsetX: -30,
      position: 'top',
      fontSize: '13px',
      horizontalAlign: 'left',
      fontFamily: theme.typography.fontFamily,
      labels: { colors: theme.palette.text.secondary },
      itemMargin: {
        vertical: 4,
        horizontal: 10
      },
      markers: {
        width: 12,
        height: 12,
        radius: 10,
        offsetY: 1,
        offsetX: theme.direction === 'ltr' ? -4 : 5
      }
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '40%',
        endingShape: 'rounded',
        startingShape: 'rounded'
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      yaxis: {
        lines: { show: false }
      },
      padding: {
        left: -15,
        right: -10,
        bottom: -12
      }
    },
    xaxis: {
      axisTicks: { show: false },
      crosshairs: { opacity: 0 },
      axisBorder: { show: false },
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      labels: {
        style: {
          colors: theme.palette.text.disabled,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -15,
        style: {
          colors: theme.palette.text.disabled,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.xl,
        options: {
          chart: { height: 321 },
          plotOptions: {
            bar: { columnWidth: '45%' }
          }
        }
      },
      {
        breakpoint: 1380,
        options: {
          plotOptions: {
            bar: { columnWidth: '55%' }
          }
        }
      },
      {
        breakpoint: 1290,
        options: {
          chart: { height: 421 }
        }
      },
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          chart: { height: 321 },
          plotOptions: {
            bar: { columnWidth: '40%' }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          plotOptions: {
            bar: { columnWidth: '50%' }
          }
        }
      },
      {
        breakpoint: 680,
        options: {
          plotOptions: {
            bar: { columnWidth: '60%' }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          plotOptions: {
            bar: { columnWidth: '50%' }
          }
        }
      },
      {
        breakpoint: 450,
        options: {
          plotOptions: {
            bar: { columnWidth: '55%' }
          }
        }
      }
    ]
  }

  const lineOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },
    stroke: {
      width: [1, 2],
      curve: 'smooth',
      dashArray: [5, 0]
    },
    colors: [theme.palette.divider, hexToRGBA(theme.palette.primary.main, 1)],
    grid: {
      padding: { top: -5 },
      yaxis: {
        lines: { show: false }
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false }
    }
  }

  const radarOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    colors: [theme.palette.primary.main, theme.palette.info.main],
    plotOptions: {
      radar: {
        size: 110,
        polygons: {
          strokeColors: theme.palette.divider,
          connectorColors: theme.palette.divider
        }
      }
    },
    stroke: { width: 0 },
    fill: {
      opacity: [1, 0.85]
    },
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    markers: { size: 0 },
    legend: {
      fontSize: '13px',
      fontFamily: theme.typography.fontFamily,
      labels: { colors: theme.palette.text.secondary },
      itemMargin: {
        vertical: 4,
        horizontal: 10
      },
      markers: {
        width: 12,
        height: 12,
        radius: 10,
        offsetY: 1,
        offsetX: theme.direction === 'ltr' ? -4 : 5
      }
    },
    grid: {
      show: false,
      padding: {
        top: 10
      }
    },
    xaxis: {
      labels: {
        show: true,
        style: {
          fontSize: theme.typography.body2.fontSize as string,
          colors: [
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled
          ]
        }
      }
    },
    yaxis: { show: false },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          chart: { height: 337 }
        }
      }
    ]
  }

  return (
    <>
      <ApexChartWrapper>
        <Card>
          <Grid container spacing={6}>
            <StyledGrid
              item
              xs={12}
              sm={8}
              sx={{
                '& .apexcharts-series[rel="1"]': { transform: 'translateY(-6px)' },
                '& .apexcharts-series[rel="2"]': { transform: 'translateY(-9px)' }
              }}
            >
              <CardHeader title='Employees' />
              <CardContent>
                <ReactApexcharts type='bar' height={301} series={barSeries} options={barOptions} />
              </CardContent>
            </StyledGrid>
            <Grid item xs={12} sm={4}>
              <CardContent
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Button
                  size='small'
                  variant='outlined'
                  aria-haspopup='true'
                  onClick={handleClick}
                  sx={{ mb: 9, '& svg': { ml: 0.5 } }}
                >
                  {new Date().getFullYear()}
                  <Icon fontSize='1rem' icon='tabler:chevron-down' />
                </Button>
                <Menu
                  keepMounted
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  open={Boolean(anchorEl)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
                >
                  {yearOptions.map((year: number) => (
                    <MenuItem key={year} onClick={handleClose}>
                      {year}
                    </MenuItem>
                  ))}
                </Menu>

                <Typography variant='h3'>$25,825</Typography>
                <Box
                  sx={{
                    mb: 8,
                    gap: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant='h6'>{t('common:budjetText')}:</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>56,800</Typography>
                </Box>
                <ReactApexcharts type='line' height={80} series={lineSeries} options={lineOptions} />
                <Button sx={{ mt: 8 }} variant='contained'>
                  {t('common:increaseText')}
                </Button>
              </CardContent>
            </Grid>
          </Grid>
        </Card>

        <br />

        <Grid container spacing={6}>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardHeader title={t('common:coursesPurchasedText')} subheader={t('common:last6MonthsText')} />
              <CardContent>
                <ReactApexcharts type='radar' height={301} series={radarSeries} options={radarOptions} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card>
              <Grid container>
                <StyledGrid item xs={12} sm={8}>
                  <CardHeader title={t('common:certifiedText')} />
                  <CardContent>
                    <ReactApexcharts type='bar' height={301} series={barSeries} options={barOptions} />
                  </CardContent>
                </StyledGrid>
                <Grid item xs={12} sm={4}>
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Button
                      size='small'
                      variant='outlined'
                      aria-haspopup='true'
                      onClick={handleClick}
                      sx={{ mb: 9, '& svg': { ml: 0.5 } }}
                    >
                      {new Date().getFullYear()}
                      <Icon fontSize='1rem' icon='tabler:chevron-down' />
                    </Button>
                    <Menu
                      keepMounted
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      open={Boolean(anchorEl)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
                    >
                      {yearOptions.map((year: number) => (
                        <MenuItem key={year} onClick={handleClose}>
                          {year}
                        </MenuItem>
                      ))}
                    </Menu>

                    <Typography variant='h3'>$25,825</Typography>
                    <Box
                      sx={{
                        mb: 8,
                        gap: 1,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant='h6'>Budget:</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>56,800</Typography>
                    </Box>
                    <ReactApexcharts type='line' height={80} series={lineSeries} options={lineOptions} />
                    <Button sx={{ mt: 8 }} variant='contained'>
                      {t('common:increaseBudgetText')}
                    </Button>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </ApexChartWrapper>
    </>
  )
}

export default SingleCompanyReportPage
