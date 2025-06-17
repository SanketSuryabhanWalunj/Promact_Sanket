// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** Next Imports
import NextLink from 'next/link'

// ** Mui Imports
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'

// ** Icon imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** Types Imports
import { CompanyType } from 'src/types/company'

// ** Axios API calls Imports
import { acceptRejectCompany, getCompanyListPagination, getPendingCompanyList } from 'src/api-services/CompanyApi'

// ** Template Utils Imports
import { getInitials } from '@virtual-aid-frontend/utils'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

interface CellType {
  row: CompanyType
}

// Renders the client avatar based on whether the profile image is available or not
//@param: row to describe company type
const renderClient = (row: CompanyType) => {
  if (row.profileImage) {
    return <CustomAvatar src={row.profileImage} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar
        skin='filled'
        sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
      >
        {getInitials(row.companyName ? row.companyName : '')}
      </CustomAvatar>
    )
  }
}

const CompanyRequestsPage = () => {
  const [companies, setCompanies] = useState<CompanyType[]>([])

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 2 })
  const [gridLoading, setGridLoading] = useState(false)
  const [dataFetched, setDataFetched] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const router = useRouter()
  const [backdrop, setBackdrop] = useState(false)
  const [requestStatusChangeErrorMsg, setRequestStatusChangeErrorMsg] = useState('')
  const { t, ready } = useTranslation(['company', 'common']);

  // Fetches the list of pending companies from the server
  // @param: page and pageSize used for getting pagewise data 
  const fetchCompanies = useCallback(async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const response = await getPendingCompanyList(page, pageSize)
      if (response.status === 200) {
        setCompanies(response.data.items)
        setTotalRows(response.data.totalCount)
        setDataFetched(true)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanies(paginationModel.page + 1, paginationModel.pageSize)
  }, [fetchCompanies, paginationModel.page, paginationModel.pageSize])

  // Accepts or rejects the company request
  // @param: row and status used fir company row data and set status 
  const acceptRejectRequest = async (row: CompanyType, status: boolean) => {
    try {
      setBackdrop(true)
      const culture = router.locale as string;
      const response = await acceptRejectCompany(row.id, status, culture)
      if (response.status === 200) {
        setBackdrop(false)
        fetchCompanies(paginationModel.page + 1, paginationModel.pageSize)
        setRequestStatusChangeErrorMsg('')
      } else {
        setRequestStatusChangeErrorMsg(t('common:somethingWentWrong'))
        setBackdrop(false)
      }
    } catch (error) {
      setRequestStatusChangeErrorMsg(t('common:somethingWentWrong'))
      setBackdrop(false)
    }
  }

  const columns: GridColDef[] = [
    {
      flex: 0.9,
      minWidth: 250,
      field: 'companyName',
      headerName: t('companyText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                noWrap
                component={NextLink}
                href={`/company/view/${row.id}`}
                sx={{
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {row.companyName}
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
      flex: 0.4,
      minWidth: 200,
      field: 'action',
      headerName: t('actionText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='contained'
                size='small'
                onClick={() => {
                  acceptRejectRequest(row, true)
                }}
              >
                {t('common:acceptText')}
              </Button>
              <Button variant='outlined' color='secondary' size='small' onClick={() => acceptRejectRequest(row, false)}>
                {t('common:rejectText')}
              </Button>
            </Box>
          </>
        )
      }
    }
  ]

  return (
    <>
      <Grid container spacing={6.5} sx={{ mb: 10 }}>
        <Grid item xs={12}>
          <Breadcrumbs>
            <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/company/list`}>
              Companies
            </MuiLink>
            <Typography>Requests</Typography>
          </Breadcrumbs>
        </Grid>
        {requestStatusChangeErrorMsg && (
          <Grid item xs={12}>
            <Alert severity='error' variant='filled'>
              {requestStatusChangeErrorMsg}
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          {paginationModel.page === 0 && !gridLoading && dataFetched && companies.length === 0 ? (
            <Card>
              <Box
                display='flex'
                alignItems='center'
                justifyContent='center'
                flexDirection='column'
                sx={{ minHeight: '300px' }}
              >
                <Icon icon='fluent-mdl2:message-friend-request' fontSize='10rem' />
                <br />
                <Typography variant='h5' component='div'>
                  No Pending Requests
                </Typography>
              </Box>
            </Card>
          ) : (
            <Card>
              <DataGrid
                autoHeight
                rowHeight={62}
                rows={companies}
                columns={columns}
                disableRowSelectionOnClick
                disableColumnFilter
                disableColumnMenu
                disableColumnSelector
                loading={gridLoading}
                pageSizeOptions={[10, 20, 50]}
                rowCount={totalRows}
                paginationMode='server'
                paginationModel={paginationModel}
                onPaginationModelChange={(model, details) => {
                  if (model.pageSize !== paginationModel.pageSize) {
                    const temp = { page: 0, pageSize: model.pageSize }
                    setPaginationModel(temp)
                  } else {
                    setPaginationModel(model)
                  }
                }}
              />
            </Card>
          )}
        </Grid>
      </Grid>

      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={backdrop}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </>
  )
}

export default CompanyRequestsPage
