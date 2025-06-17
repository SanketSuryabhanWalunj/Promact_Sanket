// ** React Import
import { useEffect, useMemo, useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

import { DataGrid, GridColDef } from '@mui/x-data-grid'

import { debounce } from '@mui/material'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Types Imports
import { CompanyType } from 'src/types/company'
import { useTranslation } from 'react-i18next'

interface CellType {
  row: CompanyType
}

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



const CompanyListPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [companies, setCompanies] = useState<CompanyType[]>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 280,
      field: 'companyName',
      headerName: t('company'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                noWrap
                component={Link}
                href='/company/details/'
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
      flex: 0.15,
      field: 'noOfCoursesPurchased',
      minWidth: 170,
      headerName: t('common:coursesPurchasedText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography noWrap sx={{ color: 'text.secondary' }}>
              {row.noOfCoursesPurchased}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.15,
      field: 'noOfEmployees',
      minWidth: 170,
      headerName: t('employeeText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography noWrap sx={{ color: 'text.secondary' }}>
              {row.noOfEmployees}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      field: 'country',
      minWidth: 190,
      headerName: t('common:countryText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography noWrap sx={{ color: 'text.secondary' }}>
              {row.country}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      field: 'actions',
      headerName: t('actionsText'),
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant='contained' LinkComponent={Link} href='/'>
              {t('reportText')}
            </Button>
          </Box>
        )
      }
    }
  ]
  return (
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={12}>
          <Card>
            <DataGrid
              getRowId={row => row.email}
              autoHeight
              rowHeight={62}
              rows={companies}
              columns={columns}
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              pageSizeOptions={[10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default CompanyListPage
