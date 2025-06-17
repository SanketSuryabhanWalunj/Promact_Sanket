import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useForm, Controller } from 'react-hook-form';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import axios, { isAxiosError } from 'axios';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import MuiTabList, { TabListProps } from '@mui/lab/TabList';
import { ExploreCourseItemType } from '../../types/courses';
import Link from 'next/link';
import CircularProgress from '@mui/material/CircularProgress';
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
import { Course } from './EmpCourses';
import { mobileRegex } from '@virtual-aid-frontend/utils';

const ExploreCompanyCourseItemBox = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: '20px',
  position: 'relative',
  
  borderRadius: '20px',
  alignItems: 'center',
  border: '1px solid linear-gradient(180deg, rgba(159,27,150,1) 0%, rgba(39,1,95,1) 100%)',
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
const TextFieldStyled = styled(TextareaAutosize)<TextFieldProps>(({ theme }) => ({
  height: '100px !important',
  borderColor: 'rgba(0, 0, 0, 0.23)',
  borderRadius: '10px !important',
  width: '100%',
  padding: '16.5px 14px',
  fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  
  '& .MuiInputBase-root': {
    height: '120px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    height: '120px',
  },
}));
type AddCourseCount = {
  onCancelClick: () => void;
};
type CouseCountForm = {
  companyId: number;
  courseId: number;
  examType: string;
  noOfCourses: number;
  requestMessage: string;
  contactNumber: number;
  
};
const ExploreCompanyCourseItem = ({
  course,
  examType,
}: {
  course: ExploreCourseItemType;
  examType: string;
}) => {
  const [formData, setFormData] = useState({
    courseCount: 1,
    message: '',
    contactNumber: '',
  });

  const [qty, setQty] = useState(1);
  const [standardQty, setStandardQty] = useState(11);
  const [isCartBtnDisabled, setIsCartBtnDisabled] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isItemInCart, setIsItemInCart] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState('1');
  const { companyInfo, empInfo, isCompany } = useContext(InfoContext);
  const cartInstance = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [companyCourseRequest, setCompanyCourseRequest] = useState();
  const { t, ready } = useTranslation(['course', 'common']);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitErrMsg, setSubmitErrMsg] = useState('');

  const defaultFormValues: CouseCountForm = {
    companyId: 1,
    courseId: 1,
    examType: examType,
    noOfCourses: 1,
    requestMessage: '',
    contactNumber: 1,
    
  };

  useEffect(() => {
    const itemFromCart = cartInstance.data.items.find(
      (item: { courseId: string; examType: string; }) => item.courseId === course.id && item.examType === examType
    );
    if (itemFromCart) {
      setIsItemInCart(true);
    }
  }, [cartInstance.data.items, course.id]);

  const onAddClick = (plan: string) => {
    if ((!isItemInCart && !isCompany) || isCompany) {
      const reqPayload = isCompany
        ? {
            companyId: companyInfo.id,
            courseId: course.id,
            courseCount: plan === 'basic' ? qty : plan === 'stn' ? standardQty : 0,
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
        padding: '20px 110px 40px 60px',
      },
      marginBottom: '44px',
    },
    '& .MuiDialogActions-root': {
      padding: '8px 110px 40px 60px',
      justifyContent: 'flex-start',
    },
  }));
  const handleDialogOpen = () => setDialogOpen(true);

  const handleDialogClose = (_event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setDialogOpen(false);
    }
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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CouseCountForm>({
    defaultValues: defaultFormValues,
  });
  const onSubmit = async (data: CouseCountForm) => {
    try {
      setIsSubmitting(true);
      const dataToSend = {
        companyId: companyInfo.id,
        courseId: course.id,
        examType: data.examType,
        noOfCourses: data.noOfCourses,
        requestMessage: data.requestMessage,
        contactNumber: data.contactNumber,
       
      };
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/payment/custom-course-contact-us/?culture=${router.locale}`,
         dataToSend,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
    
      if (response.status === 200) {
        router.reload();
      }
    } catch (error) {
      setIsSubmitting(false);
      setIsSubmitError(true);
      if (isAxiosError(error)) {
        if (
          error.response?.data?.error?.code === 409 ||
          error.response?.data?.error?.code === '409'
        ) {
          setSubmitErrMsg(t('emailAlreadyRegistered'));
        } else {
          setSubmitErrMsg(t('common:error.unspecific'));
        }
      } else {
        setSubmitErrMsg('common:error.unspecific');
      }
    }
  };

  if (!ready) {
    <></>;
  }

  return (
    <ExploreCompanyCourseItemBox>
      <TabContext value={currentTabValue}>
        <TabList
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            padding: '0 30px 0 30px',
            
           
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
          }}
        >
          <Tab
            value="1"
            label={ready ? t('basicPlan') : ''}
            sx={{ maxWidth: '150px' }}
            
          />
          <Tab
            value="2"
            label={ready ? t('standardPlan') : ''}
            sx={{ maxWidth: '150px' }}
          />
          <Tab
            value="3"
            label={ready ? t('premiumPlan') : ''}
            sx={{ maxWidth: '150px' }}
          />
        </TabList>
        <TabPanel
          value="1"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0',
          }}
        >
          <Box sx={{border: '1px solid #ddd',  width: "100%"}}>
          <Box sx={{ width: { xs: '100%', lg: '60%',  }, padding: '20px 30px', float: {xs: 'none', lg: 'left'} }}>
            <Link
              href={`/course/details/${course.id}`}
              style={{ textDecoration: 'none' }}
            >
              <CourseTitleText>
                {course.name} {examType}
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
              width: { xs: '100%', lg: '40%', padding: '20px 30px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', lg: 'flex-end' },
              rowGap: '5px',
            }}
          >
            <CoursePriceText sx={{ marginRight: '10px' }}>
            &euro;{getPrice(examType, 'basic') * qty}
            </CoursePriceText>
            {examType === t('common:OnlineText') && (<CoursePlanDetailsText>
              {ready && t('basicPlanDetailsOnline')}
            </CoursePlanDetailsText>)}
            {examType === t('common:liveText') && (<CoursePlanDetailsText>
              {ready && t('basicPlanDetailsLive')}
            </CoursePlanDetailsText>)}
            {examType === t('common:vrText') && (<CoursePlanDetailsText>
              {ready && t('basicPlanDetailsVR')}
            </CoursePlanDetailsText>)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{}}>
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
                <Box sx={{}}>
                  <TextField
                    type="number"
                    value={qty}
                    InputProps={{
                      inputProps: { min: 0, max: 10 },
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
          </Box>
        </TabPanel>
        <TabPanel
          value="2"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0',
          }}
        >
             <Box sx={{border: '1px solid #ddd',  width: "100%"}}>
          <Box sx={{ width: { xs: '100%', lg: '60%' }, padding: '20px 30px',float: {xs: 'none', lg: 'left'} }}>
            <Link
              href={`/course/details/${course.id}`}
              style={{ textDecoration: 'none' }}
            >
              <CourseTitleText>
                {course.name} {examType}
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
              width: { xs: '100%', lg: '40%' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', lg: 'flex-end' },
              rowGap: '5px',
              padding: '20px 30px',
            }}
          >
            <CoursePriceText sx={{ marginRight: '10px' }}>
            &euro;{getPrice(examType, 'stn') * standardQty}
            </CoursePriceText>
            {examType === t('common:OnlineText')&& (<CoursePlanDetailsText>
              {ready && t('standardPlanDetailsOnline')}
            </CoursePlanDetailsText>)}
            {examType === t('common:liveText') && (<CoursePlanDetailsText>
              {ready && t('standardPlanDetailsLive')}
            </CoursePlanDetailsText>)}
            {examType === t('common:vrText') && (<CoursePlanDetailsText>
              {ready && t('standardPlanDetailsVR')}
            </CoursePlanDetailsText>)}
            
            

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{}}>
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
                <Box sx={{}}>
                  <TextField
                    type="number"
                    value={standardQty}
                    InputProps={{
                      inputProps: { min: 11, max: 100 },
                    }}
                    onChange={(event) => {
                      const inputValue = Number(event.target.value);
                      if (inputValue < 0) {
                        setStandardQty(0);
                        setIsCartBtnDisabled(true);
                      } else if (inputValue > 100) {
                        setStandardQty(100);
                        setIsCartBtnDisabled(false);
                      } else {
                        setStandardQty(inputValue);
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
          </Box>
        </TabPanel>
        <TabPanel
          value="3"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0',
          }}
        >
             <Box sx={{border: '1px solid #ddd', width: "100%"}}>
          <Box sx={{ width: { xs: '100%', lg: '60%' }, padding: '20px 30px',float: {xs: 'none', lg: 'left'} }}>
            <Link
              href={`/course/details/${course.id}`}
              style={{ textDecoration: 'none' }}
            >
              <CourseTitleText>
                {course.name} {examType}
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
              width: { xs: '100%', lg: '40%', padding: '20px 30px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', lg: 'flex-end' },
              rowGap: '5px',
            }}
          >
            <CoursePlanDetailsText sx={{ marginTop: '30px' }}>
              {ready && t('premiumPlanDetails')}
            </CoursePlanDetailsText>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="gradient"
                onClick={handleDialogOpen}
                disabled={isCartBtnDisabled}
                sx={{
                  textTransform: 'capitalize',
                  minWidth: '62px',
                  borderRadius: '4px',
                  height: '36px',
                }}
              >
                {ready && t('contactUs')}
              </Button>
              <BootstrapDialog
                fullWidth
                maxWidth="sm"
                open={dialogOpen}
                onClose={handleDialogClose}
                scroll="paper"
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                sx={{ borderRadius: '20px' }}
                disableEscapeKeyDown
              >
                <DialogTitle
                  id="scroll-dialog-title"
                  sx={{
                    color: '#000000',
                    fontSize: '26px',
                    fontFamily: "'Outfit', sans-serif",
                    marginBottom: '14px !important',
                  }}
                >
                  {ready && t('contactUs')}
                </DialogTitle>
                <DialogContent dividers sx={{ border: 'none', padding: '' }}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                      control={control}
                      name="noOfCourses"
                      rules={{
                        required: {
                          value: true,
                          message: t('firstNameRequiredMsg'),
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="number"
                          label={t('enterCounts')}
                          required
                          disabled={isSubmitting}
                          error={!!errors['requestMessage']}
                          helperText={
                            errors['requestMessage']
                              ? errors['requestMessage'].message
                              : ''
                          }
                          InputProps={{
                            inputProps: { min: 100 },
                          }}
                          sx={{ mb: '20px' }}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="requestMessage"
                      rules={{
                        required: {
                          value: true,
                          message: t('firstNameRequiredMsg'),
                        },
                      }}
                      render={({ field }) => (
                        <><label className='label-dialog' style={{color: 'rgba(0, 0, 0, 0.6)',
                          fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                          fontWeight: '400',
                          fontSize: '1rem !important',
                          fontSizeAdjust: '1rem !important',
                          lineHeight: '1.4375em'}}>Enter Request Message</label><TextFieldStyled
                          {...field}
                          fullWidth
                          type="text"
                          label={t('tellSomething')}
                          required
                          disabled={isSubmitting}
                          error={!!errors['requestMessage']}
                          helperText={errors['requestMessage']
                            ? errors['requestMessage'].message
                            : ''}
                          sx={{ mb: '20px' }} /></>
                      )}
                    />
                    <Controller
                      control={control}
                      name="contactNumber"
                      rules={{
                        required: {
                          value: true,
                          message:t('common:contactNumberRequiredMessage'),
                        },
                        pattern: {
                          value: mobileRegex,
                          message: t('common:contactValidationMessage'),
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="text"
                          label={t('contactUs')}
                          required
                          disabled={isSubmitting}
                          error={!!errors['requestMessage']}
                          helperText={
                            errors['requestMessage']
                              ? errors['requestMessage'].message
                              : ''
                          }
                          sx={{ mb: '20px' }}
                        />
                      )}
                    />
                    <DialogActions sx={{ mt: 2, padding: '0 !important' }}>
                      <Button
                        variant="gradient"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <CircularProgress size="1.75rem" />
                        ) : (
                          t('common:action.submit')
                        )}
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setDialogOpen(false)}
                      >
                        {t('common:action.cancel')}
                      </Button>
                    </DialogActions>
                  </form>
                </DialogContent>
              </BootstrapDialog>
            </Box>
          </Box>
          </Box>
        </TabPanel>
      </TabContext>
    </ExploreCompanyCourseItemBox>
  );
};
export default ExploreCompanyCourseItem;
