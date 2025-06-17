import { Box, Container } from '@mui/system';
import HeaderLayout from 'apps/individual/layouts/components/Header';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import { ProfileLayout } from 'apps/individual/layouts/components/ProfileLayout';
import { Divider, Typography } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import { useRouter } from 'next/router';
import { CompanyEmployeeType } from '../../../types/company';

import {
  CompanyRequestedCourseCount,
  CourseDetailsType,
  SubscribedCourseType,
} from 'apps/individual/types/courses';
import axios from 'axios';

import { useDispatch } from 'react-redux';
import InfoContext from 'apps/individual/contexts/InfoContext';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

type PublicProfileType = {
  companyName: string;
  email: string;
  contactNumber: string;
  profileImage: string;
  bannerImage: string;
  bio: string;
  address1: string;
  address2: string;
  address3: string;
  country: string;
  state: string;
  city: string;
  postalcode: string;
  latitude: 0;
  longitude: 0;
  publishData: true;
  slogan: string;
};
type TempCourseType = {
  course: SubscribedCourseType;
  employee: CompanyEmployeeType;
};

const PublicProfile = (props: TempCourseType) => {
  const [CompanyDetails, setCompanyDetails] = useState<PublicProfileType>(
    {} as PublicProfileType
  );
  const router = useRouter();
  const isPreviewRequestGiven = router.query.isPreviewRequest;
  const [companyCourses, setCompanyCourses] = useState<SubscribedCourseType[]>(
    []
  );
  const [companyEmployees, setCompanyEmployees] = useState<
    CompanyEmployeeType[]
  >([]);
  const [isUserCoursesLoading, setIsUserCoursesLoading] = useState(false);
  const [isUserCoursesErr, setIsUserCoursesErr] = useState(false);
  // Inside your component
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const { t, ready } = useTranslation(['company', 'common']);
  const getCompanyProfileData = async (id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company/public-profile-details-of-company/${id}?isPreviewRequest=true`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setCompanyDetails(response.data);
      }
    } catch (error) {
      console.error(t('errorFetchingUserText'), error);
    }
  };

  // company course get function
  const getCompanyCourses = async () => {
    const complete = [];
    if (router.query.id === undefined) {
      return;
    }
    try {
      setIsUserCoursesLoading(true);
  
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/subscribed-courses-by-company-id/${router.query.id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setCompanyCourses(response.data);
        setIsUserCoursesLoading(false);
        setIsUserCoursesErr(false);
      }
    } catch (error) {
      setIsUserCoursesLoading(false);
      setIsUserCoursesErr(true);
    }
  };

  // company employees get function
  const getCompanyEmployees = async () => {
    try {
      setIsUserCoursesLoading(true);
    
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company-employee/employees/${router.query.id}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setCompanyEmployees(response.data);
        setIsUserCoursesLoading(false);
        setIsUserCoursesErr(false);
      }
    } catch (error) {
      setIsUserCoursesLoading(false);
      setIsUserCoursesErr(true);
    }
  };

  // Banner and profile image url
  const banneImageUrl = CompanyDetails.bannerImage;
  const profileImageUrl = CompanyDetails.profileImage;

  useEffect(() => {
    if (router.query.id) {
      getCompanyProfileData(router.query.id as string);
    }
    getCompanyCourses();
    getCompanyEmployees();
  }, [router.query.id]);
  const id = router.query.id;
  const [text, setText] = useState(
    `${process.env.NEXT_PUBLIC_PROFILE_URL}/company/${id}/`
  );

  // copy click handle function
  const handleCopyClick = async () => {
    //  setText("/user/public-profile")
    try {
      const link = typeof window !== undefined;
      if (link) {
        await navigator.clipboard.writeText(
          `${window.location.host}/company/${router.query.id}`
        );
        alert(t('copiedText'));
      } else {
        throw Error;
      }
      // await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error(t('unableCopyText'), err);
      alert(t('copiedFailedText'));
    }
  };

  return (
    <div>
      {isPreviewRequestGiven || CompanyDetails.publishData ? (
        <Container maxWidth="md" sx={{ padding: '0 100px' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '60px',
            }}
          >
            <img src="/logo.png" style={{ maxHeight: '15px' }}></img>
            <Box>
              <InsertLinkIcon
                sx={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  marginRight: '5px',
                  color: '#5C00A8',
                  transform: 'rotate(120deg)',
                }}
                onClick={handleCopyClick}
              ></InsertLinkIcon>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#5C00A8',
                  fontFamily: "'Open Sans', sans-serif",
                  display: 'inline-block',
                  verticalAlign: 'middle',
                }}
              >
                {t('copyText')}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              borderRadius: '0 0 10px 10px',
              border: '1px solid #ddd',
              background: '#F7F7F7',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px',
            }}
          >
            <Box
              sx={{
                background: `url('${banneImageUrl}')`,
                height: '260px',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  width: '178px',
                  height: '178px',
                  borderRadius: '50%',
                  position: 'absolute',
                  left: '50px',
                  bottom: '-89px',
                  border: '8px solid #fff',
                }}
              >
                <img
                  src={profileImageUrl}
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                ></img>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              padding: '91px 82px',
              background: '#F7F7F7',
              borderBottomLeftRadius: '10px',
              borderBottomRightRadius: '10px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '35px',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '30px',
                    fontFamily: "'Open Sans', semi-bold",
                    color: '#000',
                  }}
                >
                  {CompanyDetails.companyName}
                </Typography>
                <Typography sx={{ color: '#333333', fontSize: '20px' }}>
                  {CompanyDetails.slogan}
                </Typography>
              </Box>
              <Box>
                <Box sx={{ marginBottom: '15px' }}>
                  <EmailIcon
                    sx={{
                      color: '#666666',
                      fontSize: '20px',
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      marginRight: '20px',
                    }}
                  ></EmailIcon>
                  <Typography
                    sx={{
                      color: '#666666',
                      fontSize: '16px',
                      display: 'inline-block',
                      verticalAlign: 'middle',
                    }}
                  >
                    {CompanyDetails.email}
                  </Typography>
                </Box>
                <Box>
                  <PhoneInTalkIcon
                    sx={{
                      color: '#666666',
                      fontSize: '20px',
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      marginRight: '20px',
                    }}
                  ></PhoneInTalkIcon>
                  <Typography
                    sx={{
                      color: '#666666',
                      fontSize: '16px',
                      display: 'inline-block',
                      verticalAlign: 'middle',
                    }}
                  >
                    {CompanyDetails.contactNumber}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ width: '100%', color: '#C9C9C9' }}></Divider>
            <Typography
              sx={{ margin: '22px 0', color: '#666666', fontSize: '16px' }}
            >
              {CompanyDetails.bio}
            </Typography>
            <Divider sx={{ width: '100%', color: '#C9C9C9' }}></Divider>

            <>
              <Typography
                sx={{
                  fontSize: '20px',
                  fontFamily: "'Open Sans', regular",
                  margin: '10px 0',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  marginRight: '70px',
                  color: '#000000',
                }}
              >
                <span style={{ display: 'block', fontSize: '40px' }}>
                  {companyCourses.length}
                </span>
                {t('coursesText')}
              </Typography>
              <Typography
                sx={{
                  fontSize: '20px',
                  fontFamily: "'Open Sans', regular",
                  margin: '10px 0',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  marginRight: '70px',
                  color: '#000000',
                }}
              >
                <span style={{ display: 'block', fontSize: '40px' }}>
                  {companyEmployees.length}
                </span>
                {t('employees')}
              </Typography>
            </>
          </Box>
        </Container>
      ) : (
        <Container>
          <img
            src="/logo.png"
            style={{ maxHeight: '15px', margin: '20px 0' }}
          ></img>
          <Box
            maxWidth="lg"
            sx={{
              background: '#F7F7F7',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '80vh',
            }}
          >
            <Typography
              sx={{
                color: '#767676',
                fontSize: '30px',
                fontFamily: "'Open Sans', Semibold",
                fontWeight: '500',
              }}
            >
              {t('noDataText')}
            </Typography>
          </Box>
        </Container>
      )}
    </div>
  );
};

PublicProfile.commonGuard = true;

export default PublicProfile;
