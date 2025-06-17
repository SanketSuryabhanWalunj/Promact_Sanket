import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const FullPageSpinner = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src="/logo.png" alt="logo" />
      <CircularProgress sx={{ m: 4, color: '#580674' }} />
    </Box>
  );
};

export default FullPageSpinner;
