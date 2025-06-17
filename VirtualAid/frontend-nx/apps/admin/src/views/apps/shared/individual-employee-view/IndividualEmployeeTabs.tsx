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
import Skeleton from '@mui/material/Skeleton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** custom component imports
import IndividualEmployeeCourses from './IndividualEmployeeCourses'
import IndividualEmployeeInvoices from './IndividualEmployeeInvoices'

// ** Types Imports
import { IndividualEnrolledCourse } from 'src/types/courses'

// ** API Call Imports and Types
import { getIndividualEnrolledCourseList, getIndividualInvoice } from 'src/api-services/IndividualApi'
import { InvoiceType } from 'src/types/invoice'
import { useTranslation } from 'react-i18next'

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

interface PropsType {
  id: string
}

const IndividualEmployeeTabs = (props: PropsType) => {
  const { id } = props

  const [activeTab, setActiveTab] = useState<string>('courses')
  const [isCourseLoading, setIsCoursesLoading] = useState<boolean>(false)
  const [isInvoiceLoading, setIsInvoiceLoading] = useState<boolean>(false)

  const [courseError, setCourseError] = useState<boolean>(true)
  const [invoiceError, setInvoiceError] = useState<boolean>(false)

  const [courses, setCourses] = useState<IndividualEnrolledCourse[]>([])
  const [invoices, setInvoices] = useState<InvoiceType[]>([])
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter()

  const handleTabChage = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const getCourses = useCallback(async () => {
    try {
      setIsCoursesLoading(true)
      const culture = router.locale as string;
      const response = await getIndividualEnrolledCourseList(id, 1, 5, culture)
      
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
  }, [id])

  const getInvoices = useCallback(async () => {
    try {
      setIsInvoiceLoading(true)
      const response = await getIndividualInvoice(id, 1, 5)
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
  }, [id])

  useEffect(() => {
    getCourses()
    getInvoices()
  }, [getCourses, getInvoices])

  return (
    <>
      {isCourseLoading || isInvoiceLoading ? (
        <Skeleton variant='rectangular' width='100%' height={579} />
      ) : (
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
                <Tab
                  value='courses'
                  label={t('courseText')}
                  icon={<Icon fontSize='1.125rem' icon='tabler:device-analytics' />}
                />
                <Tab
                  value='invoices'
                  label={t('invoicesText')}
                  icon={<Icon fontSize='1.125rem' icon='tabler:currency-dollar' />}
                />
              </TabList>

              <Box sx={{ mt: 4 }}>
                <TabPanel sx={{ p: 0 }} value='courses'>
                  <IndividualEmployeeCourses courses={courses} />
                </TabPanel>

                <TabPanel sx={{ p: 0 }} value='invoices'>
                  <IndividualEmployeeInvoices invoices={invoices} />
                </TabPanel>
              </Box>
            </TabContext>
          </Box>
        </>
      )}
    </>
  )
}

export default IndividualEmployeeTabs
