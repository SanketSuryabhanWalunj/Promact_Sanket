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
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import axios, { isAxiosError } from 'axios'
import { DialogTitle, MenuItem, Select, TextField, debounce } from '@mui/material'

// ** Types Imports
import { CompanyPurchasedCourse, CoursesType } from 'src/types/courses'

// ** Common utils imports from lib
import { getDisplayDate } from '@virtual-aid-frontend/utils'
import { SetStateAction, useCallback, useEffect, useState } from 'react'
import { CompanyProfileType, CourseCompanyRequestType } from 'src/types/company'
import { Controller, useForm } from 'react-hook-form'
import { getAllCourses } from 'src/api-services/CoursesApi'
import { postAdminCourseAcceptRequest, postAdminCourseSubscribedRequest } from 'src/api-services/CompanyApi'
import FallbackSpinner from 'src/@core/components/spinner'
import AssignCourseButton from './AssignCourseButton'
import EditAssignCourseButton from './EditAssignCourseButton'
import { useTranslation } from 'react-i18next'

interface CellType {
  row: CompanyPurchasedCourse
}

interface CompanyViewCoursesPropsType {
  courses: CompanyPurchasedCourse[]
  coursesRequestCount: CourseCompanyRequestType[]
  selectedCourse: CompanyPurchasedCourse | undefined
}


const CompanyViewCourses = (props: CompanyViewCoursesPropsType) => {
  const { courses } = props
  const { coursesRequestCount } = props
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter()
  
  // Prefield values
  const prefieldValues = {
    courseName:'' ,
    purchasedAmount: 10,
    examType: '',
    totalAmount: 10
  };
  const handleSubmit = () => {


  }
  

  const columns: GridColDef[] = [
    {
      flex: 0.30,
      minWidth: 350,
      field: 'courseName',
      headerName: t('common:courseNameText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box title={row.name +  row.examType}>{row.name}  {row.examType}</Box>
      }
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'price',
      headerName: t('common:priceText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box> &euro; {row.price}</Box>
      }
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'purchasedcount',
      headerName: t('purchasedCountText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box>{row.purchasedAmount}</Box>
      }
    },
    {
      flex: 0.25,
      minWidth: 250,
      field: 'purchasedDate',
      headerName: t('purchaseCourseDate'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box sx={{ display: 'flex', alignItems: 'center' }}>{getDisplayDate(row.purchasedDate)}</Box>
      }
    },
    {
      flex: 0.25,
      minWidth: 250,
      field: 'expirationDate',
      headerName: t('expirationDate'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box sx={{ display: 'flex', alignItems: 'center' }}>{getDisplayDate(row.expirationDate)}</Box>
      }
    },
    {
      flex: 0.25,
      minWidth: 250,
      field: 'edit',
      headerName: t('edit'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <EditAssignCourseButton courses={courses} selectedCourse={row} coursesRequestCount={coursesRequestCount} formDefaultValues={prefieldValues} onSubmitClick={handleSubmit} loading={false} errorMsg={''} ></EditAssignCourseButton>
      }
    },
  ]

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: '20px' }}>
              <CardHeader title={t('common:coursesListText')} />
              <AssignCourseButton courses={courses} coursesRequestCount={coursesRequestCount}></AssignCourseButton>
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
            />
            <Button
              variant='outlined'
              color='secondary'
              sx={{ my: 4, mx: 6 }}
              LinkComponent={Link}
              href={`/company/view/${router.query.id}/courses/list`}
            >
             {t('viewAllText')}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default CompanyViewCourses
function setIsSubmitError(arg0: boolean) {
 // throw new Error('Function not implemented.')
}


