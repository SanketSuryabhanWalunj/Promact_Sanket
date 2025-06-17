// ** react imports
import { useLayoutEffect, useRef, useState } from 'react'

// ** next imports
import NextLink from 'next/link'

// ** MUI imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'

// ** Icon imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** amCharts Imports
import * as am5 from '@amcharts/amcharts5'
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive'
import * as am5map from '@amcharts/amcharts5/map'
import am5geodata_netherlandsLow from '@amcharts/amcharts5-geodata/netherlandsLow'
import { IComponentDataItem } from '@amcharts/amcharts5/.internal/core/render/Component'

// ** App Utils Imports
import { getInitials } from 'src/@core/utils/get-initials'

// ** Types Imports
import { IndividualsOfStateType } from 'src/types/governor'

// ** Axios Call Imports
import { getCountOfIndividualsWithConsentPerStates, getIndividualsOfState } from 'src/api-services/GovernorApi'

const renderClient = (row: IndividualsOfStateType) => {
  return (
    <CustomAvatar
      skin='filled'
      sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
    >
      {getInitials(row.firstName + ' ' + row.lastName)}
    </CustomAvatar>
  )
}

const MapChart = () => {
  const [state, setState] = useState('')
  const [numberOfPeople, setNumberOfPeople] = useState(0)
  const [lastClickedPolygon, setLastClickedPolygon] = useState<am5map.MapPolygon | null>(null)
  const [polyEv, setPolyEv] = useState<
    am5.ISpritePointerEvent & {
      type: 'click'
      target: am5map.MapPolygon
    }
  >()

  const [mapData, setMapData] = useState<{ [key: string]: number }>({})
  const [mapDataLoading, setMapDataLoading] = useState(false)

  const [individuals, setIndividuals] = useState<IndividualsOfStateType[]>([])
  const [individualsLoading, setIndividualsLoading] = useState(false)

  const chartRef = useRef<am5map.MapChart | null>(null)
  const polygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null)
  const labelSeriesRef = useRef<am5map.MapPointSeries | null>(null)
  const legendRef = useRef<am5.Legend | null>(null)

  const theme = useTheme()

  const getCountsPerState = async () => {
    try {
      setMapDataLoading(true)
      const response = await getCountOfIndividualsWithConsentPerStates('Netherlands')

      if (response.status === 200) {
        const { data } = response
        setMapData(response.data)

        const featuresLength = am5geodata_netherlandsLow.features.length

        // set state data
        const stateData = []
        for (let i = 0; i < featuresLength; i++) {
          const state = am5geodata_netherlandsLow.features[i]
          const value = data[am5geodata_netherlandsLow.features[i].properties?.NAME_ENG] | 0

          // Math.floor(Math.random() * (10000 - 100 + 1)) + 100
          let stateColor = '#fff'
          if (value < 500) {
            stateColor = '#B60909'
          } else if (value >= 500 && value < 2000) {
            stateColor = '#FF6767'
          } else if (value >= 2000 && value < 5000) {
            stateColor = '#C5FBA2'
          } else if (value >= 5000 && value < 8000) {
            stateColor = '#8CE552'
          } else if (value >= 8000) {
            stateColor = '#4DB509'
          }

          stateData.push({
            id: state.id,
            value: value,
            polygonSettings: {
              fill: stateColor

              //   visible: isVisible, // Sets visibility based on the condition
            }
          })
        }

        polygonSeriesRef.current?.data.setAll(stateData)
        labelSeriesRef.current?.data.setAll(stateData)
        setMapDataLoading(false)
      }
    } catch (error) {
      setMapDataLoading(false)
    }
  }

  const getIndividuals = async (state: string) => {
    try {
      setIndividualsLoading(true)
      const response = await getIndividualsOfState(state)

      if (response.status === 200) {
        setIndividuals(response.data)
        setIndividualsLoading(false)
      } else {
        setIndividualsLoading(false)
      }
    } catch (error) {
      setIndividualsLoading(false)
    }
  }

  useLayoutEffect(() => {
    const legendData = [
      { name: '> 8000', fill: am5.color(0x4db509) },
      { name: '5000 - 8000', fill: am5.color(0x8ce552) },
      { name: '2000 - 5000', fill: am5.color(0xc5fba2) },
      { name: '500 - 2000', fill: am5.color(0xff6767) },
      { name: '< 500', fill: am5.color(0xb60909) }
    ]

    const root = am5.Root.new('chartdiv')

    root.setThemes([am5themes_Responsive.new(root)])

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'none',
        panY: 'none',
        projection: am5map.geoMercator(),
        minZoomLevel: 1,
        maxZoomLevel: 1
      })
    )

    // Create polygon series for the map to add Thailand chart
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_netherlandsLow
      })
    )

    // template to add custom settings
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: '[#000 bold]{name} : {value}[/]',
      interactive: false,
      templateField: 'polygonSettings',
      strokeOpacity: 0,
      shadowColor: am5.color(0x000000),
      shadowBlur: 1,
      shadowOffsetX: 0,
      shadowOffsetY: 0
    })

    // add event listener to scroll page from inside map area
    window.addEventListener(
      'wheel',
      function (event) {
        window.scrollBy(5, event.deltaY)
      },
      { passive: false }
    )

    // Create and configure a legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        // Legend configuration options
        layout: root.verticalLayout,
        clickTarget: 'none'
      })
    )

    // Change legend marker style to square
    legend.markers.template.setAll({
      width: 30, // width of the square
      height: 15, // height of the square

      background: am5.Rectangle.new(root, {
        strokeWidth: 0
      })
    })

    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 10,
      cornerRadiusTR: 10,
      cornerRadiusBL: 10,
      cornerRadiusBR: 10
    })

    // push the legendData to the legend
    am5.array.each(legendData, function (group) {
      const polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          name: group.name,
          fill: group.fill
        })
      )
      legend.data.push(polygonSeries)
    })

    // creating series to add labels in all areas
    const labelSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {
        valueField: 'value',
        calculateAggregates: true,
        polygonIdField: 'id'
      })
    )

    labelSeries.bullets.push(function (root) {
      const container = am5.Container.new(root, {})

      container.children.push(
        am5.Label.new(root, {
          text: '{value}', // value which is shown in each area
          populateText: true,
          fontWeight: 'bold',
          fontSize: 8,
          centerX: am5.p50,
          centerY: am5.p50
        })
      )

      return am5.Bullet.new(root, {
        sprite: container,
        dynamic: true
      })
    })

    polygonSeries.mapPolygons.template.events.on('click', ev => {
      setPolyEv(ev)
    })

    chartRef.current = chart
    polygonSeriesRef.current = polygonSeries
    labelSeriesRef.current = labelSeries
    legendRef.current = legend

    // polygonSeries.data.setAll(stateData)
    // labelSeries.data.setAll(stateData)

    return () => {
      root.dispose()
    }
  }, [])

  useLayoutEffect(() => {
    if (polygonSeriesRef.current && polyEv) {
      const dataItem: am5.DataItem<IComponentDataItem> | undefined = polyEv.target.dataItem
      const data: any = dataItem?.dataContext
      setState(data.name)
      setNumberOfPeople(data.value)

      let prevSelectedPolygon = null

      //   get prev selected polygon.
      for (const polygon of polygonSeriesRef.current.mapPolygons) {
        if (polygon._settings.opacity === 1) {
          prevSelectedPolygon = polygon
        }
      }

      if (prevSelectedPolygon?.dataItem?.uid === polyEv?.target?.dataItem?.uid) {
        polygonSeriesRef.current.mapPolygons.each(polygon => {
          polygon.setAll({
            opacity: 1,
            strokeOpacity: 0,
            shadowColor: am5.color(0x000000),
            shadowBlur: 1,
            shadowOffsetX: 0,
            shadowOffsetY: 0
          })
        })
        setLastClickedPolygon(null)
        setIndividuals([])
      } else {
        polygonSeriesRef.current.mapPolygons.each(polygon => {
          polygon.setAll({
            opacity: 0.5,
            strokeOpacity: 0,
            shadowColor: am5.color(0x000000),
            shadowBlur: 1,
            shadowOffsetX: 0,
            shadowOffsetY: 0
          })
        })

        const clickedPolygon = polyEv.target
        clickedPolygon.setAll({
          strokeOpacity: 1,
          shadowColor: am5.color(0x000000),
          shadowBlur: 10,
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
          opacity: 1
        })
        setLastClickedPolygon(clickedPolygon)
        getIndividuals(data.NAME_ENG)
      }

      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }
  }, [polyEv])

  useLayoutEffect(() => {
    if (legendRef.current && theme) {
      if (theme.palette.mode === 'light') {
        legendRef.current.labels.template.setAll({
          fontSize: 16,
          fontWeight: '300',
          fill: am5.color(0x000000)
        })
      } else {
        legendRef.current.labels.template.setAll({
          fontSize: 16,
          fontWeight: '300',
          fill: am5.color(0xffffff)
        })
      }
    }
  }, [theme])

  useLayoutEffect(() => {
    if (polygonSeriesRef && labelSeriesRef) {
      getCountsPerState()
    }
  }, [polygonSeriesRef, labelSeriesRef])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 4 }}>
            <div id='chartdiv' style={{ width: '100%', height: '500px' }}></div>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 4 }}>
            <Typography component='div' variant='h6' sx={{ mb: 4 }}>
              Users ({individuals.length})
            </Typography>

            {individuals.map((item, index) => (
              <Box key={index} sx={{ mb: 4, display: 'flex', alignItems: 'center', width: '100%' }}>
                {renderClient(item)}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', width: '70%' }}>
                  <Typography component='div' variant='body1'>
                    {item.firstName + ' ' + item.lastName}
                  </Typography>
                  <Typography component='div' variant='caption'>
                    {item.email}
                  </Typography>
                </Box>
                <IconButton LinkComponent={NextLink} href={`/map/individual/${item.id}`}>
                  <Icon icon='ic:round-near-me'></Icon>
                </IconButton>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>

      <Backdrop
        open={individualsLoading || mapDataLoading}
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.tooltip + 1 }}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    </>
  )
}

export default MapChart
