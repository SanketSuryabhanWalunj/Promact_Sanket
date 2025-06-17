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
// ** Icon Imports
import Icon from 'src/@core/components/icon'
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
// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import { DialogTitle, TextField, Tooltip, debounce } from '@mui/material'
import { CourseDetailsType, LiveExamRequestDetailType, UserCourseEnrollments } from 'src/types/individual'
import {
  acceptLiveDateRequest,
  deleteLiveExam,
  getApprovedExamDetails,
  getLiveExamDetails,
  getPendingExamDetails,
  setMarksLiveExamDates,
  setdLiveExamDates
} from 'src/api-services/IndividualApi'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getDisplayDate, getInitials } from '@virtual-aid-frontend/utils'
import { isAxiosError } from 'axios'
import { t } from 'i18next'
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar'
import vertical from 'src/navigation/vertical'
import React from 'react'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import ListSearchBox from 'src/components/list-search/ListSearchBox'

interface CellType {
  row: LiveExamRequestDetailType
}
type LiveExamForm = {
  courseId: string
  examDate: string
  allocatedSeatsCount: number
  remaningSeatsCount: number
  isDeleted: boolean
}
type LiveExamApprovedForm = {
  marks: number
}
interface CourseLiveExamType {
  selectedRows: LiveExamRequestDetailType | undefined
  liveExamId: number | null
}
// ** renders client column
const renderClient = (row: LiveExamRequestDetailType) => {
  if (row?.userCourseEnrollments?.user?.profileImage) {
    return <CustomAvatar src={row?.userCourseEnrollments?.user?.profileImage} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar
        skin='filled'
        sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
      >
        {getInitials(row?.userCourseEnrollments?.user?.firstName ? row?.userCourseEnrollments?.user?.firstName : '')}
      </CustomAvatar>
    )
  }
}

const LiveExamApproved = (props: CourseLiveExamType) => {
  const { selectedRows } = props
  const [totalRows, setTotalRows] = useState(0)
  const [userId, setUserId] = useState('')
  const [userCourseEnrollmentsId, setUserCourseEnrollmentId] = useState(0)
  const [liveExams, setLiveExams] = useState<LiveExamRequestDetailType[]>([])
  const [liveExamsRequests, setLiveExamsRequests] = useState<LiveExamRequestDetailType[]>([])
  const [liveExamCount, setLiveExamCount] = useState<LiveExamRequestDetailType>({} as LiveExamRequestDetailType)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [searchedValue, setSearchedValue] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const [openDialog, setOpenDialog] = useState(false)
  // State to hold the data of the clicked row
  const [selectedRowData, setSelectedRowData] = useState<LiveExamRequestDetailType | null>(null)
  const [errorMessage, setErrorMsg] = useState<string>('')
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  // Prefield values
  const prefieldValues = {
    courseId: '',
    examDate: '',
    allocatedSeatsCount: 1,
    remaningSeatsCount: 1,
    isDeleted: false
  }
  interface State extends SnackbarOrigin {
    open: boolean
  }
  const [state, setState] = React.useState<State>({
    open: false,
    vertical: 'top',
    horizontal: 'center'
  })
  const { vertical, horizontal, open } = state

  const [searchText, setSearchText] = useState('')
  const [filteredRows, setFilteredRows] = useState(liveExamsRequests)

  // Then you can use useRouter hook as you're currently doing
  const router = useRouter()

  

  //method to open dialog
  const openAddMarksDialog = (row: LiveExamRequestDetailType) => {
    setOpenDialog(true)
    setUserId(row.userCourseEnrollments.user.id)
    setUserCourseEnrollmentId(row.userCourseEnrollments.id)
  }

  // method to close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }
 

  const [gridLoading, setGridLoading] = useState(false)
// Filter rows based on search text
const handleSearch = (query: string) => {
  // Filter liveExamsRequests based on the search query
  const filteredData = liveExamsRequests.filter((item) => {
    // Access the user object within userCourseEnrollments
    const user = item.userCourseEnrollments?.user;

    // Check if the user object exists and if any of its properties match the search query
    if (user) {
      return Object.values(user).some((value) =>
        value?.toString().toLowerCase().includes(query.toLowerCase())
      );
    }

    // If the user object doesn't exist or none of its properties match, return false
    return false;
  });

  // Set the filtered rows to update the DataGrid
  setFilteredRows(filteredData);
};
  useEffect(() => {
    getAllLiveExams(paginationModel.page, paginationModel.pageSize)
  }, [paginationModel.page, paginationModel.pageSize])

useEffect(() => {
  setFilteredRows(liveExamsRequests) // Update filteredRows whenever Individuals changes
}, [liveExamsRequests])
  //get request api for live exam date
  const getAllLiveExams = useCallback(async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const response = await getApprovedExamDetails(page, pageSize)

      if (response.status === 200) {
        const combinedData = response.data.flatMap((item: any) => {
          const { userCourseEnrollments, courseDetail } = item
          const users = Array.isArray(userCourseEnrollments) ? userCourseEnrollments : [userCourseEnrollments]

          // Map over each user and create a row for them
          return users.map((user: any) => ({
            userCourseEnrollments,
            courseDetail,
            id: user.id // You may need to adjust this based on your data structure
          }))
        })

        setLiveExamsRequests(combinedData)
        setTotalRows(response.data.totalCount)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }, [])
  
  // Function to handle closing the dialog
  // Post request api for live exam date
  // @param data represets liveExamForm which stores form data
  const addLiveExamMarks = async (data: LiveExamApprovedForm) => {
    try {
      const response = await setMarksLiveExamDates(userId, userCourseEnrollmentsId, data.marks)
      if (response.status === 204) {
        setOpenDialog(false)
        router.reload()
      }
    } catch (error) {
      if (isAxiosError(error)) {
        setErrorMsg(t('common:error.unspecific'))
      } else {
        setErrorMsg(t('common:error.unspecific'))
      }
    }
  }
  const columns: GridColDef[] = [
    {
      flex: 0.3,
      minWidth: 150,
      field: 'Individual Name',
      headerName: t('individualNameText'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderClient(row)}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              noWrap
              component={Link}
              href={`/individual/view/${row.id}`}
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {row?.userCourseEnrollments?.user?.firstName} {row?.userCourseEnrollments?.user?.lastName}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              {row?.userCourseEnrollments?.user?.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.2,
      minWidth: 350,
      field: 'courseName',
      headerName: t('common:courseNameText'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>{row?.courseDetail?.name}</Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'liveExamAcceptedDate',
      headerName: t('common:requestDateForLiveExam'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
          {getDisplayDate(row?.userCourseEnrollments?.liveExamDate)}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 126,
      field: 'action',
      headerName: t('common:action:action'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <>
          {row.userCourseEnrollments?.liveExamMarkes !== null ? (
            <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize', fontWeight: 'bold' }}>
              {t('common:completedText')}
            </Typography>
          ) : (
            <IconButton onClick={() => openAddMarksDialog(row)}>
              <DashboardCustomizeOutlinedIcon></DashboardCustomizeOutlinedIcon>
            </IconButton>
          )}
        </>
      )
    }
  ]
  //Form controls
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<LiveExamApprovedForm>({
    defaultValues: {
      marks: 0
    }
  })
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
      <Grid container spacing={6.5} sx={{ mb: 10 }}>
        <Dialog open={openDialog} maxWidth={'sm'} fullWidth onClose={() => setOpenDialog(false)} sx={{ p: 4 }}>
          <DialogTitle
            id='scroll-dialog-title'
            sx={{
              color: 'text.secondary',
              fontSize: '26px',
              fontFamily: "'Outfit', sans-serif",
              marginBottom: '14px'
            }}
          >
            {t('common:addMarks')}
          </DialogTitle>
          <form onSubmit={handleSubmit(addLiveExamMarks)}>
            <DialogContent>
              <Controller
                control={control}
                name='marks'
                rules={{
                  required: {
                    value: true,
                    message: t('common:noOfMarks')
                  }
                }}
                render={({ field }) => (
                  <>
                   
                    <TextField {...field} fullWidth type='number' label={t('common:addMarks')} required sx={{ mb: '20px' }} />
                  </>
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button variant='contained' type='submit'>
              {t('common:action:submit')}
              </Button>
              <Button variant='outlined' sx={{ color: 'text.secondary' }} onClick={handleCloseDialog}>
                {' '}
                {t('common:action:cancel')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

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
              </Box>
            </Box>
            <DataGrid
              autoHeight
              rowHeight={62}
              rows={filteredRows}
              columns={columns}
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
              components={{ Pagination: CustomPagination }} 
            />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default LiveExamApproved
