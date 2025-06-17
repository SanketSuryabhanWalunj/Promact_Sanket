import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import ExploreCompanyCourseItem from './ExploreCourseCompanyItem';
import {
  ExploreCourseItemType,
  UserSubscribedCourseType,
} from '../../types/courses';

import { useTranslation } from 'next-i18next';

const ExploreCompanyCourseList = (props: {
  courses: ExploreCourseItemType[];
  userCourses: UserSubscribedCourseType[];
}) => {
  const { courses, userCourses } = props;
  const { t, ready } = useTranslation(['course', 'common']);
  const examType = [
    'Online','VR','Live'
  ];

  return (
    <Box>
      {courses.map((course, index) => (
        <div key={index}>
          {examType.map((et, etIndex) => (
            <ExploreCompanyCourseItem
              examType={et}
              course={course}
              key={etIndex}
            />
          ))}
        </div>
      ))}
    </Box>
  );
};

export default ExploreCompanyCourseList;
