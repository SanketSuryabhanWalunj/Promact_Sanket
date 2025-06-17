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

// ** App Component Imports
import AdminAddEditFormDialog from 'src/views/apps/roles-and-permission/admins/add-edit/AdminAddEditFormDialog'

// ** Types Imports
import { AdminListObjType, AdminFormType, AdminDetailsType } from 'src/types/admin'

// ** Axios Api Call Imports
import { getAdminDetails, getAdminsList, putAdminDetails } from 'src/api-services/AdminApi'
import { changeActiveStatusIndividual } from 'src/api-services/IndividualApi'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import ListSearchBox from 'src/components/list-search/ListSearchBox'

interface CellType {
  row: AdminListObjType
}

const renderClient = (row: AdminListObjType) => {
  // if (row.profileImage) {
  //   return <CustomAvatar src={row.profileImage} sx={{ mr: 2.5, width: 38, height: 38 }} />
  // } else {
  return (
    <CustomAvatar
      skin='filled'
      sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
    >
      {getInitials(row?.fullName ? row.fullName : '')}
    </CustomAvatar>
  )

  // }
}



const AdminRolePage = () => {
  const [adminList, setAdminList] = useState<AdminListObjType[]>([])
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const RowActions = ({ row }: { row: AdminListObjType }) => {
    const [openDialog, setOpenDialog] = useState(false)
    const [adminDetails, setAdminDetails] = useState<AdminDetailsType>({} as AdminDetailsType)
    const [defaultValues, setDefaultValues] = useState<AdminFormType>({
      firstName: '',
      lastName: '',
      email: '',
      contact: ''
    })
  
    const [fetchBackdrop, setFetchBackdrop] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitErrMsg, setSubmitErrMsg] = useState('')
    
    const fetchAdminDetails = useCallback(async (id: string) => {
      try {
        setFetchBackdrop(true)
        const response = await getAdminDetails(id)
  
        if (response.status === 200) {
          setAdminDetails(response.data)
          setDefaultValues({
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            contact: response.data.contactNumber
          })
          setFetchBackdrop(false)
          setOpenDialog(true)
        } else {
          setFetchBackdrop(false)
        }
      } catch (error) {
        setFetchBackdrop(false)
      }
    }, [])
  
    const onSubmit = async (data: AdminFormType) => {
      try {
        setSubmitting(true)
        const dataToSend = {
          ...adminDetails,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          contactNumber: data.contact
        }
        const response = await putAdminDetails(dataToSend)
        if (response.status === 200) {
          setSubmitting(false)
        } else {
          setSubmitting(false)
          setSubmitErrMsg(t('common:emailExistsError'))
        }
      } catch (error) {
        setSubmitting(false)
        setSubmitErrMsg(t('common:emailExistsError'))
      }
    }
  
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => fetchAdminDetails(row.id)}>
            <Icon icon='tabler:edit' />
          </IconButton>
        </Box>
  
        {!fetchBackdrop && (
          <AdminAddEditFormDialog
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            formDefaultValues={defaultValues}
            dialogTitle={t('common:editAdminDialogText')}
            onSubmitClick={onSubmit}
            loading={submitting}
            errorMsg={submitErrMsg}
          />
        )}
  
        <Backdrop open={fetchBackdrop} sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}>
          <CircularProgress color='inherit' />
        </Backdrop>
      </>
    )
  }
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [gridLoading, setGridLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)

  const [searchedValue, setSearchedValue] = useState('')

  const [changeStatusBackdrop, setChangeStatusBackdrop] = useState(false)

  const ability = useContext(AbilityContext)

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const [detailsForConfirmDialog, setDetailsForConfirmDialog] = useState<AdminListObjType>({} as AdminListObjType)
  const [filteredRows, setFilteredRows] = useState(adminList);

  const router = useRouter();
    // Filter rows based on search text
    const handleSearch = (searchQuery: string) => {
      setSearchedValue(searchQuery);
  
      const filteredData = adminList.filter((row) =>
        Object.values(row).some((value) =>
          value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
  
      setFilteredRows(filteredData);
    };
  
  /* 
  Commenting out code for now. Below is the code for add admin dailog.
  */

  /*  const [addAdminDialog, setAddAdminDialog] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitErrMsg, setSubmitErrMsg] = useState('')

  const [openSuccessDialog, setOpenSuccessDialog] = useState(false)

  const openAddAdminDialog = () => {
    setAddAdminDialog(true)
  }
 */
  const fetchAdmins = async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const response = await getAdminsList(page, pageSize)

      if (response.status === 200) {
        setAdminList(response.data.items)
        setTotalRows(response.data.totalCount)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins(paginationModel.page + 1, paginationModel.pageSize)
  }, [paginationModel.page, paginationModel.pageSize])
  
  useEffect(() => {
    setFilteredRows(adminList); // Update filteredRows whenever Individuals changes
  }, [adminList]);

  /* 
    Commenting out code for now. Below is the code for add admin dailog.
  */

  /* const onSubmitNewAdmin = async (data: AdminFormType, reset?: UseFormReset<AdminFormType>) => {
    try {
      setSubmitting(true)
      const dataToSend = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNumber: data.contact
      }

      const response = await postAddNewAdmin(dataToSend)
      if (response.status === 200) {
        setSubmitting(false)
        if (reset) {
          reset()
        }
        setOpenSuccessDialog(true)
      } else {
        setSubmitErrMsg('error')
        setSubmitting(false)
      }
    } catch (error) {
      setSubmitErrMsg('error')
      setSubmitting(false)
    }
  } */

  const activeDeactiveAccount = async (row: AdminListObjType) => {
    const copyOfCompanies: AdminListObjType[] = JSON.parse(JSON.stringify(adminList))
    try {
      setChangeStatusBackdrop(true)
      const culture = router.locale as string;
      const response = await changeActiveStatusIndividual(row.id, !row.isDeleted, culture)

      if (response.status === 200) {
        setChangeStatusBackdrop(false)
        setOpenConfirmDialog(false)
        fetchAdmins(paginationModel.page + 1, paginationModel.pageSize)
      } else {
        setChangeStatusBackdrop(false)
        setOpenConfirmDialog(false)
        setAdminList(copyOfCompanies)
      }
    } catch (error) {
      setChangeStatusBackdrop(false)
      setOpenConfirmDialog(false)
      setAdminList(copyOfCompanies)
    }
  }

  const openDialogFromSwitch = (row: AdminListObjType) => {
    setDetailsForConfirmDialog(row)
    setOpenConfirmDialog(true)
  }

  const columns: GridColDef[] = [
    {
      flex: 0.6,
      minWidth: 400,
      field: 'firstName',
      headerName: t('common:adminsText'),
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
                {row.fullName}
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
            {ability?.can('update', 'admin') ? (
              <IconButton LinkComponent={NextLink} href={`/roles-and-permission/admins/edit/${row.id}`}>
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
                <Button variant='contained' LinkComponent={NextLink} href={`/roles-and-permission/admins/add`}>
                  + {t('common:addNewAdminText')}
                </Button>
              ) : null}
            </Box>

            <Divider sx={{ m: '0 !important' }} />

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
              onPaginationModelChange={model => {
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

      {/* 
        Commenting out code for now. Below is the code for add admin dailog.
      */}

      {/* <AdminAddEditFormDialog
        openDialog={addAdminDialog}
        setOpenDialog={setAddAdminDialog}
        dialogTitle='Add Admin User Information'
        formDefaultValues={{ firstName: '', lastName: '', email: '', contact: '' }}
        onSubmitClick={onSubmitNewAdmin}
        loading={submitting}
        errorMsg={submitErrMsg}
      /> */}

      {/* <Dialog open={openSuccessDialog} maxWidth={'sm'} fullWidth onClose={() => setOpenSuccessDialog(false)}>
        <DialogContent>Admin added successfully</DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button
            variant='contained'
            sx={{ mr: 2 }}
            onClick={() => {
              setOpenSuccessDialog(false)
            }}
          >
            Add another admin
          </Button>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setOpenSuccessDialog(false)
              setAddAdminDialog(false)
              fetchAdmins(paginationModel.page + 1, paginationModel.pageSize)
            }}
          >
            Return to list
          </Button>
        </DialogActions>
      </Dialog> */}

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
          {t('common:cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AdminRolePage
