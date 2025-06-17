import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';

import Paper from '@mui/material/Paper';

import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import { useState } from 'react';

import SearchBox from '../../../components/search/SearchBox';

import StyledTableRow from '../../../components/styled/TableRow';
import StyledTableCell from "../../../components/styled/TableCell";


function createData(name: string, fat: number, carbs: number, protein: number) {
  return { name, fat, carbs, protein };
}

const rows = [
  createData('Advanced Sales Techniques', 6.0, 24, 4.0),
  createData('Project Management Fundamentals', 9.0, 37, 4.3),
  createData('Digital Marketing Strategies', 16.0, 24, 6.0),
  createData('Advanced Sales Techniques 2.0', 3.7, 67, 4.3),
  createData('Project Management Fundamentals 2.0', 16.0, 49, 3.9),
];

const SubscribedCourses = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <SearchBox/>

      <TableContainer
        component={Paper}
        sx={{ marginTop: '10px', borderRadius: '15px' }}
      >
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Course</StyledTableCell>
              <StyledTableCell align="left">Team</StyledTableCell>
              <StyledTableCell align="left">Status</StyledTableCell>
              <StyledTableCell align="left">Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <StyledTableRow key={row.name}>
                <StyledTableCell component="th" scope="row">
                  {row.name}
                </StyledTableCell>
                <StyledTableCell align="left">
                  <AvatarGroup sx={{ display: 'inline-flex' }}>
                    <Avatar
                      alt="Remy Sharp"
                      src="/person.svg"
                      sx={{
                        borderColor: '#EAEAEA !important',
                        width: '30px',
                        height: '30px',
                      }}
                    />
                    <Avatar
                      alt="Travis Howard"
                      sx={{
                        borderColor: '#EAEAEA !important',
                        //   bgcolor: deepOrange[500],
                        width: '30px',
                        height: '30px',
                      }}
                    />
                    <Avatar
                      alt="Agnes Walker"
                      sx={{
                        borderColor: '#EAEAEA !important',
                        width: '30px',
                        height: '30px',
                      }}
                    />
                    <Avatar
                      alt="Trevor Henderson"
                      sx={{
                        borderColor: '#EAEAEA !important',
                        width: '30px',
                        height: '30px',
                      }}
                    />
                  </AvatarGroup>
                </StyledTableCell>
                <StyledTableCell align="left">{row.fat}</StyledTableCell>
                <StyledTableCell align="left">{row.carbs}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

export default SubscribedCourses;
