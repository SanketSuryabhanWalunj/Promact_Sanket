import Box from '@mui/material/Box';

import { styled, SxProps } from '@mui/system';
import { useTranslation } from 'react-i18next';

const CourseList = styled('ul')({
  position: 'relative',
  borderLeft: '1px solid #ddd',
  listStyle: 'none',
  paddingLeft: 0,
  margin: 0,
  padding: '20px 0',
});

type CourseItemPropsType = SxProps & {
  courseStatus: string;
};

const CourseItem = styled('li')<CourseItemPropsType>(
  ({ courseStatus, theme }) => ({
    padding: '20px',
    border: '1px solid #EEEEEE',
    borderLeft: 'none',
    background:
      'linear-gradient(180deg, rgba(241,241,241,1) 0%, rgba(255,255,255,1) 100%)',
    borderRadius: '20px',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    position: 'relative',
    marginBottom: '20px',
    '&:before': {
      position: 'absolute',
      left: '-30px',
      top: '-1px',
      width: '30px',
      height: '102%',
      borderTopLeftRadius: '20px',
      borderBottomKLeftRadius: '20px',
      content: '',
      background: 'linear-gradient(to right, #950c8d, #2e0162)',
    },
  })
);
const { t, ready } = useTranslation(['user']);
const SubscribedCourses = () => {
  return (
    <>
      <Box
        sx={{
          marginTop: '10px',
          padding: { xs: '0 20px 10px 50px', md: '0 50px 10px 72px' },
        }}
      >
        <label
          style={{ color: '#666666', fontSize: '16px', marginLeft: '-30px' }}
        >
          {t('user:assignedCourses')}
        </label>
        <ul className="custom-timeline">
          <li className="course-box"></li>
        </ul>
      </Box>
    </>
  );
};

export default SubscribedCourses;
