import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { styled } from '@mui/material/styles';

import Link from 'next/link';

import { CartItemType } from '../../types/cart';
import { useContext, useEffect, useState } from 'react';
import Tab from '@mui/material/Tab';

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';

import MuiTabList, { TabListProps } from '@mui/lab/TabList';
import { InfoContext } from '../../contexts/InfoContext';
import { useRouter } from 'next/router';
import TabPanel from '@mui/lab/TabPanel';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { addItemInCart, removeItemFromCart } from '../../store/apps/cart';
import { SyntheticEvent } from 'react';
import { useTranslation } from 'next-i18next';
import { padding } from '@mui/system';

const ExploreCartCourseItemBox = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: '20px',
  position: 'relative',
  background:
    'linear-gradient(180deg, rgba(241,241,241,1) 0%, rgba(255,255,255,1) 100%)',
  borderRadius: '20px',
  alignItems: 'center',

  border: '1px solid #EEEEEE',
  height: 'auto',
  display: 'block',
  justifyContent: 'normal',
  // [theme.breakpoints.up('md')]: {
  //   padding: '20px 30px 20px 50px',
  // },
  // [theme.breakpoints.up('xs')]: {
  //   padding: '15px',
  // },
}));

const TopCartCourseItem = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const BottomCartCourseItem = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '45px',
  },
}));

const CourseTitleText = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.black,
  fontSize: '18px',
  fontFamily: "'Outfit', sans-serif",
  textTransform: 'capitalize',
}));
const CoursePlanDetailsText = styled(Typography)(({ theme }) => ({
  fontSize: '10px',
  fontFamily: "'Open Sans', sans-serif",
  color: '#000000',
  marginTop: '10px',
  textAlign: 'right',
}));

const CourseDurationText = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.black,
  fontSize: '10px',
  fontFamily: "'Outfit', sans-serif",
  marginTop: '10px',
}));

const CourseDescriptionSummaryText = styled(Typography)(() => ({
  color: '#666666',
  fontSize: '12px',
  width: '100%',
  marginTop: '10px',
}));

const CoursePriceText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Open Sans', sans-serif",
  color: '#9A9A9A',
  fontSize: '16px',
  whiteSpace: 'nowrap',
  marginTop: '10px',
  [theme.breakpoints.up('xs')]: {
    marginTop: '5px',
    marginBottom: '5px',
  },
}));
const CoursePriceTextCompany = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  color: '#6C107F',
  fontFamily: "'Open Sans', sans-serif",
  fontWeight: '600',
  marginTop: '10px',
  [theme.breakpoints.up('md')]: {
    textAlign: 'right',
    marginTop: 0,
  },
}));

const CourseNoEmployeeText = styled(Typography)(({ theme }) => ({
  display: 'inline-block',
  verticalAlign: 'middle',
  color: '#9A9A9A',
  [theme.breakpoints.up('md')]: {
    fontSize: '16px',
  },
  [theme.breakpoints.up('xs')]: {
    fontSize: '12px',
  },
}));

const CourseSubTotalEmployee = styled(Typography)(({ theme }) => ({
  color: '#9A9A9A',
  fontFamily: "'Open Sans', sans-serif",
  marginRight: '6px',
  display: 'inline-block',
  verticalAlign: 'middle',
  [theme.breakpoints.up('md')]: {
    fontSize: '16px',
  },
  [theme.breakpoints.up('xs')]: {
    fontSize: '14px',
  },
}));

const CartCourseItem = ({ item }: { item: CartItemType }) => {
  const [qty, setQty] = useState(1);
  const [standardQty, setStandardQty] = useState(11);
  const [isCartBtnDisabled, setIsCartBtnDisabled] = useState(false);
  const { companyInfo, isCompany, empInfo } = useContext(InfoContext);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState('1');
  const dispatch = useDispatch<AppDispatch>();
  const [isItemInCart, setIsItemInCart] = useState(false);
  const cartInstance = useSelector((state: RootState) => state.cart);

  const [isModifyBtnDisabled, setIsModifyBtnDisabled] = useState(false);

  const { t, ready } = useTranslation(['course', 'cart', 'common']);
  const router = useRouter();

  useEffect(() => {
    const itemFromCart = cartInstance.data.items.find(
      (cartItem: { courseId: string; examType: string; }) =>
        cartItem.courseId === item.courseId && cartItem.examType === item.examType
    );
    setIsItemInCart(!!itemFromCart); // Set isItemInCart based on whether the item is found in the cart

  }, [cartInstance.data.items, item.courseId, item.examType]);

  const onAddClick = (plan: string) => {
    if ((!isItemInCart && !isCompany) || isCompany) {
      const reqPayload = isCompany
        ? {
            companyId: companyInfo.id,
            courseId: item.courseId,
            courseCount:
              plan === (t('common:BasicText')) ? qty : plan === (t('common:stnText')) ? standardQty : 0,
            examType: item.examType,
          }
        : {
            userId: empInfo.id,
            courseId: item.courseId,
            courseCount: 1,
            examType: item.examType,
          };

      dispatch(addItemInCart(reqPayload));
    } else {
      router.push('/cart');
    }
  };
  useEffect(() => {
    setQty(item.courseCount);
    setStandardQty(item.courseCount);
    setCurrentTabValue(item.courseCount < 11 ? "1": "2")
    if (isItemInCart) {
      setIsModifyBtnDisabled(true);
      
    } else {
      setIsModifyBtnDisabled(false);
    }
  }, [item.courseCount]);

  const onClickModify = () => {
    const reqPayload = {
      companyId: companyInfo.id,
      courseId: item.courseId,
      courseCount: qty,
      examType: item.examType,
    };

    dispatch(addItemInCart(reqPayload));
  };

  const onRemoveClick = () => {
    const deleteReqData = {
      cartId: item.id,
    };
    dispatch(removeItemFromCart(deleteReqData));
  };
  const handleTabChange = (event: SyntheticEvent, newValue: string) => {
    setCurrentTabValue(newValue);
    setIsSubmitError(false);
  };
  const getPrice = (examType: string, plan: string) => {
    if (examType === ('Online')) {
      if (plan === ('basic')) {
        return 50;
      } else plan === ('stn');
      {
        return 45;
      }
    } else if (examType === ('VR')) {
      if (plan === ('basic')) {
        return 100;
      } else (plan === ('stn'));
      {
        return 95;
      }
    } else if (examType === ('Live')) {
      if  (plan === ('basic')) {
        return 150;
      } else  (plan === ('stn'));
      {
        return 145;
      }
    }
    return 0;
  };
  return (
    <ExploreCartCourseItemBox>
      {isCompany ? (
        <TabContext value={currentTabValue}>
          <TabList
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              padding: '0 20px 0 20px',
              borderBottom: '1px solid #ddd',
              background:
                'linear-gradient(180deg, rgba(241,241,241,1) 0%, rgba(255,255,255,1) 100%);',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
            }}
          >
            <Tab
              value="1"
              label={ready ? t('basicPlan') : ''}
              sx={{ maxWidth: '150px' }}
              disabled={isItemInCart} 
            />
            <Tab
              value="2"
              label={ready ? t('standardPlan') : ''}
              sx={{ maxWidth: '150px' }}
              disabled={isItemInCart} 
            />

            <Button
              variant="text"
              disabled={cartInstance.loading}
              onClick={onRemoveClick}
              sx={{
                color: '#2A2A2A',
                fontSize: '12px',
                p: 0,
                width: '100px',
                textAlign: 'right',
                marginLeft: '10px',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                justifyContent: 'flex-end',
              }}
            >
              {ready && t('common:action.remove')}
            </Button>
          </TabList>
          <TabPanel value="1" sx={{ padding: '0' }}>
            {' '}
            <TopCartCourseItem>
              <Box sx={{ padding: { md:'20px 0 20px 20px', xs: '20px'}, width: {md: '50%', xs: '100%'} }}>
                <Link
                  href={`/course/details/${item.courseId}`}
                  style={{ textDecoration: 'none' }}
                >
                  <CourseTitleText>
                    {item.courseDetails.name} {item.examType}
                  </CourseTitleText>
                </Link>
                <CourseDurationText>
                  {ready &&
                    t('hour', {
                      count: item.courseDetails.totalNoOfHours,
                    })}{' '}
                  |
                  {ready &&
                    t('module', { count: item.courseDetails.noOfModules })}{' '}
                  | {ready && t('validityText')}
                </CourseDurationText>
                <CourseDescriptionSummaryText>
                  {item.courseDetails.shortDescription}
                </CourseDescriptionSummaryText>
              </Box>
              {isCompany && (
                <Box sx={{ padding: { md:'20px 20px 20px 0', xs: '20px'}, width: {md: '50%', xs: '100%'} }}>
                  <CoursePriceTextCompany>
                     &euro;{getPrice(item.examType, 'basic') * qty}
                  </CoursePriceTextCompany>
                  {item.examType === t('common:OnlineText') && (<CoursePlanDetailsText>
              {ready && t('basicPlanDetailsOnline')}
            </CoursePlanDetailsText>)}
            {item.examType === t('common:liveText') && (<CoursePlanDetailsText>
              {ready && t('basicPlanDetailsLive')}
            </CoursePlanDetailsText>)}
            {item.examType === t('common:vrText') && (<CoursePlanDetailsText>
              {ready && t('basicPlanDetailsVR')}
            </CoursePlanDetailsText>)}
                  <Box sx={{ marginTop: '10px' }}>
                    <CourseNoEmployeeText sx={{ display: 'inline-block' }}>
                      {ready && t('selectNoOfEmployee')}
                    </CourseNoEmployeeText>
                    <TextField
                      type="number"
                      value={qty}
                      sx={{
                        width: '54px',
                        height: '36px',
                        marginLeft: '8px',
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        marginRight: '20px',
                        '& .MuiInputBase-root': {
                          height: '36px !important',
                        },
                        '& .MuiInputBase-input': {
                          paddingLeft: '8px',
                          paddingRight: '2px',
                        },
                      }}
                      InputProps={{
                        inputProps: { min: 0, max: 10 },
                      }}
                      onChange={(event) => {
                        if (Number(event.target.value) <= 0) {
                          setQty(0);
                          setIsModifyBtnDisabled(true);
                        } else {
                          setQty(item.courseCount);
                          setIsModifyBtnDisabled(false);
                        }
                      }}
                    />
                    <Button
                      variant="gradient"
                      onClick={() => onAddClick('basic')}
                      disabled={isCartBtnDisabled}
                      sx={{
                        textTransform: 'capitalize',
                        minWidth: '62px',
                        borderRadius: '4px',
                        height: '36px',
                      }}
                    >
                      {isItemInCart
                        ? ready && t('common:action.modify')
                        : ready && t('common:action.add')}
                    </Button>
                  </Box>
                </Box>
              )}
            </TopCartCourseItem>
          </TabPanel>
          <TabPanel value="2" sx={{ padding: '0' }}>
            {' '}
            <TopCartCourseItem>
              <Box sx={{ padding: '20px 0 20px 20px', width: '50%' }}>
                <Link
                  href={`/course/details/${item.courseId}`}
                  style={{ textDecoration: 'none' }}
                >
                  <CourseTitleText>
                    {item.courseDetails.name} {item.examType}
                  </CourseTitleText>
                </Link>
                <CourseDurationText>
                  {ready &&
                    t('hour', {
                      count: item.courseDetails.totalNoOfHours,
                    })}{' '}
                  |
                  {ready &&
                    t('module', { count: item.courseDetails.noOfModules })}{' '}
                  | {ready && t('validityText')}
                </CourseDurationText>
                <CourseDescriptionSummaryText>
                  {item.courseDetails.shortDescription}
                </CourseDescriptionSummaryText>
              </Box>
              {isCompany && (
                <Box sx={{ padding: '20px 20px 20px 0', width: '50%' }}>
                  <CoursePriceTextCompany>
                  &euro;{getPrice(item.examType, 'stn') * qty}
                  </CoursePriceTextCompany>
                  
            {item.examType === t('common:OnlineText')&& (<CoursePlanDetailsText>
              {ready && t('standardPlanDetailsOnline')}
            </CoursePlanDetailsText>)}
            {item.examType === t('common:liveText') && (<CoursePlanDetailsText>
              {ready && t('standardPlanDetailsLive')}
            </CoursePlanDetailsText>)}
            {item.examType === t('common:vrText') && (<CoursePlanDetailsText>
              {ready && t('standardPlanDetailsVR')}
            </CoursePlanDetailsText>)}
                  <Box sx={{ marginTop: '10px' }}>
                    <CourseNoEmployeeText sx={{ display: 'inline-block' }}>
                      {ready && t('selectNoOfEmployee')}
                    </CourseNoEmployeeText>

                    <TextField
                      type="number"
                      value={standardQty}
                      InputProps={{
                        inputProps: { min: 11, max: 100 },
                      }}
                      onChange={(event) => {
                        if (Number(event.target.value) <= 11) {
                          setStandardQty(item.courseCount);
                          setIsCartBtnDisabled(true);
                        } else {
                          setStandardQty(item.courseCount)
                          setStandardQty(Number(event.target.value));
                          setIsCartBtnDisabled(false);
                        }
                      }}
                      sx={{
                        marginRight: '20px',
                        width: '54px',
                        height: '36px',
                        marginLeft: '8px',
                        '& .MuiInputBase-root': {
                          height: '36px !important',
                        },
                        '& .MuiInputBase-input': {
                          paddingLeft: '8px',
                          paddingRight: '2px',
                        },
                      }}
                    />

                    <Button
                      variant="gradient"
                      onClick={() => onAddClick('stn')}
                      disabled={isCartBtnDisabled}
                      sx={{
                        textTransform: 'capitalize',
                        minWidth: '62px',
                        borderRadius: '4px',
                        height: '36px',
                      }}
                    >
                      {isItemInCart
                        ? ready && t('common:action.modify')
                        : ready && t('common:action.add')}
                    </Button>
                  </Box>
                </Box>
              )}
            </TopCartCourseItem>
          </TabPanel>
        </TabContext>
      ) : (
        <>
          <TopCartCourseItem>
            <Box sx={{ padding: '20px' }}>
              <Link
                href={`/course/details/${item.courseId}`}
                style={{ textDecoration: 'none' }}
              >
                <CourseTitleText>{item.courseDetails.name} {item.examType}</CourseTitleText>
              </Link>
              <CourseDurationText>
                {ready &&
                  t('hour', { count: item.courseDetails.totalNoOfHours })}{' '}
                |
                {ready &&
                  t('module', { count: item.courseDetails.noOfModules })}
              </CourseDurationText>
              <CourseDescriptionSummaryText>
                {item.courseDetails.shortDescription}
              </CourseDescriptionSummaryText>
            </Box>
            {isCompany && (
              <Box>
                <CoursePriceText>
                  {ready &&
                    t('cart:costForOneEmp', { cost: item.courseDetails.price })}
                </CoursePriceText>
              </Box>
            )}
          </TopCartCourseItem>
          <BottomCartCourseItem>
            <Box sx={{ padding: '20px' }}>
              {isCompany ? (
                <>
                  <CourseNoEmployeeText>
                    {ready && t('selectNoOfEmployee')}
                  </CourseNoEmployeeText>
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
                        setIsModifyBtnDisabled(true);
                      } else {
                        setQty(Number(event.target.value));
                        setIsModifyBtnDisabled(false);
                      }
                    }}
                  />
                  <Button
                    variant="gradient"
                    sx={{
                      margin: { xs: '0', sm: '0 20px' },
                      fontSize: '12px',
                    }}
                    onClick={onClickModify}
                    disabled={cartInstance.loading || isModifyBtnDisabled}
                  >
                    {ready && t('common:action.modify')}
                  </Button>
                </>
              ) : (
                <></>
              )}
              <Button
                variant="text"
                disabled={cartInstance.loading}
                onClick={onRemoveClick}
                sx={{
                  color: '#2A2A2A',
                  fontSize: '12px',
                  p: 0,
                  minWidth: 'fit-content',
                  marginLeft: '10px',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {ready && t('common:action.remove')}
              </Button>
            </Box>
            <Box sx={{ padding: '20px' }}>
              <CourseSubTotalEmployee>
                {ready && t('cart:subTotal', { count: item.courseCount })}:
              </CourseSubTotalEmployee>
              <Typography
                sx={{
                  color: '#000000',
                  fontSize: '20px',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                }}
              >
                  &euro;{item.courseCount * item.courseDetails.price}
              </Typography>
            </Box>
          </BottomCartCourseItem>
        </>
      )}
    </ExploreCartCourseItemBox>
  );
};

export default CartCourseItem;
