import { ChangeEvent, ReactNode, useContext, useState } from 'react';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';

import IconButton from '@mui/material/IconButton';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { useRouter } from 'next/router';

import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { userInfo } from 'os';
import { InfoContext } from '../../contexts/InfoContext';
import { Props } from 'react-apexcharts';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

type feedBackForm = {
  Message: string;
  Category: string;
  UserId: string;
  CompanyId: string;
  Platform: string;
  FormFiles: File[];
};

export const HeaderLayout = (
  { children }: { children: ReactNode },
  props: Props
) => {
  const { window } = props;

  const [dialogOpen, setDialogOpen] = useState(false);
  const cartInstance = useSelector((state: RootState) => state.cart);
  window !== undefined ? () => window().document.body : undefined;
  const router = useRouter();
  const { t, ready } = useTranslation(['course', 'common']);
  const { companyInfo, empInfo, isCompany } = useContext(InfoContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitErrMsg, setSubmitErrMsg] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files); // Convert FileList to Array
      setSelectedFiles(newFiles);
    }
  };
  const defaultFormValues: feedBackForm = {
    Message: '',
    Category: '',
    UserId: '',
    CompanyId: '',
    Platform: '',
    FormFiles: [],
  };
  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogTitle-root': {
      padding: '40px 110px 0 60px',
      marginBottom: '0',
    },
    '& .MuiPaper-rounded': {
      borderRadius: '20px',
    },
    '& .MuiDialogContent-root': {
      [theme.breakpoints.up('sm')]: {
        padding: '20px',
      },
      [theme.breakpoints.up('md')]: {
        padding: '20px 110px 40px 60px',
      },
      [theme.breakpoints.up('lg')]: {
        padding: '20px 110px 40px 60px',
      },
      marginBottom: '44px',
    },
    '& .MuiDialogActions-root': {
      padding: '8px 110px 40px 60px',
      justifyContent: 'flex-start',
    },
  }));

  const categoryOptions = ['BugReport', 'Suggestion'];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<feedBackForm>();

  //const handleDialogOpen = () => setDialogOpen(true);

  const handleDialogClose = () => setDialogOpen(false);
  const category = ['BugReport', 'Suggestion'];
  const onSubmit = async (data: feedBackForm) => {
    const parsedCategory = JSON.parse(data.Category);
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      console.log('Selected Files:', selectedFiles);

      selectedFiles.map((file) => {
        formData.append('FormFiles', file);
      });
      formData.append('Message', data.Message);
      formData.append('Category', parsedCategory);
      formData.append('UserId', empInfo.id ? empInfo.id : '');
      formData.append('CompanyId', companyInfo.id ? companyInfo.id : '');
      formData.append('Platform', 'UserPlatform');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/feedback/feedback/?culture=${router.locale}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Set content type for FormDat
            'Accept-Language': router.locale, // Set content type for FormData
          },
        }
      );

      if (response.status === 200) {
        setIsSubmitting(false);
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Container maxWidth="xl" sx={{ p: { xs: 0 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: { xs: '20px', md: '32px 50px' },
          }}
        >
          <Box>
            <img
              src="/logo.png"
              className="logo"
              style={{ maxHeight: '16px' }}
              alt="logo"
            />
          </Box>
          <Box>
             {/* NOte: for testing hide button */}
            {/* Add button to open feedback dialog */}
            {/* <IconButton
              sx={{
                color: '#212121',
                display: 'inline-block',
                verticalAlign: 'top',
              }}
              onClick={handleDialogOpen}
            >
              <AnnouncementIcon />
            </IconButton> */}
            <IconButton
              onClick={() => {
                router.push('/cart');
              }}
              sx={{
                marginRight: '20px',
                color: '#212121',
              }}
            >
              <Badge badgeContent={cartInstance.data.totalQty} color="primary">
                <ShoppingBagIcon
                  sx={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    fontSize: '21px',
                  }}
                />
              </Badge>
            </IconButton>
            <IconButton
              sx={{
                color: '#212121',
              }}
            >
              <NotificationsIcon
                sx={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  fontSize: '21px',
                }}
              />
            </IconButton>
          </Box>
        </Box>
        {/* Feedback dialog */}
        <BootstrapDialog
          fullWidth
          maxWidth="sm"
          open={dialogOpen}
          onClose={handleDialogClose}
          scroll="paper"
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
          sx={{ borderRadius: '20px' }}
        >
          <DialogTitle
            id="scroll-dialog-title"
            sx={{
              color: '#000000',
              fontSize: '26px',
              fontFamily: "'Outfit', sans-serif",
              marginBottom: '14px !important',
            }}
          >
            {t('feedBackText')}
            
          </DialogTitle>

          <DialogContent dividers sx={{ border: 'none', padding: '' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {isSubmitting && (
                <Alert severity="success" sx={{ mb: '20px' }}>
                  {t('common:feedbackAlertText')}
                </Alert>
              )}
              <Controller
                control={control}
                name="Message"
                rules={{
                  required: {
                    value: true,
                    message: t('firstNameRequiredMsg'),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="textarea"
                    label={t('common:MessageText')}
                    required
                    disabled={isSubmitting}
                    error={!!errors['Message']}
                    helperText={
                      errors['Message'] ? errors['Message'].message : ''
                    }
                    InputProps={{
                      inputProps: { min: 100 },
                    }}
                    sx={{ mb: '20px' }}
                  />
                )}
              />

              <Controller
                control={control}
                name="Category"
                rules={{
                  required: {
                    value: true,
                    message: t('categoryReqText'),
                  },
                }}
                render={({ field }) => (
                  <>
                    <label
                      className="label-dialog"
                      style={{
                        color: 'rgba(0, 0, 0, 0.6)',
                        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                        fontWeight: '400',
                        fontSize: '1rem !important',
                        fontSizeAdjust: '1rem !important',
                        lineHeight: '1.4375em',
                      }}
                    >
                 {t('common:enterText')}
                    </label>
                    <Select
                      {...field}
                      displayEmpty
                      fullWidth
                      sx={{ mb: '20px' }}
                      renderValue={(selected) => {
                        if (selected) {
                          const parsedSelected = JSON.parse(selected);
                          if (parsedSelected) {
                            return parsedSelected;
                          }
                        }
                        return '';
                      }}
                    >
                      {category.map((option) => (
                        <MenuItem
                          value={JSON.stringify(option)}
                          style={{ whiteSpace: 'normal' }}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              />
              <Controller
                control={control}
                name="FormFiles"
                render={({ field }) => (
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
                     {t('common:chooseText')}
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
                      multiple
                      onChange={handleFileChange}
                    ></input>

                    <>
                      <Button
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
                        {t('common:browseText')}
                      </Button>
                    </>
                  </label>
                )}
              />
              <DialogActions sx={{ mt: 2, padding: '0 !important', marginTop: '20px'}}>
                <Button
                  variant="gradient"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size="1.75rem" />
                  ) : (
                    t('common:action.submit')
                  )}
                </Button>
                <Button
                  disabled={isSubmitting}
                  variant="outlined"
                  onClick={() => setDialogOpen(false)}
                >
                  {t('common:action.cancel')}
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </BootstrapDialog>
        {children}
      </Container>
    </>
  );
};
export default HeaderLayout;
