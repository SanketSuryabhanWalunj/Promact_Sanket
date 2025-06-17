// ** React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import NextLink from 'next/link'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { debounce } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Application Components Imports
// import { columns } from 'src/views/apps/shared/individual-employee-list/IndividualEmployeeListColumns'

// ** Types Imports
import { IndividualType } from 'src/types/individual'
import { CompanyProfileType } from 'src/types/company'

// ** Axios API calls imports
import { getCompanyEmps, getCompanyProfile } from 'src/api-services/CompanyApi'
import { changeActiveStatusIndividual } from 'src/api-services/IndividualApi'

// ** Utils imports
import { getInitials } from 'src/@core/utils/get-initials'

interface CellType {
  row: IndividualType
}

// ** renders client column
const renderClient = (row: IndividualType) => {
  if (row.profileImage) {
    return <CustomAvatar src={row.profileImage} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar
        skin='filled'
        sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
      >
        {getInitials(row.fullName ? row.fullName : '')}
      </CustomAvatar>
    )
  }
}

const CompanyEmployeeListPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [Individuals, setIndividuals] = useState<IndividualType[]>([])

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [dataGridLoading, setDataGridLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)

  const [companyDetails, setCompanyDetails] = useState<CompanyProfileType>({} as CompanyProfileType)

  const router = useRouter()

  const [searchedValue, setSearchedValue] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debouncedSearchedValue, setDebouncedSearchedValue] = useState('')

  const [changeStatusBackdrop, setChangeStatusBackdrop] = useState(false)

  const debouncedSetTypedText = useMemo(
    () =>
      debounce(keyword => {
        setDebouncedSearchedValue(keyword)
      }, 400),
    []
  )

  useEffect(() => {
    debouncedSetTypedText(searchedValue)
  }, [debouncedSetTypedText, searchedValue])

  //method to gt employee details to set in grid 
  //@param: companyId - for companyId wise data  
  //        pageno and pageSize? - used for getting pagewise data 
  const getEmployees = useCallback(async (companyId: string, pageNo: number, pageSize: number) => {
    try {
      setDataGridLoading(true)
      const response = await getCompanyEmps(companyId, pageNo, pageSize)

      if (response.status === 200) {
        setIndividuals(response.data.items)
        setTotalRows(response.data.totalCount)
        setDataGridLoading(false)
      } else {
        setDataGridLoading(false)
      }
    } catch (error) {
      setDataGridLoading(false)
    }
  }, [])

  useEffect(() => {
    if (router.isReady) {
      getEmployees(router.query.id as string, paginationModel.page + 1, paginationModel.pageSize)
    }
  }, [getEmployees, paginationModel.page, paginationModel.pageSize, router.isReady, router.query.id])

  //method to get company profile for breadcrumbs  
  //@param: id - to get data using id  
  const getCompanyProfileForBreadcrumbs = useCallback(async (id: string) => {
    try {
      const culture = router.locale as string;
      const response = await getCompanyProfile(id, culture)

      if (response.status === 200) {
        setCompanyDetails(response.data)
      }
    } catch (error) {
      //
    }
  }, [])

  useEffect(() => {
    if (router.isReady) {
      getCompanyProfileForBreadcrumbs(router.query.id as string)
    }
  }, [getCompanyProfileForBreadcrumbs, router.isReady, router.query.id])

  //active deactive account details using this method
  //@param: row - to set row data here 
  const activeDeactiveAccount = async (row: IndividualType) => {
    const copyOfIndividuals: IndividualType[] = JSON.parse(JSON.stringify(Individuals))
    try {
      setChangeStatusBackdrop(true)
      const culture = router.locale as string;
      const response = await changeActiveStatusIndividual(row.id, !row.isDeleted, culture)

      if (response.status === 200) {
        setChangeStatusBackdrop(false)

        getEmployees(router.query.id as string, paginationModel.page + 1, paginationModel.pageSize)
      } else {
        setChangeStatusBackdrop(false)
        setIndividuals(copyOfIndividuals)
      }
    } catch (error) {
      setChangeStatusBackdrop(false)
      setIndividuals(copyOfIndividuals)
    }
  }

  const columns: GridColDef[] = [
    {
      flex: 0.3,
      minWidth: 250,
      field: 'fullName',
      headerName: 'Employees',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderClient(row)}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              noWrap
              component={NextLink}
              href={`/individual/view/${row.id}`}
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {row.fullName}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.2,
      minWidth: 126,
      field: 'coursesEnrolled',
      headerName: 'Courses enrolled',
      renderCell: ({ row }: CellType) => (
        <Typography sx={{ color: 'text.secondary' }}>{row.noOfCoursesEnrolled}</Typography>
      )
    },
   
    {
      flex: 0.2,
      minWidth: 126,
      field: 'country',
      headerName: 'Country',
      renderCell: ({ row }: CellType) => <Typography sx={{ color: 'text.secondary' }}>{row.country}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 125,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }: CellType) => (
        <>
          <Box>
            <IconButton LinkComponent={NextLink} href={`/individual/edit/${row.id}`}>
              <Icon icon={'tabler:edit'} />
            </IconButton>
            <Switch checked={!row.isDeleted} onChange={() => activeDeactiveAccount(row)} />
          </Box>
        </>
      )
    }
  ]

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
            <Typography>Employees</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <Box
              sx={{
                py: 4,
                px: 6,
                rowGap: 2,
                columnGap: 4,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <CustomTextField
                  sx={{ mr: 4 }}
                  placeholder='Search'
                  value={searchedValue}
                  onChange={e => setSearchedValue(e.target.value)}
                />
                <Button
                  variant='contained'
                  LinkComponent={NextLink}
                  href={`/company/view/${router.query.id}/employees/add`}
                >
                  + Add Employee
                </Button>
              </Box>
            </Box>
            <DataGrid
              autoHeight
              rows={Individuals}
              columns={columns}
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              loading={dataGridLoading}
              pageSizeOptions={[10, 25, 50]}
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

      <Backdrop open={changeStatusBackdrop} sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </>
  )
}

export default CompanyEmployeeListPage
