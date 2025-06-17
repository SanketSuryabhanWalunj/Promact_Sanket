import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import PaymentLayout from '../../../layouts/components/PaymentLayout';
import { AppDispatch } from '../../../store';
import { emptyCart } from '../../../store/apps/cart';
import { InfoContext } from '../../../contexts/InfoContext';
import axios from 'axios';

import { useTranslation } from 'next-i18next';
import CompanyDetails from '../../company/details';

const PaymentSuccess = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { empInfo, isCompany, companyInfo } = useContext(InfoContext);

  const [assigningCourse, setAssiginingCourse] = useState(false);
  const [assignedSuccessfully, setAssignedSuccessfully] = useState(true);
  const [assignErr, setAssignErr] = useState(false);

  const { t, ready } = useTranslation(['payment', 'common']);

  const onGoToDashboardClick = () => {
    router.replace('/');
  };
  const deleteCart = useCallback(async () => {
    try {
      
    if(isCompany) {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/cart/cart-for-user/${companyInfo.id}`,
        
      );
      if (response.status === 200) {
      
      }
    }else {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/cart/cart-for-user/${empInfo.id}`,
      );
      if (response.status === 200) {
        
      } 
    }
      
    } catch (error) {
     
    }
  }, []);
  useEffect(() => {
    deleteCart();
 
   const timer = setTimeout(() => {
      dispatch(emptyCart());
    }, 3000);
     // Clear the timer when component unmounts or when dependency changes
     return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);
  
  //NOTE: code is commented for testing purpose
  // const assignCourseToUser = useCallback(async () => {
  //   try {
  //     setAssiginingCourse(true);
  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/assign-course-to-user/${empInfo.id}`
  //     );

  //     if (response.status === 200 || response.status === 204) {
  //       setAssiginingCourse(false);
  //       setAssignedSuccessfully(true);
  //     } else {
  //       setAssiginingCourse(false);
  //       setAssignErr(true);
  //     }
  //   } catch (error) {
  //     setAssiginingCourse(false);
  //     setAssignErr(true);
  //   }
  // }, [empInfo.id]);

  // useEffect(() => {
  //   if (!isCompany) {
  //     assignCourseToUser();
  //   }
  // }, [assignCourseToUser, isCompany]);

  if (!ready) {
    return <></>;
  }

  return (
    <>
      <Box
        sx={{
          textAlign: 'center',
          height: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <img src="/verify.png" alt="" style={{ marginBottom: '12px' }} />
        <Typography
          sx={{
            color: '#000',
            fontSize: '30px',
            marginBottom: '12px',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            margiBottom: '12px',
          }}
        >
          {t('success')}
        </Typography>

        <Typography
          sx={{
            color: '#666666',
            fontSize: '18px',
            fontFamily: 'Open Sans, Regular',
            marginBottom: '66px',
          }}
        >
          {t('paymentSuccess')}
        </Typography>

        {!isCompany && assigningCourse && (
          <>
            <CircularProgress sx={{ color: '#666666' }} />
            <Typography
              sx={{
                color: '#666666',
                fontSize: '18px',
                fontFamily: 'Open Sans, Regular',
                marginBottom: '66px',
              }}
            >
              {t('assigningCourses')}
            </Typography>
          </>
        )}

        {(!isCompany || assignedSuccessfully) && (
          <Typography
            sx={{
              color: '#666666',
              fontSize: '18px',
              fontFamily: 'Open Sans, Regular',
              marginBottom: '66px',
            }}
          >
            {t('purchasedCoursesActivated')}
          </Typography>
        )}

        {(isCompany || assignedSuccessfully) && (
          <Button
            onClick={onGoToDashboardClick}
            sx={{
              color: '#ffffff',
              fontSize: '18px',
              fontFamily: "'Outfit', sans-serif",
              minWidth: '320px',
              margin: '0 auto',
              background: '#38E894',
              borderRadius: '7px',
              '&:hover': {
                background: '#38E894',
                color: '#fff',
              },
            }}
          >
            {t('common:action.goToDashboard')}
          </Button>
        )}
      </Box>
    </>
  );
};

PaymentSuccess.authGuard = true;

PaymentSuccess.getLayout = (page: ReactNode) => (
  <PaymentLayout>{page}</PaymentLayout>
);

export default PaymentSuccess;
