import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import MuiTabList, { TabListProps } from '@mui/lab/TabList';
import { CourseDetailsType, ExploreCourseItemType } from '../../types/courses';
import Link from 'next/link';
import {
  DialogContent,
  DialogTitle,
  TextareaAutosize,
  TextField,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { TextFieldProps } from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import { useDispatch, useSelector } from 'react-redux';
import { addItemInCart } from '../../store/apps/cart';
import { useContext, useEffect, useState } from 'react';
import { InfoContext } from '../../contexts/InfoContext';
import { AppDispatch, RootState } from '../../store';
import { useRouter } from 'next/router';
import { ReactNode, SyntheticEvent } from 'react';
import { useTranslation } from 'next-i18next';
import TabPanel from '@mui/lab/TabPanel';

const ExploreCourseItemBox = styled(Box)(({ theme }) => ({
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
  [theme.breakpoints.up('lg')]: {
    display: 'block',
    justifyContent: 'space-between',
  },
}));

const CourseTitleText = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.black,
  fontSize: '18px',
  fontFamily: "'Outfit', sans-serif",
  textTransform: 'capitalize',
  marginBottom: '10px',
}));

const CourseDurationText = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.black,
  fontSize: '10px',
  fontFamily: "'Outfit', sans-serif",
  marginBottom: '10px',
}));

const CourseDescriptionSummaryText = styled(Typography)(() => ({
  color: '#666666',
  fontSize: '12px',
  // width: '80%',
  marginTop: '6px',
}));

const CoursePriceText = styled(Typography)(({ theme }) => ({
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

const CourseCompletedText = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  color: '#009405',
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
  fontSize: '12px',
}));

const CoursePlanDetailsText = styled(Typography)(({ theme }) => ({
  fontSize: '10px',
  fontFamily: "'Open Sans', sans-serif",
  color: '#000000',
}));
const TextFieldStyled = styled(TextField)<TextFieldProps>(({ theme }) => ({
  height: '120px',
  '& .MuiInputBase-root': {
    height: '120px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    height: '120px',
  },
}));
const ExploreCourseItem = ({
  course,
  purchased = false,
  completed = false,
  examType,
}: {
  course: ExploreCourseItemType;
  purchased?: boolean;
  completed?: boolean;
  examType: string;
}) => {
  const [qty, setQty] = useState(1);
  const [isCartBtnDisabled, setIsCartBtnDisabled] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isItemInCart, setIsItemInCart] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState('1');
  const { companyInfo, empInfo, isCompany } = useContext(InfoContext);
  const cartInstance = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { t, ready } = useTranslation(['course', 'common']);

  useEffect(() => {
    const itemFromCart = cartInstance.data.items.find(
      (item) => item.courseId === course.id && item.examType === examType
    );
    if (itemFromCart) {
      setQty(itemFromCart.courseCount * qty);
      setIsItemInCart(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartInstance.data.items, course.id]);

  const isCertiCourseExpired = (): boolean => {
    const currentDate = new Date();
    return new Date(course.certificateExpirationDate) < currentDate;
  };
  const onAddClick = () => {
  
    if ((!isItemInCart && !isCompany) || isCompany) {
    
      const reqPayload = isCompany
        ? {
            companyId: companyInfo.id,
            courseId: course.id,
            courseCount: qty,
            examType: examType,
          }
        : {
            userId: empInfo.id,
            courseId: course.id,
            courseCount: 1,
            examType: examType,
          };

      dispatch(addItemInCart(reqPayload));
     
    } else {
      router.push('/cart');
    }
  };
  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogTitle-root': {
      padding: '40px 110px 0 60px',
      marginBottom: '0',
    },
    '& .MuiPaper-rounded': {
      borderRadius: '20px',
    },
    '& .MuiDialogContent-root': {
      [theme.breakpoints.up('sm')]: {
        padding: '20px',
      },
      [theme.breakpoints.up('md')]: {
        padding: '20px 110px 40px 60px',
      },
      [theme.breakpoints.up('lg')]: {
        padding: '0 110px 40px 60px',
      },
      marginBottom: '44px',
    },
    '& .MuiDialogActions-root': {
      padding: '8px 110px 40px 60px',
      justifyContent: 'flex-start',
    },
  }));

  const getPrice = (examType: string) => {
    console.log(examType)
    if (examType === t('Online')) {
      return 50;
      const price = 50;
      if(router.locale === 'ar'){
        const arabicPrice = price.toLocaleString('ar-EG')
        console.log(arabicPrice)
      }
      

    } else if (examType === t('VR')) {
      return 100;
    } else if (examType === t('Live')) {
      return 150;
    }
    return 0;
  };
  return (
    
    <ExploreCourseItemBox>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ width: { xs: '100%', lg: '70%' }, padding: '20px 30px' }}>
          <Link
            href={`/course/details/${course.id}`}
            style={{ textDecoration: 'none' }}
          >
            <CourseTitleText>
              {course.name} {t(`common:${examType}`)}
            </CourseTitleText>
          </Link>
          <CourseDurationText>
            {ready && t('hour', { count: course.totalNoOfHours })} |
            {ready && t('module', { count: course.noOfModules })} |{' '}
            {ready && t('validityText')}
          </CourseDurationText>
          <CourseDescriptionSummaryText>
            {course.shortDescription}
          </CourseDescriptionSummaryText>
        </Box>
        <Box
          sx={{
            width: { xs: '100%', lg: '30%', padding: '20px 30px' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', lg: 'flex-end' },
            rowGap: '5px',
          }}
        >
          <CoursePriceText sx={{ marginRight: '10px' }}>
         &euro; {getPrice(examType)}
          </CoursePriceText>
          {isCompany ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box>
                  <CourseNoEmployeeText
                    variant="subtitle2"
                    sx={{
                      color: '#9A9A9A',
                      display: 'inline-block',
                      verticalAlign: 'middle',
                    }}
                  >
                    {ready && t('selectNoOfEmployee')}
                  </CourseNoEmployeeText>
                </Box>
                <Box>
                  <TextField
                    type="number"
                    value={qty}
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
                    sx={{
                      marginRight: '10px',
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
                </Box>
              </Box>
              <Button
                variant="gradient"
                onClick={onAddClick}
                disabled={isCartBtnDisabled}
                sx={{ textTransform: 'capitalize', minWidth:{xs: 'auto'}}}
              >
                {isItemInCart
                  ? ready && t('common:action.modify')
                  : ready && t('common:action.add')}
              </Button>
            </>
          ) : (
            <>
              {purchased ? (
                <>
                  {completed ? (
                    <CourseCompletedText sx={{ marginRight: '10px' }}>
                      {ready && t('completed')}
                    </CourseCompletedText>
                  ) : (
                    <Button
                      variant="gradient"
                      sx={{minWidth:{xs: 'auto'}}}
                      onClick={() => {
                        router.push(`/course/content-index/${course.id}?examType=${examType}`);
                      }}
                    >
                      {ready && t('goToCourse')}
                    </Button>
                  )}
                </>
              ) : (
                <Button variant="gradient" onClick={onAddClick} sx={{minWidth:{xs: 'auto'}}}>
                  {isItemInCart
                    ? ready && t('goToCart')
                    : ready && t('addToCart')}
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
    </ExploreCourseItemBox>
  );
};

export default ExploreCourseItem;
