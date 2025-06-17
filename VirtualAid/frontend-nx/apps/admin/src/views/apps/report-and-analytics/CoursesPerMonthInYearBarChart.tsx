// ** React Imports
import { useEffect, useMemo, useState } from 'react'

// ** Next Imports

// ** Mui Imports
import { useTheme } from '@mui/material/styles'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Types Imports
import { PurchasePerMonthType } from 'src/types/report'
import { useTranslation } from 'react-i18next'

interface ChartPropsType {
  purchasePerMonth: PurchasePerMonthType
}

const CoursesPerMonthInYearBarChart = (props: ChartPropsType) => {
  const { purchasePerMonth } = props

  const theme = useTheme()



  const barOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        parentHeightOffset: 0,
        toolbar: { show: false }
      },
      colors: ['#00cfe8'],
      dataLabels: { enabled: false },
      plotOptions: {
        bar: {
          borderRadius: 8,
          barHeight: '30%',
          horizontal: true,
          startingShape: 'rounded'
        }
      },
      grid: {
        borderColor: theme.palette.divider,
        xaxis: {
          lines: { show: false }
        },
        padding: {
          top: -10
        }
      },
      yaxis: {
        labels: {
          style: { colors: theme.palette.text.disabled }
        }
      },
      xaxis: {
        axisBorder: { show: false },
        axisTicks: { color: theme.palette.divider },
        categories: ['MON, 11', 'THU, 14', 'FRI, 15', 'MON, 18', 'WED, 20', 'FRI, 21', 'MON, 23'],
        labels: {
          style: { colors: theme.palette.text.disabled }
        }
      }
    }),
    [theme.palette.divider, theme.palette.text.disabled]
  )

  const [optionsForChart, setOptionsForChart] = useState<ApexOptions>({} as ApexOptions)
  const [seriesForChart, setSeriesForChart] = useState<{ name: string; data: number[] }[]>([])
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  useEffect(() => {
    const xAxis = []
    const yAxis = []

    for (let i = 0; i < purchasePerMonth.length; i++) {
      xAxis.push(purchasePerMonth[i].monthName)
      yAxis.push(purchasePerMonth[i].count)
    }

    const tempOptions = JSON.parse(JSON.stringify(barOptions))
    tempOptions.xaxis.categories = xAxis

    setOptionsForChart(tempOptions)

    setSeriesForChart([{ name: t('common:coursesPurchasedText'), data: yAxis }])
  }, [barOptions, purchasePerMonth])

  return (
    <>
      <Card>
        <CardHeader title={t('common:coursesPurchasedText')} />
        <CardContent>
          <ReactApexcharts type='bar' height={400} options={optionsForChart} series={seriesForChart} />
        </CardContent>
      </Card>
    </>
  )
}

export default CoursesPerMonthInYearBarChart
