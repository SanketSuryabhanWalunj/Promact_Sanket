import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';

import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import axios from 'axios';

import { ProfileLayout } from '../../../layouts/components/ProfileLayout';

import SummaryBoxes from '../../../views/company/report/SummaryBoxes';
import MyCourseBox from '../../../views/courses/MyCourseBox';
import CourseEnrollmentChart from '../../../views/company/report/CourseEnrollmentChart';
import ExploreCourseBox from '../../../views/courses/ExploreCourseBox';

import { InfoContext } from '../../../contexts/InfoContext';
import { useRouter } from 'next/router';

const CompanyProfile = () => {
  const [courseLoading, setCourseLoading] = useState(false);
  const [hasBoughtCourse, setHasBoughtCourse] = useState(false);
  const router = useRouter();
  
  const { companyInfo } = useContext(InfoContext);
 
  //Method to get courses 
  const getCourses = useCallback(async () => {
    try {
      setCourseLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/subscribed-courses-by-company-id/${companyInfo.id}?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        if (response.data.length > 0) {
          setHasBoughtCourse(true);
        }
        setCourseLoading(false);
      }
    } catch (error) {
      setCourseLoading(false);
    }
  }, [companyInfo.id]);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          marginTop: '15px',
          padding: { xs: '0 20px', lg: '0 50px !important' },
        }}
      >
        <SummaryBoxes />
        {courseLoading ? (
          <>
            <Skeleton variant="rectangular" width="100%" height="120px" />
          </>
        ) : (
          <>
            {hasBoughtCourse ? (
              <>
                <MyCourseBox />
              </>
            ) : (
              <>
                <ExploreCourseBox />
              </>
            )}
          </>
        )}
        <CourseEnrollmentChart />
      </Container>
    </>
  );
};

CompanyProfile.companyGuard = true;

CompanyProfile.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default CompanyProfile;
