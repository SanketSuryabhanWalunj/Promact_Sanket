// ** React Imports
import React, { useState, useEffect, useMemo, MouseEvent, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'
import { GetStaticProps, InferGetStaticPropsType } from 'next/types'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid, GridColDef, GridPagination } from '@mui/x-data-grid'
import { CoursesType } from '../../../types/courses'
import { styled } from '@mui/material/styles'
import { debounce } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

//Api Imports
import { getAllCourses } from 'src/api-services/CoursesApi'

// ** Custom Components Imports

import { useTranslation } from 'react-i18next'
import { t } from 'i18next'
import { useRouter } from 'next/router'
import SearchComponent from 'src/components/list-search/ListSearchBox'
import ListSearchBox from 'src/components/list-search/ListSearchBox'

interface CellType {
  row: CoursesType
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
        <MenuItem component={Link} sx={{ '& svg': { mr: 2 } }} href='./view/{}' onClick={handleRowOptionsClose}>
          <Icon icon='tabler:eye' fontSize={20} />
          {t('common:viewText')}
        </MenuItem>
      </Menu>
    </>
  )
}



const CoursesList = () => {
  const [Courses, setCourses] = useState<CoursesType[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [searchedValue, setSearchedValue] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debouncedSearchedValue, setDebouncedSearchedValue] = useState('')

  const [changeStatusBackdrop, setChangeStatusBackdrop] = useState(false)
  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState(Courses);

  // const [filteredRows, setFilteredRows] = useState(Courses);
  const { t, ready } = useTranslation(['course', 'common']);
  const router = useRouter();

  // Filter rows based on search text
    
 
  // Filter rows based on search text
  const handleSearch = (searchQuery: string) => {
    setSearchedValue(searchQuery);

    const filteredData = Courses.filter((row) =>
      Object.values(row).some((value) =>
        value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    setFilteredRows(filteredData);
  };


  useEffect(() => {
    setFilteredRows(Courses); // Update filteredRows whenever Individuals changes
  }, [Courses]);



  const [gridLoading, setGridLoading] = useState(false)

  //method to get all courses list 
  //@param: page and pageSize - for getting page wise details
  const getAllCoursesList = useCallback(async (page: number, pageSize: number) => {
    try {
      setGridLoading(true)
      const culture = router.locale as string;
      const response = await getAllCourses(page, pageSize, culture)
      if (response.status === 200) {
        setCourses(response.data.items)
        setTotalRows(response.data.totalCount)
        setGridLoading(false)
      } else {
        setGridLoading(false)
      }
    } catch (error) {
      setGridLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllCoursesList(paginationModel.page + 1, paginationModel.pageSize)
  }, [getAllCoursesList, paginationModel.page, paginationModel.pageSize])
  const columns: GridColDef[] = [
    {
      flex: 0.35,
      minWidth: 250,
      field: 'courses',
      headerName: t('common:coursesText'),
      sortable: false,
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            sx={{
              fontWeight: 500,
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': {
                color: 'primary.main'
              }
            }}
            component={Link}
            href={`/course/view/${row.id}`}
          >
            {row.name}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.2,
      minWidth: 126,
      field: 'price',
      headerName: t('common:priceText'),
      sortable: false,
      renderCell: ({ row }: CellType) => <Typography sx={{ color: 'text.secondary' }}>{row.price} &euro;</Typography>
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
            </Box>
          </Box>
          <DataGrid
            getRowId={row => row.id}
            autoHeight
            rowHeight={62}
            rows={filteredRows}
            columns={columns}
            loading={gridLoading}
            disableRowSelectionOnClick
            disableColumnFilter
            disableColumnMenu
            disableColumnSelector
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
            components={{ Pagination: CustomPagination }}
          />
        </Card>
      </Grid>
    </>
  )
}

export default CoursesList
