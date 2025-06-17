import { Box, Container, styled } from '@mui/system';
import HeaderLayout from 'apps/individual/layouts/components/Header';
import { ReactNode, useContext, useEffect, useState } from 'react';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import { ProfileLayout } from 'apps/individual/layouts/components/ProfileLayout';
import { Divider, Typography } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import { useRouter } from 'next/router';
import { CompanyEmployeeType } from '../../../types/company';
import axios from 'axios';
import { UserSubscribedCourseType } from 'apps/individual/types/courses';
import InfoContext from 'apps/individual/contexts/InfoContext';
import { Course } from 'apps/individual/views/courses/EmpCourses';
import { useTranslation } from 'react-i18next';

type PublicProfileType = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  profileImage: string;
  bannerImage: string;
  bio: string;
  designation: string;
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
  isPreviewRequest: true;
};

const PublicProfile = () => {
  const [empDetails, setEmpDetails] = useState<PublicProfileType>(
    {} as PublicProfileType
  );

  const router = useRouter();
  const isPreviewRequestNew = router.query.isPreviewRequest;
  const [userCourses, setUserCourses] = useState<UserSubscribedCourseType[]>(
    []
  );
  const [isUserCoursesLoading, setIsUserCoursesLoading] = useState(false);
  const [isUserCoursesErr, setIsUserCoursesErr] = useState(false);
  const [completedCourses, setCompletedCourses] = useState<
    UserSubscribedCourseType[]
  >([]);

  const [otherCourses, setOtherCourses] = useState<UserSubscribedCourseType[]>(
    []
  );
  const { t, ready } = useTranslation(['company', 'common']);
  const getUserProfileData = async (id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/public-profile-details-of-user/${id}?isPreviewRequest=true`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setEmpDetails(response.data);
      }
    } catch (error) {
      console.error(t('errorFetchingText'), error);
    }
  };

   // Method to on click action for getting current company Id
  // @param: emp for company employees details
  const getUserCourses = async () => {
    const complete = [];
    try {
      setIsUserCoursesLoading(true);
   
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/courses-for-individual/${router.query.id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        for (const course of response.data) {
          if (course.isCompleted) {
            setUserCourses(response.data);
            complete.push(course);
          } else {
            
          }
        }
        setCompletedCourses(complete);

        setIsUserCoursesLoading(false);
        setIsUserCoursesErr(false);
      }
    } catch (error) {
      setIsUserCoursesLoading(false);
      setIsUserCoursesErr(true);
    }
  };
 // copy click handle function
  const handleCopyClick = async () => {
    //  setText("/user/public-profile")
    try {
      const link = typeof window !== undefined;
      if (link) {
        await navigator.clipboard.writeText(
          `${window.location.host}/user/${router.query.id}`
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
  useEffect(() => {
    if (router.query.id) {
      getUserProfileData(router.query.id as string);
    }
    getUserCourses();
    for (const course of userCourses) {
      const employeeCourse = course;
    }
  }, [router.query.id]);
  const banneImageUrl = empDetails.bannerImage;

  const profileImageUrl = empDetails.profileImage;

  return (
    <div>
      {isPreviewRequestNew || empDetails.publishData ? (
        <Container
          maxWidth="lg"
          sx={{ padding: { md: '0 100px', xs: '0 20px' } }}
        >
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
            }}
          >
            <Box
              sx={{
                background: `url(${banneImageUrl})`,
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
              padding: { md: '91px 82px', xs: '91px 20px 20px 20px' },
              background: '#F7F7F7',
              borderBottomLeftRadius: '10px',
              borderBottomRightRadius: '10px',
            }}
          >
            <Box
              sx={{
                display: { md: 'flex', xs: 'block' },
                justifyContent: 'space-between',
                marginBottom: '35px',
              }}
            >
              <Box sx={{ marginBottom: '10px' }}>
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { md: '30px', xs: '20px' },
                    fontFamily: "'Open Sans', semi-bold",
                    color: '#000',
                  }}
                >
                  {empDetails.firstName} {empDetails.lastName}
                </Typography>
                <Typography
                  sx={{
                    color: '#333333',
                    fontSize: { md: '20px', xs: '14px' },
                  }}
                >
                  {empDetails.designation}
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
                      marginRight: '10px',
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
                    {empDetails.email}
                  </Typography>
                </Box>
                <Box>
                  <PhoneInTalkIcon
                    sx={{
                      color: '#666666',
                      fontSize: '20px',
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      marginRight: '10px',
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
                    {empDetails.contactNumber}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ width: '100%', color: '#C9C9C9' }}></Divider>
            <Typography
              sx={{ margin: '22px 0', color: '#666666', fontSize: '16px' }}
            >
              {empDetails.bio}
            </Typography>
            <Divider sx={{ width: '100%', color: '#C9C9C9' }}></Divider>
            <Typography
              sx={{ margin: '22px 0', color: '#666666', fontSize: '16px' }}
            >
              {empDetails.address1},{empDetails.address2},{empDetails.address3}
            </Typography>
            <Divider sx={{ width: '100%', color: '#C9C9C9' }}></Divider>
            <Typography
              sx={{
                color: '#666',
                fontSize: '14px',
                fontFamily: "'Open Sans', Bold",
                fontWeight: '700',
                margin: '10px 0',
              }}
            >
                {t('coursesText')}
            </Typography>
            <Divider sx={{ width: '100%', color: '#C9C9C9' }}></Divider>
            {completedCourses.length > 0 && (
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                {completedCourses.map((item, index) => (
                  <li
                    style={{
                      marginBottom: '20px',
                      paddingBottom: '20px',
                      borderBottom: '1px solid #c9c9c9',
                    }}
                  >
                    <img
                      src="/certificate.png"
                      style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        maxHeight: '34px',
                        marginRight: '10px',
                      }}
                    ></img>
                    <Box
                      sx={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        maxWidth: '90%',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '16px',
                          fontFamily: "'Open Sans'",
                          marginBottom: '7px',
                          color: '#000',
                        }}
                      >
                        {item.name} {item.examType}
                      </Typography>
                      <Typography
                        sx={{
                          color: '#666666',
                          fontSize: '12px',
                          marginTop: '10px',
                        }}
                      >
                        {item.shortDescription}
                      </Typography>
                      <Typography
                        sx={{
                          color: '#242424',
                          fontSize: '14px',
                          marginTop: '10px',
                        }}
                      >
                        {t('completedText')}
                      </Typography>
                    </Box>
                  </li>
                ))}
              </ul>
            )}
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
// PublicProfile.getLayout = (page: ReactNode) => <ProfileLayout>{page}</ProfileLayout>;

export default PublicProfile;
