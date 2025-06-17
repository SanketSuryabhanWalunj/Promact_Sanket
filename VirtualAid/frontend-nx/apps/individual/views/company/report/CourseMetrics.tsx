import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

import EastIcon from '@mui/icons-material/East';

import { useCallback, useContext, useEffect, useState } from 'react';

import { InfoContext } from '../../../contexts/InfoContext';
import axios from 'axios';
import { ReportCourseMetricType } from '../../../types/courses';
import CourseMetricsTable from './CourseMetricsTable';
import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';

const CourseMatrics = () => {
  const { companyInfo } = useContext(InfoContext);
  const [courseMetricList, setCourseMetricList] = useState<
    ReportCourseMetricType[]
  >([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isDataErr, setIsDataErr] = useState(false);
  const [dataErrMsg, setDataErrMsg] = useState('');
  const [showBtn, setShowBtn] = useState(false);
  const router = useRouter();

  const { t, ready } = useTranslation(['company', 'common']);

  const getCourseMetrics = useCallback(async () => {
    try {
      setIsDataLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company-dashboard/course-metric/${companyInfo.id}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        const receivedData = response.data;
        if (receivedData.length > 5) {
          setShowBtn(true);
        }
        setCourseMetricList(receivedData.slice(0, 5));
        setIsDataLoading(false);
        setIsDataErr(false);
        setDataErrMsg('');
      }
    } catch (error) {
      setIsDataLoading(false);
      setIsDataErr(true);
      setDataErrMsg(t('common:somethingWentWrong'));
    }
  }, [companyInfo.id]);

  useEffect(() => {
    getCourseMetrics();
  }, [getCourseMetrics]);

  return (
    <>
      {isDataLoading || !ready ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="300px"
          sx={{ margin: '12px 0 43px 0' }}
        />
      ) : (
        <>
          {isDataErr ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ margin: '12px 0 43px 0' }}
            >
              {dataErrMsg}
            </Box>
          ) : (
            <>
              {courseMetricList.length > 0 ? (
                <Box sx={{ marginBottom: '43px' }}>
                  <Typography
                    sx={{
                      color: '#6C107F',
                      fontSize: '14px',
                      fontFamily: 'Outfit, Regular',
                    }}
                  >
                    {t('courseWiseMetrics')}
                  </Typography>
                  <CourseMetricsTable courseMetricList={courseMetricList} />
                  {showBtn && (
                    <Button
                      variant="outlined"
                      sx={{
                        margin: '12px 0 0 0',
                        borderColor: '#666',
                        color: '#666666',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                      }}
                      onClick={() =>
                        router.push(`/company/report/course-matrics`)
                      }
                    >
                      {t('viewAll')}
                      <EastIcon />
                    </Button>
                  )}
                </Box>
              ) : null}
            </>
          )}
        </>
      )}
    </>
  );
};

export default CourseMatrics;
