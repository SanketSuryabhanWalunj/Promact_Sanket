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
import {
  Alert,
  DialogTitle,
  FilledTextFieldProps,
  MenuItem,
  OutlinedTextFieldProps,
  Select,
  StandardTextFieldProps,
  TextField,
  TextFieldVariants,
  debounce
} from '@mui/material'

// ** Types Imports
import { CompanyPurchasedCourse, CoursesType } from 'src/types/courses'

// ** Common utils imports from lib
import { getDisplayDate } from '@virtual-aid-frontend/utils'
import { SetStateAction, useCallback, useEffect, useState } from 'react'
import { CourseCompanyRequestType } from 'src/types/company'
import { Controller, useForm } from 'react-hook-form'
import { getAllCourses } from 'src/api-services/CoursesApi'
import dayjs, { Dayjs } from 'dayjs'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import React from 'react'
import { LiveExamType } from 'src/types/individual'
import { useTranslation } from 'react-i18next'

type LiveExamForm = {
  courseId: string
  examDate: string
  allocatedSeatsCount: number
  remaningSeatsCount: number
  isDeleted: boolean
}

interface LiveExamFormType {
  formDefaultValues: LiveExamForm
  onSubmitClick: (data: LiveExamForm) => void
  loading: boolean
  errorMsg: string
  selectedRows: LiveExamType | undefined
}

const AddEditLiveExamForm = (props: LiveExamFormType & { handleCloseDialog: () => void }) => {
  const { onSubmitClick, errorMsg } = props

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [totalRows, setTotalRows] = useState(0)
  const [gridLoading, setGridLoading] = useState(false)
  const [courses, setCourses] = useState<CoursesType[]>([])
  const examTypeName = ['Online', 'VR', 'Live']
  const router = useRouter()
  const [valueNew, setValueNew] = React.useState<Dayjs | null>(dayjs(new Date()))
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  //Get All course list method
  const getAllCoursesList = useCallback(async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const culture = router.locale as string;
      const response = await getAllCourses(page, pageSize,culture)
      console.log(response.data.items);
      if (response.status === 200) {
        const temp = response.data.items.find((item: { id: any }) => item.id === props.selectedRows?.courseId)
        setCourses(response.data.items)
        setValue('courseId', JSON.stringify(temp))
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
  } = useForm<LiveExamForm>({
    defaultValues: {
      courseId: '',
      examDate: '',
      allocatedSeatsCount: 0,
      remaningSeatsCount: 0,
      isDeleted: false
    }
  })

  //UseEffect method for page load
  useEffect(() => {
  
    
    if (props.selectedRows) {
       if (props.selectedRows && props.selectedRows.examDate) {
      // Parse and format the examDate value using dayjs
      const selectedDate = dayjs(props.selectedRows.examDate).format('YYYY-MM-DD');

      //Set the examDate value using setValue
       setValue('examDate', selectedDate || '');

          // Update valueNew state with the parsed date
        setValueNew(dayjs(selectedDate));
        setValue('allocatedSeatsCount', props.selectedRows.allocatedSeatsCount)
      }
    }
  }, [props.selectedRows, setValue, courses])

  //On submit method for course assign edit
  const onSubmit = async (data: LiveExamForm) => {
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
                fullWidth
                sx={{ mb: '20px' }}
                disabled={!!field.value} // Disable the Select if a value is selected
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
          name='examDate'
          control={control}
          disabled={!!valueNew || isEditDialogOpen} // Disable the Select if a value is selected or if the edit dialog is open
          defaultValue={t('common:courseNameText')}
          render={({ field: { onChange, value } }) => (
            <>
              <label style={{display: 'block', marginBottom: '10px'}}>Live Exam Date</label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t('common:liveExamDateText')}
                  value={valueNew}
                  className='fullWidth-datepicker'
                  onChange={(valueNew: Dayjs | null) => {
                    setValue('examDate', valueNew ? valueNew.format('YYYY-MM-DD') : '') // Set the value using setValue method
                    setValueNew(valueNew)
                  }}
                  minDate={dayjs()} // Set minimum date to today
                  sx={{display: 'inline-block',marginBottom: '30px', width: '100%'}}
                />
              </LocalizationProvider>
            </>
          )}
        />

        <Controller
          control={control}
          name='allocatedSeatsCount'
          rules={{
            required: {
              value: true,
              message: t('common:noOfCoursesText')
            }
          }}
          render={({ field }) => (
            <><label style={{ display: 'block', marginBottom: '10px' }}>Available Seats</label>
            <TextField {...field} fullWidth type='number' label='No Of Courses' required sx={{ mb: '20px' }} /></>
          )}
        />
        {errorMsg && (
          <Alert severity='error' sx={{ mb: '20px' }}>
            {errorMsg}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='contained' type='submit'>
          {t('common:action:submit')}
        </Button>
        <Button variant='outlined' sx={{ color: 'text.secondary' }} onClick={props.handleCloseDialog}>
          {' '}
          {t('common:action:cancel')}
        </Button>
      </DialogActions>
    </form>
  )
}

export default AddEditLiveExamForm
