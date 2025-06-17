import Grid from '@mui/material/Grid';
import Box from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import CourseIndexName from '../../../views/course-content/CourseIndexName';
import CourseIndex from '../../../views/course-content/CourseIndex';
import HeaderLayout from '../../../layouts/components/Header';

import { useRouter } from 'next/router';

import axios from 'axios';
import { ModuleWithLessonType } from '../../../types/course-content';
import { InfoContext } from '../../../contexts/InfoContext';
import {
  CourseDetailsType,
  UserCourseEnrollmentDetailsType,
} from '../../../types/courses';

import { useTranslation } from 'next-i18next';

const CourseContentIndex = () => {
  const router = useRouter();

  const { empInfo } = useContext(InfoContext);

  const [courseModules, setCourseModules] = useState<ModuleWithLessonType[]>(
    []
  );
  const [loadingCourseModules, setLoadingCourseModules] = useState(false);
  const [errorGettingModules, setErrorGettingCourseModules] = useState(false);

  const [courseProgress, setCourseProgress] =
    useState<UserCourseEnrollmentDetailsType>(
      {} as UserCourseEnrollmentDetailsType
    );
  const [loadingCourseProgress, setLoadingCourseProgress] = useState(false);
  const [errorCourseProgress, setErrorCourseProgress] = useState(false);

  const [courseDetails, setCourseDetails] = useState<CourseDetailsType>(
    {} as CourseDetailsType
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDetailsError, setIsDetailsError] = useState(false);

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const [currentCourseId, setCurrentCourseId] = useState('');
  const [currentModuleId, setCurrentModuleId] = useState('');
  const [currentLessonId, setCurrentLessonId] = useState('');
  const { t, ready } = useTranslation(['course', 'common']);
  const [currentModuleHasExam, setCurrentModuleHasExam] = useState(false);

 // Method to get user course details
  const getUserCourseDetails = useCallback(async () => {
    try {
      setLoadingCourseProgress(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/user-course-enrollment-details/?culture=${router.locale}`,
        {
          params: {
            userId: empInfo.id,
            courseId: router.query.id,
            examType: router.query.examType,
          },
        }
      );

      if (response.status === 200) {
        setCourseProgress(response.data);
        setLoadingCourseProgress(false);
        setErrorCourseProgress(false);
      } else {
        setLoadingCourseProgress(false);
        setErrorCourseProgress(true);
      }
    } catch (error) {
      setLoadingCourseProgress(false);
      setErrorCourseProgress(true);
    }
  }, [empInfo.id, router.query.id]);

 // Method to get course modules 
  const getCourseModules = useCallback(async () => {
    try {
      if (!courseProgress || !courseProgress.id) {
        return;
      }
      setLoadingCourseModules(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/module/modules-with-contents-by-course-id/${router.query.id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        },
      );

      if (response.status === 200) {
        for (let i = 0; i < response.data.length; i++) {
          const isVrLesson =
            response.data[i].lessons[response.data[i].lessons.length - 1]
              .contents[0].sections[0].fieldType === 4;
          if (isVrLesson && courseProgress.examType !== 'VR') {
            response.data[i].lessons.splice(
              response.data[i].lessons.length - 1,
              1
            );
            i++;
          }
        }
        setCourseModules(response.data);

        setLoadingCourseModules(false);
      } else {
        setLoadingCourseModules(false);
        setErrorGettingCourseModules(true);
      }
    } catch (error) {
      setLoadingCourseModules(false);
      setErrorGettingCourseModules(true);
    }
  }, [courseProgress, router.query.id]);

  // Method to get course details 
  const getCourseDetails = useCallback(async () => {
    try {
      setDetailsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/course-detail/${router.query.id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        },
      );

      if (response.status === 200) {
        setCourseDetails(response.data);

        setDetailsLoading(false);
        setIsDetailsError(false);
      } else {
        setDetailsLoading(false);
        setIsDetailsError(true);
      }
    } catch (error) {
      setDetailsLoading(false);
      setIsDetailsError(true);
    }
  }, [router.query.id]);

  useEffect(() => {
    if (router.isReady) {
      getCourseDetails();
      getUserCourseDetails();
    }
  }, [getCourseDetails, getUserCourseDetails, router.isReady]);

  useEffect(() => {
    if (router.isReady && courseProgress?.id) {
      getCourseModules();
    }
  }, [courseProgress?.id, getCourseModules]);

  useEffect(() => {
    if (courseModules.length > 0 && courseProgress.currentLessonId) {
      for (let i = 0; i < courseModules.length; i++) {
        let flag = false;
        const lessonArr = courseModules[i].lessons;
        for (let j = 0; j < lessonArr.length; j++) {
          if (lessonArr[j].id === courseProgress.currentLessonId) {
            setCurrentLessonIndex(j);
            setCurrentModuleIndex(i);
            setCurrentCourseId(courseModules[i].courseId);
            setCurrentModuleId(lessonArr[j].moduleId);
            setCurrentLessonId(lessonArr[j].id);
            flag = true;
            break;
          }
        }
        if (flag) {
          break;
        }
      }
      if (courseModules.length > 0 && courseProgress.currentModuleId) {
        const currentModule = courseModules.find(
          (module) => module.id === courseProgress.currentModuleId
        );
        if (currentModule) {
          setCurrentModuleHasExam(currentModule.hasExam);
        }
      }
    }
  }, [
    courseProgress,
    courseModules,
    courseModules.length,
    courseProgress.currentLessonId,
    courseProgress.currentModuleId,
  ]);

  return (
    <>
      {loadingCourseModules ||
      loadingCourseProgress ||
      detailsLoading ||
      !ready ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {errorGettingModules || errorCourseProgress ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              {t('common:error.unspecific')}
            </Box>
          ) : (
            <>
              <Grid
                container
                spacing={2}
                sx={{ padding: { xs: '20px', md: '24px 50px' } }}
              >
                <Grid item xs={12} md={4} sx={{ padding: '0' }}>
                  <CourseIndexName
                    title={courseDetails?.name ? courseDetails?.name : ''}
                    examType={courseProgress.examType}
                    description={
                      courseDetails?.shortDescription
                        ? courseDetails?.shortDescription
                        : ''
                    }
                  />
                  {currentCourseId && currentModuleId && currentLessonId && (
                    <Button
                      variant="gradient"
                      sx={{ my: 2 }}
                      onClick={() => {
                        router.push(
                          `/course/content/${currentCourseId}/${currentModuleId}/${currentLessonId}?examType=${router.query.examType}`
                        );
                      }}
                    >
                    {t('countinueLearning')}
                    </Button>
                  )}

                  {courseProgress.liveExamDate !== null && (
                    <>
                      <Box>
                        <Button
                          variant="gradient"
                          href={`/live-exam-status?userId=${empInfo.id}&courseId=${router.query.id}&examType=${router.query.examType}`}
                          sx={{ my: 2 }}
                        >
                          {t('checkRequestStatus')}
                        </Button>
                      </Box>
                    </>
                  )}
                </Grid>
                <Grid item xs={12} md={8}>
                  <CourseIndex
                    modules={courseModules}
                    examType={
                      typeof router.query.examType === 'string'
                        ? router.query.examType
                        : ''
                    }
                    currentModuleIndex={currentModuleIndex}
                    currentLessonIndex={currentLessonIndex}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}
    </>
  );
};

CourseContentIndex.individualGuard = true;

CourseContentIndex.getLayout = (page: ReactNode) => (
  <HeaderLayout>{page}</HeaderLayout>
);

export default CourseContentIndex;
