import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#F7F7F7',
    color: '#666666',
    textTransform: 'UpperCase',
    padding: '8px',
    fontSize: '13px',
    fontFamily: "'Outfit', sans-serif",
    
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: '8px',
    fontFamily: "'Open Sans', sans-serif",
    color: '#666666',
   
  },
}));

export default StyledTableCell;
