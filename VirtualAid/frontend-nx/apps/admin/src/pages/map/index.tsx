// ** react imports
import { useLayoutEffect } from 'react'

// ** next imports
import dynamic from 'next/dynamic'

// ** MUI imports
import Card from '@mui/material/Card'

// ** amCharts Imports
import * as am5 from '@amcharts/amcharts5'
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive'
import * as am5map from '@amcharts/amcharts5/map'
import am5geodata_netherlandsLow from '@amcharts/amcharts5-geodata/netherlandsLow'

const MapChartComponent = dynamic(() => import('src/views/apps/map/MapChart'), {
  ssr: false
})

const MapPage = () => {
  return (
    <>
      <MapChartComponent />
    </>
  )
}

MapPage.acl = {
  action: 'read',
  subject: 'map-chart'
}

export default MapPage
