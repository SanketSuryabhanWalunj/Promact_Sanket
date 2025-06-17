import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import { styled } from '@mui/material/styles';

import { ProfileLayout } from '../../../layouts/components/ProfileLayout';

import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import EmpPersonalInfo from '../../../views/shared/emp-info/EmpPersonalInfo';
import EmployeeEnrolledCourses from '../../../views/company/company-employee-info/EmployeeEnrolledCourses';

import { CompanyEmployeeType } from '../../../types/company';
import {
  CourseDetailsType,
  UserSubscribedCourseType,
} from '../../../types/courses';

import axios, { isAxiosError } from 'axios';

import { InfoContext } from '../../../contexts/InfoContext';
import EditEmpInfo from '../../../views/shared/edit-emp-info/EditEmpInfo';;
import { EmpInfoType } from '../../../types/emp';

import { useTranslation } from 'next-i18next';



const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    padding: '20px 60px',
    marginBottom: '0',
  },
  '& .MuiPaper-rounded': {
    borderRadius: '20px',
    maxHeight: 'calc(100% - 8px)',
  },
  '& .MuiDialogContent-root': {
    [theme.breakpoints.up('sm')]: {
      padding: '20px',
    },
    [theme.breakpoints.up('md')]: {
      padding: '0 110px 0 60px',
    },
    [theme.breakpoints.up('lg')]: {
      padding: '0 110px 0 60px',
    },
    marginBottom: '20px',
  },
  '& .MuiDialogActions-root': {
    padding: '8px 60px 20px 60px',
    justifyContent: 'flex-start',
  },
}));

const CompanyEmployeeInfo = () => {
  const router = useRouter();

  const { companyInfo } = useContext(InfoContext);

  const [empDetails, setEmpDetails] = useState<EmpInfoType>({} as EmpInfoType);
  const [empCourses, setEmpCourses] = useState<UserSubscribedCourseType[]>([]);
  const [isEmpLoading, setIsEmpLoading] = useState(false);
  const [isEmpErr, setIsEmpErr] = useState(false);
  const [empErrMsg, setEmpErrMsg] = useState('');

  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isActivityErr, setIsActivityErr] = useState(false);
  const [activityErrMsg, setActivityErrMsg] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);

  const [isTerminatedEmp, setIsTerminatedEmp] = useState(false);

  const { t, ready } = useTranslation(['company', 'common']);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
 
  const [isPublishSuccess, setIsPublishSuccess] = useState(false);

  // get employee details using routing query id
  const getEmpDetails = useCallback(async () => {
    try {
      setIsEmpLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/user-details-by-id/${router.query.id}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        if (response.data.currentCompanyId === companyInfo.id) {
          setIsTerminatedEmp(false);
        } else {
          setIsTerminatedEmp(true);
        }
        setEmpDetails(response.data);
        setIsEmpLoading(false);
        setIsEmpErr(false);
        setEmpErrMsg('');
      }
    } catch (error) {
      setIsEmpLoading(false);
      setIsEmpErr(true);
      setEmpErrMsg(t('common:error.unspecific'));
    }
  }, [companyInfo.id, router.query.id, t]);

  // get company profile data function 
  // @param: id is used to get id wise company profile data
  const getEmpCourse = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/enrolled-courses-by-user-id/${router.query.id}/?culture=${router.locale}`,
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
  }, [router.query.id]);

  useEffect(() => {
    if (router.isReady) {
      getEmpDetails();
      getEmpCourse();
      getUserProfileData(empDetails.id);
    }
  }, [getEmpCourse, getEmpDetails, router.isReady]);

  // method to terminate employee
  const onTerminate = async () => {
    try {
      setIsActivityLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company-employee/employee/${empDetails.id}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        router.reload();
      }
    } catch (error) {
      setIsActivityLoading(false);
      setIsActivityErr(true);
      setDialogOpen(false);
      if (isAxiosError(error)) {
        if (error.response?.data?.error?.message) {
          setActivityErrMsg(error.response?.data?.error?.message);
        } else {
          setActivityErrMsg(t('common:error.unspecific'));
        }
      } else {
        setActivityErrMsg(t('common:error.unspecific'));
      }
    }
  };

  // Method to reassign employees after certificate expire
  const onReassign = async () => {
    try {
      setIsActivityLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company-employee/reassign-employee-to-company-by-id?companyId=${companyInfo.id}&userId=${empDetails.id}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        router.reload();
      }
    } catch (error) {
      setIsActivityLoading(false);
      setIsActivityErr(true);
      setDialogOpen(false);
      if (isAxiosError(error)) {
        if (error.response?.data?.error?.message) {
          setActivityErrMsg(error.response?.data?.error?.message);
        } else {
          setActivityErrMsg(t('common:error.unspecific'));
        }
      } else {
        setActivityErrMsg(t('common:error.unspecific'));
      }
    }
  };
  // Method to close dialog function
  // @param: event object for backdrop object
  const handleCloseDialog = (_event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setDialogOpen(false);
    }
  };

  // Method to get user profile data
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
      console.error('Error fetching user profile data:', error);
    }
  };

  const profileUrl = empDetails.profileImage;
  let initials = '';
  if (empDetails.firstName && empDetails.lastName) {
    initials = empDetails.firstName.charAt(0) + empDetails.lastName.charAt(0);
  } else if (empDetails.firstName) {
    initials = empDetails.firstName.charAt(0);
  } else if (empDetails.lastName) {
    initials = empDetails.lastName.charAt(0);
  }
  
  return (
    <>
      <Box
        className="company-details"
        sx={{ padding: { xs: '20px', md: '30px 50px 50px 50px' } }}
      >
        {isEmpLoading || !ready ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : isEmpErr ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            {empErrMsg}
          </Box>
        ) : (
          <>
            <BootstrapDialog
              open={dialogOpen}
              fullWidth
              maxWidth="sm"
              scroll="paper"
              sx={{ borderRadius: '20px' }}
              disableEscapeKeyDown
              onClose={handleCloseDialog}
            >
              <DialogTitle>
                {isTerminatedEmp
                  ? t('reAssignPrompt', {
                      name: `${empDetails.firstName} ${empDetails.lastName}`,
                    })
                  : t('termiatePrompt', {
                      name: `${empDetails.firstName} ${empDetails.lastName}`,
                    })}
              </DialogTitle>
              <DialogActions>
                <Button
                  variant="gradient"
                  onClick={() =>
                    isTerminatedEmp ? onReassign() : onTerminate()
                  }
                  disabled={isActivityLoading}
                >
                  {t('common:action.confirm')}
                </Button>
                <Button
                  variant="text"
                  disabled={isActivityLoading}
                  onClick={() => setDialogOpen(false)}
                >
                  {t('common:action.cancel')}
                </Button>
              </DialogActions>
            </BootstrapDialog>
            <Box
              sx={{
                display: {md: 'flex', sm: 'block'},
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box
                
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
                    src={
                      'https://virtualaid-dev-files.s3.eu-central-1.amazonaws.com/' +
                      profileUrl
                    }
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                 
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
                  {initials}
                 
                </Box>
               
              </>
            )}
                <Box
                  sx={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    mx: '30px',
                  }}
                >
                  <Typography
                    sx={{
                      display: 'block',
                      fontSize: { xs: '14px', md: '16px' },
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {empDetails.firstName + ' ' + empDetails.lastName}
                  </Typography>
                  <Typography
                    sx={{
                      display: 'block',
                      fontSize: { xs: '14px', md: '16px' },
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {empDetails.email}
                  </Typography>
                </Box>
               
              </Box>
              </Box>
              <Box sx={{ lineHeight: { xs: '60px', md: '78px' } }}>
              {!isActivityLoading && <EditEmpInfo empDetails={empDetails} />}
                <Button
                  variant="outlined"
                  disabled={isActivityLoading}
                  onClick={() => setDialogOpen(true)}
                  sx={{ml: '20px'}}
                >
                  {isActivityLoading ? (
                    <CircularProgress size="1.75rem" />
                  ) : (
                    <>
                      {isTerminatedEmp
                        ? t('common:action.reAssign')
                        : t('common:action.terminate')}
                    </>
                  )}
                </Button>
              </Box>

            </Box>
            {isActivityErr && (
              <Alert severity="error" sx={{ mt: '20px' }}>
                {activityErrMsg}
              </Alert>
            )}
            <EmpPersonalInfo empDetails={empDetails} />
            <EmployeeEnrolledCourses
              empDetails={empDetails}
              courses={empCourses}
            />
          </>
        )}
      </Box>
    </>
  );
};

CompanyEmployeeInfo.companyGuard = true;

CompanyEmployeeInfo.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default CompanyEmployeeInfo;
