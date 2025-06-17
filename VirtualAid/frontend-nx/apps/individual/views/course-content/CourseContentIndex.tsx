import Box from '@mui/material/Box';
import MuiLink, { LinkProps } from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import { styled } from '@mui/material/styles';
import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';

import NextLink from 'next/link';

import { ModuleLessonType } from '../../types/course-content';
import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';

const HeaderBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

const CustomMuiLink = styled(MuiLink)<
  LinkProps & { component?: typeof NextLink }
>(() => ({
  display: 'inline-block',
  verticalAlign: 'middle',
  textDecoration: 'none',
  color: '#000000',
  marginBottom: '32px',
  fontSize: '14px',
  fontFamily: 'outfit, Medium',
}));

const HeaderText = styled(Typography)(() => ({
  fontSize: '14px',
  fontFamily: 'outfit, Medium',
}));

const TitleText = styled(Typography)(({ theme }) => ({
  fontFamily: 'outfit, Medium',
  marginBottom: '10px',
  fontSize: '20px',

  [theme.breakpoints.up('md')]: {
    fontSize: '28px',
  },

  [theme.breakpoints.up('lg')]: {
    fontSize: '36px',
  },
}));

const IndexList = styled(List)(() => ({
  listStyle: 'ordered',
}));

const IndexListItem = styled(ListItem)(() => ({
  display: 'list-item',
  listStyle: 'disc',
  padding: '0',
  marginLeft: '20px',
}));

const IndexListItemLink = styled(MuiLink)<
  LinkProps & { component?: typeof NextLink }
>(() => ({
  textDecoration: 'none',
  color: '#000000',
  fontFamily: 'outfit, Medium',
  verticalAlign: 'top'
}));

const IndexListItemText = styled(ListItemText)(({ theme }) => ({
  fontSize: '12px',

  [theme.breakpoints.up('md')]: {
    fontSize: '14px',
  },
}));

const CourseContentIndex = ({ lesson }: { lesson: ModuleLessonType }) => {
  const router = useRouter();
  const { t, ready } = useTranslation(['course', 'common']);
  const { slug } = router.query;

  return (
    <>
      <HeaderBox>
        <CustomMuiLink
          component={NextLink}
          href={slug ? `/course/content-index/${slug[0]}?examType=${router.query.examType}` : `/user/dashboard`}
          sx={{ textDecoration: 'none' }}
        >
          <KeyboardBackspaceOutlinedIcon
            sx={{
              display: 'inline-block',
              verticalAlign: 'middle',
              marginTop: '-5px',
            }}
          />{' '}
          {ready && t('common:action.back')}
        </CustomMuiLink>
        <HeaderText>{ready && t('tableOfContent')}</HeaderText>
      </HeaderBox>
      <TitleText>{lesson.name}</TitleText>
      <IndexList>
        {lesson?.contents?.map((content, index) => (
          <IndexListItem key={index}>
            <IndexListItemLink
            >
              <IndexListItemText
                primary={content.contentTitle}
              ></IndexListItemText>
            </IndexListItemLink>
          </IndexListItem>
        ))}
      </IndexList>
    </>
  );
};

export default CourseContentIndex;
