import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { ReactNode } from 'react';

import { useRouter } from 'next/router';

import EmptyQuizLayout from '../../../layouts/components/EmptyQuizLayout';

import { useTranslation } from 'next-i18next';

const QuizCompletedSuccessfully = () => {
  const router = useRouter();

  const { t, ready } = useTranslation(['quiz', 'common']);

  const onButtonClick = () => {
    router.replace(`/quiz/certificate/${router.query.id}?examType=${router.query.examType}`);
  };

  if (!ready) {
    return <></>;
  }

  return (
    <Box
      sx={{
        textAlign: 'center',
        marginBottom: '10px',
        maxWidth: '600px',
        margin: '100px auto 0 auto',
      }}
    >
      <img src="/verify.png" alt="success image" />
      <Typography
        sx={{
          fontSize: { xs: '18px', md: '24px', lg: '30px' },
          fontFamily: "'Outfit', sans-serif",
          marginBottom: '12px',
          color: '#000',
          fontWeight: '500',
        }}
      >
        {router.query.finishBy === 'click'
          ? t('successfullyCompletedTest')
          : router.query.finishBy === 'timeout'
          ? t('timeoutTest')
          : ``}
      </Typography>

      <Button variant="fandango-contained" onClick={onButtonClick}>
        {t('goToCertiPage')}
      </Button>
    </Box>
  );
};

QuizCompletedSuccessfully.individualGuard = true;

QuizCompletedSuccessfully.getLayout = (page: ReactNode) => (
  <EmptyQuizLayout>{page}</EmptyQuizLayout>
);

export default QuizCompletedSuccessfully;
