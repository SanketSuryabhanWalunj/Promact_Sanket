// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import NextLink from 'next/link'

// ** Mui Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

// ** Types Imports
import { CompanyPurchasedCourse } from 'src/types/courses'
import { CompanyProfileType, CourseCompanyRequestType } from 'src/types/company'

// ** Axios API calls imports
import { getCompanyProfile, getCompanyPurchasedCourses } from 'src/api-services/CompanyApi'

// ** Common Utils imports from lib
import { getDisplayDate } from '@virtual-aid-frontend/utils'
import EditAssignCourseButton from 'src/views/apps/company/view/EditAssignCourseButton'
import AssignCourseButton from 'src/views/apps/company/view/AssignCourseButton'

interface CellType {
  row: CompanyPurchasedCourse
}
interface CompanyViewCoursesPropsType {
  coursesRequestCount: CourseCompanyRequestType[]
  selectedCourse: CompanyPurchasedCourse | undefined
}



const CompanyCourseListPage = (props: CompanyViewCoursesPropsType) => {
  const [courses, setCourses] = useState<CompanyPurchasedCourse[]>([])
  const { coursesRequestCount } = props
  
   // Prefield values for form
   const prefieldValues = {
    courseName:'' ,
    purchasedAmount: 10,
    examType: '',
    totalAmount: 10
  };

  // Handle form submission
  const handleSubmit = () => {
    // Handle form submission logic here
  }
  
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [dataGridLoading, setDataGridLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)

  const [companyDetails, setCompanyDetails] = useState<CompanyProfileType>({} as CompanyProfileType)

  const [courseError, setCourseError] = useState<boolean>(false)

  const router = useRouter()

  const columns: GridColDef[] = [
    {
      flex: 0.2,
      minWidth: 200,
      field: 'courseName',
      headerName: 'Course',
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box sx={{ display: 'flex', alignItems: 'center' }}>{row.name}</Box>
      }
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'price',
      headerName: 'Price',
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box> &euro;{row.price}</Box>
      }
    },
    {
      flex: 0.17,
      minWidth: 170,
      field: 'qty',
      headerName: 'Purchased Qty',
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box>{row.purchasedAmount}</Box>
      }
    },
    {
      flex: 0.17,
      minWidth: 170,
      field: 'reminingQty',
      headerName: 'Unassigned Qty',
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box>{row.purchasedAmount - row.enrolledAmount}</Box>
      }
    },
    {
      flex: 0.18,
      minWidth: 200,
      field: 'purchasedDate',
      headerName: 'Purchased Date',
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box sx={{ display: 'flex', alignItems: 'center' }}>{getDisplayDate(row.purchasedDate)}</Box>
      }
    },
    {
      flex: 0.18,
      minWidth: 200,
      field: 'expirationDate',
      headerName: 'Expiration Date',
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box sx={{ display: 'flex', alignItems: 'center' }}>{getDisplayDate(row.expirationDate)}</Box>
      }
    },
    {
      flex: 0.25,
      minWidth: 250,
      field: 'edit',
      headerName: 'EDit',
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <EditAssignCourseButton courses={courses} selectedCourse={row} coursesRequestCount={coursesRequestCount} formDefaultValues={prefieldValues} onSubmitClick={handleSubmit} loading={false} errorMsg={''} ></EditAssignCourseButton>
      }
    },
  
  ]
  // Fetches the list of purchased courses for the company
  // @companyId: used to get courses companywise, pageno and pagesize for pagewise data of courses
  const getCourses = useCallback(async (companyId: string, pageNo: number, pageSize: number) => {
    try {
      setDataGridLoading(true)
      const culture = router.locale as string
      const response = await getCompanyPurchasedCourses(companyId, pageNo, pageSize,culture)
      if (response.status === 200) {
        setCourses(response.data.items)
        setTotalRows(response.data.totalCount)
        setDataGridLoading(false)
        setCourseError(false)
      } else {
        setDataGridLoading(false)
        setCourseError(true)
      }
    } catch (error) {
      setDataGridLoading(false)
      setCourseError(true)
    }
  }, [])

  useEffect(() => {
    if (router.isReady) {
      getCourses(router.query.id as string, paginationModel.page + 1, paginationModel.pageSize)
    }
  }, [getCourses, paginationModel.page, paginationModel.pageSize, router.isReady, router.query.id])

  //get company profile for breadcrumbs method 
  //@id: id string used to get id wise data
  const getCompanyProfileForBreadcrumbs = useCallback(async (id: string) => {
    try {
      const culture = router.locale as string
      const response = await getCompanyProfile(id,culture)

      if (response.status === 200) {
        setCompanyDetails(response.data)
      }
    } catch (error) {
    }
  }, [])

  useEffect(() => {
    if (router.isReady) {
      getCompanyProfileForBreadcrumbs(router.query.id as string)
    }
  }, [getCompanyProfileForBreadcrumbs, router.isReady, router.query.id])

  return (
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={12}>
          <Breadcrumbs>
            <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/company/list`}>
              Companies
            </MuiLink>
            <MuiLink
              underline='hover'
              color='inherit'
              component={NextLink as any}
              href={`/company/view/${companyDetails?.id}`}
            >
              {companyDetails?.companyName}
            </MuiLink>
            <Typography>Courses</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12}>
          <Card>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: '20px' }}>
              <CardHeader title='Courses List' />
              <AssignCourseButton courses={courses} coursesRequestCount={coursesRequestCount}></AssignCourseButton>
            </Box>
            <DataGrid
              rows={courses}
              columns={columns}
              autoHeight
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              loading={dataGridLoading}
              pageSizeOptions={[10, 20, 50]}
              rowCount={totalRows}
              paginationMode='server'
              paginationModel={paginationModel}
              onPaginationModelChange={model => {
                if (model.pageSize !== paginationModel.pageSize) {
                  const temp = { page: 0, pageSize: model.pageSize }
                  setPaginationModel(temp)
                } else {
                  setPaginationModel(model)
                }
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default CompanyCourseListPage
