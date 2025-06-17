// ** Next Imports
import { useRouter } from 'next/router'

// ** Mui Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import { DialogTitle } from '@mui/material'

// ** Types Imports
import { CompanyPurchasedCourse, CoursesType } from 'src/types/courses'

// ** Common utils imports from lib
import { useCallback, useEffect, useState } from 'react'
import { CourseCompanyRequestType } from 'src/types/company'
import { getAllCourses } from 'src/api-services/CoursesApi'
import { postAdminCourseAcceptRequest, postAdminCourseSubscribedRequest } from 'src/api-services/CompanyApi'
import AddEditAssignForm from './AddEditAssignForm'
import { useTranslation } from 'react-i18next'

interface CellType {
  row: CompanyPurchasedCourse
}

interface CompanyViewCoursesPropsType {
  courses: CompanyPurchasedCourse[]
  coursesRequestCount: CourseCompanyRequestType[]
}

const AssignCourseButton = (props: CompanyViewCoursesPropsType) => {
  const { courses } = props
  const { coursesRequestCount } = props
  const [openDialog, setOpenDialog] = useState(false)
  const [Courses, setCourses] = useState<CoursesType[]>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [totalRows, setTotalRows] = useState(0)
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState('')
  const [count, setCount] = useState(0)
  const [gridLoading, setGridLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // State variable to track if the API call was successful
  const [apiSuccess, setApiSuccess] = useState(false)

  const openDialogAssign = () => {
    setOpenDialog(true)
  }

  // Function to handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
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
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  // get All courses to display in course dropdown
  const getAllCoursesList = useCallback(async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const culture = router.locale as string;
      const response = await getAllCourses(page, pageSize, culture)
      if (response.status === 200) {
        setCourses(response.data.items)
        setTotalRows(response.data.totalCount)
        setGridLoading(false)

        // If API call is successful
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllCoursesList(paginationModel.page + 1, paginationModel.pageSize)
  }, [getAllCoursesList, paginationModel.page, paginationModel.pageSize])

  // Post request api for course subscribtion and accept reject request
  const handlePostData = async (data: CouseCountForm) => {
    const parsedCourseItem = JSON.parse(data.courseName)
    const parsedCourseExamType = data.examType

    try {
      let requestId = ''
      setIsSubmitting(true)
      for (let i = 0; i < coursesRequestCount.length; i++) {
        if (coursesRequestCount[i].courseId === parsedCourseItem.id) {
          requestId = coursesRequestCount[i].id
        }
      }
      const dataToSendSubscribe = {
        companysId: router.query.id as string,
        courseId: parsedCourseItem.id,
        examType: parsedCourseExamType,
        totalAmount: parsedCourseItem.price,
        planType: 'Premium',
        totalCount: data.count,
        remainingCount: data.count
      }
      let dataNew = [dataToSendSubscribe]
      const response = await postAdminCourseSubscribedRequest(dataNew, router.query.id as string)
      if (response.status === 204) {
        if (requestId !== '') {
          
          const acceptedResponse = await postAdminCourseAcceptRequest(requestId)
          
          if (acceptedResponse.status === 204) {
            window.location.reload();
            setOpenDialog(false)
          }
        } else {
          window.location.reload();
          setIsSubmitError(true)
        }
      }
    } catch (error) {
      setIsSubmitting(false)
      setIsSubmitError(true)
    }
  }

  return (
    <>
      <Button
        variant='contained'
        sx={{ width: '173px', height: '38px', whiteSpace: 'nowrap' }}
        onClick={() => openDialogAssign()}
      >
        <svg
          width='18'
          height='18'
          style={{ marginRight: '5px' }}
          viewBox='0 0 18 18'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M9 3.75V14.25' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M3.75 9H14.25' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
        {t('assignCourseText')}
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
         {t('assignCourseText')}
        </DialogTitle>
        <AddEditAssignForm
          onSubmitClick={handlePostData}
          formDefaultValues={defaultFormValues}
          courses={courses}
          coursesRequestCount={coursesRequestCount}
          loading={false}
          selectedCourse={undefined}
          errorMsg={''}
          handleCloseDialog={handleCloseDialog}
        ></AddEditAssignForm>
      </Dialog>
    </>
  )
}

export default AssignCourseButton
function setIsSubmitError(arg0: boolean) {
  // throw new Error('Function not implemented.')
}
