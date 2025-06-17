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
import {
  CompanyProfileType,
  CourseCompanyRequestType,
  SubscribedAssignedAdmin,
  courseSubscritionAdminType
} from 'src/types/company'
import { Controller, useForm } from 'react-hook-form'
import { getAllCourses } from 'src/api-services/CoursesApi'
import {
  editAssignedCourses,
  getCompanyPurchasedCourses,
  postAdminCourseAcceptRequest,
  postAdminCourseSubscribedRequest
} from 'src/api-services/CompanyApi'
import AddEditAssignForm from './AddEditAssignForm'
import { useTranslation } from 'react-i18next'

type CourseCountForm = {
  courseName: string
  purchasedAmount: number
  examType: string
  totalAmount: number
}

interface CompanyViewCoursesPropsType {
  formDefaultValues: CourseCountForm
  onSubmitClick: (data: CourseCountForm) => void
  loading: boolean
  errorMsg: string
  courses: CompanyPurchasedCourse[]
  coursesRequestCount: CourseCompanyRequestType[]
  selectedCourse: CompanyPurchasedCourse | undefined
}

const EditAssignCourseButton = (props: CompanyViewCoursesPropsType) => {
  const { courses } = props
  const [loadingCompany, setLoadingCompany] = useState(false)
  const [errorCompany, setErrorCompany] = useState(false)
  const [defaultFormData, setDefaultFormData] = useState<CouseCountForm>({
    courseName: '',
    examType: '',
    count: 1,
    totalAmount: 1
  })

  const { coursesRequestCount } = props
  const [openDialog, setOpenDialog] = useState(false)
  const [assignedCourses, setAssignedCourses] = useState<CourseCompanyRequestType>()
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [totalRows, setTotalRows] = useState(0)
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState<CompanyPurchasedCourse | undefined>()
  const [count, setCount] = useState(0)
  const [gridLoading, setGridLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitErrMsg, setSubmitErrMsg] = useState('')
  const [errorMessage, setErrorMsg] = useState<string>('')
  const [editRowData, setEditRowData] = useState<CompanyPurchasedCourse | null>(null)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  
  //openDialog method for company purchase code
  const openDialogAssign = () => {
    setOpenDialog(true)
    if (props.selectedCourse !== undefined) {
      const convertedCourse: CompanyPurchasedCourse = {
        name: props.selectedCourse.name,
        purchasedAmount: props.selectedCourse.purchasedAmount,
        examType: props.selectedCourse.examType,
        id: props.selectedCourse.id,
        courseId: props.selectedCourse.courseId,
        price: props.selectedCourse.price,
        enrolledAmount: props.selectedCourse.enrolledAmount,
        purchasedDate: props.selectedCourse.purchasedDate,
        expirationDate: props.selectedCourse.expirationDate
      }
      setSelectedCourse(convertedCourse)
    }
  }

  type CouseCountForm = {
    courseName: string
    count: number
    examType: string
    totalAmount: number
  }
  const defaultFormValues: CouseCountForm = {
    courseName: '',
    count: 1,
    examType: '',
    totalAmount: 1
  }

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<CouseCountForm>({
    defaultValues: defaultFormValues
  })

  // update assign course
  const handlePutData = async (data: CouseCountForm) => {
    try {
      const payload: SubscribedAssignedAdmin = {
        courseName: JSON.parse(data.courseName).name || '',
        examtype: data.examType || '',
        count: data.count,
        totalAmount: data.totalAmount || 0,
        culture: router.locale as string 
      }
      const response = await editAssignedCourses(router.query.id as string, payload)

      if (response.status === 204) {
        router.reload()
      }
    } catch (error) {
      if (isAxiosError(error)) {
        if (error?.response?.data?.error?.code === 409 || error?.response?.data?.error.code === '409') {
          setErrorMsg(t('updateCountText'))
        }
      }
    }
  }
  // Function to handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  return (
    <>
      <Button
        variant='contained'
        sx={{ width: '173px', height: '38px', whiteSpace: 'nowrap' }}
        onClick={() => openDialogAssign()}
      >
        {t('edit')}
      </Button>
      <Dialog open={openDialog} maxWidth={'sm'} fullWidth onClose={() => setOpenDialog(!openDialog)} sx={{ p: 4 }}>
        <DialogTitle
          id='scroll-dialog-title'
          sx={{
            color: 'text.secondary',
            fontSize: '26px',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '14px'
          }}
        >
          {t('assignCourses')}
        </DialogTitle>
        <AddEditAssignForm
          onSubmitClick={handlePutData}
          selectedCourse={selectedCourse}
          formDefaultValues={defaultFormData}
          courses={courses}
          coursesRequestCount={coursesRequestCount}
          handleCloseDialog={handleCloseDialog}
          loading={false}
          errorMsg={errorMessage}
        ></AddEditAssignForm>
      </Dialog>
    </>
  )
}

export default EditAssignCourseButton
function setIsSubmitError(arg0: boolean) {
  // throw new Error('Function not implemented.')
}
