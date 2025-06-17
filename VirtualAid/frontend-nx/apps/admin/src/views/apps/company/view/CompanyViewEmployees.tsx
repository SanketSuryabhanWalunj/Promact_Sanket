// ** React Imports
import { useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline, { TimelineProps } from '@mui/lab/Timeline'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'

import { DataGrid, GridColDef } from '@mui/x-data-grid'

// ** Custom Component Import
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Type Imports
import { CompanyEmployeeType } from 'src/types/company'
import { IndividualType } from 'src/types/individual'
import { useTranslation } from 'react-i18next'

interface CellType {
  row: IndividualType
}

const renderClient = (row: IndividualType) => {
  if (row.profileImage) {
    return <CustomAvatar src={row.profileImage} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar
        skin='filled'
        sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
      >
        {getInitials(row.fullName)}
      </CustomAvatar>
    )
  }
}



const CompanyViewEmployees = ({ emps }: { emps: IndividualType[] }) => {
  const router = useRouter()
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const columns: GridColDef[] = [
    {
      flex: 0.35,
      minWidth: 250,
      field: 'firstName',
      headerName: t('employeeText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
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
                {row.fullName}
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
      flex: 0.25,
      minWidth: 130,
      field: 'totalCourses',
      headerName: t('coursesEnrolled'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography noWrap sx={{ color: 'text.secondary' }}>
              {row.noOfCoursesEnrolled}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.25,
      minWidth: 130,
      field: 'total',
      headerName: t('progress'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ width: '100%' }}>
            {(row.progress <= 100 ? (<> <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{`${row.progress}%`}</Typography>
            <LinearProgress sx={{ height: 8 }} variant='determinate' value={row.progress} /></>): (<></>))}
           
          </Box>
        )
      }
    },
    
  ]
  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('employeesListText')} />
            <DataGrid
              autoHeight
              rows={emps}
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
              href={`/company/view/${router.query.id}/employees/list`}
            >
               {t('viewAllText')}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default CompanyViewEmployees
