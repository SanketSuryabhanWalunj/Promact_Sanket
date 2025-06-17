import { useCallback, useEffect, useState } from 'react'

import Container from '@mui/material/Container'
import { DataGrid, GridCallbackDetails } from '@mui/x-data-grid'
import axios from 'axios'

const columns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 70
  },
  {
    field: 'userId',
    headerName: 'User ID',
    width: 70
  },
  {
    field: 'title',
    headerName: 'Title',
    width: 200
  },
  {
    field: 'body',
    headerName: 'Body',
    flex: 1
  }
]

const PaginateTry = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalRows, setTotalRows] = useState(100)

  const fetchData = useCallback(async (page: number, pageSize: number) => {
    setLoading(true)
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${pageSize}`)
    setTotalRows(100)

    //   setPageState(old => ({ ...old, isLoading: false, data: json.data, total: 100 }))
    if (response.status) {
      setRows(response.data)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(paginationModel.page + 1, paginationModel.pageSize)
  }, [fetchData, paginationModel.page, paginationModel.pageSize])

  return (
    <>
      <Container style={{ marginTop: 100, marginBottom: 100 }}>
        <DataGrid
          autoHeight
          rows={rows}
          rowCount={totalRows}
          loading={loading}
          pageSizeOptions={[10, 20, 30]}
          columns={columns}
          pagination
          paginationMode='server'
          onPaginationModelChange={(model, details: GridCallbackDetails) => {
           
            if (model.pageSize !== paginationModel.pageSize) {
             
              const temp = { page: 0, pageSize: model.pageSize }
             
              setPaginationModel(temp)
             
            } else {
              setPaginationModel(model)
            }
          }}
          paginationModel={paginationModel}
        />
      </Container>
    </>
  )
}

export default PaginateTry
