// ** React Imports

// ** Next Imports

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Custom App Component Imports
import IndividualEmployeeDetails from 'src/views/apps/shared/individual-employee-view/IndividualEmployeeDetails'
import IndividualEmployeeTabs from 'src/views/apps/shared/individual-employee-view/IndividualEmployeeTabs'

interface EmployeeViewPropsType {
  id: string
}

const EmployeeView = (props: EmployeeViewPropsType) => {
  return (
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={12} md={5} lg={4}>
          <IndividualEmployeeDetails id={props.id} />
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          <IndividualEmployeeTabs id={props.id} />
        </Grid>
      </Grid>
    </>
  )
}

export default EmployeeView
