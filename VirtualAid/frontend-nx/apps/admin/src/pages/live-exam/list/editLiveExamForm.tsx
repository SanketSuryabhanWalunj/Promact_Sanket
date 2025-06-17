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

import { DataGrid, GridCallbackDetails, GridColDef } from '@mui/x-data-grid'

import { DialogTitle, Tooltip, debounce } from '@mui/material'
import { LiveExamType } from 'src/types/individual'
import { editLiveExamDetails, getLiveExamDetails, setdLiveExamDates } from 'src/api-services/IndividualApi'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddEditLiveExamForm from './addEditLiveExamForm'
import { t } from 'i18next'

interface CellType {
  row: LiveExamType
}
type LiveExamForm = {
  courseId: string
  examDate: string
  allocatedSeatsCount: number
  remaningSeatsCount: number
  isDeleted: boolean
}
const defaultFormValues: LiveExamForm = {
  courseId: '',
  examDate: '',
  allocatedSeatsCount: 1,
  remaningSeatsCount: 1,
  isDeleted: false
}
interface LiveExamDetailsEditProps {
  onClose: () => void
  selectedRows: LiveExamType | undefined
  liveExamId: number | null
}

const LiveExamDetailsEdit = (props: LiveExamDetailsEditProps) => {
  const [totalRows, setTotalRows] = useState(0)
  const [liveExams, setLiveExams] = useState<LiveExamType[]>([])
  const [liveExamCount, setLiveExamCount] = useState<LiveExamType>({} as LiveExamType)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [searchedValue, setSearchedValue] = useState('')
  const [selectedRows, setSelectedRows] = useState<LiveExamType | undefined>()
  const [debouncedSearchedValue, setDebouncedSearchedValue] = useState('')

  const [changeStatusBackdrop, setChangeStatusBackdrop] = useState(false)

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const [detailsForConfirmDialog, setDetailsForConfirmDialog] = useState<LiveExamType>({} as LiveExamType)

  const [openDialog, setOpenDialog] = useState(false)
  const [gridLoading, setGridLoading] = useState(false)

  // useRouter hook for routing information
  const router = useRouter()
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

  //close dialog method
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }
  //open dialog method for seats and dates
  const openAddExamDialog = () => {
    setOpenDialog(true)
    if (props.selectedRows !== undefined) {
      const convertedRow: LiveExamType = {
        allocatedSeatsCount: props.selectedRows.allocatedSeatsCount,
        courseId: props.selectedRows.courseId,
        examDate: props.selectedRows.examDate,
        remaningSeatsCount: props.selectedRows.remaningSeatsCount
      }
      if (convertedRow.allocatedSeatsCount > convertedRow.allocatedSeatsCount - convertedRow.remaningSeatsCount) {
        setSelectedRows(convertedRow)
      }
    }
  }

  //  Put method to update the live Exam data
  //  @param: liveExamForm is used to store data for live exam form
  const handlePutData = async (data: LiveExamForm) => {
    const parsedCourseId = JSON.parse(data.courseId)
    try {
      const payload: LiveExamType = {
        courseId: parsedCourseId.id,
        allocatedSeatsCount: data.allocatedSeatsCount,
        examDate: data.examDate,
        remaningSeatsCount: data.remaningSeatsCount
      }
      const response = await editLiveExamDetails(props.liveExamId, payload)
      if (response.status === 200) {
        router.reload()
      }
    } catch (error) {}
  }

  return (
    <>
      <IconButton LinkComponent={Link} onClick={openAddExamDialog}>
        <Icon icon={'tabler:edit'} />
      </IconButton>

      <Dialog open={openDialog} maxWidth={'sm'} fullWidth onClose={() => setOpenDialog(!openDialog)} sx={{ p: 4 }}>
        <DialogTitle
          id='scroll-dialog-title'
          sx={{
            color: '#000000',
            fontSize: '26px',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '14px'
          }}
        >
          {t('common:editLiveExamText')}
        </DialogTitle>
        <AddEditLiveExamForm
          formDefaultValues={defaultFormValues}
          onSubmitClick={handlePutData}
          selectedRows={selectedRows}
          loading={false}
          errorMsg={''}
          handleCloseDialog={handleCloseDialog}
        ></AddEditLiveExamForm>
      </Dialog>
    </>
  )
}

export default LiveExamDetailsEdit
