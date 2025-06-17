import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { ReactNode } from 'react';

const EmptyQuizLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Container maxWidth="xl" sx={{ p: { xs: 0 } }}>
      <Box sx={{ p: { xs: '20px', md: '24px 50px' } }}>
        <Box>
          <img
            src="/logo.png"
            className="logo"
            style={{ maxHeight: '16px' }}
            alt="logo"
          />
        </Box>
      </Box>
      {children}
    </Container>
  );
};

export default EmptyQuizLayout;
