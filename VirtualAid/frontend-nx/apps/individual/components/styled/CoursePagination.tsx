import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Pagination from '@mui/material/Pagination';

const StyledCoursePagination = styled(Pagination)(({ theme }) => ({
  '& .MuiPaginationItem-root': {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: '#E8E8E8',
    color: '#000',
    fontFamily: 'Outfit, Regular',
    [theme.breakpoints.down('md')]: {
      width: '26px',
      height: '26px',
    },
    '&.Mui-selected': {
      background: '#9F1B96',
      color: '#fff',
    },
  },
}));

export default StyledCoursePagination;
