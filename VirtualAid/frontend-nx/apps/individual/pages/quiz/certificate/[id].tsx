import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import axios from 'axios';

import EmptyQuizLayout from '../../../layouts/components/EmptyQuizLayout';

import { InfoContext } from '../../../contexts/InfoContext';

import { useTranslation } from 'next-i18next';

const CoursesCertificate = () => {
  const { empInfo } = useContext(InfoContext);

  const router = useRouter();

  const [percentage, setPercentage] = useState(0);
  const [percentageLoading, setPercentageLoading] = useState(false);
  const [percentageError, setPercentageError] = useState(false);

  const [certiLoading, setCertiLoading] = useState(false);
  const [certiErr, setCertiErr] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [consentStatus, setConsentStatus] = useState(false);

  const [dataConsentLoading, setDataConsentLoading] = useState(false);
  const [dataConsentErr, setDataConcentErr] = useState(false);
  const [dataConsentProvided, setDataConsentProvided] = useState(false);

  const { t, ready } = useTranslation(['quiz', 'common']);

 // Method to get percentage 
  const getPercentage = useCallback(async () => {
    try {
      setPercentageLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/exam/exam-percentage`,
        {
          params: {
            userId: empInfo.id,
            examDetailId: router.query.id,
            examType: router.query.examType,
          },
        }
      );
      if (response.status === 200) {
        setPercentage(response.data);
        setPercentageLoading(false);
      } else {
        setPercentageLoading(false);
        setPercentageError(true);
      }
    } catch (error) {
      setPercentageLoading(false);
      setPercentageError(true);
    }
  }, [empInfo.id, router.query.id]);

 // Method to get certificate
  const getCertificate = useCallback(async () => {
    try {
      
      setCertiLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/download-certificate`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        },
        {
          params: {
            userId: empInfo.id,
            examDetailId: router.query.id,
            examType: router.query.examType,
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
          filename || `certificate-${router.query.id}-${empInfo.id}`
        );
        el.click();

        window.URL.revokeObjectURL(href);
        setCertiLoading(false);
        setCertiErr(false);
      } else {
        setCertiLoading(false);
        setCertiErr(true);
      }
    } catch (error) {
      setCertiLoading(false);
      setCertiErr(true);
    }
  }, [empInfo.id, router.query.id]);

   // Method to make course completed
  const makeCourseCompleted = useCallback(async () => {

    const responseNew = await axios.post(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/api/app/course/course-completed?userId=${empInfo.id}&courseId=${router.query.courseId}&examType=${router.query.examType}`
    );

    if (responseNew.status === 204) {
      setIsCourseCompleted(true);
      setCertiLoading(false);
      setCertiErr(false);
    } else {
      setCertiLoading(false);
      setCertiErr(true);
    }
  }, []);

 // Method to provide consent 
 // @param: status for getting status of consent
  const provideShareDataConsent = useCallback(async (status: boolean) => {
    try {
      setDataConsentLoading(true);
      setConsentStatus(status);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/provide-consent-to-share-data?isConsentProvided=${status}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );

      if (response.status === 200) {
        setDataConsentLoading(false);
        setDataConcentErr(false);
        setDataConsentProvided(true);
      } else {
        setDataConsentLoading(false);
        setDataConcentErr(true);
      }
    } catch (error) {
      setDataConsentLoading(false);
      setDataConcentErr(true);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      getPercentage();
      makeCourseCompleted();  
    }
    
    const handleBackButton = (event: { preventDefault: () => void; }) => {
      if (router.pathname !== 'user/dashboard') {
        event.preventDefault(); // Prevent the default behavior of the back button
        router.push('/user/dashboard'); // Redirect to the dashboard page
      }
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [getPercentage, router.isReady, router]);
  

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
          }}
        >
          {percentageLoading || !ready ? (
            <Box display="flex" alignItems="center" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {percentageError ? (
                <Box display="flex" alignItems="center" justifyContent="center">
                  {t('common:error.unspecific')}
                </Box>
              ) : (
                <>
                  <img src="/certificate.png" alt="img1" />
                  <Typography
                    sx={{
                      fontSize: { xs: '20px', md: '24px' },
                      fontFamily: 'Outfit, Medium',
                      fontWeight: 'bold',
                      marginBottom: '16px',
                    }}
                  >
                    {t('congratsOnComplete')}
                    
                  </Typography>
                  {/* Note:This code is commented due to total grade */}
                  {/* <Typography
                    sx={{
                      color: '#666666',
                      fontSize: { xs: '16px', md: '20px' },
                      fontFamily: 'Outfit, Regular',
                      verticalAlign: 'middle',
                      marginBottom: '16px',
                    }}
                  >
                    {t('totalGrade', {
                      score: Number.isInteger(percentage)
                        ? percentage
                        : percentage?.toFixed(2),
                    })}
                  </Typography> */}
                  <Button
                    variant="gradient"
                    disabled={certiLoading}
                    sx={{
                      gap: '10px',
                      fontSize: { xs: '14px', md: '18px' },
                      textAlign: 'center',
                      display: 'inline-block',
                      marginRight: '10px',
                    }}
                    onClick={getCertificate}
                  >
                    {(certiLoading && !isCourseCompleted) ? (
                      <>
                        <CircularProgress size="24px" />
                      </>
                    ) : (
                      <>
                        <FileDownloadOutlinedIcon
                          sx={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                          }}
                        />
                        {t('certificate')}
                      </>
                    )}
                  </Button>

                  {certiErr && (
                    <Alert severity="error" sx={{ mt: '20px' }}>
                      {t('unableToDownloadCerti')}
                    </Alert>
                  )}
                  <Divider
                    sx={{
                      width: '80%',
                      margin: { xs: '20px auto', md: '30px auto' },
                    }}
                  />
                  {!empInfo.consentToShareData && !dataConsentProvided && (
                    <>
                      <Typography
                        sx={{
                          color: '#666666',
                          fontSize: '14px',
                          fontFamily: 'Open Sans, Regular',
                          marginBottom: '30px',
                          width: '534px',
                          maxWidth: '100%',
                          margin: '0 auto 24px auto',
                        }}
                      >
                        {t('consentQuestion')}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '20px',
                          marginBottom: '24px',
                        }}
                      >
                        <Button
                          variant="gradient"
                          onClick={() => provideShareDataConsent(true)}
                          disabled={dataConsentLoading}
                        >
                          {dataConsentLoading ? (
                            <CircularProgress size="28px" />
                          ) : (
                            <>{t('common:action.yes')}</>
                          )}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => provideShareDataConsent(false)}
                          disabled={dataConsentLoading}
                        >
                          {t('common:action.no')}
                        </Button>
                      </Box>
                    </>
                  )}
                  {dataConsentProvided && (
                    <>
                      <Typography sx={{ color: '#666' }}>
                        {consentStatus
                          ? t('dataConsentProvided')
                          : t('dataConsentNotProvided')}
                      </Typography>
                      <br />
                    </>
                  )}
                  {dataConsentErr && (
                    <>
                      <Alert severity="error">
                        {t('unableToProvideConsent')}
                      </Alert>
                      <br />
                    </>
                  )}
                  <Button
                    variant="outlined"
                    onClick={() => {
                      router.push(`/${router.locale}`);
                    }}
                  >
                    {t('common:action.backToDashboard')}
                  </Button>
                </>
              )}
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

CoursesCertificate.individualGuard = true;

CoursesCertificate.getLayout = (page: ReactNode) => (
  <EmptyQuizLayout>{page}</EmptyQuizLayout>
);
export default CoursesCertificate;
