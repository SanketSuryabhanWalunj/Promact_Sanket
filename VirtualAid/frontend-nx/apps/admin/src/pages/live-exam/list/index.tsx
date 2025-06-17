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

import { DialogTitle, Tooltip, debounce } from '@mui/material'
import { LiveExamAnalytics, LiveExamDetailType, LiveExamType } from 'src/types/individual'
import {
  deleteLiveExam,
  getLiveAllocationAnalytics,
  getLiveExamDetails,
  setdLiveExamDates
} from 'src/api-services/IndividualApi'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddEditLiveExamForm from './addEditLiveExamForm'
import LiveExamDetailsEdit from './editLiveExamForm'
import { getDisplayDate } from '@virtual-aid-frontend/utils'
import { isAxiosError } from 'axios'
import { t } from 'i18next'
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar'
import vertical from 'src/navigation/vertical'
import React from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import { useTranslation } from 'react-i18next'
import ListSearchBox from 'src/components/list-search/ListSearchBox'

interface CellType {
  row: LiveExamDetailType
}
type LiveExamForm = {
  courseId: string
  examDate: string
  allocatedSeatsCount: number
  remaningSeatsCount: number
  isDeleted: boolean
}
interface CourseLiveExamType {
  selectedRows: LiveExamType | undefined
  liveExamId: number | null
}

const LiveExamSetting = (props: CourseLiveExamType) => {
  const { selectedRows } = props
  const [totalRows, setTotalRows] = useState(0)
  const [liveExams, setLiveExams] = useState<LiveExamDetailType[]>([])
  const [liveExamsAnalytics, setLiveExamsAnalytics] = useState<LiveExamAnalytics>({} as LiveExamAnalytics)
  const [liveExamCount, setLiveExamCount] = useState<LiveExamType>({} as LiveExamType)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [searchedValue, setSearchedValue] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debouncedSearchedValue, setDebouncedSearchedValue] = useState('')
  const [changeStatusBackdrop, setChangeStatusBackdrop] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [detailsForConfirmDialog, setDetailsForConfirmDialog] = useState<LiveExamType>({} as LiveExamType)
  const [openDialog, setOpenDialog] = useState(false)
  // State to hold the data of the clicked row
  const [selectedRowData, setSelectedRowData] = useState<LiveExamType | null>(null)
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
  const [searchText, setSearchText] = useState('')
  const [filteredRows, setFilteredRows] = useState(liveExams)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  // Then you can use useRouter hook as you're currently doing
  const router = useRouter()

  // Filter rows based on search text
  const handleSearch = (query: string) => {
    const formattedQuery = query.toLowerCase();
  
    const filteredData = liveExams.filter((item) => {
      // Convert the exam date string to a Date object
      const examDate = new Date(item.examDate);
      
      // Format the date to "DD MMMM" (e.g., "04 June")
      const formattedExamDate = examDate.toLocaleDateString('en-US', { day: '2-digit', month: 'long' }).toLowerCase();
      
      // Check if the formatted exam date includes the search query
      return formattedExamDate.includes(formattedQuery);
    });
  
    setFilteredRows(filteredData);
  };
  useEffect(() => {
    setFilteredRows(liveExams) // Update filteredRows whenever Individuals changes
  }, [liveExams])

  const handleClose = () => {
    setState({ ...state, open: false })
  }

  const [gridLoading, setGridLoading] = useState(false)
  //get method to get analytics for seats allocation
  const getSeatsAnalytics = useCallback(async () => {
    try {
      setGridLoading(true)
      const response = await getLiveAllocationAnalytics()
      if (response.status === 200) {
        setLiveExamsAnalytics(response.data)
        setTotalRows(response.data.totalCount)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }, [])
  useEffect(() => {
    getAllLiveExams(paginationModel.page, paginationModel.pageSize)
    getSeatsAnalytics()
  }, [paginationModel.page, paginationModel.pageSize])

  //method to open dialog
  const openAddExamDialog = () => {
    setOpenDialog(true)
  }

  // method to close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }
  const handleDelete = async (liveExamId: number) => {
    try {
      // Perform deletion operation using the liveExamId
      // For example:
      const response = await deleteLiveExam(liveExamId)
      // Assuming deleteLiveExam is an API call to delete the live exam
      // Reload the data after successful deletion
      await getAllLiveExams(paginationModel.page, paginationModel.pageSize)
      // Show Snackbar on successful deletion
      setState({ ...state, open: true })
    } catch (error) {
    }
  }
  // Function to handle closing the dialog
  // Post request api for live exam date
  // @param data represets liveExamForm which stores form data
  const handlePostData = async (data: LiveExamForm) => {
    const parsedCourseId = JSON.parse(data.courseId)
    try {
      const dataToSendSubscribe = {
        courseId: parsedCourseId.id,
        examDate: data.examDate,
        allocatedSeatsCount: data.allocatedSeatsCount,
        remaningSeatsCount: data.remaningSeatsCount
      }

      const response = await setdLiveExamDates(dataToSendSubscribe)

      if (response.status === 200) {
        router.reload()
        setOpenDialog(false)
      } else if (response.status === 406) {
        setErrorMsg(t('common:dateAlreadyError'))
      } else if (response.status === 409) {
        setErrorMsg(t('countError'))
      }
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.data?.error?.code === '406') {
          setErrorMsg(t('common:dateAlreadyError'))
        } else {
          setErrorMsg(t('common:error.unspecific'))
        }
      } else {
        setErrorMsg(t('common:error.unspecific'))
      }
    }
  }

  //get request api for live exam date
  const getAllLiveExams = useCallback(async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const response = await getLiveExamDetails(page, pageSize)
      if (response.status === 200) {
        setLiveExams(response.data)
        setTotalRows(response.data.totalCount)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }, [])

  const columns: GridColDef[] = [
    {
      flex: 0.3,
      minWidth: 250,
      field: 'examDate',
      headerName: t('common:liveExamDate'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              noWrap
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {getDisplayDate(row.examDate)}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.2,
      minWidth: 126,
      field: 'allocatedSeatsCount',
      headerName: t('common:allocatedSeatsCount'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
          {row?.allocatedSeatsCount}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'Course Approved Seats',
      headerName: t('common:userCountApproved'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
          {row?.allocatedSeatsCount - row?.remaningSeatsCount}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 125,
      sortable: false,
      field: 'actions',
      headerName: t('actionsText'),
      renderCell: ({ row }: CellType) => (
        <>
          <Box>
            <LiveExamDetailsEdit
              selectedRows={row}
              onClose={() => setSelectedRowData(null)}
              liveExamId={row?.id ?? null}
            />
          </Box>
          <Box>
            <IconButton onClick={() => handleDelete(row.id)}>
              <DeleteIcon></DeleteIcon>
            </IconButton>
            <Snackbar
              anchorOrigin={{ vertical, horizontal }}
              open={open}
              onClose={handleClose}
              message={t('liveExamDateDeleted')}
              key={vertical + horizontal}
            />
          </Box>
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
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <CardStatsHorizontalWithDetails
                icon='tabler:user-check'
                stats={liveExamsAnalytics?.examDateAcceptedCount?.toString()}
                subtitle={t('common:lastWeekText')}
                title={t('common:activeIndividualsText')}
                trendDiff={liveExamsAnalytics?.analyticsPercentage}
                avatarColor='success'
                trend={
                  liveExamsAnalytics?.analyticsPercentage
                    ? parseFloat(liveExamsAnalytics?.analyticsPercentage) >= 0
                      ? 'positive'
                      : 'negative'
                    : 'positive'
                }
              />
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
                <Button variant='contained' LinkComponent={Link} onClick={openAddExamDialog}>
                  + {t('common:setLiveDate')}
                </Button>
              </Box>
            </Box>

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
                {t('common:setLiveDate')}
              </DialogTitle>
              <AddEditLiveExamForm
                selectedRows={selectedRows}
                formDefaultValues={prefieldValues}
                onSubmitClick={handlePostData}
                loading={false}
                errorMsg={errorMessage}
                handleCloseDialog={handleCloseDialog}
              ></AddEditLiveExamForm>
            </Dialog>
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

export default LiveExamSetting
