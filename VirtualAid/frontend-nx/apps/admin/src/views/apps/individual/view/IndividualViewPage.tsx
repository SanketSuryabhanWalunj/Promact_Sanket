// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Next Imports
import { useRouter } from 'next/router'

import IndividualEmployeeDetails from 'src/views/apps/shared/individual-employee-view/IndividualEmployeeDetails'
import IndividualEmployeeTabs from 'src/views/apps/shared/individual-employee-view/IndividualEmployeeTabs'

const IndiVidualViewPage = () => {
  const router = useRouter()

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={5} lg={4}>
        {router.isReady ? <IndividualEmployeeDetails id={router.query.id as string} /> : <></>}
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        {router.isReady ? <IndividualEmployeeTabs id={router.query.id as string} /> : <></>}
      </Grid>
    </Grid>
  )
}

export default IndiVidualViewPage
