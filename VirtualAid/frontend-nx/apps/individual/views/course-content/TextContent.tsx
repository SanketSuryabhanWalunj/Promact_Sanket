import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import DoneIcon from '@mui/icons-material/Done';

import { styled } from '@mui/material/styles';
import {
  ContentSectionType,
  LessonContentType,
} from '../../types/course-content';
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Divider } from '@mui/material';
import axios, { isAxiosError } from 'axios';
import router from 'next/router';
import InfoContext from 'apps/individual/contexts/InfoContext';
import { EmpInfoType } from 'apps/individual/types/emp';
import { userInfo } from 'os';
import RefreshIcon from '@mui/icons-material/Refresh';
import { UserSubscribedCourseType, VrCodeType } from 'apps/individual/types/courses';
import { useTranslation } from 'react-i18next';
import { FieldType } from '../../types/courses'; // Import your enum type

const TitleText = styled(Typography)(({ theme }) => ({
  fontFamily: 'outfit, Medium',
  marginBottom: '15px',
  fontSize: '18px',

  [theme.breakpoints.up('md')]: {
    fontSize: '20px',
  },

  [theme.breakpoints.up('lg')]: {
    fontSize: '26px',
  },
}));
const SubTitleText = styled(Typography)(({ theme }) => ({
  fontFamily: 'outfit, regular',
  marginBottom: '5px',
  fontWeight: 'normal',
  fontSize: '16px',
  color: '#333',

  [theme.breakpoints.up('md')]: {
    fontSize: '18px',
  },

  [theme.breakpoints.up('lg')]: {
    fontSize: '22px',
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

const ContentList = styled(List)(({ theme }) => ({
  listStyle: 'ordered',
  marginBottom: '20px',
}));

const ContentListItem = styled(ListItem)(({ theme }) => ({
  display: 'list-item',
  listStyle: 'disc',
  padding: '0',
  marginLeft: '20px',
}));

const ContetListItemText = styled(ListItemText)(({ theme }) => ({
  fontFamily: "'Open Sans', sans-serif",
  fontSize: '12px',

  [theme.breakpoints.up('md')]: {
    fontSize: '14px',
  },

  [theme.breakpoints.up('lg')]: {
    fontSize: '16px',
  },
}));

const StyledSelectedList = styled(ListItemButton)(({ theme }) => ({
  border: '1px solid #ddd',
  borderRadius: '10px',
  width: '489px',
  marginBottom: '10px',
  [theme.breakpoints.down('md')]: {
    width: '90%',
  },
  '&&.Mui-selected, &:hover': {
    background: '#000000',
    color: '#fff',
    '& .MuiListItemIcon-root': {
      color: '#fff',
    },
  },

  '& .MuiListItemIcon-root': {
    minWidth: '35px',
  },
}));
const ExploreText = styled(Typography)(({ theme }) => ({
  color: 'black',
  fontSize: '26px',
  fontFamily: "'Outfit', medium",
  margin: '26px 0 20px 0',
}));

const ImmerseText = styled(Typography)(({ theme }) => ({
  color: '#666666',
  fontSize: '14px',
  fontFamily: "'Outfit', medium",
  marginBottom: '30px',
  width: '649px',
  maxWidth: '100%',
  textAlign: 'center',
}));

const GenerateCodeLink = styled(Typography)(({ theme }) => ({
  color: '#000000',
  fontSize: '30px',
  fontFamily: "'Outfit', medium",
  cursor: 'pointer',
  marginBottom: '20px',
}));

const GeneratedCode = styled(Typography)(({ theme }) => ({
  fontSize: '30px',
  fontFamily: "'Outfit', medium",
  textTransform: 'uppercase',
  marginBottom: '20px',
  display: 'inline-block', 
  marginRight: '10px'
}));

const ReaderText = styled(Typography)((theme) => ({
  fontSize: '18px',
  color: '#666666',
  fontFamily: "'Outfit', medium",
}));

const AccessCodeText = styled(Typography)((theme) => ({
  fontSize: '18px',
  color: '#868686',
  fontFamily: "'Outfit', medium",

}))

type generateCodeType = {
  emailId: string;
  virtualRealityOtpCode: string;
  virtualRealitySystemLink: null;
}
const TextContent = ({ content , empInfo}: { content: ContentSectionType , empInfo: EmpInfoType},) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const [submitErrMsg, setSubmitErrMsg] = useState('');
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [userCourses, setUserCourses] = useState<UserSubscribedCourseType[]>(
    []
  );
  const [vrCode, setVrCode] = useState<generateCodeType | null>(null);
  const [isUserCoursesLoading, setIsUserCoursesLoading] = useState(false);
  const [isUserCoursesErr, setIsUserCoursesErr] = useState(false);
  const [hideGenerateButton, setHideGenerateButton] = useState(true);

  const [generateCode, setGenerateCode] = useState<generateCodeType[]>([]);
  const [examTypeVr, setExamTypeVr] = useState<UserSubscribedCourseType[]>([]);
  const { t, ready } = useTranslation(['common']);

  const getVrCourse = useCallback(async () => {
    try {
      setIsUserCoursesLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/virtual-reality-token/${empInfo.email}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        const { emailId, virtualRealityOtpCode, virtualRealitySystemLink } = response.data;
        setVrCode({ emailId, virtualRealityOtpCode, virtualRealitySystemLink });
         // Hide the button after generating the code
         if(virtualRealityOtpCode){
          setHideGenerateButton(false);
         }
      }
    } catch (error) {
      setIsUserCoursesLoading(false);
      setIsUserCoursesErr(true);
    }
  }, [empInfo.id]);
  const getUserCourses = useCallback(async () => {
    try {
      setIsUserCoursesLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/courses-for-individual/${empInfo.id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setUserCourses(response.data);
        setIsUserCoursesLoading(false);
        setIsUserCoursesErr(false);
      }
    } catch (error) {
      setIsUserCoursesLoading(false);
      setIsUserCoursesErr(true);
    }
  }, [empInfo.id]);
 
  const generateVrCode = async () => {
    
    try {
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/generate-virtual-reality-token/${empInfo.email}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
       
      );
      
      if (response.status === 200) {
       const { emailId, virtualRealityOtpCode, virtualRealitySystemLink } = response.data;
          setHideGenerateButton(false);
          setVrCode({ emailId, virtualRealityOtpCode, virtualRealitySystemLink });
      }
      
    } catch (error) {
      setIsSubmitting(false);
      setIsSubmitError(true);
      if (isAxiosError(error)) {
        if (
          error.response?.data?.error?.code === 409 ||
          error.response?.data?.error?.code === '409'
        ) {
          setSubmitErrMsg(t('common:codeAlreadyExistText'));
        } else {
          setSubmitErrMsg(t('common:codeNotFoundText'));
        }
      } else {
        setSubmitErrMsg(t('common:notFoundText'));
      }
    }
   
  
  }

  useEffect(() => {
    getUserCourses();
  }, [getUserCourses]);
  
  useEffect(() => {
   

    if (vrCode === null) {
      
      setHideGenerateButton(true);
      getVrCourse();
    }
  }, [vrCode,getVrCourse]);
 
  return (
    <Box sx={{ mb: '20px' }}>
      {(examTypeVr.length > 0 && examTypeVr[0].examType === t('common:vrText') && (content.sectionTitle).includes(t('common:vrText'))) ?(<TitleText>{content.sectionTitle.includes(t('common:vrText'))}</TitleText>):(<TitleText>{content.sectionTitle}</TitleText>)}
      
      {(content.fieldType === FieldType.PointList) && (<>
     
      <ContentList>{(JSON.parse(content.sectionData)).Points.map((bulletPoint: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined, index: any) =><ContentListItem><ContetListItemText>{bulletPoint}</ContetListItemText></ContentListItem>)}</ContentList></>)}
     
      {(content.fieldType === FieldType.VRContent) && (<>
        <Box
                  sx={{
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  <Box
                    sx={{ width: '103px', height: '49px', margin: '0 auto' }}
                  >
                    <img src="/SVGID.svg"></img>
                  </Box>
                  <ExploreText>
                    {t('common:exploreTextVR')}
                  </ExploreText>
                  <ImmerseText>
                    {t('common:immerseTextVR')}
                  </ImmerseText>
                  <AccessCodeText>{t('common:accessTokenText')} </AccessCodeText>
                  {hideGenerateButton ? (<><GenerateCodeLink onClick={generateVrCode}>{t('common:tapCodeButtonText')}</GenerateCodeLink></>
                  ): ( <><GeneratedCode>{vrCode?.virtualRealityOtpCode}</GeneratedCode><span onClick={generateVrCode} style={{color: "#970C8E",display: 'inline-block'}}><RefreshIcon></RefreshIcon></span></>)}
                  
                 
                  <ImmerseText>
                   {t('common:immerseText2')}
                  </ImmerseText>
                  <Divider
                    sx={{
                      marginBottom: '30px',
                      width: '100%',
                      maxWidth: '730px',
                    }}
                  ></Divider>
                  <ReaderText>
                    {t('common:readyText')}
                  </ReaderText>
                  <ImmerseText>
                    {t('common:visitText')}
                  </ImmerseText>
                  <Button
                    type="button"
                    variant="gradient"
                    sx={{ width: '256px' }}
                  >
                    {t('common:exploreNowText')}
                  </Button>
                </Box></>)}
                
                {((content.fieldType !== FieldType.PointList) && (content.fieldType !== FieldType.VRContent)) && ( <ParaText>{content.sectionData}</ParaText>)}
               
    </Box>  
  );
};


export default TextContent;



