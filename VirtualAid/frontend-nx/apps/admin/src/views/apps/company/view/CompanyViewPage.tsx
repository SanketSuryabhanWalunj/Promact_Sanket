// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Page Component Imports
import CompanyViewLeft from './CompanyViewLeft'
import CompanyViewRight from './CompanyViewRight'

const CompanyViewPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={5} lg={4}>
        <CompanyViewLeft />
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        <CompanyViewRight />
      </Grid>
    </Grid>
  )
}

export default CompanyViewPage
