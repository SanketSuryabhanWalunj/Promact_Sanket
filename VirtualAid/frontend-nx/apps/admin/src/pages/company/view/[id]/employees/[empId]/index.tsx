// ** Next Imports
import { useRouter } from 'next/router'

// App Components Imports
import EmployeeView from 'src/views/apps/company/employee/EmployeeViewPage'

const CompanyEmployeePage = () => {
  const router = useRouter()

  return <>{router.isReady ? <EmployeeView id={router.query.empId as string} /> : <></>}</>
}

export default CompanyEmployeePage
