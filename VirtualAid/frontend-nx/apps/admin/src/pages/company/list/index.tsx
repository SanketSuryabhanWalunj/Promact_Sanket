// ** React Import
import { useCallback, useEffect, useMemo, useState } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import MuiLink from '@mui/material/Link'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { DataGrid, GridCallbackDetails, GridColDef, GridPagination } from '@mui/x-data-grid'

import { DialogTitle, debounce } from '@mui/material'

// ** Icon imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Types Imports
import { CompanyType, CompanyCountType, CompanyPendingReuestType, CourseCompanyRequestType } from 'src/types/company'
import {
  changeActiveStatusCompany,
  getCompanyListPagination,
  getActiveCompanyCount,
  getActiveAllCompanyReuest,
  getCourseCount
} from 'src/api-services/CompanyApi'
import axios from 'axios'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'
import ListSearchBox from 'src/components/list-search/ListSearchBox'

interface CellType {
  row: CompanyType
}

const renderClient = (row: CompanyType) => {
  if (row.profileImage) {
    return <CustomAvatar src={row.profileImage} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar
        skin='filled'
        sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
      >
        {getInitials(row.companyName ? row.companyName : '')}
      </CustomAvatar>
    )
  }
}

const CompanyListPage = (props: { pagination: any; api: any }) => {
  const [companies, setCompanies] = useState<CompanyType[]>([])
  const [CompanyCount, setCompanyCount] = useState<CompanyCountType>({} as CompanyCountType)
  const [CompanyPendingRequest, setCompanyPendingRequest] = useState<CompanyPendingReuestType>(
    {} as CompanyPendingReuestType
  )
  const [companyId, setCompanyId] = useState('0')
  const [courseRequestCount, setCourseRequestCounts] = useState<CourseCompanyRequestType[]>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [gridLoading, setGridLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const router = useRouter()
  const [changeStatusBackdrop, setChangeStatusBackdrop] = useState(false)
  const [searchedValue, setSearchedValue] = useState('')
  const [companyRequestedCourse, setCompanyRequestedCourse] = useState<CourseCompanyRequestType[]>([])

  const { t, ready } = useTranslation(['company', 'common']);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const [detailsForConfirmDialog, setDetailsForConfirmDialog] = useState<CompanyType>({} as CompanyType)

  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState(companies);
  const { pagination, api } = props;

   // Filter rows based on search text
   const handleSearch = (searchQuery: string) => {
    setSearchedValue(searchQuery);

    const filteredData = companies.filter((row) =>
      Object.values(row).some((value) =>
        value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    setFilteredRows(filteredData);
  };

  
 // Define default locale text
 const defaultLocaleText = {
  noRowsLabel: 'No rows found',
  pagination: {
    rowsPerPage: 'rowsperpageText',
  },
};

// Customize localization strings
const localeText = {
  ...defaultLocaleText,
  pagination: {
    ...defaultLocaleText.pagination,
    rowsPerPage: t('rowsperText'),
  },
  // Add more localization overrides as needed
};


 

  useEffect(() => {
    setFilteredRows(companies); // Update filteredRows whenever Individuals changes
  }, [companies]);

  const fetchCompanies = useCallback(async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const culture = router.locale as string;
      const response = await getCompanyListPagination(page, pageSize, culture)
      if (response.status === 200) {
         // Sort companies based on customCourseRequests length
         const sortedCompanies = response.data.items.sort((a: CompanyType, b: CompanyType) => {
          const hasRequestsA = a.customCourseRequests && a.customCourseRequests.length > 0;
          const hasRequestsB = b.customCourseRequests && b.customCourseRequests.length > 0;
  
          // Sort companies with requests first
          if (hasRequestsA && !hasRequestsB) {
            return -1;
          } else if (!hasRequestsA && hasRequestsB) {
            return 1;
          } else {
            // If both companies have requests or both don't have requests, maintain their original order
            return 0;
          }
        });
      setCompanies(sortedCompanies)
        setTotalRows(response.data.totalCount)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }, [])

  //Method to get all active companies  
  const getAllActiveCompanies = useCallback(async () => {
    try {
      const response = await getActiveCompanyCount()

      if (response.status === 200) {
        setCompanyCount(response.data)
      }
    } catch (error) {}
  }, [])

  //Method to open dialog from switch
  const getAllPendingCourseRequests = useCallback(async () => {
    const culture = router.locale as string;
    const response = await getCourseCount(culture)


    setCourseRequestCounts(response.data)

  }, [])
  const getAllCompanyPendingUsers = useCallback(async () => {
    try {
      const response = await getActiveAllCompanyReuest()
      if (response.status === 200) {
        setCompanyPendingRequest(response.data)
      }
    } catch (error) {}
  }, [])

  useEffect(() => {
    fetchCompanies(paginationModel.page + 1, paginationModel.pageSize)
    getAllActiveCompanies()
    getAllCompanyPendingUsers()
    getAllPendingCourseRequests()
  }, [fetchCompanies, paginationModel.page, paginationModel.pageSize])

  //Method to for activating and deactive account
  //@param: row which represent company type 
  const activeDeactiveAccount = async (row: CompanyType) => {
    const copyOfCompanies: CompanyType[] = JSON.parse(JSON.stringify(companies))
    try {
      setChangeStatusBackdrop(true)
      const culture = router.locale as string
      const response = await changeActiveStatusCompany(row.id, !row.isDeleted, culture)

      if (response.status === 200) {
        setChangeStatusBackdrop(false)
        setOpenConfirmDialog(false)
        fetchCompanies(paginationModel.page + 1, paginationModel.pageSize)
      } else {
        setChangeStatusBackdrop(false)
        setCompanies(copyOfCompanies)
        setOpenConfirmDialog(false)
      }
    } catch (error) {
      setChangeStatusBackdrop(false)
      setCompanies(copyOfCompanies)
      setOpenConfirmDialog(false)
    }
  }

  //Method to open dialog from switch
  const openDialogFromSwitch = (row: CompanyType) => {
    setDetailsForConfirmDialog(row)
    setOpenConfirmDialog(true)
  }
  //Method to open dialog for courses
  const openDialogCourses = (row: CompanyType) => {
    setCompanyId(row.id)
    setCompanyRequestedCourse(row.customCourseRequests)
    setOpenDialog(true)
  }

  //Method to redirect to view page on click of button
  const handleRedirectionClick = () => {
    router.push(`/company/view/${companyId}?tab=courses`)
  }

  // Merge course data and course count data into a single dataset

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 280,
      field: 'companyName',
      headerName: t('companyText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              
              <Typography
                noWrap
                component={Link}
                href={`/company/view/${row.id}`}
                sx={{
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {row.companyName}
              </Typography>
              <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>
                {row.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.15,
      field: 'noOfCoursesPurchased',
      minWidth: 170,
      headerName: t('coursesPurchasedText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography noWrap sx={{ color: 'text.secondary' }}>
              {row.noOfCoursesPurchased}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.15,
      field: 'noOfEmployees',
      minWidth: 170,
      headerName: t('employees'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography noWrap sx={{ color: 'text.secondary' }}>
              {row.noOfEmployees}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      field: 'country',
      minWidth: 190,
      headerName: t('common:countryText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography noWrap sx={{ color: 'text.secondary' }}>
              {row.country}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      field: 'courseCount',
      minWidth: 190,
      headerName: t('coursesRequestText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              noWrap
              sx={{ color: 'Highlight', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => openDialogCourses(row)}
            >
              {row?.customCourseRequests?.length}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 125,
      sortable: false,
      field: 'actions',
      headerName: t('actionText'),
      renderCell: ({ row }: CellType) => (
        <>
          <Box>
            <IconButton LinkComponent={Link} href={`/company/edit/${row.id}`}>
              <Icon icon={'tabler:edit'} />
            </IconButton>
            <Switch
              checked={!row.isDeleted}
              onChange={() => {
                openDialogFromSwitch(row)
              }}
            />
          </Box>
        </>
      )
    }
  ]
  // Override default pagination components to intercept text and translate
  const CustomPagination = (props: { pagination: any; api: any }) => {
    const { pagination, api } = props;
    const { t } = useTranslation();

    return (
      <GridPagination
        {...pagination}
        labelRowsPerPage={t('company:datagrid:rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('company:datagrid:of')} ${count}`}
        pageText={(page: any) => `${t('datagrid:page')} ${page}`}
        {...props}
      />
    );
  };

  return (
    <>
      <Dialog open={openDialog} maxWidth={'sm'} fullWidth onClose={() => setOpenDialog(!openDialog)} sx={{ p: 4 }}>
        <DialogTitle
          id='scroll-dialog-title'
          sx={{
            color: 'text.secondary',
            fontSize: '26px',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '14px'
          }}
        >
        {t('courseSubscribtion')}
        </DialogTitle>
        <DialogContent>
          <ul className='courses-assignment-li'>
            {companyRequestedCourse.map(courseData => (
              <li key={courseData.id}>
                <p>
                  {t('courseName')}:{' '}
                  <b>
                    {courseData.course.name} {courseData.examType}
                  </b>
                </p>
                <p>
                  {t('noOfCoursesText')}: <b>{courseData.noOfCourses}</b>
                </p>
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={() => handleRedirectionClick()}>
           {t('okText')}
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={6.5} sx={{ mb: 10 }}>
        <Grid item xs={12}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <CardStatsHorizontalWithDetails
                icon='tabler:user-check'
                stats={CompanyCount?.loggedInCount?.toString()}
                subtitle={t('common:lastWeekText')}
                title={t('activeCompanyText')}
                trendDiff={CompanyCount?.analyticsPercentage}
                avatarColor='success'
                trend={
                  CompanyCount?.analyticsPercentage
                    ? parseFloat(CompanyCount?.analyticsPercentage) >= 0
                      ? 'positive'
                      : 'negative'
                    : 'positive'
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MuiLink component={Link} href={`/company/requests`}>
                <CardStatsHorizontalWithDetails
                  icon='tabler:user-exclamation'
                  stats={CompanyPendingRequest?.pendingRequestCount?.toString()}
                  subtitle={t('common:lastWeekText')}
                  title={t('reqPendingCompany')}
                  trendDiff={CompanyPendingRequest?.analyticsPercentage}
                  avatarColor='warning'
                  trend={
                    CompanyPendingRequest?.analyticsPercentage
                      ? parseFloat(CompanyPendingRequest?.analyticsPercentage) >= 0
                        ? 'positive'
                        : 'negative'
                      : 'positive'
                  }
                />
              </MuiLink>
            </Grid>
          </Grid>
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
              <ListSearchBox onSearch={handleSearch} />
                <Button variant='contained' LinkComponent={Link} href='/company/add'>
                  + {t('addCompanyText')}
                </Button>
              </Box>
            </Box>
            <DataGrid
            {...pagination}
              autoHeight
              rowHeight={62}
              rows={filteredRows}
              columns={columns}
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              loading={gridLoading}
              pageSizeOptions={[10, 20, 50]}
              rowCount={totalRows}
              paginationMode='server'
              paginationModel={paginationModel}
              onPaginationModelChange={(model, details: GridCallbackDetails) => {
                if (model.pageSize !== paginationModel.pageSize) {
                  const temp = { page: 0, pageSize: model.pageSize }
                  setPaginationModel(temp)
                } else {
                  setPaginationModel(model)
                }
              }}
              localeText={localeText}
              components={{ Pagination: CustomPagination }} // Override pagination component
            />
          </Card>
        </Grid>
      </Grid>

      <Backdrop open={changeStatusBackdrop} sx={{ color: '#fff', zIndex: theme => theme.zIndex.tooltip + 1 }}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Dialog
        open={openConfirmDialog}
        maxWidth={'sm'}
        fullWidth
        onClose={() => setOpenConfirmDialog(!openConfirmDialog)}
        sx={{ p: 4 }}
      >
        <DialogContent>
          {detailsForConfirmDialog?.isDeleted
            ? `Enable ${detailsForConfirmDialog?.companyName} ?`
            : `Disable ${detailsForConfirmDialog?.companyName} ?`}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center'
          }}
        >
          <Button
            variant='contained'
            onClick={() => {
              activeDeactiveAccount(detailsForConfirmDialog)
            }}
          >
            {detailsForConfirmDialog?.isDeleted ? `Enable` : `Disable`}
          </Button>
          <Button variant='tonal' color={'secondary'} onClick={() => setOpenConfirmDialog(!openConfirmDialog)}>
            {t('common:cancelText')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CompanyListPage
