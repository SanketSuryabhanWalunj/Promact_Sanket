import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography, { TypographyProps } from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { styled } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ExamDetailsType } from '../../../types/quiz';
import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';
import Link from '@mui/material/Link';
import EmptyQuizLayout from '../../../layouts/components/EmptyQuizLayout';

import { InfoContext } from '../../../contexts/InfoContext';

import AddressForm from '../../../views/shared/address-form/AddressForm';

import { AddressFormType } from '../../../types/address';

import { useTranslation } from 'next-i18next';

const QuizBox = styled(Box)(() => ({
  padding: '32px 55px',
  background:
    'linear-gradient(180deg, rgba(241,241,241,1) 0%, rgba(255,255,255,1) 100%)',
  borderRadius: '20px',
}));

const PageTitle = styled(Typography)(() => ({
  fontSize: '1.75rem',
  fontFamily: 'outfit, Medium',
  marginBottom: '28px',
}));

const InstructionTitle = styled(Typography)<TypographyProps>(() => ({
  fontFamily: 'outfit, Medium',
})) as typeof Typography;

const InstructionText = styled(Typography)<TypographyProps>(() => ({
  fontFamily: 'outfit, Medium',
  color: '#635E67',
})) as typeof Typography;

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

const QuizIndex = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      readAll: false,
    },
  });

  const router = useRouter();

  const { t, ready } = useTranslation(['quiz', 'common']);

  const [quizDetails, setQuizDetails] = useState<ExamDetailsType>(
    {} as ExamDetailsType
  );
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isDetailsErr, setIsDetailsErr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUseEffectClean1 = useRef(true);

  const { empInfo, changeEmpInfo } = useContext(InfoContext);

  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const handleFormOpen = () => setFormDialogOpen(true);
  const handleFormClose = () => setFormDialogOpen(false);

  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressErrMsg, setAddressErrMsg] = useState('');

  const formDefaultValues: AddressFormType = {
    addressLine1: empInfo.address1 ? empInfo.address1 : '',
    addressLine2: empInfo.address2 ? empInfo.address2 : '',
    addressLine3: empInfo.address3 ? empInfo.address3 : '',
    city: empInfo.city ? empInfo.city : '',
    state: empInfo.state ? empInfo.state : '',
    country: empInfo.country ? empInfo.country : '',
    postalCode: empInfo.postalcode ? empInfo.postalcode : '',
    lat: empInfo.latitude ? empInfo.latitude : '',
    lon: empInfo.longitude ? empInfo.longitude : '',
  };

   // Method to close dialog
  const onDialogClose = (_event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setFormDialogOpen(!formDialogOpen);
    }
  };
   // Method to get quize details
  const getQuizDetails = useCallback(async () => {
    try {
      setIsDetailsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/exam/exam-details-by-course-module`,
        {
          params: {
            courseId: router.query.id,
            moduleId: router.query.moduleId,
            culture: router.locale
          },
        }
      );
      if (response.status === 200) {
        setIsDetailsLoading(false);
        setIsDetailsErr(false);
        setQuizDetails(response.data);
      }
    } catch (error) {
      setIsDetailsLoading(false);
      setIsDetailsErr(true);
    }
  }, [router.query.id]);

  useEffect(() => {
    if (router.isReady && isUseEffectClean1.current) {
      isUseEffectClean1.current = false;

      getQuizDetails();
    }
  }, [getQuizDetails, router.isReady]);

 // Method to submit emp info
  const onSubmit = () => {
    setIsSubmitting(true);
    if (
      !empInfo.address1 ||
      !empInfo.city ||
      !empInfo.state ||
      !empInfo.country ||
      !empInfo.postalcode
    ) {
      // Open Address
      setIsSubmitting(false);
      handleFormOpen();
    } else {
      router.replace(
        `/quiz/quizzing/${quizDetails.id}?examType=${router.query.examType}&moduleId=${router.query.moduleId}&nextLessonId=${router.query.nextLessonId}&courseId=${router.query.id}`
      );
    }
  };
 // Method to submit address form
 // @param: data for address form type to get data 
  const onSubmitAddressForm = async (data: AddressFormType) => {
    try {
      setAddressSubmitting(true);
      const dataToSend = {
        ...empInfo,
        address1: data.addressLine1,
        address2: data.addressLine2,
        address3: data.addressLine3,
        country: data.country,
        state: data.state,
        city: data.city,
        postalCode: data.postalCode,
        
      };
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/user-details`,
        dataToSend,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        // router.reload();
        changeEmpInfo(response.data);
        router.replace(
          `/quiz/quizzing/${quizDetails.id}?examType=${router.query.examType}&moduleId=${router.query.moduleId}&nextLessonId=${router.query.nextLessonId}&courseId=${router.query.id}`
        );
      }
    } catch (error) {
      setAddressSubmitting(false);
      setAddressErrMsg(ready ? t('common:error.unspecific') : '');
    }
  };

  return (
    <>
      {isDetailsLoading || !ready ? (
        <>
          <Box display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        </>
      ) : (
        <>
          {isDetailsErr ? (
            <>
              <Box display="flex" alignItems="center" justifyContent="center">
                {t('common:error.unspecific')}
              </Box>
            </>
          ) : (
            <>
              <Grid
                container
                spacing={2}
                sx={{ padding: { xs: '20px', md: '24px 50px' } }}
              >
                <Grid item xs={12} md={2} sx={{ p: 0 }}>
                  <Link href={`/${router.locale}`} style={{ textDecoration: 'none' }}>
                    <KeyboardBackspaceOutlinedIcon
                      href={`/${router.locale}`}
                      sx={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        marginTop: '-5px',
                      }}
                    />
                    {t('common:action.back')}
                  </Link>
                </Grid>
                <Grid item xs={12} md={8} sx={{ p: 0 }}>
                  <QuizBox>
                    <PageTitle>
                      {t('completedAllModules')}
                      <br />
                      {t('timeToTestSkills')}
                    </PageTitle>
                    <InstructionTitle variant="h5" component="div">
                      {t('instruction')}
                    </InstructionTitle>
                    <ul>
                      <InstructionText variant="body1" component="li">
                        {t('testDuration', { min: quizDetails.durationTime })}
                      </InstructionText>
                      <InstructionText variant="body1" component="li">
                        {t('totalQues', { count: quizDetails.noOfQuestions })}
                      </InstructionText>
                      <InstructionText variant="body1" component="li">
                        {t('queChoice')}
                      </InstructionText>
                      <InstructionText variant="body1" component="li">
                        {t('optionMandatoryText')}
                      </InstructionText>
                      <InstructionText variant="body1" component="li">
                        {t('remainingTime')}
                      </InstructionText>
                      <InstructionText variant="body1" component="li">
                        {t('navigate')}
                      </InstructionText>
                      <InstructionText variant="body1" component="li">
                        {t('finishTest')}
                      </InstructionText>
                      <InstructionText variant="body1" component="li">
                        {t('internetConnection')}
                      </InstructionText>
                      <InstructionText variant="body1" component="li">
                        {t('testEnd')}
                      </InstructionText>
                    </ul>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <FormControl required error={!!errors['readAll']}>
                        <FormControlLabel
                          control={
                            <Controller
                              control={control}
                              name="readAll"
                              rules={{
                                required: {
                                  value: true,
                                  message: t('checkBoxReq'),
                                },
                              }}
                              render={({ field }) => (
                                <Checkbox {...field} disabled={isSubmitting} />
                              )}
                            />
                          }
                          label={t('checkBoxLabel')}
                        />
                        <FormHelperText>
                          {errors['readAll']?.message ? (
                            errors['readAll']?.message
                          ) : (
                            <>&nbsp;</>
                          )}
                        </FormHelperText>
                      </FormControl>
                      <br />
                      <Button
                        variant="gradient"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {t('startTest')}
                      </Button>
                    </form>
                  </QuizBox>
                </Grid>
                <Grid item xs={12} md={2} sx={{ p: 0 }}></Grid>
              </Grid>

              <BootstrapDialog
                open={formDialogOpen}
                onClose={onDialogClose}
                maxWidth="md"
                scroll="paper"
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                disableEscapeKeyDown
              >
                <DialogTitle>
                  <Typography
                    color="black"
                    sx={{
                      fontSize: '26px',
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {t('addAddress')}
                  </Typography>
                </DialogTitle>
                <DialogContent>
                  <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                    {t('addAddressNote')}
                  </Typography>
                  <AddressForm
                    onSubmitClick={onSubmitAddressForm}
                    formDefaultValues={formDefaultValues}
                    onCancelClick={handleFormClose}
                    loading={addressSubmitting}
                    errorMsg={addressErrMsg}
                    showMap={true}
                    editable={true}
                  />
                </DialogContent>
              </BootstrapDialog>
            </>
          )}
        </>
      )}
    </>
  );
};

QuizIndex.individualGuard = true;

QuizIndex.getLayout = (page: ReactNode) => (
  <EmptyQuizLayout>{page}</EmptyQuizLayout>
);

export default QuizIndex;
