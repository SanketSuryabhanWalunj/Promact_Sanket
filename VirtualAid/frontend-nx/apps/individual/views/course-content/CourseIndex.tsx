import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import { styled } from '@mui/material/styles';

import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import SearchIcon from '@mui/icons-material/Search';

import { useState } from 'react';
import ArrowButtonLink from '../../components/styled/ArrowButtonLink';
import { ModuleWithLessonType } from '../../types/course-content';
import { useRouter } from 'next/router';

const MainBox = styled(Box)(({ theme }) => ({
  background:
    'linear-gradient(180deg, rgba(246,246,246,1) 0%, rgba(255,255,255,1) 100%)',
  padding: '10px',
  borderRadius: '20px',
  [theme.breakpoints.up('md')]: {
    padding: '30px 40px',
  },
}));

const SearchIconBox = styled(Box)(({ theme }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  border: '1px solid #ddd',
  background: '#fff',
  display: 'none',
  verticalAlign: 'middle',

  [theme.breakpoints.up('md')]: {
    display: 'inline-block',
  },
}));

const InputField = styled(InputBase)(({ theme }) => ({
  marginLeft: 0,
  width: '100%',
  maxWidth: '100%',
  display: 'right',
  border: '1px solid #ddd',
  borderRadius: '25px',
  background: '#fff',
  padding: '14px 10px 14px 30px',

  [theme.breakpoints.up('md')]: {
    marginLeft: '20px',
    width: '490px',
  },
}));

const AccordianBox = styled(Box)(({ theme }) => ({
  borderLeft: 'none',
  padding: '20px',
  marginLeft: 0,

  [theme.breakpoints.up('md')]: {
    borderLeft: '2px solid #000',
    padding: '25px 0 0 30px',
    marginLeft: '25px',
  },
}));

const Accordian = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  backgroundColor: 'transparent',
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

//accordian styles for accordian title  box
const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? 'transparent' : 'transparent',
  flexDirection: 'row-reverse',
  margin: '0',
  padding: '0',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'none !important',
    '&:before': {
      content: "''",
      position: 'absolute',
      left: '-45px',
      top: '12px',
      width: '30px',
      height: '30px',
      backgroundColor: '#000 !important',
      background: "url('/minus-icon.svg')",
      backgroundRepeat: 'no-repeat',
      borderRadius: '50%',
      backgroundPosition: 'center',
    },
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    transform: 'none !important',
    '&:before': {
      content: "''",
      position: 'absolute',
      left: '-45px',
      top: '12px',
      width: '30px',
      height: '30px',
      backgroundColor: '#000 !important',
      background: "url('/plus-icon.svg')",
      backgroundRepeat: 'no-repeat',
      borderRadius: '50%',
      backgroundPosition: 'center',
    },
  },
  '& svg': {
    display: 'none',
  },
  '& .MuiAccordionSummary-content': {
    margin: '0',
    marginLeft: '15px',
    [theme.breakpoints.down('sm')]: {
      marginLeft: '0',
    },
  },
}));

//accordian styles for accordian content  box
const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  border: '1px solid #dddddd',
  borderRadius: '10px',
  marginLeft: '15px',
  background: '#fff',
  position: 'relative',
  marginBottom: '16px',
  '&:before': {
    position: 'absolute',
    content: "''",
    left: '-52px',
    top: '50%',
    width: '10px',
    height: '10px',
    background: '#000',
    borderRadius: '50%',
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: '0',
    '&:before': {
      display: 'none',
    },
  },
}));

const SummaryText = styled(Typography)(({ theme }) => ({
  color: '#000',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',

  [theme.breakpoints.up('md')]: {
    fontSize: '26px',
  },
}));

const DetailsImageBox = styled(Box)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background:
    'linear-gradient(90deg, rgba(159,27,150,1) 0%, rgba(39,1,95,1) 100%)',
  display: 'none',
  verticalAlign: 'middle',
  justifyContent: 'center',
  alignItems: 'center',
  lineHeight: '52px',
  textAlign: 'center',

  [theme.breakpoints.up('md')]: {
    width: '74px',
    height: '74px',
    display: 'inline-flex',
  },
}));

const DetailsTextBox = styled(Box)(({ theme }) => ({
  paddingLeft: 0,
  width: '100%',
  display: 'inline-block',
  verticalAlign: 'middle',

  [theme.breakpoints.up('md')]: {
    paddingLeft: '20px',
    width: 'calc(100% - 74px)',
  },
}));

const DetailsTitleText = styled(Box)(() => ({
  fontWeight: 'bold',
  fontFamily: "'Open Sans', sans-serif",
  fontSize: '16px',
}));

const DetailsList = styled(List)(() => ({
  listStyle: 'ordered',
  display: 'inline-block',
  width: '80%',
}));

const DetailsListItem = styled(ListItem)(() => ({
  display: 'list-item',
  listStyle: 'disc',
  padding: '0',
  marginLeft: '20px',
}));

const DetailsListItemText = styled(ListItemText)(({ theme }) => ({
  fontSize: '12px',

  [theme.breakpoints.up('md')]: {
    fontSize: '14px',
  },
}));

const DetailsButtonBox = styled(Box)(() => ({
  display: 'inline-block',
  verticalAlign: 'top',
  width: '20%',
  marginTop: '6px',
  textAlign: 'right',
}));

const CourseIndex = ({
  modules,
  currentModuleIndex = 0,
  currentLessonIndex = 0,
  examType = "",
}: {
  modules: ModuleWithLessonType[];
  currentModuleIndex: number;
  currentLessonIndex: number;
  examType: string;
}) => {
  const router = useRouter();
  
  const [expanded, setExpanded] = useState<string | false>('panel0');

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  return (
    <>
      <MainBox>
        <AccordianBox>
          {modules.map((module, moduleIndex) => (
            <Accordian
              key={moduleIndex}
              TransitionProps={{ unmountOnExit: true }}
              expanded={expanded === `panel${moduleIndex}`}
              onChange={handleChange(`panel${moduleIndex}`)}
            >
              <AccordionSummary>
                <SummaryText>{module.name}</SummaryText>
              </AccordionSummary>
              {module.lessons.map((lesson, lessonIndex) => (
                <AccordionDetails key={lessonIndex}>
                  <DetailsImageBox>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '60%',
                      }}
                    >
                      <img
                        src="/books.svg"
                        alt="book"
                        style={{ width: '100%' }}
                      />
                    </Box>
                  </DetailsImageBox>
                  <DetailsTextBox>
                    <DetailsTitleText>{lesson.name}</DetailsTitleText>
                    <DetailsList>
                      {lesson.contents.map((content, contentIndex) => (
                        <DetailsListItem key={contentIndex}>
                          <DetailsListItemText primary={content.contentTitle} />
                        </DetailsListItem>
                      ))}
                    </DetailsList>
                    <DetailsButtonBox>
                      {(currentModuleIndex > moduleIndex ||
                        (currentModuleIndex === moduleIndex &&
                          currentLessonIndex >= lessonIndex)) && (
                        <ArrowButtonLink
                          onClick={() => {
                            router.push(
                              `/course/content/${module.courseId}/${module.id}/${lesson.id}?examType=${examType}`
                            );
                          }}
                        />
                      )}
                    </DetailsButtonBox>
                  </DetailsTextBox>
                </AccordionDetails>
              ))}
            </Accordian>
          ))}
        </AccordianBox>

      </MainBox>
    </>
  );
};

export default CourseIndex;
