// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import NextLink from 'next/link'

// ** Mui Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types Imports
import { CompanyPurchasedCourse, IndividualEnrolledCourse } from 'src/types/courses'
import { IndividualProfileType } from 'src/types/individual'

// ** Axios API calls imports
import { getCertificate, getIndividualProfile } from 'src/api-services/IndividualApi'

// ** Common Utils imports from lib
import { getDisplayDate } from '@virtual-aid-frontend/utils'

import { getIndividualEnrolledCourseList } from 'src/api-services/IndividualApi'
import AssignCourseButton from 'src/views/apps/company/view/AssignCourseButton'
import AssignCourseIndividualButton from 'src/views/apps/shared/individual-employee-view/AssignCourseIndividualButton'
import { useTranslation } from 'react-i18next'

interface CellType {
  row: IndividualEnrolledCourse
}





const IndividualCourseListPage = () => {
  const [courses, setCourses] = useState<IndividualEnrolledCourse[]>([])

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [dataGridLoading, setDataGridLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)

  const [IndividualDetails, setIndividualDetails] = useState<IndividualProfileType>({} as IndividualProfileType)

  const [courseError, setCourseError] = useState<boolean>(false)

  const router = useRouter()
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const RowOptions = ({ row }: CellType) => {
    const router = useRouter()
  
    const [certiLoading, setCertiLoading] = useState(false)
  
     //method to download employee certificate
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
              <Tooltip title={t('common:downloadCertificateText')}>
                <IconButton size='small' onClick={downloadCertificate} disabled={certiLoading}>
                  <Icon icon='tabler:download' />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <></>
          )}
        </Box>
      </>
    )
  }
  const columns: GridColDef[] = [
    {
      flex: 0.8,
      minWidth: 300,
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
  
              // '&:hover': { color: 'primary.main' }
            }}
          >
            {row.name} {row.examType}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            {getDisplayDate(row.courseEnrolledDate)}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.3,
      minWidth: 130,
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
      flex: 0.3,
      minWidth: 150,
      sortable: false,
      field: 'actions',
      headerName: t('actionsText'),
      renderCell: ({ row }: CellType) => {
        return (
          <>
            <RowOptions row={row} />
          </>
        )
      }
    }
  ]
  //method to get courses using parameters
  //@param: individualId used for individual details get id wise
  //        pageno and pagesize used to set grid data pagewise
  const getCourses = useCallback(async (individualId: string, pageNo: number, pageSize: number) => {
    try {
      setDataGridLoading(true)
      const culture = router.locale as string;
      const response = await getIndividualEnrolledCourseList(individualId, pageNo, pageSize, culture)
      if (response.status === 200) {
        setCourses(response.data.items)
        setTotalRows(response.data.totalCount)
        setDataGridLoading(false)
        setCourseError(false)
      } else {
        setDataGridLoading(false)
        setCourseError(true)
      }
    } catch (error) {
      setDataGridLoading(false)
      setCourseError(true)
    }
  }, [])

  useEffect(() => {
    if (router.isReady) {
      getCourses(router.query.id as string, paginationModel.page + 1, paginationModel.pageSize)
    }
  }, [getCourses, paginationModel.page, paginationModel.pageSize, router.isReady, router.query.id])

  const getCompanyProfileForBreadcrumbs = useCallback(async (id: string) => {
    try {
      const response = await getIndividualProfile(id)

      if (response.status === 200) {
        setIndividualDetails(response.data)
      }
    } catch (error) {
      //
    }
  }, [])

  useEffect(() => {
    if (router.isReady) {
      getCompanyProfileForBreadcrumbs(router.query.id as string)
    }
  }, [getCompanyProfileForBreadcrumbs, router.isReady, router.query.id])

  return (
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={12}>
          <Breadcrumbs>
            <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/individual/list`}>
              {t('individualsText')}
            </MuiLink>
            <MuiLink
              underline='hover'
              color='inherit'
              component={NextLink as any}
              href={`/individual/view/${IndividualDetails?.id}`}
            >
              {IndividualDetails?.fullName}
            </MuiLink>
            <Typography>{t('common:coursesText')}</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12}>
          <Card>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: '20px' }}>
            <CardHeader title={t('common:coursesListText')} />
            <AssignCourseIndividualButton courses={courses}></AssignCourseIndividualButton>
            </Box>
            <DataGrid
              rows={courses}
              columns={columns}
              autoHeight
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              loading={dataGridLoading}
              pageSizeOptions={[10, 20, 50]}
              rowCount={totalRows}
              paginationMode='server'
              paginationModel={paginationModel}
              onPaginationModelChange={model => {
                if (model.pageSize !== paginationModel.pageSize) {
                  const temp = { page: 0, pageSize: model.pageSize }
                  setPaginationModel(temp)
                } else {
                  setPaginationModel(model)
                }
              }}
              getRowId={row => row.id + row.examType}
            />
          
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default IndividualCourseListPage
