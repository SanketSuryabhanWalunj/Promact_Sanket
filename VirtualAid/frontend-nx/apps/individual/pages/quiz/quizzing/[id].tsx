import Grid from '@mui/material/Grid';
import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Pagination, {
  PaginationRenderItemParams,
} from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';

import { styled } from '@mui/material/styles';

import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import Countdown, { CountdownRenderProps } from 'react-countdown';

import axios, { isAxiosError } from 'axios';
import { useRouter } from 'next/router';

import { minToMs } from '@virtual-aid-frontend/utils';

import { QuizQuestionType, SaveQuizAnswerType } from '../../../types/quiz';
import { InfoContext } from '../../../contexts/InfoContext';
import EmptyQuizLayout from '../../../layouts/components/EmptyQuizLayout';

import { useTranslation } from 'next-i18next';

const CurrentQuestionBox = styled(Box)(() => ({
  padding: '26px 40px',
  background:
    'linear-gradient(180deg, rgba(241,241,241,1) 0%, rgba(255,255,255,1) 100%)',
  borderRadius: '20px',
  fontFamily: 'outfit, Medium',
}));

const AllQuestionsBox = styled(Box)(() => ({
  padding: '26px 30px',
  background:
    'linear-gradient(180deg, rgba(241,241,241,1) 0%, rgba(255,255,255,1) 100%)',
  borderRadius: '20px',
  fontFamily: 'outfit, Medium',
}));

const Indicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<BoxProps & { status: string }>(({ status }) => ({
  width: '16px',
  height: '16px',
  border: '1px solid #000',
  margin: '4px',
  borderRadius: '50%',
  backgroundColor:
    status === 'answered'
      ? '#2E0162'
      : status === 'selected'
      ? '#9F1B96'
      : '#fff',
}));

const QuizTestPage = () => {
  const { empInfo } = useContext(InfoContext);

  const [answers, setAnswers] = useState<SaveQuizAnswerType[]>([]);
  const [gettingQues, setGettingQues] = useState(false);
  const [errorGettingQues, setErrorGettingQues] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [currentQuestionNo, setCurrentQuestionNo] = useState(0);

  const [savingAns, setSavingAns] = useState(false);
  const [errSavingAns, setErrSavingAns] = useState(false);
  const [errFinishQuiz, setErrFinishQuiz] = useState(false);

  const [countOfSavedAnswer, setCountOfSavedAnswers] = useState(0);

  const isUseEffectClean1 = useRef(true);
  const isFinishQuizClean = useRef(true);
  const [isOptionSelected, setIsOptionSelected] = useState(false);
  // const [checking, setChecking] = useState(false);
  // const [checkErr, setCheckErr] = useState(false);

  const router = useRouter();

  const { t, ready } = useTranslation(['quiz', 'common']);


  // Function to get all questions
  const getAllQuestions = useCallback(async () => {
    try {
      setGettingQues(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/exam/questions-for-particular-module`,

        {
          params: {
            moduleId: router.query.moduleId,
            examDetailsId: router.query.id,
            userId: empInfo.id,
            examType: router.query.examType,
            culture: router.locale
          },
        }
      );
      if (response.status === 200) {
        setGettingQues(false);
        setTimer(Date.now() + minToMs(response.data.examTime));
        setErrorGettingQues(false);
        setAnswers(Array(response.data.questions.length).fill(null));
        setQuestions(response.data.questions);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        if (error?.response?.status === 403) {
          router.replace(
            `/course/content/${router.query.courseId}/${router.query.moduleId}/${router.query.nextLessonId}?examType=${router.query.examType}`
          );
        } else {
          setGettingQues(false);
          setErrorGettingQues(true);
        }
      } else {
        setGettingQues(false);
        setErrorGettingQues(true);
      }
    }
  }, [empInfo.id, router]);

  // Function to finish test
  const finishTest = async (finishBy: 'click' | 'timeout') => {
    try {
      setSavingAns(true);
      setErrFinishQuiz(false);
      const arr = answers
        .map((ans) => {
          if (ans && ans?.isSaved && router.query.moduleId) {
            return {
              chosedOptionId: ans.chosedOptionId,
              questionId: ans.questionId,
              userId: empInfo.id,
            };
          }
        })
        .filter((ans) => ans !== undefined);

      if (arr.length > 0) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/exam/save-answer`,
          arr,
          {
            params: {
              examType: router.query.examType, // Pass the examType as a parameter
            },
          }
        );

        if (response.status === 200 || response.status === 204) {
          
          if (router.query.moduleId) {
            // If there's a next lesson, navigate to it
            router.push(
              `/course/content/${router.query.courseId}/${router.query.moduleId}/${router.query.nextLessonId}?examType=${router.query.examType}`
            );
          } else {
            // If there's no next lesson, navigate to the certificate page
            router.push(
              `/quiz/success/${router.query.id}?finishBy=${finishBy}&examType=${router.query.examType}`
            );
          }
        } else {
          setSavingAns(false);
          setErrFinishQuiz(true);
        }
      } else {
        router.push(
          `/course/content/${router.query.courseId}/${router.query.moduleId}/${router.query.nextLessonId}?examType=${router.query.examType}`
        );
      }
    } catch (error) {
      setSavingAns(false);
      setErrFinishQuiz(true);
    }
  };

  // Function to render time count down
  const CountDownRenderer = (countDownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds, completed } = countDownProps;

    if (completed) {
      if (isFinishQuizClean.current) {
        isFinishQuizClean.current = false;
        finishTest('timeout');
      }
    } else {
      return (
        <Box display="flex">
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h4" component="span">
              {hours}
            </Typography>
            <Box sx={{ color: '#6D6C6C' }}>{ready && t('hour')}</Box>
          </Box>
          <Box>
            <Typography variant="h4" component="span">
              <Box sx={{ color: '#6D6C6C' }}>:</Box>
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h4" component="span">
              {minutes}
            </Typography>
            <Box sx={{ color: '#6D6C6C' }}>{ready && t('minutes')}</Box>
          </Box>
          <Box>
            <Typography variant="h4" component="span">
              <Box sx={{ color: '#6D6C6C' }}>:</Box>
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h4" component="span">
              {seconds}
            </Typography>
            <Box sx={{ color: '#6D6C6C' }}>{ready && t('seconds')}</Box>
          </Box>
        </Box>
      );
    }
  };

  // Function that work on pagination click
  const onPaginationChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    // const ansArr = JSON.parse(JSON.stringify(answers));
    // if (!ansArr[currentQuestionNo]?.isSaved) {
    //   ansArr[currentQuestionNo] = null;
    //   setAnswers(ansArr);
    // }
    // setCurrentQuestionNo(page - 1);
    if(answers[page - 1] !== null) {
      setCurrentQuestionNo(page - 1);
    }

  };

  // Function to check whether answer was submitted
  const availableAnswer = (qid: number) => {
    const answer = answers.find((item) => item?.questionId === qid);

    if (answer) {
      return answer.chosedOptionId;
    } else {
      return null;
    }
  };

  // Function that runs when one of the option from question is selected
  const onAnswerSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // get current question object
      const que = questions[currentQuestionNo];

      // check whether que id and exists in answer array

      const answersCopy = JSON.parse(JSON.stringify(answers));

      if (answersCopy[currentQuestionNo]) {
        if (answersCopy[currentQuestionNo].questionId === que.id) {
          answersCopy[currentQuestionNo].chosedOptionId = Number(
            (event.target as HTMLInputElement).value
          );
        }
      } else {
        answersCopy[currentQuestionNo] = {
          questionId: que.id,
          chosedOptionId: Number((event.target as HTMLInputElement).value),
          isSaved: false,
        };
      }

      setAnswers(answersCopy);
      setIsOptionSelected(true);
    } catch (error) {
    }
  };

  // Function to decide how pagination numbers should be display appearance wise
  const getPaginationBackground = (params: PaginationRenderItemParams) => {
    if (params.page) {
      if (answers[params.page - 1]?.isSaved) {
        return {
          backgroundColor: '#2E0162 !important',
          color: '#fff !important',
        };
      } else if (params.page - 1 === currentQuestionNo) {
        return {
          backgroundColor: '#9F1B96 !important',
          color: '#fff !important',
        };
      } else {
        return {
          backgroundColor: '#fff !important',
        };
      }
    }
  };

  // Function to make api call to save answer in DB and render next question
  const saveAnswerAndNext = async () => {
    try {
      if (answers[currentQuestionNo]) {
        setSavingAns(true);
        setErrSavingAns(false);
        const dataToSend = [
          {
            userId: empInfo.id,
            questionId: answers[currentQuestionNo].questionId,
            chosedOptionId: answers[currentQuestionNo].chosedOptionId,
          },
        ];

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/exam/save-answer/`,
          dataToSend,
          {
            params: {
              examType: router.query.examType, // Pass the examType as a parameter
            },
          }
        );

        if (response.status === 200 || response.status === 204) {
          setSavingAns(false);
          const ansArr = JSON.parse(JSON.stringify(answers));
          ansArr[currentQuestionNo].isSaved = true;
          setAnswers(ansArr);
          const countSavedAnswers = ansArr.reduce(function (
            accumulator: number,
            current: SaveQuizAnswerType
          ) {
            if (current?.isSaved) {
              return (accumulator = accumulator + 1);
            }
            return accumulator;
          },
          0);
          setCountOfSavedAnswers(countSavedAnswers);
          setCurrentQuestionNo((prev) => prev + 1);
          setIsOptionSelected(false);
        }
      } else {
        setCurrentQuestionNo((prev) => prev + 1);
        setIsOptionSelected(false);
      }
    } catch (error) {
      setSavingAns(false);
      setErrSavingAns(true);
    }
  };

  // Function to render previous question
  const prevQue = async () => {
    const ansArr = JSON.parse(JSON.stringify(answers));

    if (!ansArr[currentQuestionNo]?.isSaved) {
      ansArr[currentQuestionNo] = null;
      setAnswers(ansArr);
    }
    if (currentQuestionNo !== 0) {
      setCurrentQuestionNo((prev) => prev - 1);
      setIsOptionSelected(answers[currentQuestionNo - 1] !== null);
    }
  };

  useEffect(() => {
    if (router.isReady && isUseEffectClean1.current) {
      isUseEffectClean1.current = false;
      getAllQuestions();
    }
  }, [getAllQuestions, router.isReady]);

  return (
    <>
      {gettingQues || !ready ? (
        // || checking
        <Box display="flex" alignItems="center" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : errorGettingQues ? (
        // || checkErr
        <Box display="flex" alignItems="center" justifyContent="center">
          {t('common:action.unspecific')}
        </Box>
      ) : (
        <>
          {questions.length > 0 && (
            <>
              <Grid
                container
                spacing={2}
                sx={{ padding: { xs: '20px', md: '24px 50px' } }}
              >
                <Grid item xs={12} md={8} sx={{ p: 0 }}>
                  <CurrentQuestionBox>
                    {currentQuestionNo < questions.length ? (
                      <>
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{
                            fontSize: '28px',
                            fontWeight: 500,
                            color: '#434343',
                            borderBottom: '1px solid #ddd',
                            marginBottom: '20px',
                            fontFamily: 'Outfit, Medium',
                          }}
                        >
                          {t('queNo', { no: currentQuestionNo + 1 })}
                        </Typography>

                        <Typography
                          variant="h5"
                          component="div"
                          sx={{
                            fontSize: '24px',
                            fontFamily: 'Outfit, Medium',
                            marginBottom: '50px',
                          }}
                        >
                          {questions[currentQuestionNo].questionText}
                        </Typography>

                        {questions[currentQuestionNo] && (
                          <>
                            <FormControl sx={{ mb: '100px' }}>
                              <RadioGroup
                                name="question"
                                value={availableAnswer(
                                  questions[currentQuestionNo].id
                                )}
                                onChange={onAnswerSelect}
                                sx={{paddingTop: '0'}}
                              >
                                {questions[
                                  currentQuestionNo
                                ].questionOptions.map((item, index) => {
                                  return (
                                    <FormControlLabel
                                      key={index}
                                      value={item.id}
                                      control={<Radio color="success" />}
                                      label={item.optionText}
                                      sx={{alignItems: 'flex-start'}}
                                    />
                                  );
                                })}
                              </RadioGroup>
                            </FormControl>
                          </>
                        )}

                        {errSavingAns && (
                          <Alert severity="error" sx={{ mb: '20px' }}>
                            {t('errorSavingAns')}
                          </Alert>
                        )}

                        <Box>
                          <Button
                            variant="fandango-outlined"
                            onClick={prevQue}
                            disabled={currentQuestionNo === 0}
                          >
                            {t('common:action.previous')}
                          </Button>

                          <Button
                            variant="fandango-contained"
                            sx={{ ml: '20px' }}
                            onClick={() => saveAnswerAndNext()}
                            disabled={!isOptionSelected}
                          >
                            {t('common:action.saveAndNext')}
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{
                            fontSize: '28px',
                            fontWeight: 500,
                            color: '#434343',
                            marginBottom: '20px',
                            fontFamily: 'Outfit, Medium',
                          }}
                        >
                          {t('summary')}
                        </Typography>
                        <Divider sx={{ marginBottom: '30px' }} />
                        <Typography
                          variant="h5"
                          component="div"
                          sx={{
                            fontSize: '24px',
                            fontFamily: 'Outfit, Medium',
                            marginBottom: '40px',
                          }}
                        >
                          {t('totalQues', { count: questions.length })}
                        </Typography>
                        <Box sx={{ marginBottom: '30px' }}>
                          <Typography
                            variant="h6"
                            component="span"
                            sx={{ color: '#464646' }}
                          >
                            {t('attemptedQues', { count: countOfSavedAnswer })}
                          </Typography>
                          <Typography
                            variant="h6"
                            component="span"
                            sx={{ color: '#464646', margin: '0 32px' }}
                          >
                            |
                          </Typography>
                          <Typography
                            variant="h6"
                            component="span"
                            sx={{ color: '#464646' }}
                          >
                            {t('notAttemptedQues', {
                              count: questions.length - countOfSavedAnswer,
                            })}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{ color: '#9A9A9A', marginBottom: '30px' }}
                        >
                          {t('endTestPrompt')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: '20px' }}>
                          <Button
                            variant="fandango-outlined"
                            onClick={() => setCurrentQuestionNo(0)}
                          >
                            {t('common:action.resume')}
                          </Button>
                          <Button
                            variant="fandango-contained"
                            onClick={() => finishTest('click')}
                          >
                            {t('common:action.end')}
                          </Button>
                        </Box>
                      </>
                    )}
                  </CurrentQuestionBox>
                </Grid>
                <Grid item xs={12} md={4} sx={{ p: 0 }}>
                  <AllQuestionsBox>
                    <Typography
                      variant="body1"
                      component="div"
                      sx={{
                        mb: '10px',
                        color: '#434343',
                        marginBottom: '10px',
                      }}
                    >
                      {t('timeLeft')}
                    </Typography>
                    <Box sx={{ mb: '36px' }}>
                      <Countdown renderer={CountDownRenderer} date={timer} />
                    </Box>
                    <Typography
                      variant="body1"
                      component="div"
                      sx={{
                        mb: '10px',
                        color: '#434343',
                        marginBottom: '10px',
                      }}
                    >
                      {t('ques')}
                    </Typography>
                    <Pagination
                      count={questions.length + 1}
                      siblingCount={questions.length + 1}
                      hideNextButton
                      hidePrevButton
                      size="large"
                      onChange={onPaginationChange}
                      sx={{
                        mb: { xs: '30px', md: '76px' },
                        '& .MuiPagination-ul': {
                          rowGap: '10px',
                          columnGap: '6px',
                        },
                        '& .MuiPaginationItem-root': {
                          fontFamily: 'outfit, Medium',
                          border: '1px solid #DFDFDF',
                          color: '#6D6C6C',
                          fontSize: '18px',
                        },
                      }}
                      renderItem={(params: PaginationRenderItemParams) => {
                        return (
                          <PaginationItem
                            {...params}
                            {...(params?.page === questions.length + 1
                              ? { page: t('summary') }
                              : {})}
                            sx={getPaginationBackground(params)}
                          />
                        );
                      }}
                    />
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      flexWrap="wrap"
                      sx={{ mb: '36px' }}
                    >
                      <Box display="flex" alignItems="center">
                        <Indicator status="unanswered"></Indicator>
                        <Typography variant="caption" sx={{ marginTop: '4px' }}>
                          {t('unanswered')}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Indicator status="answered"></Indicator>
                        <Typography variant="caption" sx={{ marginTop: '4px' }}>
                          {t('answered')}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Indicator status="selected"></Indicator>
                        <Typography variant="caption" sx={{ marginTop: '4px' }}>
                          {t('selected')}
                        </Typography>
                      </Box>
                    </Box>

                    {errFinishQuiz && (
                      <Alert severity="error" sx={{ mb: '20px' }}>
                        {t('errorFinishingQuiz')}
                      </Alert>
                    )}

                    {/* <Button
                      fullWidth
                      variant="fandango-contained"
                      onClick={() => finishTest('click')}
                    >
                      Finish Test
                    </Button> */}
                  </AllQuestionsBox>
                </Grid>
              </Grid>
              <Backdrop
                sx={{
                  color: '#fff',
                  zIndex: (theme) => theme.zIndex.modal + 1,
                }}
                open={savingAns}
              >
                <CircularProgress />
              </Backdrop>
            </>
          )}
        </>
      )}
    </>
  );
};

QuizTestPage.individualGuard = true;

QuizTestPage.getLayout = (page: ReactNode) => (
  <EmptyQuizLayout>{page}</EmptyQuizLayout>
);

export default QuizTestPage;
