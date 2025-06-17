import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { ProfileLayout } from '../../../layouts/components/ProfileLayout';
import EmpCourses from '../../../views/courses/EmpCourses';
import { UserSubscribedCourseType } from '../../../types/courses';
import { InfoContext } from '../../../contexts/InfoContext';

import axios from 'axios';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const EmplyoeeProfile = () => {
  const [userCourses, setUserCourses] = useState<UserSubscribedCourseType[]>(
    []
  );
  const [isUserCoursesLoading, setIsUserCoursesLoading] = useState(false);
  const [isUserCoursesErr, setIsUserCoursesErr] = useState(false);
  const [completedCourses, setCompletedCourses] = useState<
    UserSubscribedCourseType[]
  >([]);
  const [otherCourses, setOtherCourses] = useState<UserSubscribedCourseType[]>(
    []
  );
  const [exCourses, setExCourses] = useState<UserSubscribedCourseType[]>([]);
  const [exCertificateCourse, setExCertificateCourse] = useState<UserSubscribedCourseType[]>([]);

  const { empInfo } = useContext(InfoContext);

  const { t, ready } = useTranslation(['user', 'common']);
  const router = useRouter();
 // Method to get user courses 
  const getUserCourses = useCallback(async () => {
    try {
      setIsUserCoursesLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/courses-for-individual/${empInfo.id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setUserCourses(response.data);
        setIsUserCoursesLoading(false);
        setIsUserCoursesErr(false);
      }
    } catch (error) {
      setIsUserCoursesLoading(false);
      setIsUserCoursesErr(true);
    }
  }, [empInfo.id]);

 // Method to filter courses according to status
  const filterCoursesAccordingToStatus = useCallback(() => {
    const complete = [];
    const other = [];
    const ex = [];
    const certiex = [];
    const courseEx = [];
    for (const course of userCourses) {
      
      
      if(course.certificateExpirationDate !== null && new Date(course.certificateExpirationDate) < new Date()) {
      
        certiex.push(course);
      }else {
        if (course.isCompleted) {
          complete.push(course);
        } else {
          if (new Date(course.expirationDate) < new Date()) {
            ex.push(course);
          } else  {
            other.push(course);
          }
        }
      }
    }

    setCompletedCourses(complete);
    setOtherCourses(other);
    setExCourses(ex);
    setExCertificateCourse(certiex);
  }, [userCourses]);

  useEffect(() => {
    getUserCourses();
  }, [getUserCourses]);

  useEffect(() => {
    filterCoursesAccordingToStatus();
  }, [filterCoursesAccordingToStatus, userCourses]);

  return (
    <>
      <Box
        sx={{
          marginTop: '10px',
          padding: { xs: '0 20px 10px 50px', md: '0 50px 10px 72px' },
        }}
      >
        {isUserCoursesLoading || !ready ? (
          <>
            <Box display="flex" alignItems="center" justifyContent="center">
              <CircularProgress />
            </Box>
          </>
        ) : (
          <>
            {isUserCoursesErr ? (
              <>
                <Box display="flex" alignItems="center" justifyContent="center">
                  {t('common:error.unspecific')}
                </Box>
              </>
            ) : (
              <>
                {userCourses.length < 0 && <>No courses found.</>}
                {otherCourses.length > 0 && (
                  <>
                    <label
                      style={{
                        color: '#666666',
                        fontSize: '16px',
                        marginLeft: '-30px',
                      }}
                    >
                      {t('assignedCourses')}
                    </label>
                    <EmpCourses courses={[...otherCourses, ...exCourses]} />
                  </>
                )}
                
                {completedCourses.length > 0 && (
                  <>
                    <label
                      style={{
                        color: '#666666',
                        fontSize: '16px',
                        marginLeft: '-30px',
                      }}
                    >
                      {t('completedCourses')}
                    </label>
                    <EmpCourses courses={completedCourses} />
                  </>
                )}
                {exCourses.length > 0 && (
                  <>
                    <label
                      style={{
                        color: '#666666',
                        fontSize: '16px',
                        marginLeft: '-30px',
                      }}
                    >
                      {t('completedCourses')}
                    </label>
                    <EmpCourses courses={completedCourses} />
                  </>
                )}
                {(exCertificateCourse.length > 0) &&  (<><label
                      style={{
                        color: '#666666',
                        fontSize: '16px',
                        marginLeft: '-30px',
                      }}
                    >
                     {t('certificationOfExpiration')}
                    </label>
                    <EmpCourses courses={exCertificateCourse} /></>)}
              
              </>
              
            )}
          </>
        )}
      </Box>
    </>
  );
};

EmplyoeeProfile.individualGuard = true;

EmplyoeeProfile.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default EmplyoeeProfile;
