// ** React Imports

// ** Next Imports
import { useRouter } from 'next/router'
import NextLink from 'next/link'

// ** MUI Imports
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'

// ** Types Imports
import { InvoiceType } from 'src/types/invoice'

// ** App components imports
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/system'
import { getDisplayDate, getDisplayStripeAmount } from '@virtual-aid-frontend/utils'
//import { Icon } from 'leaflet'
import MuiLink from '@mui/material/Link'
import Icon from 'src/@core/components/icon'

interface IndividualViewInvoicesPropsType {
  invoices: InvoiceType[]
}
  interface CellType {
  row: InvoiceType
}
const IndividualEmployeeInvoices = (props: IndividualViewInvoicesPropsType) => {
  const { invoices } = props
  const { t, ready } = useTranslation(['individualAuth', 'common']);

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
  const router = useRouter()

  return (
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('invoicesListText')} />
            <DataGrid
              autoHeight
              rows={invoices}
              columns={invoiceColumns}
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              hideFooterPagination={true}
              sx={{
                '& .MuiDataGrid-footerContainer': { display: 'none' }
              }}
            />
            <Button
              variant='outlined'
              color='secondary'
              sx={{ my: 4, mx: 6 }}
              LinkComponent={NextLink}
              href={`/individual/view/${router.query.id}/invoices/list`}
            >
              {t('viewAllText')}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default IndividualEmployeeInvoices
