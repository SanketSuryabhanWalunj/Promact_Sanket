// ** React Import
import { useCallback, useContext, useEffect, useState } from 'react'

// ** Next Imports
import NextLink from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'

import { DataGrid, GridColDef, GridPagination } from '@mui/x-data-grid'

import { debounce } from '@mui/material'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Icon imports
import Icon from 'src/@core/components/icon'

import { UseFormReset } from 'react-hook-form'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Types Imports
import { GovernorDetailsType } from 'src/types/governor'

// **Axios API calls
import { getGovernorsList, postActiveInactiveGovernor } from 'src/api-services/GovernorApi'
import { useTranslation } from 'react-i18next'
import ListSearchBox from 'src/components/list-search/ListSearchBox'

interface CellType {
  row: GovernorDetailsType
}

const renderClient = (row: GovernorDetailsType) => {
  // if (row.profileImage) {
  //   return <CustomAvatar src={row.profileImage} sx={{ mr: 2.5, width: 38, height: 38 }} />
  // } else {
  return (
    <CustomAvatar
      skin='filled'
      sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
    >
      {getInitials(row?.firstName ? row.lastName : '')}
    </CustomAvatar>
  )

  // }
}

const GovernorListPage = () => {
  const [governorList, setGovernorList] = useState<GovernorDetailsType[]>([])

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [gridLoading, setGridLoading] = useState(false)

  const [changeStatusBackdrop, setChangeStatusBackdrop] = useState(false)

  const ability = useContext(AbilityContext)

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const [detailsForConfirmDialog, setDetailsForConfirmDialog] = useState<GovernorDetailsType>({} as GovernorDetailsType)
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  
  const [searchedValue, setSearchedValue] = useState('')
  const [filteredRows, setFilteredRows] = useState(governorList);
  
  const getGovernors = async () => {
    try {
      setGridLoading(true)
      const response = await getGovernorsList()

      if (response.status === 200) {
        setGovernorList(response.data)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }

  useEffect(() => {
    getGovernors()
  }, [])
  // Filter rows based on search text
  const handleSearch = (searchQuery: string) => {
    setSearchedValue(searchQuery);

    const filteredData = governorList.filter((row) =>
      Object.values(row).some((value) =>
        value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    setFilteredRows(filteredData);
  };
  useEffect(() => {
    setFilteredRows(governorList); // Update filteredRows whenever Individuals changes
  }, [governorList]);
  const activeDeactiveAccount = async (row: GovernorDetailsType) => {
    try {
      setChangeStatusBackdrop(true)
      const response = await postActiveInactiveGovernor(row.id, !row.isDeleted)

      if (response.status === 200) {
        setChangeStatusBackdrop(false)
        setOpenConfirmDialog(false)
        getGovernors()
      } else {
        setChangeStatusBackdrop(false)
        setOpenConfirmDialog(false)
      }
    } catch (error) {
      setChangeStatusBackdrop(false)
      setOpenConfirmDialog(false)
    }
  }

  const openDialogFromSwitch = (row: GovernorDetailsType) => {
    setDetailsForConfirmDialog(row)
    setOpenConfirmDialog(true)
  }

  const columns: GridColDef[] = [
    {
      flex: 0.6,
      minWidth: 400,
      field: 'firstName',
      headerName: t('common:governerText'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {row.firstName + ' ' + row.lastName}
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
      flex: 0.3,
      minWidth: 100,
      field: 'actions',
      headerName: t('common:action:action'),
      sortable: false,
      renderCell: ({ row }: CellType) => {
        return (
          <Box>
            {ability?.can('update', 'governor') ? (
              <IconButton LinkComponent={NextLink} href={`/roles-and-permission/governors/edit/${row.id}`}>
                <Icon icon='tabler:edit' />
              </IconButton>
            ) : null}
            {ability?.can('delete', 'admin') ? (
              <Switch
                checked={!row.isDeleted}
                onChange={() => openDialogFromSwitch(row)}

                // onChange={() => activeDeactiveAccount(row)}
              />
            ) : null}
          </Box>
        )
      }
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
          <Card>
            <Box
              sx={{
                pt: 6,
                pb: 4,
                px: 6,
                rowGap: 2,
                columnGap: 4,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}
            >
              <ListSearchBox onSearch={handleSearch} />
              {ability?.can('create', 'admin') ? (
                <Button variant='contained' LinkComponent={NextLink} href={`/roles-and-permission/governors/add`}>
                  + {t('common:addNewGovernerText')}
                </Button>
              ) : null}
            </Box>

            <Divider sx={{ m: '0 !important' }} />

            <DataGrid
              autoHeight
              rowHeight={62}
              rows={governorList}
              columns={columns}
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              loading={gridLoading}
              pageSizeOptions={[10, 20, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={model => {
                if (model.pageSize !== paginationModel.pageSize) {
                  const temp = { page: 0, pageSize: model.pageSize }
                  setPaginationModel(temp)
                } else {
                  setPaginationModel(model)
                }
              }}
              components={{ Pagination: CustomPagination }} 
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
            ? `Enable ${detailsForConfirmDialog?.firstName} ${detailsForConfirmDialog?.lastName} ?`
            : `Disable ${detailsForConfirmDialog?.firstName} ${detailsForConfirmDialog?.lastName} ?`}
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
          {t('common:cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default GovernorListPage
