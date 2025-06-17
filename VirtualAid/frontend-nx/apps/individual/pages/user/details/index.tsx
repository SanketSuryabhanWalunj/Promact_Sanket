import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import {
  ChangeEvent,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ProfileLayout } from '../../../layouts/components/ProfileLayout';
import EmpPersonalInfo from '../../../views/shared/emp-info/EmpPersonalInfo';
import { CompanyEmployeeType } from '../../../types/company';
import { UserSubscribedCourseType } from '../../../types/courses';
import EditEmpInfo from '../../../views/shared/edit-emp-info/EditEmpInfo';
import { InfoContext } from '../../../contexts/InfoContext';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import EditIcon from '@mui/icons-material/Edit';
import Link from '@mui/material/Link';
import axios from 'axios';
import EmployeeEnrolledCourses from '../../../views/company/company-employee-info/EmployeeEnrolledCourses';
import styled from '@emotion/styled';
import { Button, IconButton } from '@mui/material';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import router from 'next/router';
import PublicProfile from '../[id]';
import { useTranslation } from 'react-i18next';


const VisuallyHiddenInput = styled('input')({
  height: '100%',
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: '100%',
  opacity: '0',
});
const EmployeeDetails = () => {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // State variables for current and new profile photos
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState(null);
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);
  const [isPublishSuccess, setIsPublishSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { empInfo } = useContext(InfoContext);
  const [empCourses, setEmpCourses] = useState<UserSubscribedCourseType[]>([]);
  const { t, ready } = useTranslation(['company', 'common']);
  // Method for handle file change 
  // @param: e for react changeevent
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploading) {
      
      return;
    }

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      try {
        setUploading(true);

        const formData = new FormData();
        formData.append('email', empInfo.email);
        formData.append('ProfileImage', file);
  
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/edit-profile-image-for-user`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept-Language': router.locale
            },
          }
        );

        if (response.status === 204 || response.status === 200) {
          setImageUrl(response.data);
          router.reload();
        }
      } catch (error) {
        console.error(t('errorUploadingText'), error);
      } finally {
        // Reset selected file and uploading state
        setUploading(false);
      
      }
    } else {
      console.error(t('noImageSelectedText'));
    }
  };
   // Method to get course by user id
   // @param: id for courses get using it
  const getCourse = useCallback(async (id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/enrolled-courses-by-user-id/${id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setEmpCourses(response.data);
      }
    } catch (error) {
    }
  }, []);

   // Method to get user profile data 
   // @param: id for getting profile daa using id
  const getUserProfileData = async (id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/public-profile-details-of-user/${id}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setIsPublishSuccess(response.data.publishData);
        
      }
    } catch (error) {
      console.error(t('errorFetchingUserText'), error);
    }
  };

  const profileUrl = empInfo.profileImage;

  // Method to handle copy click function
  const handleCopyClick = async () => {
    try {
      const link = typeof window !== undefined 
      if (link) {
        await navigator.clipboard.writeText(`${window.location.host}/user/${empInfo.id}`)
        alert(t('copiedText'));
      } else {
        throw Error
      }
    } catch (err) {
      console.error(t('unableCopyText'), err);
      alert(t('copiedFailedText'));
    }
  };
  useEffect(() => {
    if (empInfo?.id) {
      getCourse(empInfo.id);
      getUserProfileData(empInfo.id);
    }
  }, [empInfo.id, getCourse]);
 
  return (
    <>
      <Box
        className="company-details"
        sx={{ padding: { xs: '20px', md: '30px 50px 50px 50px' } }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            {profileUrl ? (
              <>
                <Box
                  sx={{
                    width: { xs: '40px', md: '78px' },
                    height: { xs: '40px', md: '78px' },
                    borderRadius: '50%',
                    color: '#890B89',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    verticalAlign: 'middle',
                    alignItems: 'center',
                    background: '#E4C4FF',
                    position: 'relative',
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: 'bold',
                  }}
                >
                 <img
                    src={profileUrl}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  
                  <Box
                    sx={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#fff',
                      color: '#AAAAAA',
                      fontSize: '10px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'absolute',
                      right: '6px',
                      top: '0px',
                    }}
                  >
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <EditIcon sx={{ fontSize: '12px'}}></EditIcon>
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    width: { xs: '40px', md: '78px' },
                    height: { xs: '40px', md: '78px' },
                    borderRadius: '50%',
                    color: '#890B89',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    verticalAlign: 'middle',
                    alignItems: 'center',
                    background: '#E4C4FF',
                    position: 'relative',
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: 'bold',
                  }}
                >
                  {empInfo.firstName[0] + empInfo.lastName[0]}
                  <Box
                    sx={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#fff',
                      color: '#AAAAAA',
                      fontSize: '10px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'absolute',
                      right: '6px',
                      top: '0px',
                    }}
                  >
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <EditIcon sx={{ fontSize: '12px' }}></EditIcon>
                  </Box>
                </Box>
              </>
            )}
            <Box
              sx={{
                display: 'inline-block',
                verticalAlign: 'middle',
                marginLeft: '30px',
              }}
            >
              <Typography
                sx={{
                  display: 'block',
                  fontSize: { xs: '14px', md: '16px' },
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {empInfo.firstName + ' ' + empInfo.lastName}
              </Typography>
              <Typography
                sx={{
                  display: 'block',
                  fontSize: { xs: '14px', md: '16px' },
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {empInfo.email}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ lineHeight: { xs: '60px', md: '78px' } }}>
          <Link href={`/user/${empInfo.id}?isPreviewRequest=true`}>
            <IconButton
              sx={{
                fontSize: { xs: '20px', md: '21px' },
                color: '#AAAAAA',
                padding: '5px',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            >
             
                <RemoveRedEyeIcon></RemoveRedEyeIcon>
              
            </IconButton>
            <label
              style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                marginRight: '5px',
                fontSize: '14px',
                color: '#5C00A8',
              }}
            >
              {t('previewText')}
            </label>
            </Link>
            {isPublishSuccess ? (
              <>
                <IconButton
                  sx={{
                    fontSize: { xs: '20px', md: '21px' },
                    color: '#AAAAAA',
                    padding: '5px',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                  }}
                >
                  <InsertLinkIcon
                    onClick={handleCopyClick}
                    sx={{
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      color: '#5C00A8',
                      transform: 'rotate(120deg)',
                    }}
                  ></InsertLinkIcon>
                </IconButton>
                <label
                  style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    marginRight: '5px',
                    fontSize: '14px',
                    color: '#5C00A8',
                  }}
                >
                  {t('copyText')}
                </label>
              </>
            ) : (
              <></>
            )}

            <EditEmpInfo empDetails={empInfo} />
          </Box>
        </Box>
        
        
        <EmpPersonalInfo empDetails={empInfo} />
        <EmployeeEnrolledCourses empDetails={empInfo} courses={empCourses} />
      </Box>
    </>
  );
};

EmployeeDetails.individualGuard = true;

EmployeeDetails.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default EmployeeDetails;
