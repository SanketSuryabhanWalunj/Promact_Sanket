import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import StyledTableRow from './../../../components/styled/TableRow';

import { styled } from '@mui/material/styles';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SubscribedCourseType } from '../../../types/courses';
import { CompanyEmployeeType } from '../../../types/company';
import { InfoContext } from '../../../contexts/InfoContext';
import StyledTableCell from './../../../components/styled/TableCell';
import useSearchHook from '../../../hooks/useSearchHook';

import { useRouter } from 'next/router';
import axios from 'axios';
import InfoBoxWithLink from '../../shared/info-box/InfoBoxWithLink';

import { useTranslation } from 'next-i18next';
import EmployeeDetails from 'apps/individual/pages/user/details';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    padding: '40px 110px 0 60px',
    marginBottom: '0',
    [theme.breakpoints.up('xs')]: {
      padding: '20px',
    },
    [theme.breakpoints.up('md')]: {
      padding: '40px 110px 0 60px',
    },
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

type AssignCourseDialogPropsType = {
  course: SubscribedCourseType;
};

type EmployeeWithCourseCheckType = CompanyEmployeeType & {
  assignedToCourse: boolean;
};

const AssignCourseDialog = (props: AssignCourseDialogPropsType) => {
  const { course } = props;

  const router = useRouter();

  const { companyInfo } = useContext(InfoContext);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignedEmps, setAssignedEmps] = useState<CompanyEmployeeType[]>([]);
  const [unassignedEmps, setUnassignedEmps] = useState<CompanyEmployeeType[]>(
    []
  );
  const [allEmpsFromAPI, setAllEmpsFromAPI] = useState<CompanyEmployeeType[]>(
    []
  );

  const [allEmpsWithCourseCheck, setAllEmpsWithCourseCheck] = useState<
    EmployeeWithCourseCheckType[]
  >([]);

  const [selectedEmps, setSelectedEmps] = useState<string[]>([]);

  const [isAssigning, setIsAssigning] = useState(false);
  const [isAssignErr, setIsAssignErr] = useState(false);
  const [assignErrMsg, setAssignErrMsg] = useState('');

  const { searchText, searchComponent } = useSearchHook(400);

  const [searchedEmps, setSearchedEmps] = useState<
    EmployeeWithCourseCheckType[]
  >([]);

  const [searchedUnassignedEmps, setSearchedUnassignedEmps] = useState<
    EmployeeWithCourseCheckType[]
  >([]);

  const { t, ready } = useTranslation(['company','individualAuth', 'common']);

  const handleDialogOpen = () => setDialogOpen(true);

 // Method to close dialog on backdrop click
 // @param: reason for for backdrop click
  const handleDialogClose = (_event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setDialogOpen(false);
    }
  };

 // Method to filter unassigned employees
  const filterUnAssignedEmps = useCallback(() => {
    const arr = [];
    const unassignedArr = [];

    for (let i = 0; i < allEmpsFromAPI.length; i++) {
      let flag = false;
      if (allEmpsFromAPI[i].currentCompanyId === companyInfo.id) {
        for (let j = 0; j < assignedEmps.length; j++) {
          if (allEmpsFromAPI[i].id === assignedEmps[j].id) {
            flag = true;
            break;
          }
        }
        if (flag) {
          arr.push({ ...allEmpsFromAPI[i], assignedToCourse: true });
        } else {
          arr.push({ ...allEmpsFromAPI[i], assignedToCourse: false });
          unassignedArr.push({ ...allEmpsFromAPI[i] });
        }
      }

      setAllEmpsWithCourseCheck(arr);
      setUnassignedEmps(unassignedArr);
    }
  }, [allEmpsFromAPI, assignedEmps, companyInfo.id]);

  // Method to fetch all employees
  const fetchAllEmps = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company-employee/employees/${companyInfo.id}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
    
      if (response.status === 200) {
        setAllEmpsFromAPI(response.data);
      }
    } catch (error) {
    }
  }, [companyInfo.id]);

  useEffect(() => {
    const currentlyAssignedEmps = course.employeeDetails.filter((employee) => {
      const expirationDate = new Date(employee.certificateExpirationDate);
      if (expirationDate !== null) {
        // Check if the employee is not assigned to the course and has an expired certificate
        return expirationDate < new Date();
      } else {
        return true;
      }
    });

   
    setAssignedEmps(currentlyAssignedEmps);
  }, [course.employeeDetails]);

  useEffect(() => {
    fetchAllEmps();
  }, [fetchAllEmps]);

  useEffect(() => {
    filterUnAssignedEmps();
  }, [allEmpsFromAPI, filterUnAssignedEmps, assignedEmps]);

  const isSelected = (empId: string) => {
    return selectedEmps.includes(empId);
  };

  //handlerow select method to select row 
  //@param: empId is used to retrive data using empId
  const handleRowSelect = (event: React.MouseEvent<unknown>, empId: string) => {
    const selectedIndex = selectedEmps.indexOf(empId);
    let updatedSelectedEmps: string[] = [];

    if (selectedIndex === -1) {
      updatedSelectedEmps = updatedSelectedEmps.concat(selectedEmps, empId);
    } else if (selectedIndex === 0) {
      updatedSelectedEmps = updatedSelectedEmps.concat(selectedEmps.slice(1));
    } else if (selectedIndex === selectedEmps.length - 1) {
      updatedSelectedEmps = updatedSelectedEmps.concat(
        selectedEmps.slice(0, -1)
      );
    } else if (selectedIndex > 0) {
      updatedSelectedEmps = updatedSelectedEmps.concat(
        selectedEmps.slice(0, selectedIndex),
        selectedEmps.slice(selectedIndex + 1)
      );
    }
    setSelectedEmps(updatedSelectedEmps);
  };
  //selectAll click method on checkbox select
  //@param: event to get data on change event
  const onSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      if (searchText) {
        const newSelected = [];
        for (let i = 0; i < searchedEmps.length; i++) {
          if (!searchedEmps[i].assignedToCourse) {
            newSelected.push(searchedEmps[i].id);
          }
        }
        setSelectedEmps(newSelected as string[]);
        return;
      } else {
        const newSelected = unassignedEmps.map((emp) => emp.id);
        setSelectedEmps(newSelected);
        return;
      }
    }
    setSelectedEmps([]);
  };
  
  //assigncourse to use assign courses to bulk users
  const assignCourse = async () => {
    try {
      setIsAssigning(true);
      setIsAssignErr(false);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/assign-course-to-bulk-users/${course.courseSubscriptionMappingId}`,
        selectedEmps,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200 || response.status === 204) {
        router.reload();
      }
    } catch (error) {
      setIsAssigning(false);
      setIsAssignErr(true);
      setAssignErrMsg(ready ? t('common:error.unspecific') : '');
    }
  };
//Visible rows method for employees 
  const visibleRows = useMemo(() => {
    if (searchText) {
      return searchedEmps;
    } else {
      return allEmpsWithCourseCheck;
    }
  }, [allEmpsWithCourseCheck, searchText, searchedEmps]);
  //To check is course expired method
  const isCourseExpired = (course: SubscribedCourseType): boolean => {
    const currentDate = new Date();
    const expirationDate = new Date(course.resCourseDetail.expirationDate);
    return expirationDate < currentDate;
  };
  //Method to filter employees using keyword
  const filterEmpsByKeyword = useCallback(() => {
    const searchedAll = [];
    const searchUnassigned = [];

    for (let i = 0; i < allEmpsWithCourseCheck.length; i++) {
      const fullName =
        allEmpsWithCourseCheck[i].firstName +
        ' ' +
        allEmpsWithCourseCheck[i].lastName;
      if (
        fullName.toLowerCase().search(searchText?.toLowerCase() as string) >= 0
      ) {
        if (!allEmpsWithCourseCheck[i].assignedToCourse) {
          searchedAll.push(allEmpsWithCourseCheck[i]);
          searchUnassigned.push(allEmpsWithCourseCheck[i]);
        } else {
          searchedAll.push(allEmpsWithCourseCheck[i]);
        }
      }
    }

    setSearchedEmps(searchedAll);
    setSearchedUnassignedEmps(searchUnassigned);
  }, [allEmpsWithCourseCheck, searchText]);

  useEffect(() => {
    if (searchText) {
      filterEmpsByKeyword();
    }
  }, [filterEmpsByKeyword, searchText]);

//Intermediate checkbox click method
  const intermediateCheckbox = () => {
    if (searchText) {
      return (
        selectedEmps.length > 0 &&
        selectedEmps.length < searchedUnassignedEmps.length
      );
    } else {
      return (
        selectedEmps.length > 0 && selectedEmps.length < unassignedEmps.length
      );
    }
  };

  //Method for fullCheckbox
  const fullCheckbox = () => {
    if (searchText) {
      return (
        selectedEmps.length > 0 &&
        selectedEmps.length === searchedUnassignedEmps.length
      );
    } else {
      return (
        selectedEmps.length > 0 && selectedEmps.length === unassignedEmps.length
      );
    }
  };
  
  const showAddNewEmployeeBox =
  unassignedEmps.length <= 0 && // Check if there are unassigned employees
  course.remainingSubscriptionCount > assignedEmps.length;
  if (!ready) {
    return <></>;
  }


  return (
    <>
  
      {isCourseExpired(course) ? (
        <Tooltip title={t('noAssignText')} arrow>
          <span>
            <Button
              variant="gradient"
              onClick={handleDialogOpen}
              disabled={isCourseExpired(course)}
            >
              {t('common:action.assign')}
            </Button>
          </span>
        </Tooltip>
      ) : (
        <Button variant="gradient" onClick={handleDialogOpen}>
          {t('common:action.assign')}
        </Button>
      )}

      <BootstrapDialog
        fullWidth
        maxWidth="md"
        open={dialogOpen}
        onClose={handleDialogClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        sx={{ borderRadius: '20px' }}
        disableEscapeKeyDown
      >
        <DialogTitle
          id="scroll-dialog-title"
          sx={{
            color: '#000000',
            fontSize: { md: '26px', sm: '18px' },
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '14px',
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            {t('addEmpsTitle')}
            <Typography variant="body1" component="div">
              {course.remainingSubscriptionCount - selectedEmps.length >= 0
                ? course.remainingSubscriptionCount - selectedEmps.length
                : 0}{' '}
              {t('remaining')}
            </Typography>
          </Box>
          {course.remainingSubscriptionCount - selectedEmps.length < 0 && (
            <Box display="flex" justifyContent="flex-end">
              <Typography
                variant="body1"
                component="div"
                sx={{ color: '#DF0606' }}
              >
                {t('purchaseMore')}
              </Typography>
            </Box>
          )}
          {isAssignErr && (
            <Box display="flex" justifyContent="flex-end">
              <Typography
                variant="body1"
                component="div"
                sx={{ color: '#DF0606' }}
              >
                {assignErrMsg}
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ border: 'none', padding: '' }}>
          {allEmpsFromAPI.length > 0 ? (
            <>
              {searchComponent()}
              <TableContainer
                component={Paper}
                sx={{
                  marginTop: '10px',
                  borderRadius: '15px',
                  margin: '14px 0 44px 0',
                }}
              >
                {visibleRows.length > 0 && (
                  <>
                    <Table sx={{ minWidth: 700 }}>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell width="5%">
                            {unassignedEmps.length > 0 && (
                              <>
                                <Checkbox
                                  color="primary"
                                  inputProps={{
                                    'aria-label': 'select all emps',
                                  }}
                                  indeterminate={intermediateCheckbox()}
                                  checked={fullCheckbox()}
                                  onChange={onSelectAllClick}
                                />
                              </>
                            )}
                          </StyledTableCell>
                          <StyledTableCell width="35%">
                            {t('empToAssignName')}
                          </StyledTableCell>
                          <StyledTableCell width="35%">
                            {t('empToAssignEmail')}
                          </StyledTableCell>
                          <StyledTableCell width="25%">{t('statusText')}</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {visibleRows.map((emp, index) => {
                          const isItemSelected = isSelected(emp.id);
                          const labelId = `enhanced-table-checkbox-${emp.id}`;
                          return (
                            <StyledTableRow key={emp.id}>
                              <StyledTableCell width="5%">
                                {!emp.assignedToCourse && (
                                  <Checkbox
                                    color="primary"
                                    inputProps={{
                                      'aria-label': labelId,
                                    }}
                                    checked={isItemSelected}
                                    onClick={(event) => {
                                      handleRowSelect(event, emp.id);
                                    }}
                                  />
                                )}
                              </StyledTableCell>
                              <StyledTableCell width="35%">
                                {`${emp.firstName} ${emp.lastName}`}
                              </StyledTableCell>
                              <StyledTableCell width="35%">
                                {emp.email}
                              </StyledTableCell>
                              <StyledTableCell width="25%">
                                {emp.assignedToCourse ? (
                                  <span style={{ color: '#5BD139' }}>
                                    {t('assigned')}
                                  </span>
                                ) : (
                                  <span style={{ color: '#FF1A00' }}>
                                    {t('notAssigned')}
                                  </span>
                                )}
                              </StyledTableCell>
                            </StyledTableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </>
                )}
              </TableContainer>
            
              {showAddNewEmployeeBox && (
              <Box sx={{ mt: 2 }}>
                <InfoBoxWithLink
                  primaryText={t('plsAddText')}
                  link={`/company/employees`}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setDialogOpen(false)}
                >
                  {t('common:action.cancel')}
                </Button>
              </Box>
              )}
            </>
          ) : (
            <Box sx={{ mt: 2 }}>
              <InfoBoxWithLink
                primaryText={t('noEmpPrimaryText')}
                secondaryText={t('noEmpSecondaryText')}
                link={`/company/employees`}
              />
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setDialogOpen(false)}
              >
                {t('common:action.cancel')}
              </Button>
            </Box>
          )}
        </DialogContent>
        {allEmpsFromAPI.length > 0 && (
          <DialogActions>
            <Button
              variant="gradient"
              onClick={assignCourse}
              disabled={
                selectedEmps.length === 0 ||
                course.remainingSubscriptionCount - selectedEmps.length < 0 ||
                isAssigning
              }
            >
              {isAssigning ? (
                <CircularProgress size="1.75rem" />
              ) : (
                t('common:action.assign')
              )}
            </Button>
            <Button onClick={() => setDialogOpen(false)} disabled={isAssigning}>
              {t('common:action.cancel')}
            </Button>
          </DialogActions>
        )}
      </BootstrapDialog>
    </>
  );
};

export default AssignCourseDialog;
