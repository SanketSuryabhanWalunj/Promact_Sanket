// ** React Imports
import { MouseEvent, useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** Mui Imports
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import { GridColDef } from '@mui/x-data-grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Types Imports
import { IndividualType } from 'src/types/individual'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

interface CellType {
  row: IndividualType
}

export const renderClient = (row: IndividualType) => {
  if (row.profileImage) {
    return <CustomAvatar src={row.profileImage} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    return (
      <CustomAvatar
        skin='filled'
        sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
      >
        {getInitials(row.fullName)}
      </CustomAvatar>
    )
  }
}
const { t, ready } = useTranslation(['individualAuth', 'common']);
export const RowOptions = ({ id = 1 }: { id: number | string }) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const router = useRouter()

  const rowOptionsOpen = Boolean(anchorEl)

  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleRowOptionsClose = () => {
    setAnchorEl(null)
  }

  const handleDelete = () => {
    handleRowOptionsClose()
  }

  return (
    <>
      <IconButton size='small' onClick={handleRowOptionsClick}>
        <Icon icon='tabler:dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        <MenuItem
          component={Link}
          sx={{ '& svg': { mr: 2 } }}
          href={
            router.pathname === '/company/view/[id]/employees/list'
              ? `/company/view/${router.query.id}/employees/${id}`
              : ``
          }
          onClick={handleRowOptionsClose}
        >
          <Icon icon='tabler:eye' fontSize={20} />
          {t('common:viewText')}
        </MenuItem>
        <MenuItem onClick={handleRowOptionsClose} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:edit' fontSize={20} />
          {t('edit')}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:trash' fontSize={20} />
          {t('delete')}
        </MenuItem>
      </Menu>
    </>
  )
}

export const columns: GridColDef[] = [
  {
    flex: 0.35,
    minWidth: 250,
    field: 'fullName',
    headerName:t('employeeText'),
    sortable: false,
    renderCell: ({ row }: CellType) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {renderClient(row)}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.fullName}</Typography>
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
    field: 'coursesEnrolled',
    headerName: t('coursesEnrolled'),
    sortable: false,
    renderCell: ({ row }: CellType) => (
      <Typography sx={{ color: 'text.secondary' }}>{row.noOfCoursesEnrolled}</Typography>
    )
  },
  {
    flex: 0.2,
    minWidth: 180,
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
    flex: 0.2,
    minWidth: 126,
    field: 'country',
    headerName: t('common:countryText'),
    sortable: false,
    renderCell: ({ row }: CellType) => <Typography sx={{ color: 'text.secondary' }}>{row.country}</Typography>
  },
  {
    flex: 0.1,
    minWidth: 100,
    sortable: false,
    field: 'actions',
    headerName: t('actionsText'),
    renderCell: ({ row }: CellType) => <RowOptions id={row.id} />
  }
]
