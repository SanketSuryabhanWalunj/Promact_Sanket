// ** React Imports
import { useEffect, useMemo, useState } from 'react'

// ** Next Imports

// ** Mui Imports
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Types Imports
import { PurchasePerMonthType } from 'src/types/report'

interface CoursesPerMonthInYearRadarChartPropsType {
  purchasePerMonth: PurchasePerMonthType
}

const CoursesPerMonthInYearRadarChart = (props: CoursesPerMonthInYearRadarChartPropsType) => {
  const { purchasePerMonth } = props
  const theme = useTheme()

  const radarOptions: ApexOptions = useMemo(
    () => ({
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
    }),
    [
      theme.breakpoints.values.lg,
      theme.direction,
      theme.palette.divider,
      theme.palette.info.main,
      theme.palette.primary.main,
      theme.palette.text.disabled,
      theme.palette.text.secondary,
      theme.typography.body2.fontSize,
      theme.typography.fontFamily
    ]
  )

  const [optionsForChart, setOptionsForChart] = useState<ApexOptions>({} as ApexOptions)
  const [seriesForChart, setSeriesForChart] = useState<{ data: number[] }[]>([])

  useEffect(() => {
    const xAxis = []
    const yAxis = []

    for (let i = 0; i < purchasePerMonth.length; i++) {
      xAxis.push(purchasePerMonth[i].monthName)
      yAxis.push(purchasePerMonth[i].count)
    }

    const tempOptions = JSON.parse(JSON.stringify(radarOptions))
    tempOptions.xaxis.categories = xAxis
    setOptionsForChart(tempOptions)
    setSeriesForChart([{ data: yAxis }])
  }, [purchasePerMonth, radarOptions])

  return (
    <>
      <ReactApexcharts type='radar' height={301} series={seriesForChart} options={optionsForChart} />
    </>
  )
}

export default CoursesPerMonthInYearRadarChart
