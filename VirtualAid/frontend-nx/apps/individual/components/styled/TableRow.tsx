import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';

const StyledTableRow = styled(TableRow)(() => ({
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  export default StyledTableRow