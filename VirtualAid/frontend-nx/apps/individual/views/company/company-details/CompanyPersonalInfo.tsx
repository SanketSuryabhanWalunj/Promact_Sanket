import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import axios from 'axios';
import router from 'next/router';
import {
  Alert,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  Grid,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { InfoContext } from '../../../contexts/InfoContext';
import { CompanyInfoType } from 'apps/individual/types/company';
import CompanyDetails from 'apps/individual/pages/company/details';

import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop';

const GridItem = styled(Grid)(({ theme }) => ({
  color: '#666666',
  fontFamily: "'Outfit', sans-serif",
  padding: '10px 0 0 0 !important',
  fontSize: '14px',

  [theme.breakpoints.up('md')]: {
    padding: '0 16px 12px !important',
    fontSize: '18px',
  },
}));

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const CompanyPersonalInfo = () => {
  const { companyInfo } = useContext(InfoContext);
  const { t, ready } = useTranslation(['company']);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublishSuccess, setIsPublishSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const [showAlert, setShowAlert] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyInfoType>(
    {} as CompanyInfoType
  );

  useEffect(() => {
    if (companyInfo && companyInfo.id) {
      getCompanyProfileData(companyInfo.id);
    }
  }, [companyInfo]);

   // Method to handle file change event
   // @param: e for htmlinput element
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      e.target.value = '';
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || '')
      );
      reader.readAsDataURL(file);
    }
  };
  // Method to load images 
  // @param: e for html image element
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  useEffect(() => {
    // Check if both imgRef and previewCanvasRef are set
    if (imgRef.current && previewCanvasRef.current) {
      // Call handleUpload function when both references are available
      handleUpload();
    }
  }, [imgRef.current, previewCanvasRef.current]);

  // Method to upload images
  const handleUpload = async () => {
    // Ensure imgRef and previewCanvasRef are initialized
    const image = imgRef.current;
    //const previewCanvas = previewCanvasRef.current;
    try {
      if (!selectedFile) {
        throw new Error('No file selected.');
      }

      if (!completedCrop) {
        throw new Error('Crop data missing.');
      }

      if (!imgRef.current) {
        throw new Error('Canvas reference missing.');
      }

      const formData = new FormData();
      formData.append('email', companyInfo.email);

      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const canvas = document.createElement('canvas');
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error(t('failed2dCanvasText'));
      }

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convert the cropped image to a Blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error(t('failedBlogCanvasText'));
        }

        const fileExtension: string =
          selectedFile.name.split('.').pop()?.toLowerCase() || '';
        if (!['jpeg', 'jpg', 'png'].includes(fileExtension)) {
          throw new Error(t('imgFormatText'));
        }

        // Append the cropped image Blob to the FormData
        formData.append('BannerImage', blob);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company/edit-banner-image-for-company/?email=${companyInfo.email}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept-Language': router.locale, // Set content type for FormDatas  
            },
          }
        );

        if (response.status === 204 || response.status === 200) {
          setIsPublishSuccess(true);
          setSubmitMessage(t('imgUploadText'));
          router.reload();
        }
      }, 'image');
    } catch (error) {
      console.error(t('errorUploadingText'), error);
    }
  };

  // publish data function
  const sendPublishData = async () => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company/publish-data-for-company/${companyInfo.id}?publishData=true`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        router.reload();
        setIsPublishSuccess(true);
        setShowAlert(true);
        setSubmitMessage(t('comapany:dataPublishedText'));
      }
    } catch (error) {
      console.error(t('comapany:errorPublishText'), error);
    }
  };

  //un published data function
  const unPublishData = async () => {
    try {
      setIsPublishSuccess(false);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company/publish-data-for-company/${companyInfo.id}?publishData=false`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        router.reload();
        setShowAlert(true);
        setSubmitMessage(t('comapany:dataUnPublishedText'));
      }
    } catch (error) {
      console.error(t('comapany:errorUnPublishText'), error);
    }
  };

 // Method to get company profile data
 // @param: id for company profile info
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
        setCompanyProfile(response.data);
        setSubmitMessage(
          response.data.publishData
            ? t('company:errorPublishText')
            : t('company:errorUnPublishText')
        );
      }
    } catch (error) {
      // console.error(t('comapany:errorFetchingUserText'), error);
    }
  };

  if (!ready || !companyInfo) {
    return null;
  }
  const bannerImageUrl = companyInfo.bannerImage;

  return (
    <Box sx={{ marginTop: '32px' }}>
      <Typography
        sx={{
          padding: '4px 20px',
          background: '#FAF3FF',
          borderRadius: '4px',
          color: '#000000',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {t('personalInformation')}
      </Typography>
      <List>
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('companyName')}
            </GridItem>
            <GridItem item xs={12} sm={8}>
              {companyInfo.companyName}
            </GridItem>
          </Grid>
        </ListItem>
        <Divider />
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('companyId')}
            </GridItem>
            <GridItem item xs={12} sm={8}>
              {companyInfo.id}
            </GridItem>
          </Grid>
        </ListItem>
        <Divider />
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('companyEmail')}
            </GridItem>
            <GridItem item xs={12} sm={8}>
              {companyInfo.email}
            </GridItem>
          </Grid>
        </ListItem>
        <Divider />
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('companyPhone')}
            </GridItem>
            <GridItem item xs={12} sm={8}>
              {companyInfo.contactNumber}
            </GridItem>
          </Grid>
        </ListItem>
        <Divider />
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('bioText')}
            </GridItem>
            <GridItem item xs={12} sm={8}>
              {companyInfo.bio}
            </GridItem>
          </Grid>
        </ListItem>
        <Divider />
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('sloganText')}
            </GridItem>
            <GridItem item xs={12} sm={8}>
              {companyInfo.slogan}
            </GridItem>
          </Grid>
        </ListItem>
        <Divider />
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('noOfEmployeeText')}
            </GridItem>
            <GridItem item xs={12} sm={8}>
              {companyInfo.noOfEmployees}
            </GridItem>
          </Grid>
        </ListItem>
        <Divider />
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('common:heroBannerText')}
            </GridItem>
            <GridItem item xs={12} sm={4}>
              <label
                style={{
                  display: 'block',
                  border: '1px solid #DDDDDD',
                  fontSize: '16px',
                  position: 'relative',
                  borderRadius: '10px',
                  height: '50px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    position: 'absolute',
                    left: '10px',
                    top: '-8px',
                    background: '#fff',
                    fontSize: '10px',
                  }}
                >
                  {t('common:attachMentText')}
                </span>
                <span
                  style={{
                    marginTop: '10px',
                    marginLeft: '10px',
                    display: 'inline-block',
                  }}
                >
                   {t('common:chooseFileText')}
                </span>
                <input
                  type="file"
                  style={{
                    width: '100%',
                    height: '100%',
                    opacity: '0',
                    position: 'absolute',
                    left: '0',
                    top: '0',
                  }}
                  accept="image/*"
                  onChange={handleFileChange}
                ></input>
                {bannerImageUrl ? (
                  <>
                    <Button
                      onClick={handleUpload}
                      sx={{
                        position: 'absolute',
                        right: '0',
                        top: '0',
                        height: '100%',
                        border: '1px solid #DDDDDD',
                        borderTopLeftRadius: '0',
                        borderBottomLeftRadius: '0',
                        borderTopRightRadius: '10px !important',
                        borderBottomRightRadius: '10px !important',
                        color: '#000000',
                      }}
                    >
                      {t('common:changeFileText')}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleUpload}
                    sx={{
                      position: 'absolute',
                      right: '0',
                      top: '0',
                      height: '100%',
                      border: '1px solid #DDDDDD',
                      borderTopLeftRadius: '0',
                      borderBottomLeftRadius: '0',
                      borderTopRightRadius: '10px !important',
                      borderBottomRightRadius: '10px !important',
                      color: '#000000',
                    }}  
                  >
                    {t('company:uploadFileText')}
                  </Button>
                )}
              </label>
              {bannerImageUrl ? (
                <>
                  <label>{t('common:bannerImgText')}</label>
                  <Box sx={{ width: '100%', height: '200px' }}>
                    <img
                      src={bannerImageUrl}
                      alt="Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                </>
              ) : (
                <>{t('common:noImageSelectedText')}</>
              )}

              {!!imgSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              )}
            </GridItem>
          </Grid>
        </ListItem>
      </List>
      {isPublishSuccess ? (
        <Button variant="gradient" onClick={() => unPublishData()}>
              {t('common:unPublishText')}
        </Button>
      ) : (
        <Button variant="gradient" onClick={() => sendPublishData()}>
          {t('common:publishText')}
        </Button>
      )}
       {showAlert && (<>
            {(isPublishSuccess && ready) && (
      <Alert
        severity={isPublishSuccess ? 'success' : 'info'}
        sx={{ mt: '20px' }}
      >
        {submitMessage}
      </Alert>)}</>)}
    </Box>
  );
};

export default CompanyPersonalInfo;
