// ** React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import NextLink from 'next/link'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { debounce } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

// ** Type Imports
import { InvoiceType } from 'src/types/invoice'
import { CompanyProfileType } from 'src/types/company'



// ** Axios API calls import
import { getCompanyProfile, getCompanyInvoices } from 'src/api-services/CompanyApi'
import { useTranslation } from 'react-i18next'
import { getDisplayDate, getDisplayStripeAmount } from '@virtual-aid-frontend/utils'
import Icon from 'src/@core/components/icon'
interface CellType {
  row: InvoiceType
}
interface IndividualViewInvoicesPropsType {
  invoices: InvoiceType[]
}
const CompanyInvoiceListPage = (props: IndividualViewInvoicesPropsType) => {
  const [invoices, setInvoices] = useState<InvoiceType[]>([])

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [dataGridLoading, setDataGridLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)

  const [companyDetails, setCompanyDetails] = useState<CompanyProfileType>({} as CompanyProfileType)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter()
  const invoiceColumns: GridColDef[] = [
    {
      flex: 0.35,
      width: 250,
      field: 'transactionId',
      headerName: t('tranjectionText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box>{row.transactionId}</Box>
      }
    },
    {
      flex: 0.1,
      width: 100,
      field: 'total',
      headerName: t('common:totalText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box>{getDisplayStripeAmount(row.currencyType, row.toatalAmount)}</Box>
      }
    },
    {
      flex: 0.25,
      width: 150,
      field: 'purchaseDate',
      headerName: t('purchaseDateText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return <Box>{getDisplayDate(row.purchaseDate)}</Box>
      }
    },
    {
      flex: 0.2,
      width: 100,
      field: 'action',
      headerName: t('common:action:action'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box>
            <MuiLink component={NextLink} target='_blank' href={row.invoiceMasterLink}>
              <Icon icon='tabler:download' />
            </MuiLink>
          </Box>
        )
      }
    }
  ]
  //method to get invoice details 
  //@param: companyId - for getting data companywise 
  //        pageNo and pageSize? - used for getting pagewise data
  const getInvoices = useCallback(async (companyId: string, pageNo: number, pageSize: number) => {
    try {
      setDataGridLoading(true)
      const response = await getCompanyInvoices(companyId, pageNo, pageSize)
      if (response.status === 200) {
        setInvoices(response.data.items)
        setTotalRows(response.data.totalCount)
        setDataGridLoading(false)
      } else {
        setDataGridLoading(false)
      }
    } catch (error) {
      setDataGridLoading(false)
    }
  }, [])

  useEffect(() => {
    if (router.isReady) {
      getInvoices(router.query.id as string, paginationModel.page + 1, paginationModel.pageSize)
    }
  }, [getInvoices, paginationModel.page, paginationModel.pageSize, router.isReady, router.query.id])

  //method to get company profile for breadcrumbs 
  //@param: id - for getting id wise details
  const getCompanyProfileForBreadcrumbs = useCallback(async (id: string) => {
    try {
      const culture = router.locale as string;
      const response = await getCompanyProfile(id, culture)

      if (response.status === 200) {
        setCompanyDetails(response.data)
      }
    } catch (error) {
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
            <MuiLink underline='hover' color='inherit' component={NextLink as any} href={`/company/list`}>
              Companies
            </MuiLink>
            <MuiLink
              underline='hover'
              color='inherit'
              component={NextLink as any}
              href={`/company/view/${companyDetails?.id}`}
            >
              {companyDetails?.companyName}
            </MuiLink>
            <Typography>Invoices</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <DataGrid
              autoHeight
              rows={invoices}
              columns={invoiceColumns}
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              loading={dataGridLoading}
              pageSizeOptions={[10, 25, 50]}
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
            />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default CompanyInvoiceListPage
