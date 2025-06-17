import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

import { ProfileLayout } from '../../../layouts/components/ProfileLayout';
import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '../../../components/styled/Accordian';

import { useRouter } from 'next/router';
import axios from 'axios';

import {
  CourseDetailsType,
  UserSubscribedCourseType,
} from '../../../types/courses';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';

import { InfoContext } from '../../../contexts/InfoContext';
import { addItemInCart } from '../../../store/apps/cart';

import { useTranslation } from 'next-i18next';

const CourseDetails = () => {
  const [expanded, setExpanded] = useState<number | false>(0);
  const [courseDetails, setCourseDetails] = useState<CourseDetailsType>(
    {} as CourseDetailsType
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDetailsError, setIsDetailsError] = useState(false);
  const [detailsErrorMsg, setDetailsErrorMsg] = useState('');
  const [qty, setQty] = useState(1);
  const [isCartBtnDisabled, setIsCartBtnDisabled] = useState(false);
  const [isItemInCart, setIsItemInCart] = useState(false);

  const [userAllCourses, setUserAllCourses] = useState<
    UserSubscribedCourseType[]
  >([]);
  const [isUserCoursesLoading, setIsUserCoursesLoading] = useState(false);
  const [isUserCoursesErr, setIsUserCoursesErr] = useState(false);

  const [alreadyBoughtByUser, setAlreadyBoughtByUser] = useState(false);
  const [alreadyCompletedByUser, setAlreadyCompletedByUser] = useState(false);
  const [buyingCheck, setBuyingCheck] = useState(true);

  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const cartInstance = useSelector((state: RootState) => state.cart);

  const { companyInfo, empInfo, isCompany } = useContext(InfoContext);

  const { t, ready } = useTranslation(['course', 'common']);

  useEffect(() => {
    if (router.isReady) {
      const courseFromCart = cartInstance.data.items.find(
        (item) => item.courseId === router.query.id
      );
      if (courseFromCart) {
        setQty(courseFromCart.courseCount);
        setIsItemInCart(true);
        setIsCartBtnDisabled(false);
      }
    }
  }, [cartInstance.data.items, router.isReady, router.query.id]);

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
        setDetailsErrorMsg('');
      }
    } catch (error) {
      setDetailsLoading(false);
      setIsDetailsError(true);
      setDetailsErrorMsg(t('common:error.unspecific'));
    }
  }, [router.query.id, t]);

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
        },
      );
      if (response.status === 200) {
        const { data } = response;
        const arr = [];
        for (const course of data) {
          if (!course.isCompleted) {
            if (new Date(course.expirationDate) > new Date()) {
              arr.push(course);
            }
          }
        }
        setUserAllCourses(data);
        setIsUserCoursesLoading(false);
        setIsUserCoursesErr(false);
      }
    } catch (error) {
      setIsUserCoursesLoading(false);
      setIsUserCoursesErr(true);
    }
  }, [empInfo.id]);

  useEffect(() => {
    if (router.isReady) {
      getCourseDetails();
      if (!isCompany) {
        getUserCourses();
      }
    }
  }, [router, getCourseDetails, getUserCourses, isCompany]);

  useEffect(() => {
    if (!isCompany) {
      if (router.isReady) {
        setBuyingCheck(true);
        const courseId = router.query.id;
        for (const course of userAllCourses) {
          if (course.id === courseId) {
            setAlreadyBoughtByUser(true);
            if (course.isCompleted) {
              setAlreadyCompletedByUser(true);
            }
            break;
          }
        }
        setBuyingCheck(false);
      }
    } else {
      setBuyingCheck(false);
    }
  }, [isCompany, router.isReady, router.query.id, userAllCourses]);

 // Method to handle change function
  const handleChange =
    (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

 // Method to click and modify using button
  const onClickAddModify = () => {
    if ((!isItemInCart && !isCompany) || isCompany) {
      const reqPayload = isCompany
        ? {
            companyId: companyInfo.id,
            courseId: router.query.id as string,
            courseCount: qty,
            examType: courseDetails.examType,
          }
        : {
            userId: empInfo.id,
            courseId: router.query.id as string,
            courseCount: 1,
            examType: courseDetails.examType,
          };

      dispatch(addItemInCart(reqPayload));
    } else {
      router.push('/cart');
    }
  };

  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          marginTop: '15px',
          padding: { xs: '0 20px', lg: '0 50px !important' },
        }}
      >
        <Box
          sx={{
            padding: '30px',
            background:
              'linear-gradient(180deg, rgba(241,241,241,1) 0%, rgba(255,255,255,1) 100%)',
            borderRadius: '20px',
          }}
        >
          {detailsLoading || isUserCoursesLoading || buyingCheck || !ready ? (
            <>
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress />
              </Box>
            </>
          ) : (
            <>
              {isDetailsError ? (
                <>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography variant="h5" component="div">
                      {detailsErrorMsg}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  {/* Course name and button */}
                  <Box
                    sx={{
                      display: { xs: 'block', md: 'flex' },
                      justifyContent: 'space-between',
                      alignItem: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#6C107F',
                        fontSize: { xs: '14px', md: '32px' },
                        marginBottom: { xs: '10px', md: '0' },
                      }}
                    >
                      {courseDetails.name}
                    </Typography>

                    {alreadyBoughtByUser ? (
                      <>
                        {alreadyCompletedByUser ? (
                          <>
                            <Typography
                              sx={{
                                color: '#009405',
                                display: 'inline-block',
                                fontFamily: "'Open Sans', sans-serif",
                                fontWeight: '600',
                              }}
                            >
                              {t('completed')}
                            </Typography>
                          </>
                        ) : (
                          <Button
                            variant="gradient"
                            sx={{ textTransform: 'capitalize' }}
                            onClick={() => {
                              router.push(
                                `/course/content-index/${router.query.id}`
                              );
                            }}
                          >
                            {t('goToCourse')}
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <Box>
                          {isCompany ? (
                            <>
                              <TextField
                                type="number"
                                value={qty}
                                sx={{
                                  width: '54px',
                                  height: '36px',
                                  marginLeft: '8px',
                                  display: 'inline-block',
                                  verticalAlign: 'middle',
                                  '& .MuiInputBase-root': {
                                    height: '36px !important',
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    paddingRight: '2px',
                                  },
                                }}
                                InputProps={{
                                  inputProps: { min: 0 },
                                }}
                                onChange={(event) => {
                                  if (Number(event.target.value) <= 0) {
                                    setQty(0);
                                    setIsCartBtnDisabled(true);
                                  } else {
                                    setQty(Number(event.target.value));
                                    setIsCartBtnDisabled(false);
                                  }
                                }}
                              />
                              <Button
                                variant="gradient"
                                sx={{ m: '0 20px' }}
                                onClick={onClickAddModify}
                                disabled={
                                  cartInstance.loading || isCartBtnDisabled
                                }
                              >
                                {isItemInCart
                                  ? t('common:action.modify')
                                  : t('common:action.add')}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="gradient"
                                onClick={onClickAddModify}
                                sx={{ textTransform: 'capitalize' }}
                              >
                                {isItemInCart ? t('goToCart') : t('addToCart')}
                              </Button>
                            </>
                          )}
                        </Box>
                      </>
                    )}
                  </Box>

                  {/* course hour and module */}
                  <Typography
                    sx={{
                      color: '#000',
                      fontSize: '16px',
                      fontFamily: "'Open Sans', sans-serif",
                    }}
                  >
                    {t('hour', { count: courseDetails.totalNoOfHours })} |{' '}
                    {t('module', { count: courseDetails.noOfModules })}
                  </Typography>

                  {/* Course description */}
                  <Box>
                    <Typography
                      sx={{
                        color: '#666666',
                        fontSize: { xs: '12px', md: '16px' },
                        fontFamily: "'Open Sans', sans-serif",
                        margin: { xs: '10px 0', md: '30px 0 26px 0' },
                      }}
                    >
                      {courseDetails.description}
                    </Typography>
                  </Box>

                  {/* Course learning outcomes and module */}
                  <Box>
                    {/* Learning outcomes */}
                    <Grid
                      container
                      spacing={2}
                      sx={{ margin: { xs: '10px 0', md: '30px 0 26px 0' } }}
                    >
                      <Grid item xs={8}>
                        <Grid container spacing={2}>
                          {courseDetails?.learningOutcomes?.map(
                            (learningOutcome, index) => (
                              <Grid
                                item
                                xs={12}
                                md={6}
                                key={index}
                                sx={{
                                  padding: '6px 0 0 16px !important',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <DoneOutlinedIcon
                                  sx={{
                                    display: 'inline-block',
                                    verticalAlign: 'top',
                                    color: '#666666',
                                    marginRight: '14px',
                                  }}
                                ></DoneOutlinedIcon>
                                <Typography
                                  variant="body1"
                                  sx={{ color: '#666' }}
                                >
                                  {learningOutcome}
                                </Typography>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </Grid>
                    </Grid>

                    <Typography
                      sx={{
                        color: '#000000',
                        fontSize: '20px',
                        fontFamily: "'Open Sans', sans-serif",
                        marginBottom: '14px',
                      }}
                    >
                      {t('moduleCourseContent')}
                    </Typography>
                    {courseDetails?.modules?.map((courseModule, index) => (
                      <Accordion
                        key={index}
                        expanded={expanded === index}
                        onChange={handleChange(index)}
                        className="course-details-section"
                      >
                        <AccordionSummary
                          aria-controls="panel1d-content"
                          id="panel1d-header"
                        >
                          <Typography>{courseModule.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ paddingTop: 0 }}>
                          <Box sx={{ marginLeft: '48px' }}>
                            {courseModule?.lessons?.map((lesson, index) => (
                              <Typography
                                key={index}
                                variant="body2"
                                component="div"
                                sx={{ color: '#666' }}
                              >
                                {lesson.name}
                              </Typography>
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

CourseDetails.authGuard = true;

CourseDetails.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default CourseDetails;
