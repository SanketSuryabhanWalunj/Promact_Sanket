import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

import { styled } from '@mui/material/styles';
import { CompanyEmployeeType } from '../../../types/company';
import { EmpInfoType } from '../../../types/emp';

import { useTranslation } from 'next-i18next';
import { Alert, Button } from '@mui/material';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import router from 'next/router';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop';
import { InfoContext } from 'apps/individual/contexts/InfoContext';

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

const EmpPersonalInfo = ({ empDetails }: { empDetails: EmpInfoType }) => {
  const { t, ready } = useTranslation(['individualAuth', 'common','company']);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isPublishSuccess, setIsPublishSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const [showAlert, setShowAlert] = useState(false);
  const { isCompany } = useContext(InfoContext);
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
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };
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
      formData.append('email', empDetails.email);

      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const canvas = document.createElement('canvas');
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get 2d context from canvas');
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
          throw new Error('Failed to create Blob from cropped image');
        }

        const fileExtension: string =
          selectedFile.name.split('.').pop()?.toLowerCase() || '';
        if (!['jpeg', 'jpg', 'png'].includes(fileExtension)) {
          throw new Error(t('imgFormatText'));
        }

        // Append the cropped image Blob to the FormData
        formData.append('BannerImage', blob);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/edit-banner-image-for-user/?email=${empDetails.email}`,
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
          setSubmitMessage(t('company:imgUploadText'));
          router.reload();
        }
      }, 'image');
    } catch (error) {
      console.error(t('company:errorUploadingText'), error);
    }
  };

  const bannerImageUrl = empDetails.bannerImage;

  const sendPublishData = async (data: EmpInfoType) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/publish-data-for-user/${data.id}?publishData=true`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        router.reload();
        setIsPublishSuccess(true);
        setSubmitMessage(t('company:dataPublishedText'));
        setShowAlert(true);
      }
    } catch (error) {
      console.error(t('company:errorPublishText'), error);
    }
  };

  const unPublishData = async (data: EmpInfoType) => {
    try {
      setIsPublishSuccess(false);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/publish-data-for-user/${data.id}?publishData=false`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        router.reload();
        setSubmitMessage(t('company:dataUnPublishedText'));
        setShowAlert(true);
      }
    } catch (error) {
      console.error(t('company:errorUnPublishText'), error);
    }
  };

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

  useEffect(() => {
    if (empDetails?.id) {
      getUserProfileData(empDetails.id);
    }
    // Check if both imgRef and previewCanvasRef are set
    if (imgRef.current && previewCanvasRef.current) {
      // Call handleUpload function when both references are available
      handleUpload();
    }
  }, [empDetails.id, imgRef.current, previewCanvasRef.current]);

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
              {t('firstNameLabel')}
            </GridItem>
            <GridItem item xs={12} sm={4}>
              {empDetails.firstName}
            </GridItem>
          </Grid>
        </ListItem>

        <Divider />

        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('lastNameLabel')}
            </GridItem>
            <GridItem item xs={12} sm={4}>
              {empDetails.lastName}
            </GridItem>
          </Grid>
        </ListItem>

        <Divider />

        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('emailAddressLabel')}
            </GridItem>
            <GridItem item xs={12} sm={4}>
              {empDetails.email}
            </GridItem>
          </Grid>
        </ListItem>

        <Divider />

        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('contactLabel')}
            </GridItem>
            <GridItem item xs={12} sm={4}>
              {empDetails.contactNumber}
            </GridItem>
          </Grid>
        </ListItem>
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('roleText')}
            </GridItem>
            <GridItem item xs={12} sm={4}>
              {empDetails.designation}
            </GridItem>
          </Grid>
        </ListItem>

        {/* Address not yet taken */}
        <Divider />
        {/* Address not yet taken */}
        <Divider />
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('address')}
            </GridItem>
            <GridItem item xs={12} sm={4}>
              {empDetails.address1 ? empDetails.address1 + ', ' : ''}
              {empDetails.address2 ? empDetails.address2 + ', ' : ''}
              {empDetails.address3 ? empDetails.address3 + ', ' : ''}
              {empDetails.city ? empDetails.city + ', ' : ''}
              {empDetails.state ? empDetails.state + ', ' : ''}
              {empDetails?.country ? empDetails.country + '. ' : ''}
              {empDetails?.postalcode ? empDetails?.postalcode : ''}
            </GridItem>
          </Grid>
        </ListItem>

        <Divider />
        <Divider />
        <ListItem>
          <Grid container spacing={2} sx={{ margin: '0' }}>
            <GridItem item xs={12} sm={4}>
              {t('aboutMeText')}
            </GridItem>
            <GridItem item xs={12} sm={4}>
              {empDetails.bio}
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
              {!isCompany && (
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
              )}

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
        {!isCompany && (
          <>
            {' '}
            {isPublishSuccess ? (
              <Button
                variant="gradient"
                onClick={() => unPublishData(empDetails)}
              >
                {t('common:unPublishText')}
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={() => sendPublishData(empDetails)}
              >
                {t('common:publishText')}
              </Button>
            )}
            
            <Box>
              {showAlert && (<>
            {(isPublishSuccess && ready) ? (
              <Alert severity="success" sx={{ mb: '20px' }}>
                {submitMessage}
              </Alert>
            ) : (
              <>
                <Alert severity="success" sx={{ mb: '20px' }}>
                  {submitMessage}
                </Alert>
              </>
            )}
         </> )}
            </Box>
          </>
          
        )}
      </List>
    </Box>
  );
};

export default EmpPersonalInfo;
