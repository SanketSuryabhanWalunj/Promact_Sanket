import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import { ProfileLayout } from '../../../layouts/components/ProfileLayout';

import {
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

// import { styled } from '@mui/material/styles';

import EditProfile from '../../../views/company/company-details/EditProfile';

import { InfoContext } from '../../../contexts/InfoContext';
import CompanyPersonalInfo from '../../../views/company/company-details/CompanyPersonalInfo';

import { getInitials } from '@virtual-aid-frontend/utils';
import { Button, IconButton, Link, styled } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import axios from 'axios';
import router from 'next/router';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import { useTranslation } from 'react-i18next';

// hide upload button style function
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

const CompanyDetails = () => {
  const { companyInfo } = useContext(InfoContext);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPublishSuccess, setIsPublishSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { t, ready } = useTranslation(['company', 'common']);
  // Method to handle file upload 
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
        formData.append('email', companyInfo.email);
        formData.append('ProfileImage', file);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company/edit-profile-image-for-company?email=${companyInfo.email}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept-Language': router.locale, // Set content type for FormDatas  
              
            },
          }
        );
        if (response.status === 204 || response.status === 200) {
          // Assuming the response contains the URL of the uploaded image
          setImageUrl(response.data);
          router.reload();
        }
      
      } catch (error) {
        console.error(t('noImageSelectedText'));
      } finally {
        // Reset selected file and uploading state
        setUploading(false);
      
      }
  
  }
}

  // get company profile data function 
  // @param: id is used to get id wise company profile data
  const getCompanyProfileData = async (id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company/public-profile-details-of-company/${id}`,
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

  // handle copy click function to copy paste the content
  const handleCopyClick = async () => {
    try {
      const link = typeof window !== undefined 
      if (link) {
        await navigator.clipboard.writeText(`${window.location.origin}/company/${companyInfo.id}`)
        alert(t('copiedText'));
      } else {
        throw Error
      }
    } catch (err) {
      console.error(t('unableCopyText'), err);
      alert(t('copiedFailedText'));
    }
  };
//  profile image url 
  const profileUrl = companyInfo.profileImage;

  // company profile data 
  useEffect(() => {
    if (companyInfo?.id) {
      getCompanyProfileData(companyInfo.id);
    }
  }, [companyInfo.id]);

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
                    <EditIcon sx={{ fontSize: '12px' }}></EditIcon>
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
                  {companyInfo.companyName[0]}
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
                {companyInfo.companyName}
              </Typography>
              <Typography
                sx={{
                  display: 'block',
                  fontSize: { xs: '14px', md: '16px' },
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {companyInfo.email}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ lineHeight: { xs: '60px', md: '78px' } }}>
          <Link href={`/company/${companyInfo.id}?isPreviewRequest=true`} sx={{cursor: 'pointer'}}>
            <IconButton
              sx={{
                fontSize: { xs: '20px', md: '21px' },
                color: '#5C00A8',
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
                cursor:'pointer'
              }}
            >
           {t('previewText')}
            </label>
            </Link>
            {isPublishSuccess ? (
              <>
              <InsertLinkIcon
                    onClick={handleCopyClick}
                    sx={{
                      display: 'inline-block',
                      verticalAlign: 'middle',

                      color: '#5C00A8',
                      transform: 'rotate(120deg)',
                    }}
                  >
                <IconButton
                  sx={{
                    fontSize: { xs: '20px', md: '21px' },
                    color: '#AAAAAA',
                    padding: '5px',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                  }}
                >
                  
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
                </InsertLinkIcon>
              </>
            ) : (
              <></>
            )}
            <EditProfile />
          </Box>
        </Box>

        <CompanyPersonalInfo />
      </Box>
    </>
  );
};

CompanyDetails.companyGuard = true;

CompanyDetails.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default CompanyDetails;
