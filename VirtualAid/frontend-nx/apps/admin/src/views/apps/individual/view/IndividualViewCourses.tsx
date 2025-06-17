// ** React Imports
import React, { useState, useEffect, useMemo, MouseEvent, useCallback } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** Mui Imports
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

// ** Types Imports
import { CourseDetailsType, IndividualEnrolledCourse } from 'src/types/courses'


// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Common utils imports from lib
import { getDisplayDate } from '@virtual-aid-frontend/utils'
import { Typography } from '@mui/material'


interface CellType {
  row: IndividualEnrolledCourse
}
const RowOptions = ({ id = 1 }: { id: number | string }) => {
    // ** State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const handleRowOptionsClose = () => {
      setAnchorEl(null)
    }
  
    const handleDelete = () => {
      handleRowOptionsClose()
    }
  
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='Edit Individual'>
            <IconButton size='small' sx={{ color: 'text.secondary' }}>
              <Icon icon='tabler:edit' fontSize={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete'>
            <IconButton size='small' sx={{ color: 'text.secondary' }}>
              <Icon icon='tabler:trash' fontSize={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </>
    )
  }

const columns: GridColDef[] = [
  {
    flex: 0.25,
    minWidth: 250,
    field: 'courseName',
    headerName: 'Course',
    sortable: false,
    renderCell: ({ row }: CellType) => (
      
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
         noWrap
         component={Link}
          href={`/course/view/${row.id}`}
          sx={{
            fontWeight: 500,
            textDecoration: 'none',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          {row.name}
        </Typography>
        <Typography variant='body2' sx={{ color: 'text.disabled' }}>
          {row.courseEnrolledDate}
        </Typography>
      </Box>
   
    )
  },
  {
    flex: 0.2,
    minWidth: 180,
    headerName: 'Progress',
    field: 'progressValue',
    renderCell: ({ row }: CellType) => (
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{`${row.progress}%`}</Typography>
        <LinearProgress sx={{ height: 8 }} variant='determinate' value={row.progress} color='secondary' />
      </Box>
    )
  },
  {
    flex: 0.1,
    minWidth: 100,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: CellType) => <RowOptions id='1' />
  }
  
]

interface IndividualViewCoursesPropsType {
  courses: IndividualEnrolledCourse[]
 
}

const IndividualViewCourses = (props: IndividualViewCoursesPropsType) => {
  const { courses } = props
 

  const router = useRouter()

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            
            <CardHeader title='Courses List' />
           
            <DataGrid
              autoHeight
              rows={courses}
              rowHeight={60}
              columns={columns}
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              hideFooterPagination={true}
              sx={{
                '& .MuiDataGrid-footerContainer': { display: 'none' }
              }}
            />
            <Button
              variant='outlined'
              color='secondary'
              sx={{ my: 4, mx: 6 }}
              LinkComponent={Link}
              href={`/individual/view/${router.query.id}/courses/list`}
            >
              View All
            </Button>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default IndividualViewCourses
