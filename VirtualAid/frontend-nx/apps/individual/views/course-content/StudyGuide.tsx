import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const TitleText = styled(Typography)(({ theme }) => ({
  fontFamily: 'outfit, Medium',
  marginBottom: '12px',
  fontSize: '18px',

  [theme.breakpoints.up('md')]: {
    fontSize: '20px',
  },

  [theme.breakpoints.up('lg')]: {
    fontSize: '26px',
  },
}));

const SubTitleText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Open Sans', sans-serif",
  fontWeight: 'Bold',
  marginBottom: '20px',
  fontSize: '14px',

  [theme.breakpoints.up('md')]: {
    fontSize: '16px',
  },
}));

const ParaText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Open Sans', sans-serif",
  fontSize: '12px',
  mb: '20px',

  [theme.breakpoints.up('md')]: {
    fontSize: '14px',
  },

  [theme.breakpoints.up('lg')]: {
    fontSize: '16px',
  },
}));
const { t, ready } = useTranslation(['course']);
const StudyGuide = () => {
  return (
    <>
      <TitleText>Explanation of the e-learning and study tips</TitleText>
      <Box>
        <SubTitleText>Goal</SubTitleText>
        <ParaText>
          With this e-learning you prepare for the basic emergency response
          course. You develop knowledge and skills to correctly assess the
          situation in the event of an incident , to fight an incipient fire, to
          respond to an evacuation and to provide first aid.
        </ParaText>
        <ParaText>
          This knowledge and skills are indispensable in the event of a
          disaster. You can even save lives with it.
        </ParaText>
      </Box>
      <Box>
        <SubTitleText>Access</SubTitleText>
        <ParaText>
          The content of the e-learning remains accessible for a year. Even
          after the practical part, you can continue to practice with the
          learning material.
        </ParaText>
      </Box>
      <Box>
        <SubTitleText>Study load</SubTitleText>
        <ParaText>
          We recommend studying the material in advance, completing the
          practical assignments and answering the practice questions.
        </ParaText>
        <ParaText>
          This contributes to better learning and exam results.
        </ParaText>
        <ParaText>
          Completing this e-learning takes an average of 6 to 8 hours.
        </ParaText>
      </Box>
    </>
  );
};

export default StudyGuide;
