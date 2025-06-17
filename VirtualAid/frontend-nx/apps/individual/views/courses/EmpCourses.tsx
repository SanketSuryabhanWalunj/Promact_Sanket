import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';

import { styled } from '@mui/material/styles';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import {
  ExploreCourseItemType,
  UserSubscribedCourseType,
} from '../../types/courses';
import { getDisplayDate } from '@virtual-aid-frontend/utils';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useContext, useState } from 'react';

import { InfoContext } from '../../contexts/InfoContext';

import { useTranslation } from 'next-i18next';

export const CourseList = styled('ul')(() => ({
  position: 'relative',
  borderLeft: '1px solid #ddd',
  listStyle: 'none',
  paddingLeft: 0,
  margin: 0,
  padding: '20px 0',
}));

const CourseListItem = styled('li', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: string }>(({ status }) => ({
  padding: '20px',
  border: '1px solid #eee',
  borderLeft: 'none',
  background:
    'linear-gradient(180deg, rgba(241, 241, 241, 1) 0%, rgba(255, 255, 255, 1) 100%)',
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
    borderBottomLeftRadius: '20px',
    content: `''`,
    background:
      status === 'completed'
        ? 'linear-gradient(180deg, rgba(31, 183, 0, 1) 0%, rgba(34, 128, 0, 1) 100%)'
        : status === 'expired'
        ? 'linear-gradient(180deg, rgba(212, 212, 212, 1) 0%, rgba(155, 155, 155, 1) 100%)'
        : status === 'pending'
        ? 'linear-gradient(180deg, rgba(216,195,0,1) 0%, rgba(216,159,0,1) 100%)'
        : 'linear-gradient(to right, #950c8d, #2e0162)',
  },
}));

const CourseName = styled(Typography)(({ theme }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  color: theme.palette.common.black,
  marginBottom: '5px',
}));

const CourseShortDescription = styled(Typography)(({ theme }) => ({
  color: '#666',
  fontSize: '12px',
  fontFamily: "'Open Sans', sans-serif",
}));

const CourseValidityDate = styled(Typography)(() => ({
  marginTop: '20px',
  fontSize: '12px',
  fontFamily: "'Outfit', sans-serif",
  display: 'inline-block',
  marginRight: '20px'
}));
const CertiExpirationDate = styled(Typography)(() => ({
  marginTop: '20px',
  fontSize: '12px',
  fontFamily: "'Outfit', sans-serif",
  display: 'inline-block'
}));

const CourseProgress = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.black,
  fontWeight: '600',
  textAlign: 'left',
  fontSize: '18px',
  [theme.breakpoints.up('md')]: {
    textAlign: 'right',
    marginRight: '40px',
  },
}));

const CourseButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: string }>(({ theme, status }) => ({
  color: theme.palette.common.white,
  width: '40px',
  height: '40px',
  minWidth: '40px',
  lineHeight: '53px',
  textAlign: 'center',
  padding: '0',
  transition: '0.2s ease-out',
  position: 'absolute',
  top: 'auto',
  bottom: '20px',
  right: '20px',

  background:
    status === 'completed'
      ? 'linear-gradient(180deg, rgba(31, 183, 0, 1) 0%, rgba(34, 128, 0, 1) 100%)'
      : status === 'expired'
      ? 'linear-gradient(180deg, rgba(212, 212, 212, 1) 0%, rgba(155, 155, 155, 1) 100%)'
      : status === 'pending'
      ? 'linear-gradient(180deg, rgba(216,195,0,1) 0%, rgba(216,159,0,1) 100%)'
      : 'linear-gradient(to right, #950c8d 0%, #2e0162 100%)',

  '&:hover': {
    background:
      status === 'completed'
        ? 'linear-gradient(180deg, rgba(31, 183, 0, 1) 0%, rgba(34, 128, 0, 1) 80%)'
        : status === 'expired'
        ? 'linear-gradient(180deg, rgba(212, 212, 212, 1) 0%, rgba(155, 155, 155, 1) 80%)'
        : status === 'pending'
        ? 'linear-gradient(180deg, rgba(216,195,0,1) 0%, rgba(216,159,0,1) 80%)'
        : 'linear-gradient(to right, #950c8d 0%, #2e0162 80%)',
  },

  [theme.breakpoints.up('md')]: {
    top: '20px',
    bottom: 'auto',
  },
}));

const StyledSpan = styled('span')(() => ({
  position: 'absolute',
  display: 'inline-block',
  top: '50%',
  '&:before': {
    content: `''`,
    display: 'block',
    width: '15px',
    height: '2px',
    backgroundColor: '#fff',
    top: 0,
    transition: 'width 0.5s ease-out',
  },
  '&:after': {
    content: `''`,
    display: 'block',
    width: '10px',
    height: '10px',
    borderTop: '2px solid #fff',
    borderRight: '2px solid #fff',
    transform: 'rotate(45deg)',
    top: '-4px',
    position: 'absolute',
    right: '1px',
  },
  '&:hover': {
    cursor: 'pointer',
    '&:before': {
      width: '25px',
    },
  },
}));

const CourseStatus = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: string }>(({ status, theme }) => ({
  marginTop: 0,
  fontWeight: '600',
  textAlign: 'left',
  color:
    status === 'completed'
      ? '#009405'
      : status === 'certificate expired'? '#666'
      : status === 'expired'
      ? '#666'
      : status === 'pending'
      ? '#d89f00'
      : '#950c8d',
     
  [theme.breakpoints.up('md')]: {
    marginTop: '24px',
    textAlign: 'right',
  },
}));

type TempCourseType = {
  course: UserSubscribedCourseType;
};

export const Course = (props: TempCourseType) => {
  const { course } = props;
   
  const router = useRouter();

  const validationDate = course.expirationDate;
  const courseExpirationDate = course.certificateExpirationDate;
  
  const { empInfo } = useContext(InfoContext);

  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateErr, setCerificateErr] = useState(false);
  const [certificateErrMsg, setCertificateErrMsg] = useState('');

  const { t, ready } = useTranslation(['user', 'common']);

  const status = (new Date(courseExpirationDate) < new Date() && new Date(courseExpirationDate) === null)
  ? "certificate expired"
  : course.isCompleted
  ? "completed"
  : new Date(validationDate) < new Date()
  ? "expired"
  : course.progress === 0
  ? "pending"
  : "in progress"
    const isCertiCourseExpired = (): boolean => {
      const currentDate = new Date();
      return new Date(course.certificateExpirationDate) < currentDate;
    };
  const onCourseBtnClick = () => {
  
    let examNewType = '';
    router.push(`/course/content-index/${course.id}?examType=${course.examType}`);
    
  };

  const onClickDownloadCertificate = async (
    userId: string,
    examDetailId: number,
    examType: string
  ) => {
    try {
      setCertificateLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/download-certificate`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        },
        {
          params: {
            examDetailId,
            userId,
            examType,
            culture: router.locale
          },
          responseType: 'blob',
        }
      );
      if (response.status === 200) {
        const headerContentDisp = response.headers['content-disposition'];
        const filename =
          headerContentDisp &&
          headerContentDisp.split('filename=')[1].replace(/["']/g, '');
        const contentType = response.headers['content-type'];

        const blob = new Blob([response.data], { type: contentType });
        const href = window.URL.createObjectURL(blob);
        const el = document.createElement('a');
        el.setAttribute('href', href);
        el.setAttribute(
          'download',
          filename || `certificate-${examDetailId}-${userId}`
        );
        el.click();

        window.URL.revokeObjectURL(`${blob}`);
        setCertificateLoading(false);
        setCerificateErr(false);
        setCertificateErrMsg('');
      } else {
        setCertificateLoading(false);
        setCerificateErr(true);
        setCertificateErrMsg(ready ? t('common:error.unspecific') : '');
      }
    } catch (error) {
      setCertificateLoading(false);
      setCerificateErr(true);
      setCertificateErrMsg(ready ? t('common:error.unspecific') : '');
    }
  };

  return (
    <>
      <CourseListItem status={status}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8} sx={{ paddingTop: '6px !important' }}>
            <CourseName>{course.name} {course.examType}</CourseName>
            <CourseShortDescription>
              {course.shortDescription}
            </CourseShortDescription>
            <CourseValidityDate>
              {ready ? t('expiryOfCourse') : ''}:{' '}
              <b>{getDisplayDate(validationDate).toUpperCase()}</b>
            </CourseValidityDate>
            {courseExpirationDate === null ? (<></>) : ( <><CertiExpirationDate>
              {ready ? t('expiryOfCertificate') : ''}:{' '}
              <b>{getDisplayDate(courseExpirationDate !== null ? courseExpirationDate : "Not Given").toUpperCase()}</b>

            </CertiExpirationDate></>)}
            
          </Grid>
          {(status === "certificate expired") ? (<>
            <Grid
                item
                xs={12}
                md={4}
                sx={{
                  paddingTop: '20px !important',
                  textAlign: { xs: 'left', md: 'right' },
                }}
              >
                 <>
                 
                  <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  }}
                >
                 
                  <IconButton
                    onClick={() =>
                      onClickDownloadCertificate(
                        empInfo.id,
                        course.examDetailId,
                        course.examType
                      )
                    }
                    disabled
                  >
                    <FileDownloadOutlinedIcon
                      sx={{
                        color: '#666',
                      }}
                    />
                  </IconButton>

                  <img
                    src="/certi_img.svg"
                    alt="certificate"
                    style={{ maxHeight: '34px' }}
                  />
                </Box>
                 </>
              

                <CourseStatus status={status}>{status}</CourseStatus>
              </Grid>
          </>): (<>
          
          
          {status === 'completed' ? (
            <>
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  paddingTop: '20px !important',
                  textAlign: { xs: 'left', md: 'right' },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  }}
                >

                  <IconButton
                    onClick={() =>
                      onClickDownloadCertificate(
                        empInfo.id,
                        course.examDetailId,
                        course.examType
                      )
                    }
                  >
                    <FileDownloadOutlinedIcon
                      sx={{
                        color: '#666',
                      }}
                    />
                  </IconButton>

                  <img
                    src="/certi_img.svg"
                    alt="certificate"
                    style={{ maxHeight: '34px' }}
                  />
                </Box>

                <CourseStatus status={status}>{t('common:completedText')}</CourseStatus>
              </Grid>
            </>
          ) : (
            <>
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  paddingTop: { xs: '10px', md: '20px !important' },
                  paddingRight: '10px',
                }}
              >
                <CourseProgress>
                  {Number.isInteger(course.progress)
                    ? course.progress
                    : course.progress.toFixed(2)}
                  %
                </CourseProgress>
                <CourseButton status={status} onClick={onCourseBtnClick}>
                  <StyledSpan></StyledSpan>
                </CourseButton>
                <CourseStatus status={status}>{t('common:inProgressText')}</CourseStatus>
              </Grid>
            </>
          )} 
          </>)}
         
        </Grid>
      </CourseListItem>

      <Backdrop
        open={certificateLoading}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.tooltip + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

const EmpCourses = ({ courses }: { courses: UserSubscribedCourseType[] }) => {
  return (
    <>
      <CourseList>
        {courses.map((item, index) => (
          <Course key={index} course={item} />
        ))}
      </CourseList>
    </>
  );
};

export default EmpCourses;
