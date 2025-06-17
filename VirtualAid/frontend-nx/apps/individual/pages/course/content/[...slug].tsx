import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

import { styled } from '@mui/material/styles';

import {
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import { useRouter } from 'next/router';

import {
  ContentSectionType,
  ModuleLessonType,
} from '../../../types/course-content';

import CourseContentIndex from '../../../views/course-content/CourseContentIndex';
import TextContent from '../../../views/course-content/TextContent';
import HeaderLayout from '../../../layouts/components/Header';
import { InfoContext } from '../../../contexts/InfoContext';

import { useTranslation } from 'next-i18next';
import { CircularProgress, PaginationItem } from '@mui/material';
import Link from 'next/link';
import { Divider } from '@mui/material';
import { Course } from 'apps/individual/views/courses/EmpCourses';
import CourseDetails from '../details/[id]';
import { ExamDetailsType } from 'apps/individual/types/quiz';

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

const CourseContent = () => {
  const router = useRouter();

  const { empInfo } = useContext(InfoContext);

  const [currentLesson, setCurrentLesson] = useState<ModuleLessonType>(
    {} as ModuleLessonType
  );
  const [prevLesson, setPrevLesson] = useState<ModuleLessonType>(
    {} as ModuleLessonType
  );
  const [nextLesson, setNextLesson] = useState<ModuleLessonType>(
    {} as ModuleLessonType
  );
  const [lessonLoading, setLessonLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorLesson, setErrorLesson] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState(false);
  const [sections, setSections] = useState<ContentSectionType[]>([]);
  const [currentSection, setCurrentSections] = useState(0);
  const [hasExam, setHasExam] = useState(false);
  // State to track the current page
  const [currentPage, setCurrentPage] = useState(0);

  // State to track whether the next button arrow is clicked
  const [isNextButtonClicked, setIsNextButtonClicked] = useState(false);
  const contentGridItemRef = useRef();
  const [quizDetails, setQuizDetails] = useState<ExamDetailsType>(
    {} as ExamDetailsType
  );
  const { t, ready } = useTranslation(['course', 'common']);
  const [setCompleted, setSetCompleted] = useState(false); // Declare setCompleted with an initial value of false

  // Method to handle next page function
  const handleNext = () => {
    if (currentPage < sections.length) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      if (!nextPage) {
        setCurrentPage(1);
      }
      setCurrentSections(nextPage - 1); // Adjust the index by subtracting 1
    }
  };

  // Method to handle previous page
  const handlePrevious = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      if (!prevPage) {
        setCurrentPage(1);
      }
      setCurrentSections(prevPage - 1); // Adjust the index by subtracting 1
    }
  };

  // Method to handle page change event
  // @param: page for getting page wise data
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setCurrentSections(page - 1);
  };

  const totalPages = sections.length;

  // Method to render pagination button
  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={
            currentPage === i ? 'active pagination-button' : 'pagination-button'
          }
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  // Method to get lesson for courses
  // @param:lessonId for get lesson using id
  //         moduleId for get lesson using moduleId
  const getLesson = useCallback(async (lessonId: string, moduleId: string) => {
    try {
      setLessonLoading(true);
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/lesson/lesson-with-previous-nextby-id/`,
        {
          params: {
            currentLessonId: lessonId,
            examType: router.query.examType,
            userId: empInfo.id,
            culture: router.locale,
          },
        }
      );
      
      if (response.status === 200) {
        setLoading(false);
        let tempLesson = {} as ModuleLessonType;
        const currentLesson = response.data.currentLesson;
        const tempNext = response.data.nextLesson;

        setCurrentLesson(currentLesson);
        // Check if the current lesson is the last one
        const isLastLesson =
          currentLesson.currentModuleSerialNumber <
          tempNext?.currentModuleSerialNumber;
        if (isLastLesson) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/module/has-exam-by-module-id/${moduleId}`,
            {
              headers: {
                'Accept-Language': router.locale, // Set content type for FormDatas
              },
            }
          );
          if (response.status === 200) {
            setHasExam(response.data);
          }
        }

        if (response.data.nextLesson) {
          setNextLesson(response.data.nextLesson);
        }
        if (response.data.previousLesson !== null) {
          setPrevLesson(response.data.previousLesson);
        }

        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i].id === lessonId) {
            setCurrentLesson(response.data[i]);
            tempLesson = response.data[i];
            break;
          }
        }
        setLessonLoading(false);
        setErrorLesson(false);
        setLoading(false);
      } else {
        setLessonLoading(false);
        setErrorLesson(true);
        setLoading(false);
      }
    } catch (error) {
      setLessonLoading(false);
      setErrorLesson(true);
    }
  }, []);

  // Method to extract sections from current lesson contents
  const extractSections = useCallback(() => {
    const secArr = [];
    for (const contents of currentLesson.contents) {
      for (const section of contents.sections) {
        secArr.push(section);
      }
    }
    setSections(secArr);
  }, [currentLesson]);

  // Method to save progress and next
  const saveProgressAndNext = async () => {
    try {
      setSaving(true);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/progress-for-course-by-lesson-id`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas
          },
        },
        {
          params: {
            userId: empInfo.id,
            courseId: courseId,
            lessonId: currentLesson.id,
            examType: router.query.examType,
            culture: router.locale,
          },
        }
      );

      if (response.status === 200) {
        setCurrentPage(1);

        router.push(
          `/course/content/${courseId}/${nextLesson.moduleId}/${nextLesson.id}?examType=${router.query.examType}`
        );
      } else {
        setSaving(false);
        setSaveErr(true);
      }
    } catch (error) {
      setSaving(false);
      setSaveErr(true);
    }
  };
  // Method to get quiz details
  // @param: courseId for getting quiz details using courseId
  const getQuizDetails = useCallback(
    async (courseId: string) => {
      try {
        setLessonLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/exam/exam-details-by-course-module/`,
          {
            params: {
              courseId: courseId,
              moduleId: router.query.moduleId,
              culture: router.locale,
            },
          }
        );
        if (response.status === 200) {
          setLessonLoading(false);
          setErrorLesson(false);
          setQuizDetails(response.data);
        }
      } catch (error) {
        setLessonLoading(true);
        setErrorLesson(true);
      }
    },
    [courseId]
  );

  // Method to click on button to go to certificate page
  const onButtonClick = () => {
    if (router.query.examType === 'Live') {
      router.replace(
        `/live-exam/?courseId=${courseId}&examType=${router.query.examType}&userId=${empInfo.id}&moduleId=${currentLesson.moduleId}`
      );
    } else {
      router.replace(
        `/quiz/certificate/${quizDetails.id}?examType=${router.query.examType}&courseId=${courseId}`
      );
    }
  };

  // Function to handle clicking the next button
  const onNextButtonClick = () => {
    setIsNextButtonClicked(true);
    // Increment the current page when the next button arrow is clicked
    setCurrentPage((prevPage) => prevPage + 1);
  };
  useEffect(() => {
    if (router.isReady) {
      setCourseId('');
      setModuleId('');
      setCurrentLesson({} as ModuleLessonType);
      setNextLesson({} as ModuleLessonType);
      setPrevLesson({} as ModuleLessonType);
      setSections([]);
      setCurrentSections(0);
      setHasExam(false);
      const slug = router.query.slug as string[];
      setCourseId(slug[0] as string);
      setModuleId(slug[1] as string);
      getLesson(slug[2] as string, slug[1] as string);
      setSaving(false);
      getQuizDetails(slug[0] as string);
    }
  }, [getLesson, getQuizDetails, router.isReady, router.query.slug]);

  useEffect(() => {
    if (currentLesson?.contents?.length > 0) {
      extractSections();
    }
  }, [currentLesson?.contents?.length, extractSections]);

  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{ padding: { xs: '20px', md: '24px 50px' } }}
        key={router.asPath}
      >
        {lessonLoading || !ready ? (
          <>
            <Grid item xs={12} md={4} sx={{ padding: 0 }}>
              <Skeleton variant="rounded" width="100%" height="50%" />
            </Grid>
            <Grid item xs={12} md={8} sx={{ padding: 0 }}>
              <Skeleton variant="rounded" width="100%" height="50%" />
            </Grid>
          </>
        ) : (
          <>
            {errorLesson ? (
              <>{t('common:error.unspecific')}</>
            ) : (
              <>
                <Grid item xs={12} md={4} sx={{ padding: '0' }}>
                  <CourseContentIndex lesson={currentLesson} />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={8}
                  sx={{ padding: '0', color: '#000', position: 'relative' }}
                >
                  {loading && <><CircularProgress></CircularProgress></>}
                   <ContentBox>
                    {sections[currentSection] && (
                      <TextContent
                        content={sections[currentSection]}
                        empInfo={empInfo}
                      />
                    )}
                  </ContentBox>
                 

                  <ContentBox>
                    <Box sx={{ mb: 5 }}>
                      <Typography variant="subtitle1" color="primary">
                        {t('lessonNavigation')}
                      </Typography>
                      {/* Note: this is commented for testing purpose  */}
                      {/* <Pagination
                        count={sections.length}
                        siblingCount={sections.length}
                        color="primary"
                        hideNextButton={false}
                        hidePrevButton={false}
                        sx={{ width: '100%' }}
                        onChange={onPaginationChange}
                      /> */}
                      <div>
                        {currentPage === 1 && prevLesson?.id && (
                          <>
                            {prevLesson?.id ? (
                              <Button
                                variant="outlined"
                                disabled={saving}
                                sx={{
                                  marginLeft: '10px',
                                  marginTop: '10px',
                                }}
                                onClick={() => {
                                  router.push(
                                    `/course/content/${courseId}/${prevLesson.moduleId}/${prevLesson.id}?examType=${router.query.examType}`
                                  );
                                }}
                              >
                                {t('common:action.prevLesson')}
                              </Button>
                            ) : (
                              <></>
                            )}
                          </>
                        )}

                        <Button
                          variant="outlined"
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          sx={{ marginLeft: '10px', marginTop: '10px' }}
                        >
                          {t('common:prevText')}
                        </Button>
                        {renderPaginationButtons()}
                        <Button
                          variant="outlined"
                          onClick={handleNext}
                          disabled={currentPage === totalPages}
                          sx={{ marginRight: '10px', marginTop: '10px' }}
                        >
                          {t('common:nextText')}
                        </Button>

                        {currentPage === sections.length && (
                          <>
                            {hasExam ? (
                              <Button
                                variant="gradient"
                                disabled={saving}
                                sx={{ marginTop: '10px' }}
                                onClick={() => {
                                  router.push(
                                    `/quiz/instructions/${courseId}/?examType=${router.query.examType}&moduleId=${currentLesson.moduleId}&nextLessonId=${nextLesson.id}`
                                  );
                                }}
                              >
                                {t('takeTest')}
                              </Button>
                            ) : (
                              <>
                                {nextLesson?.id ? (
                                  <Button
                                    variant="outlined"
                                    disabled={saving}
                                    onClick={saveProgressAndNext}
                                    sx={{ marginTop: '10px' }}
                                  >
                                    {t('common:action.nextLesson')}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outlined"
                                    onClick={onButtonClick}
                                    sx={{ marginTop: '10px' }}
                                  >
                                    {router.query.examType === 'Live'
                                      ? t('common:RequestLiveExam')
                                      : t('goToCertiPage')}
                                  </Button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        rowGap: { xs: 2, md: 0 },
                      }}
                    >
                      {/* Note: this code is commented due to testing purpose */}
                      {/* {prevLesson?.id ? (
                        <Button
                          variant="outlined"
                          disabled={saving}
                          onClick={() => {
                            router.push(
                              `/course/content/${courseId}/${prevLesson.moduleId}/${prevLesson.id}`
                            );
                          }}
                        >
                          {t('common:action.prevLesson')}
                        </Button>
                      ) : (
                        <Button hidden></Button>
                      )}
                      {nextLesson?.id ? (
                        <Button
                          variant="gradient"
                          disabled={saving}
                          onClick={() => {
                            saveProgressAndNext();
                          }}
                        >
                          {t('common:action.nextLesson')}
                        </Button>
                      ) : (
                        <Button
                          variant="gradient"
                          disabled={saving}
                          onClick={() => {
                            router.push(`/quiz/instructions/${courseId}`);
                          }}
                        >
                          {t('takeTest')}
                        </Button>
                      )} */}
                    </Box>
                  </ContentBox>
                </Grid>
              </>
            )}
          </>
        )}
      </Grid>
    </>
  );
};

CourseContent.individualGuard = true;

CourseContent.getLayout = (page: ReactNode) => (
  <HeaderLayout>{page}</HeaderLayout>
);

export default CourseContent;
