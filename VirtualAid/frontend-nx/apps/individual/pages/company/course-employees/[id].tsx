import { ProfileLayout } from '../../../layouts/components/ProfileLayout';
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import StyledTableRow from '../../../components/styled/TableRow';
import StyledTableCell from '../../../components/styled/TableCell';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';

import { styled } from '@mui/material/styles';

import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { useRouter } from 'next/router';
import axios from 'axios';

import { InfoContext } from '../../../contexts/InfoContext';
import { CourseDetailsType, CourseModuelType, SubscribedCourseType } from '../../../types/courses';
import {
  CompanyEmployeeType,
  CourseEnrolledEmployeeType,
} from '../../../types/company';
import AssignCourseDialog from '../../../views/company/company-course-list/AssignCourseDialog';
import { getDisplayDate, getInitials } from '@virtual-aid-frontend/utils';

import useSearchHook from '../../../hooks/useSearchHook';

import { useTranslation } from 'next-i18next';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));

const EmployeeCourse = () => {
  const { companyInfo } = useContext(InfoContext);
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [coursesFromApi, setCoursesFromApi] = useState<SubscribedCourseType[]>(
    []
  );
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [isCoursesError, setIsCoursesError] = useState(false);
  const [coursesErrMsg, setCoursesErrMsg] = useState('');

  const [currentCourse, setCurrentCourse] =
    useState<SubscribedCourseType | null>(null);
  const [isCurrentCourseLoading, setIsCurrentCourseLoading] = useState(false);

  const [alreadyAssignedEmps, setAlreadyAssignedEmps] = useState<
    CourseEnrolledEmployeeType[]
  >([]);

  const { searchText, searchComponent } = useSearchHook(400);

  const [filterAssignedEmps, setFilterAssignedEmps] = useState<
    CourseEnrolledEmployeeType[]
  >([]);

  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateErr, setCerificateErr] = useState(false);
  const [certificateErrMsg, setCertificateErrMsg] = useState('');
 
  const { t, ready } = useTranslation(['company', 'common']);

  //Method to change page on pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

 //Method to handle change rows per page
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  //Method to fetch course and employee info
  const fetchCourseAndEmployeeInfo = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/subscribed-courses-by-company-id/${companyInfo.id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
    
      if (response.status === 200) {
        setCoursesFromApi(response.data);
        setIsCoursesLoading(false);
        setIsCoursesError(false);
        setCoursesErrMsg('');
      }
      
    } catch (error) {
      setIsCoursesLoading(false);
      setIsCoursesError(true);
      setCoursesErrMsg(t('common:somethingWentWrong'));
    }
    
  }, [companyInfo.id]);

  //Method to find current course
  const findCurrentCourse = useCallback(() => {
    setIsCurrentCourseLoading(true);
    const course = coursesFromApi.find(
      (item) =>
        item.courseSubscriptionMappingId === parseInt(router.query.id as string)
    );

    if (course) {
      setCurrentCourse(course as SubscribedCourseType);
      setAlreadyAssignedEmps(course.employeeDetails);
      setIsCurrentCourseLoading(false);
      
    } else {
      setIsCurrentCourseLoading(false);
    }
    
    
  }, [coursesFromApi, router.query.id]);
 
  useEffect(() => {
    if (router.isReady) {
      fetchCourseAndEmployeeInfo();
    }
  }, [fetchCourseAndEmployeeInfo, router.isReady]);

  useEffect(() => {
    if (router.isReady && router.query.id && coursesFromApi.length) {
      findCurrentCourse();
    }
  }, [
    coursesFromApi.length,
    findCurrentCourse,
    router.isReady,
    router.query.id,
  ]);
  
//Method to set visible rows
  const visibleRows = useMemo(() => {
    if (searchText) {
      return filterAssignedEmps.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );
    } else {
      return alreadyAssignedEmps.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );
    }
  }, [alreadyAssignedEmps, filterAssignedEmps, page, rowsPerPage, searchText]);

  //Method to filter assigned employee by keyword
  const filterAssignedEmployeeByKeyword = useCallback(() => {
    const arr = alreadyAssignedEmps.filter((emp) => {
      const fullName = emp.firstName + ' ' + emp.lastName;
      if (
        fullName.toLowerCase().search(searchText?.toLowerCase() as string) >= 0
      ) {
        return true;
      } else {
        return false;
      }
    });

    setPage(0);
    setFilterAssignedEmps(arr);
  }, [alreadyAssignedEmps, searchText]);

  useEffect(() => {
    if (searchText) {
      filterAssignedEmployeeByKeyword();
    }
  }, [filterAssignedEmployeeByKeyword, searchText]);

  //Method to download certificate
  //@param: userId: used for download certificate userwise
  //        examDetailsId used for examdetail wise certificate
  const onClickCertiDownload = async (userId: string, examDetailId: number) => {
    try {
      setCertificateLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/download-certificate`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        },
        {
          params: {
            userId,
            examDetailId,
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
        setCertificateErrMsg(t('common:somethingWentWrong'));
      }
    } catch (error) {
      setCertificateLoading(false);
      setCerificateErr(true);
      setCertificateErrMsg(t('common:somethingWentWrong'));
    }
  };
  
  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          marginTop: '15px',
          padding: { xs: '0 20px', lg: '0 50px !important' },
        }}
      >
        {isCoursesLoading ||
        isCurrentCourseLoading ||
        !currentCourse ||
        !ready ? (
          <>
            <Skeleton variant="rectangular" width="100%" height="500px" />
          </>
        ) : (
          <>
            {isCoursesError ? (
              <>
                <Box display="flex" justifyContent="center" alignItems="center">
                  {coursesErrMsg}
                </Box>
              </>
            ) : (
              <>
                {searchComponent()}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    flexDirection: { xs: 'column', md: 'row' },
                    mb: '30px',
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: '#6C107F',
                        fontSize: '24px',
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      {currentCourse.resCourseDetail.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#000',
                        fontSize: '14px',
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      {t('assignedEmps', {
                        count: currentCourse.employeeDetails.length,
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ my: '10px' }}>
                    <AssignCourseDialog course={currentCourse} />
                  </Box>
                </Box>
                {visibleRows.length > 0 ? (
                  <>
                    <Box sx={{ mb: 2, color: '#666666' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <PersonIcon />
                        &#x1F80A;
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {t('purchasedByEmp')}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <BusinessIcon /> &#x1F80A;
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {t('purchasedByCompany')}
                        </Typography>
                      </Box>
                    </Box>
                    <TableContainer
                      component={Paper}
                      sx={{ borderRadius: '15px' }}
                    >
                      <Table
                        sx={{ minWidth: 700 }}
                        aria-label="customized table"
                      >
                        <TableHead>
                          <TableRow>
                            <StyledTableCell width="5%">
                              {/* <Checkbox
                                    color="primary"
                                    inputProps={{
                                      'aria-label': 'select all desserts',
                                    }}
                                /> */}
                            </StyledTableCell>
                            <StyledTableCell width="25%">
                              {t('assignedEmpName')}
                            </StyledTableCell>
                            <StyledTableCell width="25%" align="left">
                              {t('assignedEmpStatus')}
                            </StyledTableCell>
                            <StyledTableCell width="25%" align="left">
                              {t('assignedDate')}
                            </StyledTableCell>
                            <StyledTableCell width="5%" align="left">
                              {t('common:action.action')}
                            </StyledTableCell>
                            <StyledTableCell
                              width="5%"
                              align="left"
                            ></StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visibleRows.map((row) => (
                            <StyledTableRow key={row.id}>
                              <StyledTableCell width="5%">
                                {/* <Checkbox
                                      color="primary"
                                        inputProps={{
                                        'aria-label': 'select all desserts',
                                      }}
                                    /> */}
                              </StyledTableCell>
                              <StyledTableCell width="30%" align="left">
                                <Avatar
                                  sx={{
                                    borderColor: '#EAEAEA !important',
                                    width: '30px',
                                    height: '30px',
                                    display: 'inline-flex',
                                    fontSize: '12px',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  {getInitials(
                                    row.firstName + ' ' + row.lastName
                                  )}
                                </Avatar>
                                <Typography
                                  sx={{
                                    marginLeft: '10px',
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  {`${row.firstName} ${row.lastName}`}
                                </Typography>
                              </StyledTableCell>
                              <StyledTableCell width="25%" align="left">
                                <BorderLinearProgress
                                  variant="determinate"
                                  value={row.progress}
                                  sx={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                    width: '60%',
                                    marginRight: '10px',
                                    borderRadius: 5,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  {row.progress}%
                                </Typography>
                              </StyledTableCell>
                              <StyledTableCell width="25%" align="left">
                                {getDisplayDate(row.enrolledDate)}
                              </StyledTableCell>
                              <StyledTableCell width="5%" align="left">
                                <IconButton
                                  disabled={row.progress !== 100}
                                  onClick={() => {
                                    row.progress === 100 &&
                                      onClickCertiDownload(
                                        row.id,
                                        currentCourse.resCourseDetail
                                          .examDetailId
                                      );
                                  }}
                                  sx={{
                                    cursor:
                                      row.progress === 100
                                        ? 'pointrt'
                                        : 'not-allowed',
                                  }}
                                >
                                  <FileDownloadOutlinedIcon
                                    sx={
                                      row.progress !== 100
                                        ? { color: '#9e9e9e !important' }
                                        : {}
                                    }
                                  />
                                </IconButton>
                              </StyledTableCell>
                              <StyledTableCell width="5%" align="left">
                                {row.isPersonalCourse ? (
                                  <PersonIcon />
                                ) : (
                                  <BusinessIcon />
                                )}
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={
                        searchText?.length
                          ? filterAssignedEmps.length
                          : alreadyAssignedEmps.length
                      }
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </>
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                    height="100vh"
                    sx={{ height: '56vh' }}
                  >
                    <AssignmentLateIcon
                      sx={(theme) => ({
                        fontSize: '100px',
                        color: theme.palette.primary.main,
                      })}
                    />
                    <Typography variant="h6" component="div" color="primary">
                      {t('noEmpFound')}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
};

EmployeeCourse.companyGuard = true;

EmployeeCourse.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default EmployeeCourse;
