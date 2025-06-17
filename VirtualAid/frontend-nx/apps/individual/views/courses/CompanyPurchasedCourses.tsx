import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';

import { styled } from '@mui/material/styles';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import axios from 'axios';

import SearchBox from '../../components/search/SearchBox';
import StyledTableRow from '../../components/styled/TableRow';
import StyledTableCell from '../../components/styled/TableCell';

import { InfoContext } from '../../contexts/InfoContext';

import { CourseDetailsType, SubscribedCourseType } from '../../types/courses';
import useSearchHook from '../../hooks/useSearchHook';
import Link from 'next/link';
import ExploreCourseBox from './ExploreCourseBox';
import { getDisplayDate } from '@virtual-aid-frontend/utils';

import { useTranslation } from 'next-i18next';
import router, { useRouter } from 'next/router';

function createData(name: string, enrollment: number, date: string) {
  return { name, enrollment, date };
}

const rows = [
  createData('Advanced Sales Techniques', 6.0, '24/11/2023'),
  createData('Project Management Fundamentals', 9.0, '24/11/2023'),
  createData('Digital Marketing Strategies', 16.0, '24/11/2023'),
  createData('Advanced Sales Techniques 2.0', 3.7, '24/11/2023'),
  createData('Project Management Fundamentals 2.0', 16.0, '24/11/2023'),
];

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
      padding: '0 110px 40px 60px',
    },
    [theme.breakpoints.up('lg')]: {
      padding: '0 110px 40px 60px',
    },
    marginBottom: '44px',
  },
  '& .MuiDialogActions-root': {
    padding: '8px 110px 40px 60px',
    justifyContent: 'flex-start',
  },
}));

const CompanyPurchasedCourses = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const { companyInfo } = useContext(InfoContext);

  const [coursesFromApi, setCoursesFromApi] = useState<SubscribedCourseType[]>(
    []
  );
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [isCoursesError, setIsCoursesError] = useState(false);
  const [coursesErrMsg, setCoursesErrMsg] = useState('');

  const { searchText, searchComponent } = useSearchHook(400);

  const [searchedCourses, setSearchedCourses] = useState<
    SubscribedCourseType[]
  >([]);

  const { t, ready } = useTranslation(['company', 'common']);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // const handleDialogOpen = () => setDialogOpen(true);

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function stringToColor(string: string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }

  function stringAvatar(name: string) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
  }

  const getSubscribedCourses = useCallback(async () => {
    try {
      setIsCoursesLoading(true);
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
      setCoursesErrMsg(ready ? t('common:error.unspecific') : '');
    }
  }, [companyInfo.id, ready, t]);

  const visibleRows = useMemo(() => {
    if (searchText) {
      return searchedCourses.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );
    } else {
      return coursesFromApi.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );
    }
  }, [coursesFromApi, page, rowsPerPage, searchText, searchedCourses]);

  const filterCoursesFromKeyword = useCallback(() => {
    const arr = coursesFromApi.filter((course) => {
      if (
        course.resCourseDetail.name
          .toLowerCase()
          .search(searchText?.toLowerCase() as string) >= 0
      ) {
        return true;
      } else {
        return false;
      }
    });

    setPage(0);
    setSearchedCourses(arr);
  }, [coursesFromApi, searchText]);

  useEffect(() => {
    getSubscribedCourses();
  }, [getSubscribedCourses]);

  useEffect(() => {
    if (searchText) {
      filterCoursesFromKeyword();
    }
  }, [filterCoursesFromKeyword, searchText]);
  const isCourseExpired = (course: CourseDetailsType): boolean => {
    // Implement your logic to check if the course is expired
    // Assuming expirationDate is a property of the course object
    const currentDate = new Date();
    return new Date(course.expirationDate) < currentDate;
  };
  return (
    <>
      {/* <SearchBox /> */}
      {isCoursesLoading || !ready ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isCoursesError ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              {coursesErrMsg}
            </Box>
          ) : (
            <>
              {coursesFromApi.length > 0 && <>{searchComponent()}</>}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '40px',
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
                    {t('myCourses')}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#000',
                      fontSize: '14px',
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {t('totalCourses', {
                      count: coursesFromApi.reduce(function (
                        accumulator,
                        current
                      ) {
                        return (
                          accumulator +
                          (current?.totalSubscriptionCount
                            ? current?.totalSubscriptionCount
                            : 0)
                        );
                      },
                      0),
                    })}
                  </Typography>
                </Box>
              </Box>
              {coursesFromApi.length <= 0 && (
                <>
                  <ExploreCourseBox />
                </>
              )}
              {coursesFromApi.length > 0 && (
                <>
                  <TableContainer
                    component={Paper}
                    sx={{ marginTop: '10px', borderRadius: '15px' }}
                  >
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell width="5%">
                           
                          </StyledTableCell>
                          <StyledTableCell width="25%">
                            {t('courseName')}
                          </StyledTableCell>
                          <StyledTableCell width="30%" align="left">
                            {t('numEnrolledEmps')}
                          </StyledTableCell>
                          <StyledTableCell width="20%" align="left">
                            {t('purchasedDate')}
                          </StyledTableCell>
                          <StyledTableCell width="20%" align="left">
                            {t('courseExpiredDate')}
                          </StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {visibleRows.map((course, index) => {
                          return (
                            
                            <StyledTableRow key={index} className={isCourseExpired(course.resCourseDetail) ? 'disabled' : ''}>
                              <StyledTableCell width="5%">
                                {/* <Checkbox
                      color="primary"
                      inputProps={{
                        // 'aria-label': 'select all desserts',
                      }}
                    /> */}
                              </StyledTableCell>
                              <StyledTableCell
                                width="25%"
                                component="th"
                                scope="row"
                              >
                                <Link
                                  href={`/company/course-employees/${course.courseSubscriptionMappingId}`}
                                  style={{ textDecoration: 'none' }}
                                >
                                  {course.resCourseDetail.name}{' '}
                                  {course.resCourseDetail.examType}
                                </Link>
                              </StyledTableCell>

                              <StyledTableCell width="30%" align="left">
                                {course.totalSubscriptionCount -
                                  course.remainingSubscriptionCount}
                                /{course.totalSubscriptionCount}
                              </StyledTableCell>
                              <StyledTableCell width="20%" align="left">
                                {getDisplayDate(
                                  course.resCourseDetail.enrolledDate
                                )}
                              </StyledTableCell>
                              <StyledTableCell width="20%" align="left">
                                {getDisplayDate(
                                  course.resCourseDetail.expirationDate
                                )}
                              </StyledTableCell>
                            </StyledTableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={
                      searchText
                        ? searchedCourses.length
                        : coursesFromApi.length
                    }
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default CompanyPurchasedCourses;
