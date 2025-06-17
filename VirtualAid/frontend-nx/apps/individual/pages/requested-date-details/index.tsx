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
import React from 'react';


type LiveExamForm = {
  id: number;
  examDate: string;
  allocatedSeatsCount: number;
  remaningSeatsCount: number;
  isDeleted: boolean;
  
};
const LiveExamRequestedDate = () => {
  const router = useRouter();

  const [liveExamDates, setLiveExamDates] = useState<LiveExamForm[]>([]);
  const [liveExamLoading, setLiveExamLoading] = useState(false);
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userEnrollCourses, setUserEnrollCourses] =
    useState<UserCourseEnrollmentDetailsType | null>(null);

  const [isUserCoursesLoading, setIsUserCoursesLoading] = useState(false);
  const [isUserCoursesErr, setIsUserCoursesErr] = useState(false);
  
  const [isExamDateErrMsg, setIsExamDateErrMsg] = useState('');
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

  // get course details by course ID
  
  const getLiveExamDateList = useCallback(async () => {
    try {
      setIsUserCoursesLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/user-course-enrollment-details`,
        {
            params: {
              userId: router.query.userId,
              courseId: router.query.courseId,
              examType: router.query.examType
            },
          }
      );
      
      if (response.status === 200) {
       
        setUserEnrollCourses(response.data);
        setIsUserCoursesLoading(false);
        setIsUserCoursesErr(false);
      }
    } catch (error) {
      setIsUserCoursesLoading(false);
      setIsUserCoursesErr(true);
    }
  }, [router.query.courseId]);
// get course details by course ID
const getUserCourses = useCallback(async () => {
  try {
    setIsUserCoursesLoading(true);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/course-detail/${router.query.courseId}/?culture=${router.locale}`
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

  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogTitle-root': {
      // padding: '40px 110px 0 60px',
      marginBottom: '0',
    },
    '& .MuiPaper-rounded': {
      borderRadius: '20px',
      // maxHeight: 'calc(100% - 8px)',
    },
    '& .MuiDialogContent-root': {
      [theme.breakpoints.up('sm')]: {
        // padding: '20px',
      },
      [theme.breakpoints.up('md')]: {
        // padding: '0 110px 0 60px',
      },
      [theme.breakpoints.up('lg')]: {
        // padding: '0 110px 0 60px',
      },
      // marginBottom: '20px',
    },
    '& .MuiDialogActions-root': {
      // padding: '8px 110px 40px 60px',
      justifyContent: 'flex-start',
    },
  }));
 

  useEffect(() => {
    if (router.isReady) {
      getLiveExamDateList();
    }
    getUserCourses();
  }, [getLiveExamDateList, router.isReady]);

  return (
    <>
      <Container
        maxWidth="xl"
      >
        <Box
          sx={{
            background:
              'linear-gradient(180deg, rgba(246,246,246,1) 0%, rgba(255,255,255,1) 100%)',
            borderRadius: '20px',
            padding: {
              xs: '30px 20px',
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
           {t('congratsText')}
          </Typography>
          
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
                  fontWeight: '400',
                  color: '#666',
                  marginBottom: '10px',
                }}
              >
                 {userEnrollCourses && userEnrollCourses.liveExamDate ? getDisplayDate(userEnrollCourses.liveExamDate) : "No live exam date available"}
              </Typography>
              <Button
                    variant="outlined"
                    onClick={() => {
                      router.push(`/${router.locale}`);
                    }}
                  >
                    {t('common:action.backToDashboard')}
                  </Button>
              {(userEnrollCourses?.isLiveExamDateApproved !==null) && <>
              <Button  href={`/${router.locale}/live-exam-status?userId=${router.query.userId}&courseId=${router.query.courseId}&examType=${router.query.examType}&moduleId=${router.query.moduleId}`}  sx={{marginTop: '10px'}}>Check Request Status</Button>
              </>}
        </Box>
      </Container>
    </>
  );
};

LiveExamRequestedDate.individualGuard = true;

LiveExamRequestedDate.getLayout = (page: ReactNode) => (
  <EmptyQuizLayout>{page}</EmptyQuizLayout>
);
export default LiveExamRequestedDate;
