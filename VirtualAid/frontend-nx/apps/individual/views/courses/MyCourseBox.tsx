import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import ArrowButtonLink from '../../components/styled/ArrowButtonLink';

import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { InfoContext } from '../../contexts/InfoContext';

import { useTranslation } from 'next-i18next';

const OuterBox = styled(Box)(() => ({
  width: '100%',
  marginBottom: '20px',
  position: 'relative',
  background:
    'linear-gradient(180deg, rgba(241,241,241,1) 0%, rgba(255,255,255,1) 100%)',
  borderRadius: '20px',
  height: '120px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 30px 0 50px',
  border: '1px solid #EEEEEE',
  '&:before': {
    position: 'absolute',
    content: `''`,
    left: '0',
    width: '30px',
    height: '100%',
    background:
      'linear-gradient(180deg, rgba(159,27,150,1) 0%, rgba(39,1,95,1) 100%)',
    borderTopLeftRadius: '20px',
    borderBottomLeftRadius: '20px',
  },
}));

const MyCoursesPrimaryText = styled(Typography)(() => ({
  fontSize: '18px',
  color: '#000',
  fontFamily: "'Outfit', sans-serif",
}));

const MyCoursesSecondaryText = styled(Typography)(() => ({
  fontSize: '12px',
  color: '#666666',
  fontFamily: "'Open Sans', sans-serif",
}));

const MyCourseArrowButton = styled(Button)(() => ({
  color: '#fff',
  backgroundColor:
    'transparent linear-gradient(88deg, #9F1B96 0%, #27015F 100%) 0% 0% no-repeat padding-box;',
  width: '40px',
  height: '40px',
  minWidth: '40px',
  lineHeight: '53px',
  textAlign: 'center',
  padding: '0',
  transition: '0.2s ease-out',
  '&:hover': {
    backgroundColor:
      'transparent linear-gradient(88deg, #9F1B96 0%, #27015F 80%) 0% 0% no-repeat padding-box',
  },
}));

const MyCourseBox = () => {
  const router = useRouter();

  const { isCompany } = useContext(InfoContext);

  const { t, ready } = useTranslation(['course', 'common']);

  const onButtonClick = () => {
    if (isCompany) {
      router.push('/company/purchased-courses');
    } else {
      router.push('/user/my-courses');
    }
  };

  return (
    <OuterBox>
      <Box>
        <MyCoursesPrimaryText>
          {isCompany && ready ? t('purchasedCourses') : t('myCourses')}
        </MyCoursesPrimaryText>
        <MyCoursesSecondaryText>
          {/* This basic course covers the knowledge and skills you need as a first
          responder. */}
        </MyCoursesSecondaryText>
      </Box>
      <Box>
        <ArrowButtonLink onClick={onButtonClick} />
      </Box>
    </OuterBox>
  );
};

export default MyCourseBox;
