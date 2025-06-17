import { ReactNode, useState, useEffect, useContext, useCallback } from 'react';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import ExploreCourseList from '../../../views/courses/ExploreCourseList';
import { ProfileLayout } from '../../../layouts/components/ProfileLayout';
import { InfoContext } from '../../../contexts/InfoContext';
import { UserSubscribedCourseType } from '../../../types/courses';
import EmpCourses from '../../../views/courses/EmpCourses';

import axios from 'axios';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { textAlign } from '@mui/system';
import { Typography } from '@mui/material';

const EmployeeDashboard = () => {
  const { empInfo } = useContext(InfoContext);

  const [courses, setCourses] = useState([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [isCoursesError, setIsCoursesError] = useState(false);
  const [coursesErrorMsg, setCoursesErrorMsg] = useState('');

  const [userCourses, setUserCourses] = useState<UserSubscribedCourseType[]>(
    []
  );
  const [userCompletedCourses, setUserCompletedCourses] = useState(false);
  const [userAllCourses, setUserAllCourses] = useState<
    UserSubscribedCourseType[]
  >([]);
  const [isUserCoursesLoading, setIsUserCoursesLoading] = useState(false);
  const [isUserCoursesErr, setIsUserCoursesErr] = useState(false);

  const { t, ready } = useTranslation(['user','course', 'common']);
  const router = useRouter();
 // Method to get all courses
  const getAllCourses = useCallback(async () => {
    try {
      setIsCoursesLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/most-popular-courses/${empInfo.id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setCourses(response.data);
        setIsCoursesLoading(false);
        setIsCoursesError(false);
        setCoursesErrorMsg('');
      } else {
        setIsCoursesLoading(false);
        setIsCoursesError(true);
        setCoursesErrorMsg(ready ? t('common:error.unspecific') : '');
      }
    } catch (error) {
      setIsCoursesLoading(false);
      setIsCoursesError(true);
      setCoursesErrorMsg(ready ? t('common:error.unspecific') : '');
    }
  }, [empInfo.id, ready, t]);

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
        const { data } = response;
        const arr = [];
        
        for (const course of data) {
          
          if (!course.isCompleted) {
            
            if (new Date(course.expirationDate) > new Date()) {
              arr.push(course);
            }
          }else {
            setUserCompletedCourses(true);
            setUserCourses(data);
          }
        }
        
        setUserAllCourses(data);
        setUserCourses([...arr.slice(0, 2)]);
        setIsUserCoursesLoading(false);
        setIsUserCoursesErr(false);
      } else {
        setIsUserCoursesLoading(false);
      }
    } catch (error) {
      setIsUserCoursesLoading(false);
      setIsUserCoursesErr(true);
    }
  }, [empInfo.id]);

  useEffect(() => {
    getAllCourses();
    getUserCourses();
  }, [getAllCourses, getUserCourses]);

  return (
    <>
      <Container
        sx={{
          marginTop: '15px',
          padding: { xs: '0 20px', lg: '0 50px !important' },
        }}
        className="employee-dashboard"
      >
      {userCompletedCourses && (
  <Box sx={{
    padding: '20px',
    border: '1px solid #ddd',
    background: 'linear-gradient(180deg, #f7f7f7 0%, #ffffff 100%)',
    borderRadius: '15px',
    position: 'relative',
    marginBottom: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    }
  }}>
    <img src="/trophy (1).png" alt="img-trophy" style={{maxWidth: '50px', marginBottom: '10px'}} />
    <Typography sx={{fontSize: '24px', color: '#333', fontWeight: 'bold'}}>
      {t('course:congratulationsText')}
    </Typography>
    <ul style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '10px',
      padding: '0',
      listStyleType: 'none',
    }}>
      {userAllCourses.map((course, cIndex) => (
        course.isCompleted && (
          <li key={cIndex} style={{
            color: '#555',
            fontSize: '16px',
            margin: '5px 0',
            padding: '5px 10px',
            background: '#f1f1f1',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
          }}>
            {course.name} {course.examType}
          </li>
        )
      ))}
    </ul>
  </Box>
)}
        
        {isCoursesLoading || isUserCoursesLoading || !ready ? (
          <Box display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {isCoursesError ? (
              <Box display="flex" alignItems="center" justifyContent="center">
                {coursesErrorMsg}
              </Box>
            ) : (
              <>
                {userCourses.length > 0 &&  (
                  <>
                    <label style={{ color: '#666666', fontSize: '16px' }}>
                      {t('countinueLearning')}
                    </label>
                    <EmpCourses courses={userCourses} />
                  </>
                )}
                <label
                  style={{
                    color: '#666666',
                    fontSize: '16px',
                    marginBottom: '20px',
                    display: 'block',
                  }}
                >
                  {t('mostPopularCourse')}
                </label>
                <ExploreCourseList
                  courses={courses}
                  userCourses={userAllCourses}
                />
              </>
            )}
            
          </>
        )}
      </Container>
    </>
  );
};

EmployeeDashboard.individualGuard = true;

EmployeeDashboard.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default EmployeeDashboard;
