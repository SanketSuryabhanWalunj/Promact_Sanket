// ** React Imports
import React, { useState, useEffect, useMemo, MouseEvent, useCallback } from 'react'
// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Next Imports
import Link from 'next/link'
import { GetStaticProps, InferGetStaticPropsType } from 'next/types'

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
import { DataGrid, GridColDef, GridCallbackDetails } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import { IndividualType } from 'src/types/individual'
import { styled } from '@mui/material/styles'
import LinearProgress from '@mui/material/LinearProgress'
import { debounce } from '@mui/material'
// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { getIndividualPaginationList } from 'src/api-services/IndividualApi'

import CustomTextField from 'src/@core/components/mui/text-field'

interface CellType {
  row: IndividualType
}
const Img = styled('img')(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  marginRight: theme.spacing(2.5)
}))

// ** renders client column
const RowOptions = ({ id = 1 }: { id: number | string }) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

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
        <MenuItem component={Link} sx={{ '& svg': { mr: 2 } }} href='./view' onClick={handleRowOptionsClose}>
          <Icon icon='tabler:eye' fontSize={20} />
          View
        </MenuItem>
        <MenuItem onClick={handleRowOptionsClose} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:edit' fontSize={20} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:trash' fontSize={20} />
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}
const columns: GridColDef[] = [
  {
    flex: 0.35,
    minWidth: 250,
    field: 'firstName',
    headerName: 'Employees',
    renderCell: ({ row }: CellType) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
    headerName: 'Courses enrolled',
    renderCell: ({ row }: CellType) => (
      <Typography sx={{ color: 'text.secondary' }}>{row.noOfCoursesEnrolled}</Typography>
    )
  },
  {
    flex: 0.2,
    minWidth: 180,
    headerName: 'Progress',
    field: 'progressValue',
    renderCell: ({ row }: CellType) => (
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{`${row.progress}%`}</Typography>
        <LinearProgress sx={{ height: 8 }} variant='determinate' value={row.progress} color='secondary' />
      </Box>
    )
  }
]

const IndividualViewList = () => {
  const router = useRouter()
  const { userId } = router.query
  const [totalRows, setTotalRows] = useState(0)
  const [isEmployeesLoading, setIsEmployeeLoading] = useState(false)
  const [employees, setEmployees] = useState<IndividualType[]>([])

  const [isEmployeesError, setIsEmployeesError] = useState(false)

  const [Individuals, setIndividuals] = useState<IndividualType[]>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [searchedValue, setSearchedValue] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debouncedSearchedValue, setDebouncedSearchedValue] = useState('')

  const debouncedSetTypedText = useMemo(
    () =>
      debounce(keyword => {
        setDebouncedSearchedValue(keyword)
      }, 400),
    []
  )

  useEffect(() => {
    debouncedSetTypedText(searchedValue)
  }, [debouncedSetTypedText, searchedValue])
  const [employeesErrorMsg, setEmployeesErrorMsg] = useState('')
  const [gridLoading, setGridLoading] = useState(false)
  const getAllEmployees = useCallback(async (page: number, pageSize: number) => {
    try {
      setIsEmployeeLoading(true)
      const response = await getIndividualPaginationList(page, pageSize)

      if (response.status === 200) {
        setIndividuals(response.data.items)

        setIsEmployeeLoading(false)
        setTotalRows(response.data.totalCount)
        setGridLoading(false)
        setIsEmployeesError(false)
        setEmployeesErrorMsg('')
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setIsEmployeeLoading(true)
      setIsEmployeesError(true)
      setGridLoading(false)
      setEmployeesErrorMsg('Something went wrong')
    }
  }, [])
  useEffect(() => {
    getAllEmployees(paginationModel.page + 1, paginationModel.pageSize)
  }, [getAllEmployees, paginationModel.page, paginationModel.pageSize])

  return (
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Employees List' />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Typography sx={{ mr: 2, color: 'text.secondary' }}>Search:</Typography>
                <CustomTextField
                  placeholder='Search Project'
                  value={searchedValue}
                  onChange={e => setSearchedValue(e.target.value)}
                />
              </Box>
            </CardContent>
            <DataGrid
              getRowId={row => row.email}
              autoHeight
              rowHeight={62}
              rows={Individuals}
              columns={columns}
              disableRowSelectionOnClick
              loading={gridLoading}
              pageSizeOptions={[1, 2, 5]}
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
            />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default IndividualViewList
