import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';
import NextLink from 'next/link';

import { useTranslation } from 'next-i18next';

const HomeText = styled(Typography)(() => ({
  display: 'inline-block',
  verticalAlign: 'middle',
  textDecoration: 'none',
  color: '#000000',
  fontSize: '14px',
  fontFamily: 'outfit, Medium',
}));

const CourseTitle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontFamily: 'outfit, Medium',
  marginBottom: '10px',
  display: 'inline-block',
  maxWidth: '83%',
  [theme.breakpoints.up('md')]: {
    fontSize: '28px',
  },

  [theme.breakpoints.up('lg')]: {
    fontSize: '36px',
  },
}));
const CourseExamType = styled(Typography)(({theme}) => ({
  fontSize: '20px',
  fontFamily: 'outfit, Medium',
  marginBottom: '10px',
  display: 'inline-block',
  [theme.breakpoints.up('md')]: {
    fontSize: '28px',
  },

  [theme.breakpoints.up('lg')]: {
    fontSize: '36px',
  },
}));

const CourseDescription = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontFamily: "'Open Sans', sans-serif",
}));

interface CourseIndexNameProps {
  title: string;
  examType: string;
  description: string;
}

const CourseIndexName = (props: CourseIndexNameProps) => {
  const { title,examType, description } = props;
  const { t, ready } = useTranslation(['course', 'common']);

  return (
    <>
      <MuiLink
        component={NextLink}
        href="/user/dashboard"
        sx={{ textDecoration: 'none' }}
      >
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          sx={{ mb: '34px' }}
        >
          <KeyboardBackspaceOutlinedIcon sx={{ color: '#000' }} />
          <HomeText>{ready && t('common:action.home')}</HomeText>
        </Box>
      </MuiLink>
      <CourseTitle>
        {/* Basic company emergency response worker */}
        {title}
      </CourseTitle>
      <CourseExamType>{examType}</CourseExamType>
      <CourseDescription>
        {description}
        {/* This basic course covers the knowledge and skills you need as a first
        responder. */}
      </CourseDescription>
    </>
  );
};

export default CourseIndexName;
