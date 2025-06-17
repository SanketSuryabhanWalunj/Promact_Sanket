// ** React Imports
import React, { useState, useEffect, useMemo, MouseEvent, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'

import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid'
import { FeedBackType } from '../../types/admin'
import { styled } from '@mui/material/styles'
import { Dialog, DialogContent, DialogTitle, Tooltip, debounce, Slider, Button } from '@mui/material'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import { getAllFeedbacks, getCompleteFeedBacks, getFeedbackFile } from 'src/api-services/AdminApi'
import { useTranslation } from 'react-i18next'
import ListSearchBox from 'src/components/list-search/ListSearchBox'

interface CellType {
  row: FeedBackType
}
const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '350px'
}))

// ** renders client column
const FeedBackList = () => {
  const [feedbacks, setFeedBacks] = useState<FeedBackType[]>([])
  const [feedbacksCompleted, setFeedBacksCompleted] = useState<FeedBackType[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [searchedValue, setSearchedValue] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debouncedSearchedValue, setDebouncedSearchedValue] = useState('')

  const [changeStatusBackdrop, setChangeStatusBackdrop] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedBackType | null>(null) // State to hold the selected feedback
  const [open, setOpen] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0)
  const { t, ready } = useTranslation(['company', 'common']);
  // Download Excel function
  const handleDownloadExcel = useCallback(async () => {
    try {
      const response = await getFeedbackFile()
      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')

        a.href = url
        a.download = 'feedbacks.xlsx'

        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        console.error(t('common:feedbackError'), response.statusText)
      }
    } catch (error) {
      console.error(t('common:feedbackError'), error)
    }
  }, [])

  //Dialog open method for feedback screenshots
  const handleOpen = (feedback: FeedBackType) => {
    setSelectedFeedback(feedback) // Set the selected feedback
    setOpen(true)
  }

  //Complete feedback status method
  const handleComplete = useCallback(async (feedBackId: string) => {
    const isDone = true
    try {
      const response = await getCompleteFeedBacks(feedBackId, isDone)
      if (response.status === 200) {
        setFeedBacksCompleted(response.data)
      } else {
        console.error('common:feedbackError', response.statusText)
      }
    } catch (error) {
      console.error('common:feedbackError', error)
    }
  }, [])

  // Close dialog method
  const handleClose = () => {
    setOpen(false)
  }

  const columns: GridColDef[] = [
    {
      flex: 0.35,
      minWidth: 250,
      field: 'feedbackProviderName',
      headerName: t('common:userText'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
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
            {row?.feedbackProviderName}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            {row?.feedbackProviderEmail}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.2,
      minWidth: 126,
      field: 'category',
      headerName: t('common:categoryText'),
      sortable: false,
      renderCell: ({ row }: CellType) => <Typography sx={{ color: 'text.secondary' }}>{row?.category}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 126,
      field: 'message',
      headerName: t('common:feedBackText'),
      sortable: false,
      renderCell: ({ row }: CellType) => <Typography sx={{ color: 'text.secondary' }}>{row?.message}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 126,
      field: 'screenShots',
      headerName: t('common:action:action'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='View Feedback'>
            <IconButton size='small' sx={{ color: 'text.secondary' }}>
              <Icon icon='lets-icons:view' fontSize={20} onClick={() => handleOpen(row)} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Complete Feedback'>
            <IconButton size='small' sx={{ color: 'text.secondary' }}>
              <Icon icon='lets-icons:check-ring-duotone' fontSize={20} onClick={() => handleComplete(row?.id)} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState(feedbacks);

   // Filter rows based on search text
   const handleSearch = (searchQuery: string) => {
    setSearchedValue(searchQuery);

    const filteredData = feedbacks.filter((row) =>
      Object.values(row).some((value) =>
        value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    setFilteredRows(filteredData);
  };


  const [gridLoading, setGridLoading] = useState(false)

  //get all feedback list 
  const getAllFeedbacksList = useCallback(async () => {
    try {
      setGridLoading(true)
      const response = await getAllFeedbacks()
      if (response.status === 200) {
        setFeedBacks(response.data)
        setTotalRows(response.data.length)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllFeedbacksList()
  }, [getAllFeedbacksList])

  useEffect(() => {
    setFilteredRows(feedbacks); 
  }, [feedbacks])

  return (
    <>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ListSearchBox onSearch={handleSearch} />
              <Button
                variant='contained'
                sx={{ width: '173px', height: '38px', whiteSpace: 'nowrap' }}
                onClick={handleDownloadExcel}
              >
                {t('common:downloadExcel')}
              </Button>
            </Box>
          </Box>
          <DataGrid
            getRowId={row => row.id}
            autoHeight
            rowHeight={62}
            rows={filteredRows}
            columns={columns}
            loading={gridLoading}
            disableRowSelectionOnClick
            disableColumnFilter
            disableColumnMenu
            disableColumnSelector
            pageSizeOptions={[10, 25, 50]}
            rowCount={totalRows}
          />
        </Card>
      </Grid>
      <Dialog open={open} maxWidth='lg' sx={{ '& .MuiDialog-paper': { width: '60%', maxHeight: '90%' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography>{t('previewText')}</Typography>
          <IconButton onClick={handleClose}>
            <Icon icon='ic:round-close' />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <StyledBox>
            {selectedFeedback &&
              Array.isArray(selectedFeedback.screenShots) &&
              selectedFeedback.screenShots.length > 0 && ( // Check if screenShots is not null and is an array with elements
                <Carousel
                  autoPlay
                  interval={3000}
                  showArrows
                  showStatus={false}
                  showThumbs={false}
                  onChange={index => setCurrentSlideIndex(index)}
                  // Set width and height of the Carousel
                >
                  {selectedFeedback.screenShots.map((image, index) => (
                    <div key={index}>
                      <img src={image} alt={`Slide ${index}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    </div>
                  ))}
                </Carousel>
              )}
          </StyledBox>
          {/* Your preview component */}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FeedBackList

