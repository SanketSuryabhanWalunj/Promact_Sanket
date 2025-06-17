import { ChangeEvent, ReactNode, useContext, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton, {
  ListItemButtonProps,
} from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Badge from '@mui/material/Badge';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PieChartOutlinedIcon from '@mui/icons-material/PieChartOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';

import { InfoContext } from '../../contexts/InfoContext';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import Link from 'next/link';

import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useRouter } from 'next/router';

import { getInitials } from '@virtual-aid-frontend/utils';

import { useTranslation } from 'next-i18next';
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
import { Controller, useForm } from 'react-hook-form';
import axios from 'axios';
import { t } from 'i18next';

type feedBackForm = {
  Message: string;
  Category: string;
  UserId: string;
  CompanyId: string;
  Platform: string;
  FormFiles: File[];
};

const drawerWidth = 240;
interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

const ListButton = styled(ListItemButton)<
  ListItemButtonProps & { component?: typeof Link; href?: string }
>(() => ({
  background: 'transparent',
  padding: '5px  0px 5px  15px',
  width: '100%',
  marginBottom: '10px',
  borderRadius: '20px !important',
  '&:hover': {
    background: '#F5E8FF !important',
  },
}));

const ListIcon = styled(ListItemIcon)({
  marginRight: '-20px',
  color: '#666666',
  fontSize: '18px',
  '& .MuiSvgIcon-fontSizeMedium': {
    fontSize: '18px',
  },
});

const ListText = styled(ListItemText)({
  color: '#666666',
  fontSize: '12px',
  '& .MuiListItemText-primary': {
    fontSize: '12px',
  },
});

const DashboardLinks = () => {
  const router = useRouter();

  const { isCompany } = useContext(InfoContext);

  const { t, ready } = useTranslation(['individualDashboard', 'common']);

  const onLogoutClick = () => {
    window.localStorage.removeItem(process.env.NEXT_PUBLIC_USER!);
    router.replace('/login');
  };

  const highlight = (currentPath: string) => {
    if (currentPath === router.route) {
      return {
        backgroundColor: '#EEE',
        '& .MuiListItemIcon-root': {
          color: '#5C00A8',
        },
        '& .MuiListItemText-root': {
          color: '#5C00A8',
        },
      };
    }
  };

  const companyLinks = () => {
    return (
      <List
        sx={{ width: '100%', maxWidth: '100%', bgcolor: 'transparent' }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        <ListButton
          component={Link}
          href="/company/dashboard"
          sx={highlight('/company/dashboard')}
        >
          <ListIcon>
            <DashboardOutlinedIcon />
          </ListIcon>
          <ListText primary={ready && t('dashboard')} />
        </ListButton>
        <ListButton
          component={Link}
          href="/course/list"
          sx={highlight('/course/list')}
        >
          <ListIcon>
            <ImportContactsIcon />
          </ListIcon>
          <ListText primary={ready && t('courses')} />
        </ListButton>
        <ListButton
          component={Link}
          href="/company/employees"
          sx={highlight('/company/employees')}
        >
          <ListIcon>
            <AssignmentIndOutlinedIcon />
          </ListIcon>
          <ListText primary={ready && t('employees')} />
        </ListButton>
        <ListButton
          component={Link}
          href="/payments"
          sx={highlight('/payments')}
        >
          <ListIcon>
            <AccountBalanceWalletOutlinedIcon />
          </ListIcon>
          <ListText primary={ready && t('payments')} />
        </ListButton>
        <ListButton
          component={Link}
          href="/company/report"
          sx={highlight('/company/report')}
        >
          <ListIcon>
            <PieChartOutlinedIcon />
          </ListIcon>
          <ListText primary={ready && t('report')} />
        </ListButton>
        <ListButton onClick={onLogoutClick}>
          <ListIcon>
            <LogoutOutlinedIcon />
          </ListIcon>
          <ListText primary={ready && t('logout')} />
        </ListButton>
      </List>
    );
  };

  const empLinks = () => {
    return (
      <List
        sx={{ width: '100%', maxWidth: '100%', bgcolor: 'transparent' }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        <ListButton
          component={Link}
          href="/user/dashboard"
          sx={highlight('/user/dashboard')}
        >
          <ListIcon>
            <DashboardOutlinedIcon />
          </ListIcon>
          <ListText primary={ready && t('dashboard')} />
        </ListButton>
        <ListButton
          component={Link}
          href="/course/list"
          sx={highlight('/course/list')}
        >
          <ListIcon>
            <ImportContactsIcon />
          </ListIcon>
          <ListText primary={ready && t('courses')} />
        </ListButton>
        <ListButton
          component={Link}
          href="/payments"
          sx={highlight('/payments')}
        >
          <ListIcon>
            <AccountBalanceWalletOutlinedIcon />
          </ListIcon>
          <ListText primary={ready && t('payments')} />
        </ListButton>
        <ListButton onClick={onLogoutClick}>
          <ListIcon>
            <LogoutOutlinedIcon />
          </ListIcon>
          <ListText primary={ready && t('logout')} />
        </ListButton>
      </List>
    );
  };

  return <>{isCompany ? companyLinks() : empLinks()}</>;
};

export const ProfileLayout = (
  { children }: { children: ReactNode },
  props: Props
) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const container =
    window !== undefined ? () => window().document.body : undefined;
  const router = useRouter();

  const { companyInfo, empInfo, isCompany } = useContext(InfoContext);

  const [isDesktop, setDesktop] = useState(false);

  const cartInstance = useSelector((state: RootState) => state.cart);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitErrMsg, setSubmitErrMsg] = useState('');
  const { t, ready } = useTranslation(['course', 'common']);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files); // Convert FileList to Array
      setSelectedFiles(newFiles);
    }
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
  const defaultFormValues: feedBackForm = {
    Message: '',
    Category: '',
    UserId: '',
    CompanyId: '',
    Platform: '',
    FormFiles: [],
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };


  const handleDialogClose = (_event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setDialogOpen(false);
    }
  };
 
  const category = ['BugReport', 'Suggestion'];
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<feedBackForm>({
    defaultValues: defaultFormValues,
  });
  const isPlatFormUser = router.query.admin ? 'false' : 'true';
  
  const onSubmit = async (data: feedBackForm) => {
    const parsedCategory = JSON.parse(data.Category)
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      console.log("Selected Files:", selectedFiles);

      selectedFiles.map((file) => {
        formData.append('FormFiles', file);

      });
       formData.append('Message', data.Message);
       formData.append('Category', parsedCategory)
       formData.append('UserId', empInfo.id ? empInfo.id : '');
       formData.append('CompanyId', companyInfo.id ? companyInfo.id : '')
       formData.append('Platform', 'UserPlatform')
    
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/feedback/feedback/?culture=${router.locale}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept-Language': router.locale, // Set content type for FormDatas  
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
  useEffect(() => {
    if (innerWidth >= 900) {
      setDesktop(true);
    } else {
      setDesktop(false);
    }

    const updateMedia = () => {
      if (innerWidth >= 900) {
        setDesktop(true);
      } else {
        setDesktop(false);
      }
    };
    addEventListener('resize', updateMedia);
    return () => removeEventListener('resize', updateMedia);
  }, []);
  const profileUrl = empInfo.profileImage;
  const profileUrlCompany = companyInfo.profileImage;




  return (
    <>
      <Grid
        container
        className="profile-layout"
        component="main"
        sx={{ height: '100vh' }}
      >
        {/* grid left profile container */}
        <Grid
          item
          xs={12}
          md={12}
          lg={3}
          sx={{
            padding: {
              xs: '20px',
              md: '30px',
              lg: '32px 20px 60px 30px',
            },
            background: '#F7F7F7',
            position: { xs: 'relative', md: 'relative', lg: 'fixed' },
            top: { xs: 'auto', md: 'auto', lg: '0' },
            bottom: { xs: 'auto', md: 'auto', lg: '0' },
            width: '300px',
            textAlign: 'center',
          }}
          className='sidebar-menu'
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: { xs: '20px', md: '50px' },
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

            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: 'block', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
          <Link
            href={isCompany ? '/company/details' : '/user/details'}
            style={{ textDecoration: 'none' }}
          >
            <Box
              sx={{
                marginBottom: '20px',
                height: { xs: '140px', md: '140px', lg: '140px' },
                width: '140px',
                margin: '0 auto',
                borderRadius: '20px',
                position: 'relative',
                background: '#E4C4FF',
                color: '#890B89',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '20px',
                fontFamily: 'Open Sans, Bold',
                cursor: 'pointer',
              }}
            >
              {isCompany ? (
                profileUrlCompany ? (
                  <img
                    src={profileUrlCompany}
                    height="100%"
                    width="100%"
                    style={{ objectFit: 'cover' }}
                    alt="Company Profile Image"
                  />
                ) : (
                  getInitials(companyInfo.companyName)
                )
              ) : profileUrl ? (
                <img
                  src={profileUrl}
                  height="100%"
                  width="100%"
                  style={{ objectFit: 'cover' }}
                  alt="User Profile Image"
                />
              ) : (
                getInitials(
                  (empInfo?.firstName ? empInfo.firstName : '') +
                    ' ' +
                    (empInfo?.lastName ? empInfo.lastName : '')
                )
              )}
            </Box>
          </Link>
          <Box
            sx={{
              marginBottom: '20px',
              textAlign: 'center',
              width: '100%',
              borderRadius: '20px',
              marginTop: '10px',
            }}
          >
            <Typography
              sx={{
                fontSize: '20px',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {isCompany
                ? companyInfo.companyName
                : empInfo.firstName + ' ' + empInfo.lastName}
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                color: '#333333',
              }}
            >
              {isCompany ? companyInfo.email : empInfo.email}
            </Typography>
          </Box>
          {isDesktop ? (
            <DashboardLinks />
          ) : (
            <Drawer
              container={container}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                display: { sm: 'block', md: 'none' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: drawerWidth,
                },
              }}
            >
              <DashboardLinks />
            </Drawer>
          )}
        </Grid>
        {/* grid right header and dashboard container */}
        <Grid
          item
          xs={12}
          md={12}
          lg={9}
          sx={{
            position: { xs: 'relative', md: 'relative', lg: 'fixed' },
            left: { xs: '0', md: '0', lg: '300px' },
            maxWidth: { xs: '100%', md: '100%', lg: '78%' },
            top: '0',
            width: '100%',
            background: '#fff',
            zIndex: '9',
            
          }}
          className="absolute-pos"
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: { xs: '10px 20px', md: '23px 50px 24px 50px' },
            }}
          >
            <Typography sx={{ fontSize: '26px', fontWeight: 600 }}>
            {ready && t('common:goodMorningText')}
            </Typography>
            <Box>
              {/* NOte: for testing hide button */}
              <IconButton
                sx={{
                  color: '#212121',
                  display: 'inline-block',
                  verticalAlign: 'top',
                }}
                onClick={() => {
                  handleDialogOpen();
                }}
              >
                <AnnouncementIcon></AnnouncementIcon>
              </IconButton>

              <IconButton
                onClick={() => {
                  router.push('/cart');
                }}
                sx={{
                  marginRight: '20px',
                  color: '#212121',
                  position: 'relative',
                }}
              >
                <Badge
                  badgeContent={cartInstance.data.totalQty}
                  color="primary"
                >
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
            {/* This code maybe helpful to do responsive  */}
          </Box>
        </Grid>
        <Box
          sx={{
            marginTop: { xs: '0', lg: '90px' },
            marginLeft: { xs: '0', lg: '300px' },
            width: '100%',
          }}
        >
          {children}
        </Box>
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
            {t('common:feedBackText')}
          </DialogTitle>

          <DialogContent dividers sx={{ border: 'none', padding: '' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
            {isSubmitting &&(
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
      </Grid>
    </>
  );
};
