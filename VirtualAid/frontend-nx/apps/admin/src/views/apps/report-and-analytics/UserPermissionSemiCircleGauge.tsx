// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Import
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Types Import
import { UserPermissionType } from 'src/types/report'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface UserPermissionSemiCircleGaugePropsType {
  userPermission: UserPermissionType
}

const UserPermissionSemiCircleGauge = (props: UserPermissionSemiCircleGaugePropsType) => {
  const { userPermission } = props
  const theme = useTheme()
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  // const [series, setSeries] = useState<number[]>([0])

  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    stroke: {},
    colors: [hexToRGBA(theme.palette.primary.main, 1)],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      radialBar: {
        endAngle: 90,
        startAngle: -90,
        hollow: { size: '64%' },
        track: {
          strokeWidth: '90%',
          background: hexToRGBA(theme.palette.customColors.trackBg, 1)
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: -3,
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.h4.fontSize as string
          }
        }
      }
    },
    grid: {
      padding: {
        bottom: 15
      }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          chart: { height: 199 }
        }
      },
      {
        breakpoint: 430,
        options: {
          chart: { height: 150 }
        }
      }
    ]
  }

  let arr: number[] = []

  if (
    userPermission?.totalUser != undefined &&
    userPermission?.totalUser != null &&
    userPermission?.consentCount != undefined &&
    userPermission?.consentCount != null
  ) {
    if (userPermission?.totalUser != 0) {
      const percentage = Number(((100 * userPermission?.consentCount) / userPermission?.totalUser).toFixed(2))

      // setSeries([percentage])
      arr = [percentage]
    } else {
      // setSeries([0])

      arr = [0]
    }
  }

 

  return (
    <Card>
      <CardContent>
        <Typography variant='h5'>{t('common:usersPermissionText')}</Typography>
     
        <ReactApexcharts type='radialBar' height={350} series={arr} options={options} />
        <Typography variant='body2' sx={{ textAlign: 'center', color: 'text.disabled' }}>
          {t('numberOfUsersGavePermission')}: {userPermission?.consentCount}
         
         {t('numberOfUsersText')}: {userPermission?.totalUser}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default UserPermissionSemiCircleGauge
