// ** React Imports
import { SyntheticEvent, useCallback, useEffect, useState } from 'react'

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

// ** Demo Components Imports

// ** Types
import { CompanyEmployeeType, CompanyProfileType, CourseCompanyRequestType } from 'src/types/company'
import { CompanyPurchasedCourse } from 'src/types/courses'
import { IndividualType } from 'src/types/individual'
import { InvoiceType } from 'src/types/invoice'

// ** App Component Imports
import CompanyViewEmployees from './CompanyViewEmployees'

import CompanyViewInvoices from './CompanyViewInvoices'

// ** API Call Imports
import {
  getCompanyEmps,
  getCompanyPurchasedCourses,
  getCompanyInvoices,
  getCompanyProfile
} from 'src/api-services/CompanyApi'
import CompanyViewCourses from './CompanyViewCourses'
import { t } from 'i18next'
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

const CompanyViewRight = () => {
  const [activeTab, setActiveTab] = useState<string>('employees')
  const [isEmpLoading, setIsEmpLoading] = useState<boolean>(false)
  const [isCourseLoading, setIsCoursesLoading] = useState<boolean>(false)
  const [isInvoiceLoading, setIsInvoiceLoading] = useState<boolean>(false)

  const [empError, setEmpError] = useState<boolean>(true)
  const [courseError, setCourseError] = useState<boolean>(true)
  const [invoiceError, setInvoiceError] = useState<boolean>(false)

  const [emps, setEmps] = useState<IndividualType[]>([])
  const [courses, setCourses] = useState<CompanyPurchasedCourse[]>([])
  const [coursesRequestCount, setCoursesRequestCount] = useState<CourseCompanyRequestType[]>([])
  const [invoices, setInvoices] = useState<InvoiceType[]>([])

  const router = useRouter()

  const { tab } = router.query // Get the query parameter
  const [selectedTab, setSelectedTab] = useState('defaultTab')
  const [companyDetails, setCompanyDetails] = useState<CompanyProfileType>({} as CompanyProfileType)
  const [detailsLoading, setDetailsLoading] = useState(true)
  const [detailsErr, setDetailsErr] = useState(false)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const handleTabChage = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const getEmps = useCallback(async () => {
    try {
      setIsEmpLoading(true)
      const response = await getCompanyEmps(router.query.id as string, 1, 5)
      if (response.status === 200) {
        setEmps(response.data.items)
        setIsEmpLoading(false)
        setEmpError(false)
      } else {
        setIsEmpLoading(false)
        setEmpError(true)
      }
    } catch (error) {
      setIsEmpLoading(false)
      setEmpError(true)
    }
  }, [router.query.id])

  const getCourses = useCallback(async () => {
    try {
      setIsCoursesLoading(true)
      const culture = router.locale as string;
      const response = await getCompanyPurchasedCourses(router.query.id as string, 1, 5,culture)
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
      const response = await getCompanyInvoices(router.query.id as string, 1, 5)
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

  const getCompanyData = async (id: string) => {
    try {
      setDetailsLoading(true)
      const culture = router.locale as string
      const response = await getCompanyProfile(id,culture)

      if (response.status === 200) {
        setCompanyDetails(response.data)

        setCoursesRequestCount(response.data.customCourseRequests)
        setDetailsLoading(false)
        setDetailsErr(false)
      } else {
        setDetailsLoading(false)
        setDetailsErr(true)
      }
    } catch (error) {
      setDetailsLoading(false)
      setDetailsErr(true)
    }
  }
  useEffect(() => {
    if (router.isReady) {
      if (router.query.id) {
        getEmps()
        getCourses()
        getInvoices()
        getCompanyData(router.query.id as string)
      }
    }
    const { tab } = router.query
    if (tab) {
      // If query parameter is present, update the selected tab
      setActiveTab('courses')
    }
  }, [getCourses, getEmps, getInvoices, router.isReady, router.query.id])

  return (
    <>
      {isEmpLoading || isCourseLoading || isInvoiceLoading ? (
        <Skeleton variant='rectangular' width='100%' height={579} />
      ) : (
        <>
          <TabContext value={activeTab}>
            <TabList
              variant='scrollable'
              scrollButtons='auto'
              onChange={handleTabChage}
              aria-label='forced scroll tabs example'
              sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
            >
              <Tab value='employees' label={t('employeeText')} icon={<Icon fontSize='1.125rem' icon='tabler:user-check' />} />
              <Tab value='courses' label={t('courseText')} icon={<Icon fontSize='1.125rem' icon='tabler:device-analytics' />} />
              <Tab
                value='invoices'
                label={t('invoicesText')}
                icon={<Icon fontSize='1.125rem' icon='tabler:currency-dollar' />}
              />
            </TabList>
            <Box sx={{ mt: 4 }}>
              <>
                <TabPanel sx={{ p: 0 }} value='employees'>
                  <CompanyViewEmployees emps={emps} />
                </TabPanel>

                <TabPanel sx={{ p: 0 }} value='courses'>
                  <CompanyViewCourses
                    courses={courses}
                    coursesRequestCount={coursesRequestCount}
                    selectedCourse={undefined}
                  />
                </TabPanel>

                <TabPanel sx={{ p: 0 }} value='invoices'>
                  <CompanyViewInvoices invoices={invoices} />
                </TabPanel>
              </>
            </Box>
          </TabContext>
        </>
      )}
    </>
  )
}

export default CompanyViewRight
