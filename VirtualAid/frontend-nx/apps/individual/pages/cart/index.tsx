import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { ProfileLayout } from '../../layouts/components/ProfileLayout';
import { Key, ReactNode, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';

import CartCourseItem from '../../views/courses/CartCourseItem';
import { InfoContext } from '../../contexts/InfoContext';

import { payment } from '../../store/apps/cart';
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

import { useTranslation } from 'next-i18next';
import { CartItemType } from 'apps/individual/types/cart';
import i18next from 'i18next';

const CourseCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cartInstance = useSelector((state: RootState) => state.cart);
  const { companyInfo, isCompany, empInfo } = useContext(InfoContext);

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState(false);
  const [checkoutErrorMsg, setCheckoutErrorMsg] = useState('');
  const [stripeError, setStripeError] = useState(false);
  const [stripeErrorMsg, setStripeErrorMsg] = useState('');

  const { t, ready } = useTranslation(['cart', 'common']);
  console.log(cartInstance.data.totalAmount)
  const router = useRouter();
  //Method to set purchase course details
  const onClickBuy = async () => {
    try {
      setLoadingCheckout(true);
      setCheckoutError(false);
      setStripeError(false);
      setCheckoutErrorMsg('');
      setStripeErrorMsg('');

      let successUrl = '';
      let cancelUrl = '';
      let currentUrl = window.location.href;

      // Remove "/cart" from the current URL
       currentUrl = currentUrl.replace('/cart', '');
      // New API for payment
      successUrl = window.location.origin + "/" + router.locale + '/payments/success';;
      cancelUrl = window.location.origin  + "/" + router.locale + '/payments/failed';


      const purchaseCourseDetails = cartInstance.data.items.map((item) => ({
        courseId: item.courseId,
        examType: item.examType,
        courseName: item.courseDetails.name,
        courseDescription: item.courseDetails.shortDescription,
        unitAmount: item.courseDetails.price,
        currencyType: 'EUR',
        quantity: item.courseCount,
        planType: item.courseCount > 10 ? 'Basic' : 'Standard',
      }));

      const checkoutData = {
        successUrl,
        cancelUrl,
        payerEmail: isCompany ? companyInfo.email : empInfo.email,
        reqPurchaseCourseDetails: purchaseCourseDetails,
        examType: 'Online'
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/payment/payment-check-out`,
        checkoutData,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
        
      );
     

      if (response.status === 200) {
        const stripePromise = loadStripe(response.data.publicKey);
        const stripe = await stripePromise;

        const sessionId = response.data.sessionId;

        const stripeResult = await stripe?.redirectToCheckout({
          sessionId,
        });

        if (stripeResult?.error) {
          setStripeError(true);
          setStripeErrorMsg(
            stripeResult?.error.message
              ? stripeResult?.error.message
              : t('stripeNotOpen')
          );
        }
      } else {
        setLoadingCheckout(false);
        setCheckoutError(true);
        setCheckoutErrorMsg('common:error.unspecific');
      }
    } catch (error) {
      setLoadingCheckout(false);
      setCheckoutError(true);
      setCheckoutErrorMsg('common:error.unspecific');
    }
  };

  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          marginTop: '15px',
          padding: { xs: '0 20px', lg: '0 40px !important' },
        }}
      >
        {cartInstance.data.totalQty <= 0 ? (
          <>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              sx={{ minHeight: '500px' }}
            >
              <img src="/Icon akar-cart.svg" alt="" />
              <br />
              <Typography variant="h5" component="div" color="primary">
                {ready && t('emptyCart')}
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Typography
              sx={{
                color: '#6C107F',
                fontSize: '24px',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {ready && t('shoppingCartTitle')}
            </Typography>
            <Typography
              sx={{
                color: '#000',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                marginBottom: '35px',
              }}
            >
              {ready &&
                t('cartTotalCourse', { count: cartInstance.data.totalQty })}
            </Typography>
            <Grid
              container
              className="profile-layout"
              component="main"
              sx={{ height: '100vh' }}
            >
              {/* grid left shopping container */}
              <Grid item xs={12} md={12} lg={8}>
                {cartInstance.data.items.map((item: CartItemType, index: Key | null | undefined) => (
                  <CartCourseItem item={item} key={index} />
                ))}
              </Grid>
              <Grid
                item
                xs={12}
                md={12}
                lg={4}
                sx={{ px: { xs: 0, md: 3 }, py: { xs: 1, sm: 2, lg: 0 } }}
              >
                <Typography
                  sx={{
                    color: '#9A9A9A',
                    fontFamily: "'Open Sans', sans-serif",
                    margin: { xs: '0', md: '0px 0 10px 0' },
                  }}
                >
                  {ready && t('total')}
                </Typography>
                <Typography
                  sx={{
                    color: '#000000',
                    fontFamily: "'Open Sans', sans-serif, Semibold",
                    fontSize: '36px',
                    margin: { xs: '0', md: '0 0 20px 0' },
                    fontWeight: '500',
                  }}
                >
                  {cartInstance.data.totalAmount}
                </Typography>
                {checkoutError && (
                  <Alert severity="error" sx={{ margin: '0 0 20px 0' }}>
                    {checkoutErrorMsg}
                  </Alert>
                )}
                {stripeError && (
                  <Alert severity="error" sx={{ margin: '0 0 20px 0' }}>
                    {stripeErrorMsg}
                  </Alert>
                )}
                <Button
                  variant="gradient"
                  sx={{ width: '100%', margin: { xs: '0', md: '0 0 40px 0' } }}
                  disabled={
                    cartInstance.loading ||
                    cartInstance.data.totalQty <= 0 ||
                    loadingCheckout
                  }
                  onClick={onClickBuy}
                >
                  {cartInstance.loading || loadingCheckout ? (
                    <CircularProgress size="1.75rem" />
                  ) : (
                    <>{ready && t('buyNow')}</>
                  )}
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

CourseCart.authGuard = true;

CourseCart.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default CourseCart;
