import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { useRouter } from 'next/router';

import axios, { isAxiosError } from 'axios';

import { useTranslation } from 'next-i18next';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import EmptyQuizLayout from 'apps/individual/layouts/components/EmptyQuizLayout';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  styled,
} from '@mui/material';
import { UserCourseEnrollmentDetailsType, UserSubscribedCourseType } from 'apps/individual/types/courses';
import { Controller, useForm } from 'react-hook-form';
import { getDisplayDate } from '@virtual-aid-frontend/utils';
import { ExamDetailsType } from 'apps/individual/types/quiz';

type LiveExamForm = {
  id: number;
  examDate: string;
  allocatedSeatsCount: number;
  remaningSeatsCount: number;
  isDeleted: boolean;
};
const LiveExamRequest = () => {
  const router = useRouter();

  const [liveExamDates, setLiveExamDates] = useState<LiveExamForm[]>([]);
  const [liveExamLoading, setLiveExamLoading] = useState(false);
  const [liveExamRequestLoading, setLiveExamRequestLoading] = useState(false);
  const [liveExamError, setLiveExamError] = useState(false);

  const [examiLoading, setexamiLoading] = useState(false);
  const [error, setSerror] = useState(false);

  const [consentStatus, setConsentStatus] = useState(false);

  const [dataConsentLoading, setDataConsentLoading] = useState(false);
  const [dataConsentErr, setDataConcentErr] = useState(false);
  const [dataConsentProvided, setDataConsentProvided] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const { t, ready } = useTranslation(['quiz', 'common']);
  const [userCourses, setUserCourses] =
    useState<UserSubscribedCourseType | null>(null);

  const [isUserCoursesLoading, setIsUserCoursesLoading] = useState(false);
  const [isUserCoursesErr, setIsUserCoursesErr] = useState(false);
  
  const [isExamDateErrMsg, setIsExamDateErrMsg] = useState('');
  const [courseProgress, setCourseProgress] =
  useState<UserCourseEnrollmentDetailsType>(
    {} as UserCourseEnrollmentDetailsType
  );
const [loadingCourseProgress, setLoadingCourseProgress] = useState(false);
const [errorCourseProgress, setErrorCourseProgress] = useState(false);
const [quizDetails, setQuizDetails] = useState<ExamDetailsType>(
  {} as ExamDetailsType
);
  //Form controls
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LiveExamForm>({
    defaultValues: {
      id: 0,
      examDate: '',
      allocatedSeatsCount: 0,
      remaningSeatsCount: 0,
      isDeleted: false,
    },
  });
  // get live exam details from admin method
  const getLiveExamScheduleList = useCallback(async () => {
    try {
      setLiveExamLoading(true);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/live-exam/live-exam-schedule-list/`,
        {
          params: {
            pageNo: paginationModel.page,
            pageSize: paginationModel.pageSize,
          },
        }
      );
      if (response.status === 200) {
        setLiveExamDates(response.data);
        setLiveExamLoading(false);
      } else {
        setLiveExamLoading(false);
        setLiveExamError(true);
      }
    } catch (error) {
      setLiveExamLoading(false);
      setLiveExamError(true);
    }
  }, []);
  // get course details by course ID
  const getUserCourses = useCallback(async () => {
    try {
      setIsUserCoursesLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/course-detail/${router.query.courseId}/?culture=${router.locale}`,
         {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        },
        
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
  }, [router.query.courseId]);


  //get live exam date is exists or not status 
  const getUserCourseDetails = useCallback(async () => {
    try {
      setLoadingCourseProgress(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/user-course-enrollment-details`,
        {
          params: {
            userId: router.query.userId,
            courseId: router.query.courseId,
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
  }, [router.query.userId, router.query.id]);
  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
       maxWidth: '580px',
       margin: '0 auto',
    '& .MuiDialogTitle-root': {
      padding: '20px 110px 20px 60px',
      marginBottom: '10px',
      borderBottom: '1px solid #ddd',
     
    },
    '& .MuiPaper-rounded': {
      borderRadius: '20px',
      maxHeight: 'calc(100% - 8px)',
    },
    '& .MuiDialogContent-root': {
      [theme.breakpoints.up('sm')]: {
        padding: '20px',
      },
      [theme.breakpoints.up('md')]: {
        padding: '0 110px 0 60px',
      },
      [theme.breakpoints.up('lg')]: {
        padding: '0 110px 0 60px',
      },
      // marginBottom: '20px',
    },
    '& .MuiDialogActions-root': {
      padding: '8px 110px 40px 60px',
      justifyContent: 'flex-start',
    },
  }));
  // To open exam dialog method
  const openLiveExamDialog = async () => {
    setOpenDialog(true);
  };
  //close exam dialog method
  const handleCloseDialog = () => {
    setOpenDialog(false);
  }

  //On submit method for course assign edit
  const onSubmit = async (data: LiveExamForm) => {
    try {
      setLiveExamRequestLoading(true);
  
      // Parse the examDate if necessary
      let newDate = data.examDate;
      if (typeof data.examDate === 'string') {
        const liveDate = JSON.parse(data.examDate);
        newDate = getDisplayDate(liveDate.examDate);
      }
  
      // Make the POST request
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/live-exam/send-live-exam-date-request`,{},
        {
          params: {
            userId: router.query.userId,
            courseId: router.query.courseId,
            requestedDate: newDate,
            culture: router.locale
          }
        }
      );
  
      if (response.status === 200) {
        // If successful, navigate to the requested-date-details page
        router.replace(`/requested-date-details/?courseId=${router.query.courseId}&examType=${router.query.examType}&userId=${router.query.userId}&moduleId=${router.query.moduleId}`);
      }
    } catch (error) {
      // Handle errors
      setLiveExamError(true);
      setOpenDialog(false);
  
      if (isAxiosError(error)) {
        if (error.response?.data?.error?.message) {
          setIsExamDateErrMsg(error.response?.data?.error?.message);
        } else {
          setIsExamDateErrMsg(t('common:error.unspecific'));
        }
      } else {
        setIsExamDateErrMsg(t('common:error.unspecific'));
      }
    } finally {
      // Reset loading state
      setLiveExamLoading(false);
    }
  }
  const getQuizDetails = useCallback(
    async () => {
      try {
     
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/exam/exam-details-by-course-module`,
          {
            params: {
              courseId:  router.query.courseId,
              moduleId: router.query.moduleId,
              culture:router.locale
            },
          }
        );
        if (response.status === 200) {
          
          setQuizDetails(response.data);
        }
      } catch (error) {
       
      }
    },
    [router.query.courseId]
  );

  useEffect(() => {
  
      getLiveExamScheduleList();
      getUserCourseDetails();
      getQuizDetails();
    getUserCourses();
  }, [getQuizDetails,getLiveExamScheduleList,getUserCourseDetails, router.isReady]);

  return (
    <>
      <Container
        maxWidth="xl"
        sx={
          {
            // padding: { xs: '0 20px', lg: '0 50px !important' },
          }
        }
      >
        <Box
          sx={{
            background:
              'linear-gradient(180deg, rgba(246,246,246,1) 0%, rgba(255,255,255,1) 100%)',
            borderRadius: '20px',
            padding: {
              xs: '30px 20px',
              // md: '60px 0 144px 0'
            },
            textAlign: 'center',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexDirection: 'column', 
            height: '80vh'
          }}
        >
          <img src="/certificate.png" alt="img1" />
          <Typography
            sx={{
              fontSize: { xs: '20px', md: '24px' },
              fontFamily: 'Outfit, Medium',
              fontWeight: 'bold',
              marginBottom: '5px',
            }}
          >
            {t('congratsOnComplete')}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '20px', md: '24px' },
              fontFamily: 'Outfit, Medium',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
           {t('plzEnrollLiveText')}
          </Typography>
         
          {courseProgress?.liveExamDate !== null ? (<>
          <Typography sx={{fontSize: { xs: '20px', md: '24px' },
              fontFamily: 'Outfit, Medium',
              fontWeight: 'bold',
              marginBottom: '20px',}}>{t('youHaveAlreadyText')}</Typography>
          <Button variant="gradient" href={`/live-exam-status?userId=${router.query.userId}&courseId=${router.query.courseId}&examType=${router.query.examType}`}>Check Status</Button></>
          ):(<><Button variant="gradient" onClick={openLiveExamDialog}>
            {t('liveExamRequest')}
          </Button></>)}
          
        
          <BootstrapDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="md"
            scroll="paper"
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
            disableEscapeKeyDown
          >
            <form  onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>
              <Typography
                color="black"
                sx={{
                  fontSize: '26px',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {t('liveExam')}
              </Typography>
            </DialogTitle>
            
            <DialogContent>
              <Typography
                sx={{
                  fontSize: '26px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 'bold',
                  marginBottom: '10px',
                }}
              >
                {userCourses?.name} {router.query.examType}
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: '400',
                  color: '#666',
                  marginBottom: '10px',
                }}
              >
                {userCourses?.shortDescription}
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: '600',
                }}
              >
                {t('selectLiveExamDate')}
              </Typography>
            <Controller
                name="examDate"
                control={control}
                defaultValue="Exam Date"
                render={({ field }) => (
                  <>
                    <Select
                      {...field}
                      fullWidth
                      sx={{ mb: '20px' }}
                      renderValue={(selected) => {
                        if (selected) {
                          const parsedSelected = JSON.parse(selected);
                          if (parsedSelected) {
                            return getDisplayDate(parsedSelected.examDate);
                          }
                        }
                        return '';
                      }}
                    >
                      
                      {liveExamDates.map((option) => (
                        <MenuItem
                          key={option.id}
                          value={JSON.stringify(option)}
                          style={{ whiteSpace: 'normal' }}
                        >
                          {getDisplayDate(option.examDate)}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              />
             
              
              
            </DialogContent>
            <DialogActions>
        <Button  type='submit' variant='contained' disabled={liveExamRequestLoading}>
          {liveExamRequestLoading ? (<> <CircularProgress size="1.75rem" /></>):(<></>)}
          {t('common:action:submit')}
        </Button>
        <Button variant='outlined' sx={{ color: 'text.secondary' }} disabled={liveExamRequestLoading} onClick={handleCloseDialog}>
          {' '}
          {t('common:action:cancel')}
        </Button>
      </DialogActions>
      </form>
          </BootstrapDialog>
          
        </Box>
      </Container>
    </>
  );
};

LiveExamRequest.individualGuard = true;

LiveExamRequest.getLayout = (page: ReactNode) => (
  <EmptyQuizLayout>{page}</EmptyQuizLayout>
);
export default LiveExamRequest;
