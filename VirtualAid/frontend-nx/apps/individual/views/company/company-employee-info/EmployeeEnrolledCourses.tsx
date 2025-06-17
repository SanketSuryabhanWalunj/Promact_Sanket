import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import StyledTableCell from '../../../components/styled/TableCell';
import StyledTableRow from '../../../components/styled/TableRow';
import {
  CourseDetailsType,
  UserSubscribedCourseType,
} from '../../../types/courses';
import { EmpInfoType } from '../../../types/emp';

import { getDisplayDate } from '@virtual-aid-frontend/utils';

import { useState } from 'react';
import axios from 'axios';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type EmployeeEnrolledCoursesPropsType = {
  empDetails: EmpInfoType;
  courses: UserSubscribedCourseType[];
};

const EmployeeEnrolledCourses = (props: EmployeeEnrolledCoursesPropsType) => {
  const { empDetails, courses } = props;
 
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateErr, setCerificateErr] = useState(false);
  const [certificateErrMsg, setCertificateErrMsg] = useState('');

  const { t, ready } = useTranslation(['individualAuth', 'common']);
  const router = useRouter();
 // Method to submit data for company info
  // @param: userId for download click
  //         examDetailId for download exam related details
  //         examType for getting exam related details
  const onDownloadClick = async (userId: string, examDetailId: number, examType: string) => {
    try {
      setCertificateLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/download-certificate`,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
        {
          params: {
            userId,
            examDetailId,
            examType,
            culture: router.locale
          },
          responseType: 'blob',
        }
      );

      if (response.status === 200) {
        const headerContentDisp = response.headers['content-disposition'];
        const filename =
          headerContentDisp &&
          headerContentDisp.split('filename=')[1].replace(/["']/g, '');
        const contentType = response.headers['content-type'];

        const blob = new Blob([response.data], { type: contentType });
        const href = window.URL.createObjectURL(blob);

        const el = document.createElement('a');
        el.setAttribute('href', href);
        el.setAttribute(
          'download',
          filename || `certificate-${examDetailId}-${userId}`
        );
        el.click();

        window.URL.revokeObjectURL(`${blob}`);
        setCertificateLoading(false);
        setCerificateErr(false);
        setCertificateErrMsg('');
      } else {
        setCertificateLoading(false);
        setCerificateErr(true);
        setCertificateErrMsg(ready ? t('common:error.unspecific') : '');
      }
    } catch (error) {
      setCertificateLoading(false);
      setCerificateErr(true);
      setCertificateErrMsg(ready ? t('common:error.unspecific') : '');
    }
  };

  if (!ready) {
    return <></>;
  }

  return (
    <>
      <Box sx={{ marginTop: '32px' }}>
        <Typography
          sx={{
            padding: '4px 20px',
            background: '#FAF3FF',
            borderRadius: '4px',
            color: '#000000',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '15px',
          }}
        >
          {t('coursesEnrolled')}
        </Typography>

        {certificateErr && (
          <>
            <Alert severity="error">{certificateErrMsg}</Alert>
          </>
        )}

        {courses.length ? (
          <>
            <TableContainer
              component={Paper}
              sx={{
                marginTop: '30px',
                borderTopLeftRadius: '15px',
                borderTopRightRadius: '15px',
              }}
            >
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell width="15%">
                      {t('courseName')}
                    </StyledTableCell>
                    <StyledTableCell width="20%" align="left">
                      {t('enrolledDate')}
                    </StyledTableCell>
                    <StyledTableCell width="20%" align="left">
                      {t('progress')}
                    </StyledTableCell>
                    <StyledTableCell width="25%" align="left">
                      {t('certificationExpirationDateText')}
                    </StyledTableCell>
                    <StyledTableCell width="10%" align="left">
                      {t('common:action.action')}
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell width="25%" align="left">
                        {course.name} {course.examType}
                      </StyledTableCell>
                      <StyledTableCell width="20%" align="left">
                        {getDisplayDate(course.enrolledDate)}
                      </StyledTableCell>
                      <StyledTableCell width="20%" align="left">
                        <LinearProgress
                          value={course.progress}
                          sx={{
                            width: '60%',
                            height: 10,
                            borderRadius: 5,
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            marginRight: '10px',
                          }}
                          variant="determinate"
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                          }}
                        >
                          {course.progress}%
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell width="25%" align="left">
                      
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                          }}
                        >
                        {course.isCompleted ? (<>{getDisplayDate(course.certificateExpirationDate)}</>):(<></>)}
                          
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell width="10%" align="left">
                        {course.isCompleted ? (
                          <>
                          {new Date(getDisplayDate(course.certificateExpirationDate)) < new Date() ? (<IconButton
                              onClick={() =>
                                onDownloadClick(
                                  empDetails.id,
                                  course.examDetailId,
                                  course.examType 
                                )
                              }
                              disabled
                            >
                              <FileDownloadOutlinedIcon
                                sx={{ color: '#666' }}
                              />
                            </IconButton>) : (<IconButton
                              onClick={() =>
                                onDownloadClick(
                                  empDetails.id,
                                  course.examDetailId, 
                                  course.examType
                                )
                              }
                            >
                              <FileDownloadOutlinedIcon
                                sx={{ color: '#666' }}
                              />
                            </IconButton>)}
                            
                          </>
                        ) : (
                          <></>
                        )}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <>
            <Typography
              sx={{
                padding: '4px 20px',
                color: '#000000',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {t('noCoursesAssigned')}
            </Typography>
          </>
        )}
      </Box>

      <Backdrop
        open={certificateLoading}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.tooltip + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default EmployeeEnrolledCourses;
