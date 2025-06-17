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
import { DialogTitle, Tooltip, debounce } from '@mui/material'
import { CourseDetailsType, LiveExamRequestDetailType, UserCourseEnrollments } from 'src/types/individual'
import {
  acceptLiveDateRequest,
  deleteLiveExam,
  getLiveExamDetails,
  getPendingExamDetails,
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
import DeleteIcon from '@mui/icons-material/Delete'
import { useTranslation } from 'react-i18next'

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

const LiveExamRequests = (props: CourseLiveExamType) => {
  const { selectedRows } = props
  const [totalRows, setTotalRows] = useState(0)
  const [liveExams, setLiveExams] = useState<LiveExamRequestDetailType[]>([])
  const [liveExamsRequests, setLiveExamsRequests] = useState<LiveExamRequestDetailType[]>([])
  const [liveExamCount, setLiveExamCount] = useState<LiveExamRequestDetailType>({} as LiveExamRequestDetailType)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [searchedValue, setSearchedValue] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const [openDialog, setOpenDialog] = useState(false)
  // State to hold the data of the clicked row
  const [selectedRowData, setSelectedRowData] = useState<LiveExamRequestDetailType | null>(null)
  const [errorMessage, setErrorMsg] = useState<string>('')

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
  const handleClose = () => {
    setState({ ...state, open: false })
  }
  // Function to handle row click event
  const handleRowClick = (rowData: LiveExamRequestDetailType) => {
    // Set the clicked row data to the state variable
    setSelectedRowData(rowData)
  }
  // Then you can use useRouter hook as you're currently doing
  const router = useRouter()
  const [gridLoading, setGridLoading] = useState(false)

  useEffect(() => {
    getAllLiveExams(paginationModel.page, paginationModel.pageSize)
  }, [paginationModel.page, paginationModel.pageSize])

  //get request api for live exam date
  const getAllLiveExams = useCallback(async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const response = await getPendingExamDetails(page, pageSize)

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

  //handle accept for live exam requests
  const handleAccept = async (requests: LiveExamRequestDetailType) => {
    try {
      const culture = router.locale as string;
      const response = await acceptLiveDateRequest(
        true,
        requests?.userCourseEnrollments.user.id,
        requests?.courseDetail.id,
        requests?.userCourseEnrollments?.id,
        culture
      )
      if (response.status === 204) {
        router.reload()
      }
    } catch (error) {
      console.error(t('common:errorAcceptRequest'), error)
    }
  }
  // handle reject for live exam reject 
  const handleReject = async (requests: LiveExamRequestDetailType) => {
    try {
      const culture = router.locale as string;
      const response = await acceptLiveDateRequest(
        false,
        requests?.userCourseEnrollments.user.id,
        requests?.courseDetail.id,
        requests?.userCourseEnrollments?.id, 
        culture
      )
      if (response.status === 204) {
        router.reload()
      }
    } catch (error) {
      console.error(t('common:errorAcceptRequest'), error)
    }
  }
 
  const columns: GridColDef[] = [
    {
      flex: 0.3,
      minWidth: 200,
      field: 'Individual Name',
      headerName:  t('individualNameText'),
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
      headerName:  t('common:requestDateForLiveExam'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
          {getDisplayDate(row?.userCourseEnrollments?.liveExamDate)}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'action',
      headerName:  t('common:action:action'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <>
          {row?.userCourseEnrollments.isLiveExamDateApproved !== null ? (
            <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize', fontWeight: 'bold' }}>
              {t('common:acceptedText')}
            </Typography>
          ) : (
            <>
              <Button variant='contained' onClick={() => handleAccept(row)} sx={{ marginRight: '10px', minWidth:'95px' }}>
              {t('common:acceptText')}
              </Button>
              <Button variant='tonal' onClick={() => handleReject(row)} sx={{minWidth:'95px'}}>
              {t('common:rejectText')}
              </Button>
            </>
          )}
        </>
      )
    }
  ]
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
        <Grid item xs={12}>
          <Card>
            <DataGrid
              autoHeight
              rowHeight={62}
              rows={liveExamsRequests}
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

export default LiveExamRequests
