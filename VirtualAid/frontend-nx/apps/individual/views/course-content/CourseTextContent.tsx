import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const ContentBox = styled(Box)(({ theme }) => ({
  background:
    'linear-gradient(180deg, rgba(246,246,246,1) 0%, rgba(255,255,255,1) 100%)',
  borderRadius: '20px',
  marginBottom: '52px',
  padding: '10px',

  [theme.breakpoints.up('md')]: {
    padding: '30px 40px',
  },
}));

const CourseTextContent = () => {
  return (
    <>
      <ContentBox></ContentBox>
    </>
  );
};

export default CourseTextContent;
