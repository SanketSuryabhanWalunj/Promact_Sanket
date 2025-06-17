// ** React Imports
import { SyntheticEvent, useState, useEffect, useCallback } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MuiTab, { TabProps } from '@mui/material/Tab'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** custom component imports
import IndividualViewCourses from './IndividualViewCourses'
import IndividualViewInvoices from './IndividualViewInvoices'
import { IndividualEnrolledCourse } from 'src/types/courses'

// ** API Call Imports and Types
import { getIndividualEnrolledCourseList, getIndividualInvoice } from 'src/api-services/IndividualApi'
import { InvoiceType } from 'src/types/invoice'

// ** Styled Tab component
const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1.5)
  }
}))

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  borderBottom: '0 !important',
  '&, & .MuiTabs-scroller': {
    boxSizing: 'content-box',
    padding: theme.spacing(1.25, 1.25, 2),
    margin: `${theme.spacing(-1.25, -1.25, -2)} !important`
  },
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    lineHeight: 1,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}))

const IndividualViewRight = () => {
  const [activeTab, setActiveTab] = useState<string>('courses')
  const [isEmpLoading, setIsEmpLoading] = useState<boolean>(false)
  const [isCourseLoading, setIsCoursesLoading] = useState<boolean>(false)
  const [isInvoiceLoading, setIsInvoiceLoading] = useState<boolean>(false)

  const [empError, setEmpError] = useState<boolean>(true)
  const [courseError, setCourseError] = useState<boolean>(true)
  const [invoiceError, setInvoiceError] = useState<boolean>(false)

  const [courses, setCourses] = useState<IndividualEnrolledCourse[]>([])
  const [invoices, setInvoices] = useState<InvoiceType[]>([])

  const router = useRouter()

  const handleTabChage = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const getCourses = useCallback(async () => {
    try {
      setIsCoursesLoading(true)
      const culture = router.locale as string; 
      const response = await getIndividualEnrolledCourseList(router.query.id as string, 1, 5, culture)
      if (response.status === 200) {
        setCourses(response.data.items)
        setIsCoursesLoading(false)
        setCourseError(false)
      } else {
        setIsCoursesLoading(false)
        setCourseError(true)
      }
    } catch (error) {
      setIsCoursesLoading(false)
      setCourseError(true)
    }
  }, [router.query.id])

  const getInvoices = useCallback(async () => {
    try {
      setIsInvoiceLoading(true)
      const response = await getIndividualInvoice(router.query.id as string, 1, 5)
      if (response.status === 200) {
        setInvoices(response.data.items)
        setIsInvoiceLoading(false)
        setInvoiceError(false)
      } else {
        setIsInvoiceLoading(false)
        setInvoiceError(true)
      }
    } catch (error) {
      setIsInvoiceLoading(false)
      setInvoiceError(true)
    }
  }, [router.query.id])

  useEffect(() => {
    if (router.isReady) {
      if (router.query.id) {
        getCourses()
        getInvoices()
      }
    }
  }, [getCourses, router.isReady, router.query.id])

  return (
    <>
      <Box sx={{ mt: 4 }}>
        <TabContext value={activeTab}>
          <TabList
            variant='scrollable'
            scrollButtons='auto'
            onChange={handleTabChage}
            aria-label='forced scroll tabs example'
            sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
          >
            <Tab value='courses' label='Courses' icon={<Icon fontSize='1.125rem' icon='tabler:device-analytics' />} />
            <Tab value='invoices' label='Invoices' icon={<Icon fontSize='1.125rem' icon='tabler:currency-dollar' />} />
          </TabList>

          <Box sx={{ mt: 4 }}>
            <>
              <TabPanel sx={{ p: 0 }} value='courses'>
                <IndividualViewCourses courses={courses}></IndividualViewCourses>
              </TabPanel>

              <TabPanel sx={{ p: 0 }} value='invoices'>
                <IndividualViewInvoices invoices={invoices}></IndividualViewInvoices>
              </TabPanel>
            </>
          </Box>
        </TabContext>
      </Box>
    </>
  )
}

export default IndividualViewRight
