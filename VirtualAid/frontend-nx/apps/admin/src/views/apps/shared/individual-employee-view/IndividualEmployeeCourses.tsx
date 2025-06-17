// ** React Imports
import React, { useState } from 'react'

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
import Typography from '@mui/material/Typography'

// ** Types Imports
import { IndividualEnrolledCourse } from 'src/types/courses'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Common utils imports from lib

import { getCertificate } from 'src/api-services/IndividualApi'
import { getDisplayDate } from '@virtual-aid-frontend/utils'
import AssignCourseButton from './AssignCourseIndividualButton'
import AssignCourseIndividualButton from './AssignCourseIndividualButton'
import { useTranslation } from 'react-i18next'
import { t } from 'i18next'


const RowOptions = ({ row }: CellType) => {

  const router = useRouter()

  const [certiLoading, setCertiLoading] = useState(false)
 
  const downloadCertificate = async () => {
    try {
      setCertiLoading(true)
      const culture = router.locale as string;
      const response = await getCertificate(router.query.id as string, row.examId, culture)

      if (response.status === 200) {
        const headerContentDisp = response.headers['content-disposition']
        const filename = headerContentDisp && headerContentDisp.split('filename=')[1].replace(/["']/g, '')
        const contentType = response.headers['content-type']

        const blob = new Blob([response.data], { type: contentType })
        const href = window.URL.createObjectURL(blob)

        const el = document.createElement('a')
        el.setAttribute('href', href)
        el.setAttribute('download', filename || `certificate-${router.query.id}-${router.query.id as string}`)
        el.click()

        window.URL.revokeObjectURL(`${blob}`)
        setCertiLoading(false)
      } else {
        setCertiLoading(false)
      }
    } catch (error) {
      setCertiLoading(false)
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
       
        {row.progress === 100 ? (
          <>
           {(new Date(getDisplayDate(row.certificateExpirationDate)) > new Date()) ? (<><Tooltip title={t('common:downloadCertificateText')}>
              <IconButton size='small' onClick={downloadCertificate} disabled={certiLoading}>
                <Icon icon='tabler:download' />
              </IconButton>
            </Tooltip></>):(<> <Tooltip title={t('common:downloadCertificateText')}>
              <IconButton size='small' onClick={downloadCertificate} disabled>
                <Icon icon='tabler:download' />
              </IconButton>
            </Tooltip></>) }
           
          </>
        ) : (
          <></>
        )}
      </Box>
    </>
  )
}
interface CellType {
  row: IndividualEnrolledCourse
}



interface PropsType {
  courses: IndividualEnrolledCourse[]
}

const IndividualEmployeeCourses = (props: PropsType) => {
  const { courses } = props
  const router = useRouter()
  const { t, ready } = useTranslation(['individualAuth', 'common']);

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 400,
      field: 'courseName',
      headerName: t('common:courseNameText'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            noWrap
            sx={{
              fontWeight: 500,
              textDecoration: 'none',
              color: 'text.secondary'
            }}
          >
            {row.name} {row?.examType}
          </Typography>
        
        </Box>
      )
    },
    {
      flex: 0.2,
      minWidth: 180,
      headerName: t('progress'),
      field: 'progressValue',
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Box sx={{ width: '100%' }}>
          <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{`${row.progress}%`}</Typography>
          <LinearProgress sx={{ height: 8 }} variant='determinate' value={row.progress} color='secondary' />
        </Box>
      )
    },
    {
      flex: 0.3,
      minWidth: 130,
      headerName: t('certificationExpirationDateText'),
      field: 'certificateexpirydate',
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Box sx={{ width: '100%' }}>
          <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{getDisplayDate(row.certificateExpirationDate)}</Typography>
          
        </Box>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      field: 'actions',
      headerName: t('actionsText'),
      renderCell: ({ row }: CellType) => (
        <>
       
          <RowOptions row={row} />
        </>
      )
    }
  ]

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: '20px' }}>
              <CardHeader title={t('common:coursesListText')} />
              <AssignCourseIndividualButton courses={courses}></AssignCourseIndividualButton>
            </Box>
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
              getRowId={row => row.id + row.examType}
            />
            <Button
              variant='outlined'
              color='secondary'
              sx={{ my: 4, mx: 6 }}
              LinkComponent={Link}
              href={`/individual/view/${router.query.id}/courses/list`}
            >
             {t('viewAllText')}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default IndividualEmployeeCourses
