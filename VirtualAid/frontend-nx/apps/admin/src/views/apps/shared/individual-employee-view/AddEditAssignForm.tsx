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
import { Alert, DialogTitle, MenuItem, Select, TextField, debounce } from '@mui/material'

// ** Types Imports
import { CompanyPurchasedCourse, CourseDetailsType, CoursesType, IndividualEnrolledCourse } from 'src/types/courses'

// ** Common utils imports from lib
import { getDisplayDate } from '@virtual-aid-frontend/utils'
import { SetStateAction, useCallback, useEffect, useState } from 'react'
import { CourseCompanyRequestType } from 'src/types/company'
import { Controller, useForm } from 'react-hook-form'
import { getAllCourses } from 'src/api-services/CoursesApi'
import { useTranslation } from 'react-i18next'

type CourseCountForm = {
  courseId: string
  examType: string
}
type CourseCountFormDefaultValues = {
  courseId: string
  examType: string
}
interface CompanyPurchasedCourseType {
  formDefaultValues: CourseCountForm
  onSubmitClick: (data: CourseCountForm) => void
  loading: boolean
  errorMsg: string
  courses: IndividualEnrolledCourse[]
}

const AddEditAssignForm = (props: CompanyPurchasedCourseType & { handleCloseDialog: () => void }) => {
  const { onSubmitClick, errorMsg } = props
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [totalRows, setTotalRows] = useState(0)
  const [gridLoading, setGridLoading] = useState(false)
  const [courses, setCourses] = useState<CoursesType[]>([])
  const examTypeName = ['Online', 'VR', 'Live']
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter()

  //Get All course list method
  const getAllCoursesList = useCallback(async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const culture = router.locale as string;
      const response = await getAllCourses(page, pageSize, culture)
      if (response.status === 200) {
        setCourses(response.data.items)
        setTotalRows(response.data.totalCount)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }, [])

  //UseEffect method for page load
  useEffect(() => {
    getAllCoursesList(paginationModel.page + 1, paginationModel.pageSize)
  }, [getAllCoursesList, paginationModel.page, paginationModel.pageSize])

  //Form controls
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CourseCountForm>({
    defaultValues: {
      courseId: '',
      examType: '',
    }
  })

 

  //On submit method for course assign edit
  const onSubmit = async (data: CourseCountForm) => {
    onSubmitClick(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogContent>
        <Controller
          name='courseId'
          control={control}
          defaultValue={t('common:courseNameText')}
          render={({ field }) => (
            <>
              <label>{t('common:courseNameText')}</label>
              <Select
                {...field}
                displayEmpty
                fullWidth
                sx={{ mb: '20px' }}
                renderValue={selected => {
                  if (selected) {
                    const parsedSelected = JSON.parse(selected)
                    if (parsedSelected) {
                      return parsedSelected.name
                    }
                  }
                  return ''
                }}
              >
                {courses.map(option => (
                  <MenuItem key={option.id} value={JSON.stringify(option)} style={{ whiteSpace: 'normal' }}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        />
        <Controller
          name='examType'
          control={control}
          defaultValue={'common:selectExamTypeText'}
          render={({ field }) => (
            <>
              <label>{t('examTypeText')}</label>
              <Select {...field} displayEmpty fullWidth>
                {examTypeName.map(option => (
                  <MenuItem key={option} value={option} style={{ whiteSpace: 'normal' }}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button variant='contained' type='submit'>
        {t('common:action.submit')}
        </Button>
        <Button variant='outlined' sx={{ color: 'text.secondary' }} onClick={props.handleCloseDialog}>
          {' '}
          {t('common:action.cancel')}
        </Button>
      </DialogActions>
    </form>
  )
}

export default AddEditAssignForm
