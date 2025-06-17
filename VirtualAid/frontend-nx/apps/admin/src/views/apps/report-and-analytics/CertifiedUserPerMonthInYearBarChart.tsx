// ** React Imports
import { useEffect, useMemo, useState } from 'react'

// ** Next Imports

// ** Mui Imports
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Types Imports
import { CertifiedUserPerMonthType } from 'src/types/report'

interface CertifiedUserPerMonthInYearBarChartPropsType {
  certifiedUserCountPerMonth: CertifiedUserPerMonthType
}

const CertifiedUserPerMonthInYearBarChart = (props: CertifiedUserPerMonthInYearBarChartPropsType) => {
  const { certifiedUserCountPerMonth } = props
  const theme = useTheme()

  const barOptions: ApexOptions = useMemo(
    () => ({
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
    }),
    [
      theme.breakpoints.values.lg,
      theme.breakpoints.values.md,
      theme.breakpoints.values.sm,
      theme.breakpoints.values.xl,
      theme.direction,
      theme.palette.background.paper,
      theme.palette.divider,
      theme.palette.primary.main,
      theme.palette.text.disabled,
      theme.palette.text.secondary,
      theme.palette.warning.main,
      theme.typography.body2.fontSize,
      theme.typography.fontFamily
    ]
  )

  const [optionsForChart, setOptionsForChart] = useState<ApexOptions>({} as ApexOptions)
  const [seriesForChart, setSeriesForChart] = useState<{ data: number[] }[]>([])

  useEffect(() => {
    if (
      certifiedUserCountPerMonth?.monthCountList !== undefined ||
      certifiedUserCountPerMonth?.monthCountList !== null
    ) {
      const barChartData = certifiedUserCountPerMonth?.monthCountList

      const xAxis = []
      const yAxis = []

      for (let i = 0; i < barChartData?.length; i++) {
        xAxis.push(barChartData[i].monthName)
        yAxis.push(barChartData[i].count)
      }

      const tempOptions = JSON.parse(JSON.stringify(barOptions))
      tempOptions.xaxis.categories = xAxis
      setOptionsForChart(tempOptions)
      setSeriesForChart([{ data: yAxis }])
    }
  }, [barOptions, certifiedUserCountPerMonth?.monthCountList])

  return (
    <>
      <ReactApexcharts options={optionsForChart} series={seriesForChart} type='bar' height={301} />
    </>
  )
}

export default CertifiedUserPerMonthInYearBarChart
