// ** React Imports
import React, { useState, useEffect, useMemo, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Switch from '@mui/material/Switch'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { DataGrid, GridColDef, GridCallbackDetails, GridPagination } from '@mui/x-data-grid'
import { debounce } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** Types Imports
import { IndividualCountType, IndividualType } from 'src/types/individual'
import {
  changeActiveStatusIndividual,
  getActiveIndividualCount,
  getIndividualPaginationList
} from 'src/api-services/IndividualApi'
import { useTranslation } from 'react-i18next'
import SearchComponent from 'src/components/list-search/ListSearchBox'
import ListSearchBox from 'src/components/list-search/ListSearchBox'

interface CellType {
  row: IndividualType
}

// ** renders client column
const renderClient = (row: IndividualType) => {
  if (row.profileImage) {
    return <CustomAvatar src={row.profileImage} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar
        skin='filled'
        sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
      >
        {getInitials(row.fullName ? row.fullName : '')}
      </CustomAvatar>
    )
  }
}

const RowOptions = ({ id = 1 }: { id: number | string }) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const handleRowOptionsClose = () => {
    setAnchorEl(null)
  }

  const handleDelete = () => {
    handleRowOptionsClose()
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title='Edit Individual'>
          <IconButton size='small' sx={{ color: 'text.secondary' }}>
            <Icon icon='tabler:edit' fontSize={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title='Delete'>
          <IconButton size='small' sx={{ color: 'text.secondary' }}>
            <Icon icon='tabler:trash' fontSize={20} />
          </IconButton>
        </Tooltip>
      </Box>
    </>
  )
}

const IndividualList = () => {
  const [totalRows, setTotalRows] = useState(0)

  const [Individuals, setIndividuals] = useState<IndividualType[]>([])
  const [IndividualsCount, setIndividualsCount] = useState<IndividualCountType>({} as IndividualCountType)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [searchedValue, setSearchedValue] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debouncedSearchedValue, setDebouncedSearchedValue] = useState('')

  const [changeStatusBackdrop, setChangeStatusBackdrop] = useState(false)

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const [detailsForConfirmDialog, setDetailsForConfirmDialog] = useState<IndividualType>({} as IndividualType)

  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState(Individuals);
  const [searchResults, setSearchResults] = useState<IndividualType[]>([]);
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter();
  
 

  const [gridLoading, setGridLoading] = useState(false)

  //method to get all employees list
  //@param: page and pageSize - for getting page wise details
  const getAllEmployees = useCallback(async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const response = await getIndividualPaginationList(page, pageSize)
      if (response.status === 200) {
        setIndividuals(response.data.items)
        setTotalRows(response.data.totalCount)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }, [])

  //method to get all active users 
  const getAllActiveUsers = useCallback(async () => {
    try {
      const response = await getActiveIndividualCount()
      if (response.status === 200) {
        setIndividualsCount(response.data)
      }
    } catch (error) {
      //
    }
  }, [])
  
  
  // Filter rows based on search text
  const handleSearch = (searchQuery: string) => {
    setSearchedValue(searchQuery);

    const filteredData = Individuals.filter((row) =>
      Object.values(row).some((value) =>
        value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    setFilteredRows(filteredData);
  };



  useEffect(() => {
    getAllEmployees(paginationModel.page + 1, paginationModel.pageSize)
    getAllActiveUsers()
  }, [getAllActiveUsers, getAllEmployees, paginationModel.page, paginationModel.pageSize])
  
  useEffect(() => {
    setFilteredRows(Individuals); // Update filteredRows whenever Individuals changes
  }, [Individuals]);

  //method to get all employees list
  //@param: page and pageSize - for getting page wise details
  const activeDeactiveAccount = async (row: IndividualType) => {
    const copyOfIndividuals: IndividualType[] = JSON.parse(JSON.stringify(Individuals))
    try {
      setChangeStatusBackdrop(true)
      const culture = router.locale as string;
      const response = await changeActiveStatusIndividual(row.id, !row.isDeleted, culture)
      if (response.status === 200) {
        setChangeStatusBackdrop(false)
        setOpenConfirmDialog(false)
        getAllEmployees(paginationModel.page + 1, paginationModel.pageSize)
      } else {
        setChangeStatusBackdrop(false)
        setOpenConfirmDialog(false)
        setIndividuals(copyOfIndividuals)
      }
    } catch (error) {
      setChangeStatusBackdrop(false)
      setOpenConfirmDialog(false)
      setIndividuals(copyOfIndividuals)
    }
  }
  //method to open dialog using switch
  //@param: page and pageSize - for getting page wise details
  const openDialogFromSwitch = (row: IndividualType) => {
    setDetailsForConfirmDialog(row)
    setOpenConfirmDialog(true)
  }

  const columns: GridColDef[] = [
    {
      flex: 0.3,
      minWidth: 250,
      field: 'fullName',
      headerName: t('employeeText'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderClient(row)}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              noWrap
              component={Link}
              href={`/individual/view/${row.id}`}
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {row.fullName}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.2,
      minWidth: 126,
      field: 'company',
      headerName: t('common:userText'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>{row.company}</Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 109,
      field: 'coursesEnrolled',
      headerName: t('coursesEnrolled'),
      headerClassName: 'breaked-cell',
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Typography sx={{ color: 'text.secondary' }}>{row.noOfCoursesEnrolled}</Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 126,
      field: 'consentToShareData',
      headerName: t('consentText'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Typography sx={{ color: 'text.secondary' }}>{row.consentToShareData ? 'Yes' : 'No'}</Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 126,
      field: 'country',
      headerName: t('common:countryText'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>{row.country}</Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 125,
      sortable: false,
      field: 'actions',
      headerName: t('actionsText'),
      renderCell: ({ row }: CellType) => (
        <>
          <Box>
            <Tooltip title={t('edit')}>
            <IconButton LinkComponent={Link} href={`/individual/edit/${row.id}`}>
              <Icon icon={'tabler:edit'} />
            </IconButton>
            </Tooltip>
            <Tooltip title={t('delete')}>
            <Switch
              checked={!row.isDeleted}
              onChange={() => {
                openDialogFromSwitch(row)
              }}
            />
            </Tooltip>
          </Box>
        </>
      )
    }
  ]
  const CustomPagination = (props: { pagination: any; api: any }) => {
    const { pagination, api } = props;
    const { t } = useTranslation();

    return (
      <GridPagination
        {...pagination}
        labelRowsPerPage={t('company:datagrid:rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('company:datagrid:of')} ${count}`}
        pageText={(page: any) => `${t('datagrid:page')} ${page}`}
        {...props}
      />
    );
  };
  return (
    <>
      <Grid container spacing={6.5} sx={{ mb: 10 }}>
        <Grid item xs={12}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <CardStatsHorizontalWithDetails
                icon='tabler:user-check'
                stats={IndividualsCount?.loggedInCount?.toString()}
                subtitle={t('common:lastWeekText')}
                title={t('common:activeIndividualsText')}
                trendDiff={IndividualsCount?.analyticsPercentage}
                avatarColor='success'
                trend={
                  IndividualsCount?.analyticsPercentage
                    ? parseFloat(IndividualsCount?.analyticsPercentage) >= 0
                      ? 'positive'
                      : 'negative'
                    : 'positive'
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* This card will be used in future implementation  */}
              {/* <CardStatsHorizontalWithDetails
                icon='tabler:user-exclamation'
                stats='23'
                subtitle='Last week analytics'
                title='Request Pending'
                trendDiff='+42'
                avatarColor='warning'
              /> */}
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <Box
              sx={{
                py: 4,
                px: 6,
                rowGap: 2,
                columnGap: 4,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <ListSearchBox onSearch={handleSearch} />
                <Button variant='contained' LinkComponent={Link} href='/individual/add'>
                  + {t('addIndividualText')}
                </Button>
              </Box>
            </Box>
            <DataGrid
              autoHeight
              rowHeight={62}
              rows={filteredRows}
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
              onPaginationModelChange={(model, details: GridCallbackDetails) => {
                if (model.pageSize !== paginationModel.pageSize) {
                  const temp = { page: 0, pageSize: model.pageSize }
                  setPaginationModel(temp)
                } else {
                  setPaginationModel(model)
                }
              }}
              components={{ Pagination: CustomPagination }} // Override pagination component
            />
          </Card>
        </Grid>
      </Grid>

      <Backdrop open={changeStatusBackdrop} sx={{ color: '#fff', zIndex: theme => theme.zIndex.tooltip + 1 }}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Dialog
        open={openConfirmDialog}
        maxWidth={'sm'}
        fullWidth
        onClose={() => setOpenConfirmDialog(!openConfirmDialog)}
        sx={{ p: 4 }}
      >
        <DialogContent>
          {detailsForConfirmDialog?.isDeleted
            ? `Enable ${detailsForConfirmDialog?.fullName} ?`
            : `Disable ${detailsForConfirmDialog?.fullName} ?`}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center'
          }}
        >
          <Button
            variant='contained'
            onClick={() => {
              activeDeactiveAccount(detailsForConfirmDialog)
            }}
          >
            {detailsForConfirmDialog?.isDeleted ? `Enable` : `Disable`}
          </Button>
          <Button variant='tonal' color={'secondary'} onClick={() => setOpenConfirmDialog(!openConfirmDialog)}>
            {t('cancelText')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default IndividualList
