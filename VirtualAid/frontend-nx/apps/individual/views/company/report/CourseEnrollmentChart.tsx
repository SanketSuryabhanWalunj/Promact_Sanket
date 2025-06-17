import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import ImportContactsIcon from '@mui/icons-material/ImportContacts';

import dynamic from 'next/dynamic';

import { InfoContext } from '../../../contexts/InfoContext';
import axios from 'axios';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

// import { ReportCourseMetricType } from '../../../types/courses';
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });


const CourseEnrollmentChart = () => {
  const { companyInfo } = useContext(InfoContext);
  // const [courseMetricList, setCourseMetricList] = useState<
  //   ReportCourseMetricType[]
  // >([]);
  const router = useRouter()
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const [optionsForChart, setOptionsForChart] = useState(null);
  const [seriesForChart, setSeriesForChart] = useState<{ data: number[] }[]>(
    []
  );
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isDataErr, setIsDataErr] = useState(false);
  const [dataErrMdg, setDataErrMsg] = useState('');
  

  


  const getCourseMetrics = useCallback(async () => {
    try {
      const option =  {
    
        chart: {
          id: 'courses-enrolled',
        },
        legend: {
          show: false, // This will hide the legend
        },
        plotOptions: {
          bar: {
            borderRadius: 0,
            distributed: true,
            horizontal: true,
          },
        },
        grid: {
          show: false,
        },
        colors: ['#133F5C', '#59508D', '#BC5090', '#EB5F5E', '#F3A533'],
        stroke: {
          width: 1,
          colors: ['#fff'],
        },
        dataLabels: {
          enabled: true,
          textAnchor: 'start' as const,
          style: {
            colors: ['#fff'],
          },
          formatter: function (
            val: string,
            opt: {
              w: { globals: { labels: { [x: string]: string } } };
              dataPointIndex: string | number;
            }
          ) {
            return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val;
          },
          offsetX: 0,
          dropShadow: {
            enabled: false,
          },
        },
        xaxis: {
          categories: [],
          legend: {
            show: false,
          },
          title: {
            text: t('noOfEmplyeesText'),
            style: {
              fill: '#666666 !important',
              fontSize: '12px',
              fontFamily: 'Outfit, Medium',
              cssClass: 'apexcharts-xaxis-title',
            },
          },
        },
        yaxis: {
          labels: {
            show: false,
          },
          title: {
            text: t('courseName'),
            style: {
              color: '#666666 !important',
              fontSize: '12px',
              fontFamily: 'Outfit, Medium',
              cssClass: 'apexcharts-yaxis-title',
            },
          },
        },
        title: {
          text: t('common:mostEnrolledEmpText'),
          align: 'left' as const,
          floating: true,
          style: {
            color: '#666666',
            fontFamily: 'Outfit, Medium',
            fontSize: '20px',
            fontWeight: '500',
            marginBottom: '20px',
            cssClass: 'top-title-chart',
          },
        },
        tooltip: {
          theme: 'dark',
          x: {
            show: true,
          },
          y: {
            title: {
              formatter: function () {
                return '';
              },
            },
          },
        },
      }
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
        // setCourseMetricList(response.data);
        const newData = JSON.parse(JSON.stringify(option));
        const x = [];
        const y = [];
        const arr = response.data;
        for (let i = 0; i < arr.length; i++) {
          x.push(arr[i].courseName);
          y.push(arr[i].enrolledCount);
        }
        newData.xaxis.categories = x;
        if (x.length > 0) {
          setOptionsForChart(newData);
        }
        setSeriesForChart([{ data: y }]);
        setIsDataLoading(false);
      }
    } catch (error) {
      setIsDataLoading(false);
      setIsDataErr(false);
      setDataErrMsg(t('common:somethingWentWrong'));
    }
  }, [companyInfo.id]);

  useEffect(() => {
   if(ready){
    getCourseMetrics();
   }
      
    
  }, [ready,getCourseMetrics]);
  

  return (
    <>
      {isDataLoading ? (
        <Skeleton variant="rectangular" width="100%" height="350px" />
      ) : (
        <>
          {isDataErr ? (
            <Box display="flex" alignItems="flex" justifyContent="flex">
              {dataErrMdg}
            </Box>
          ) : (
            <div
              id="chart"
              style={{
                border: '1px solid #E5E5E5',
                borderRadius: '16px',
                padding: '26px 44px 24px 28px',
                marginBottom: '50px',
              }}
            >
              {ready ? (
                <>
                  {optionsForChart && (
                    <ApexChart
                      options={optionsForChart}
                      series={seriesForChart}
                      type="bar"
                      height={350}
                    />
                  )}
                </>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <ImportContactsIcon
                    sx={(theme) => ({
                      fontSize: '100px',
                      color: theme.palette.primary.main,
                    })}
                  />
                  <Typography variant="h6" component="div" color="primary">
                    {t('common:noCoursesEnrolled')}
                  </Typography>
                </Box>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default CourseEnrollmentChart;
