import {
  ElementType,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TablePagination, { TablePaginationOwnProps } from '@mui/material/TablePagination';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { styled, alpha } from '@mui/material/styles';

import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import BadgeIcon from '@mui/icons-material/Badge';

import StyledTableRow from '../../../components/styled/TableRow';
import StyledTableCell from '../../../components/styled/TableCell';

import { ProfileLayout } from '../../../layouts/components/ProfileLayout';

import AddCompanyEmployeesDialog from '../../../views/company/company-employees/AddCompanyEmployeesDialog';
import axios from 'axios';

import { InfoContext } from '../../../contexts/InfoContext';
import { CompanyEmployeeType } from '../../../types/company';
import useSearchHook from '../../../hooks/useSearchHook';

import { getInitials } from '@virtual-aid-frontend/utils';
import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';
import { CommonProps } from '@mui/material/OverridableComponent';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

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

const CompanyEmployees = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const { companyInfo } = useContext(InfoContext);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [empListFromAPI, setEmpListFromAPI] = useState<CompanyEmployeeType[]>(
    []
  );
  const [isEmpListLoading, setIsEmpListLoading] = useState(false);
  const [isEmpListError, setIsEmpListError] = useState(false);
  const [empListErrMsg, setEmpListErrMsg] = useState('');

  const [filteredEmpList, setFilteredEmpList] = useState<CompanyEmployeeType[]>(
    []
  );

  const [selectedEmps, setSelectedEmps] = useState<string[]>([]);

  const [isEmpActLoading, setIsEmpActLoading] = useState(false);
  const [isEmpActErr, setIsEmpActErr] = useState(false);
  const [empActErrMsg, setEmpActErrMsg] = useState('');

  const [numberOfCurrentEmps, setNumberOfCurrentEmps] = useState(0);

  const [currentEmp, setCurrentEmp] = useState<CompanyEmployeeType>(
    {} as CompanyEmployeeType
  );
  const [currentActionTerminate, setCurrentActionTerminate] = useState(false);

  const { searchText, searchComponent } = useSearchHook(400);

  const { t, ready } = useTranslation(['company', 'common']);

  // Method to fetch all employees
  const fetchAllEmployees = useCallback(async () => {
    try {
      setIsEmpListLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company-employee/employees/${companyInfo.id}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );

      if (response.status === 200) {
        setEmpListFromAPI(response.data);
        const { data } = response;
        let count = 0;
        for (let i = 0; i < data.length; i++) {
          if (data[i].currentCompanyId === companyInfo.id) {
            count++;
          }
        }
        setNumberOfCurrentEmps(count);
        setIsEmpListLoading(false);
        setIsEmpListError(false);
        setEmpListErrMsg('');
      }
    } catch (error) {
      setIsEmpListLoading(false);
      setIsEmpListError(true);
      setEmpListErrMsg(ready ? t('common:error.unspecific') : '');
    }
  }, [companyInfo.id, ready, t]);

  useEffect(() => {
    fetchAllEmployees();
  }, [fetchAllEmployees]);

  // Method close dialog
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Method to handle action click
  // @param: event react mouse event listner
  const handleActionClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Method to page change event
  // @param: newpage to getnew page
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Method to handle rows per page
  // @param: event react change event
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = useMemo(() => {
    if (searchText) {
      return filteredEmpList.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );
    } else {
      return empListFromAPI.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );
    }
  }, [empListFromAPI, filteredEmpList, page, rowsPerPage, searchText]);

  // Method filter employee list using keywords
  const filterEmpListFromKeyword = useCallback(() => {
    const arr = empListFromAPI.filter((emp) => {
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
    setFilteredEmpList(arr as CompanyEmployeeType[]);
  }, [empListFromAPI, searchText]);

  useEffect(() => {
    if (searchText) {
      filterEmpListFromKeyword();
    }
  }, [filterEmpListFromKeyword, searchText]);

  // Method to terminate employees
  // @param: empId for terminating employee using it
  const terminateEmp = async (empId: string) => {
    try {
      setIsEmpActLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company-employee/employee/${empId}/?culture=${router.locale}`,
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
      setIsEmpActLoading(false);
      setIsEmpActErr(true);
      setConfirmDialogOpen(false);
      setEmpActErrMsg(ready ? t('common:error.unspecific') : '');
    }
  };

  // Method to assign employee again 
  // @param: emp for setting employees details
  const assignAgainEmp = async (emp: CompanyEmployeeType) => {
    try {
      setIsEmpActLoading(true);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company-employee/reassign-employee-to-company-by-id?companyId=${companyInfo.id}&userId=${emp.id}`,
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
      setIsEmpActLoading(false);
      setIsEmpActErr(true);
      setConfirmDialogOpen(false);
      setEmpActErrMsg(ready ? t('common:error.unspecific') : '');
    }
  };

  // Method to on click action for getting current company Id
  // @param: emp for company employees details
  const onClickAction = (emp: CompanyEmployeeType) => {
    if (emp.currentCompanyId === companyInfo.id) {
      setCurrentActionTerminate(true);
    } else if (emp.currentCompanyId === null) {
      setCurrentActionTerminate(false);
    }
    setCurrentEmp(emp);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = (_event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setConfirmDialogOpen(false);
    }
  };
   const CustomPagination = (props: JSX.IntrinsicAttributes & { component: ElementType<any>; } & TablePaginationOwnProps & CommonProps & Omit<any, "id" | "className" | "style" | "classes" | "color" | "width" | "height" | "padding" | "content" | "page" | "translate" | "sx" | "ref" | "abbr" | "slot" | "title" | "defaultChecked" | "defaultValue" | "suppressContentEditableWarning" | "suppressHydrationWarning" | "accessKey" | "autoFocus" | "contentEditable" | "contextMenu" | "dir" | "draggable" | "hidden" | "lang" | "nonce" | "placeholder" | "spellCheck" | "tabIndex" | "radioGroup" | "role" | "about" | "datatype" | "inlist" | "prefix" | "property" | "rel" | "resource" | "rev" | "typeof" | "vocab" | "autoCapitalize" | "autoCorrect" | "autoSave" | "itemProp" | "itemScope" | "itemType" | "itemID" | "itemRef" | "results" | "security" | "unselectable" | "inputMode" | "is" | "tw" | "aria-activedescendant" | "aria-atomic" | "aria-autocomplete" | "aria-braillelabel" | "aria-brailleroledescription" | "aria-busy" | "aria-checked" | "aria-colcount" | "aria-colindex" | "aria-colindextext" | "aria-colspan" | "aria-controls" | "aria-current" | "aria-describedby" | "aria-description" | "aria-details" | "aria-disabled" | "aria-dropeffect" | "aria-errormessage" | "aria-expanded" | "aria-flowto" | "aria-grabbed" | "aria-haspopup" | "aria-hidden" | "aria-invalid" | "aria-keyshortcuts" | "aria-label" | "aria-labelledby" | "aria-level" | "aria-live" | "aria-modal" | "aria-multiline" | "aria-multiselectable" | "aria-orientation" | "aria-owns" | "aria-placeholder" | "aria-posinset" | "aria-pressed" | "aria-readonly" | "aria-relevant" | "aria-required" | "aria-roledescription" | "aria-rowcount" | "aria-rowindex" | "aria-rowindextext" | "aria-rowspan" | "aria-selected" | "aria-setsize" | "aria-sort" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "dangerouslySetInnerHTML" | "onCopy" | "onCopyCapture" | "onCut" | "onCutCapture" | "onPaste" | "onPasteCapture" | "onCompositionEnd" | "onCompositionEndCapture" | "onCompositionStart" | "onCompositionStartCapture" | "onCompositionUpdate" | "onCompositionUpdateCapture" | "onFocus" | "onFocusCapture" | "onBlur" | "onBlurCapture" | "onChange" | "onChangeCapture" | "onBeforeInput" | "onBeforeInputCapture" | "onInput" | "onInputCapture" | "onReset" | "onResetCapture" | "onSubmit" | "onSubmitCapture" | "onInvalid" | "onInvalidCapture" | "onLoad" | "onLoadCapture" | "onError" | "onErrorCapture" | "onKeyDown" | "onKeyDownCapture" | "onKeyPress" | "onKeyPressCapture" | "onKeyUp" | "onKeyUpCapture" | "onAbort" | "onAbortCapture" | "onCanPlay" | "onCanPlayCapture" | "onCanPlayThrough" | "onCanPlayThroughCapture" | "onDurationChange" | "onDurationChangeCapture" | "onEmptied" | "onEmptiedCapture" | "onEncrypted" | "onEncryptedCapture" | "onEnded" | "onEndedCapture" | "onLoadedData" | "onLoadedDataCapture" | "onLoadedMetadata" | "onLoadedMetadataCapture" | "onLoadStart" | "onLoadStartCapture" | "onPause" | "onPauseCapture" | "onPlay" | "onPlayCapture" | "onPlaying" | "onPlayingCapture" | "onProgress" | "onProgressCapture" | "onRateChange" | "onRateChangeCapture" | "onResize" | "onResizeCapture" | "onSeeked" | "onSeekedCapture" | "onSeeking" | "onSeekingCapture" | "onStalled" | "onStalledCapture" | "onSuspend" | "onSuspendCapture" | "onTimeUpdate" | "onTimeUpdateCapture" | "onVolumeChange" | "onVolumeChangeCapture" | "onWaiting" | "onWaitingCapture" | "onAuxClick" | "onAuxClickCapture" | "onClick" | "onClickCapture" | "onContextMenu" | "onContextMenuCapture" | "onDoubleClick" | "onDoubleClickCapture" | "onDrag" | "onDragCapture" | "onDragEnd" | "onDragEndCapture" | "onDragEnter" | "onDragEnterCapture" | "onDragExit" | "onDragExitCapture" | "onDragLeave" | "onDragLeaveCapture" | "onDragOver" | "onDragOverCapture" | "onDragStart" | "onDragStartCapture" | "onDrop" | "onDropCapture" | "onMouseDown" | "onMouseDownCapture" | "onMouseEnter" | "onMouseLeave" | "onMouseMove" | "onMouseMoveCapture" | "onMouseOut" | "onMouseOutCapture" | "onMouseOver" | "onMouseOverCapture" | "onMouseUp" | "onMouseUpCapture" | "onSelect" | "onSelectCapture" | "onTouchCancel" | "onTouchCancelCapture" | "onTouchEnd" | "onTouchEndCapture" | "onTouchMove" | "onTouchMoveCapture" | "onTouchStart" | "onTouchStartCapture" | "onPointerDown" | "onPointerDownCapture" | "onPointerMove" | "onPointerMoveCapture" | "onPointerUp" | "onPointerUpCapture" | "onPointerCancel" | "onPointerCancelCapture" | "onPointerEnter" | "onPointerEnterCapture" | "onPointerLeave" | "onPointerLeaveCapture" | "onPointerOver" | "onPointerOverCapture" | "onPointerOut" | "onPointerOutCapture" | "onGotPointerCapture" | "onGotPointerCaptureCapture" | "onLostPointerCapture" | "onLostPointerCaptureCapture" | "onScroll" | "onScrollCapture" | "onWheel" | "onWheelCapture" | "onAnimationStart" | "onAnimationStartCapture" | "onAnimationEnd" | "onAnimationEndCapture" | "onAnimationIteration" | "onAnimationIterationCapture" | "onTransitionEnd" | "onTransitionEndCapture" | "disabled" | "size" | "align" | "colSpan" | "headers" | "rowSpan" | "scope" | "valign" | "variant" | "slotProps" | "count" | "SelectProps" | "rowsPerPage" | "sortDirection" | "ActionsComponent" | "backIconButtonProps" | "getItemAriaLabel" | "labelDisplayedRows" | "labelRowsPerPage" | "nextIconButtonProps" | "onPageChange" | "onRowsPerPageChange" | "rowsPerPageOptions" | "showFirstButton" | "showLastButton">) => {
    const { t } = useTranslation();
  
    return (
      <TablePagination
        {...props}
        labelRowsPerPage={t('company:datagrid:rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} ${t('company:datagrid:of')} ${count}`
        }
        backIconButtonText={t('datagrid:previous')}
        nextIconButtonText={t('datagrid:next')}
      />
    );
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
        {isEmpListLoading || isEmpActLoading || !ready ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {isEmpListError ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                {empListErrMsg}
              </Box>
            ) : (
              <>
                {searchComponent()}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    marginBottom: '40px',
                  }}
                >
                  <Box>
                    <Typography sx={{ color: '#6C107F', fontSize: '24px' }}>
                      {t('employees')}
                    </Typography>
                    <Typography sx={{ color: '#000', fontSize: '14px' }}>
                      {t('totalEmployee', { count: numberOfCurrentEmps })}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: { xs: 'flex-start', md: 'center' },
                      justifyContent: 'space-between',
                      my: { xs: '10px', md: 0 },
                    }}
                  >
                    {/* 
                      Action to show while employees are selected
                    */}
                    {selectedEmps.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          sx={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            color: '#000',
                            fontSize: '18px',
                            fontFamily: "'Outfit', sans-serif",
                            marginRight: '20px',
                          }}
                        >
                          <IconButton
                            sx={{ mr: '10px' }}
                            onClick={() => setSelectedEmps([])}
                          >
                            <CloseIcon />
                          </IconButton>
                          {t('selectedEmps', { count: selectedEmps.length })}
                        </Typography>
                        <Button
                          id="demo-customized-button"
                          aria-controls={
                            openMenu ? 'demo-customized-menu' : undefined
                          }
                          aria-haspopup="true"
                          aria-expanded={openMenu ? 'true' : undefined}
                          variant="outlined"
                          disableElevation
                          onClick={handleActionClick}
                          endIcon={<KeyboardArrowDownIcon />}
                          sx={{
                            marginRight: '20px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {t('common:action.action')}
                        </Button>
                        <StyledMenu
                          id="demo-customized-menu"
                          MenuListProps={{
                            'aria-labelledby': 'demo-customized-button',
                          }}
                          anchorEl={anchorEl}
                          open={openMenu}
                          onClose={handleClose}
                        >
                          <MenuItem
                            onClick={handleClose}
                            disableRipple
                            sx={{ textTransform: 'uppercase' }}
                          >
                            {t('common:action.terminate')}
                          </MenuItem>
                          <MenuItem
                            onClick={handleClose}
                            disableRipple
                            sx={{ textTransform: 'uppercase' }}
                          >
                            {t('common:action.assignAgain')}
                          </MenuItem>
                        </StyledMenu>
                      </Box>
                    )}
                    <AddCompanyEmployeesDialog />
                  </Box>
                </Box>
                {isEmpActErr && <Alert severity="error">{empActErrMsg}</Alert>}

                {/* 
                  Action dialog for confirmation
                */}

                <BootstrapDialog
                  open={confirmDialogOpen}
                  fullWidth
                  maxWidth="sm"
                  scroll="paper"
                  sx={{ borderRadius: '20px' }}
                  disableEscapeKeyDown
                  onClose={handleCloseConfirmDialog}
                >
                  <DialogTitle
                    sx={{
                      color: '#000000',
                      fontSize: '22px',
                      fontFamily: "'Outfit', sans-serif",
                      marginBottom: '14px',
                    }}
                  >
                    {currentActionTerminate
                      ? t('termiatePrompt', {
                          name: `${currentEmp.firstName} ${currentEmp.lastName}`,
                        })
                      : t('reAssignPrompt', {
                          name: `${currentEmp.firstName} ${currentEmp.lastName}`,
                        })}
                  </DialogTitle>
                  {/* <DialogContent
                    dividers
                    sx={{ border: 'none', padding: '' }}
                  ></DialogContent> */}
                  <DialogActions>
                    <Button
                      variant="gradient"
                      disabled={isEmpActLoading}
                      onClick={() => {
                        currentActionTerminate
                          ? terminateEmp(currentEmp.id)
                          : assignAgainEmp(currentEmp);
                      }}
                    >
                      {t('common:action.confirm')}
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => setConfirmDialogOpen(false)}
                    >
                      {t('common:action.cancel')}
                    </Button>
                  </DialogActions>
                </BootstrapDialog>

                {/* 
                  Employee list table
                */}
                {visibleRows.length > 0 ? (
                  <>
                    <TableContainer
                      component={Paper}
                      sx={{ marginTop: '30px', borderRadius: '15px' }}
                    >
                      <Table
                        sx={{ minWidth: 700 }}
                        aria-label="customized table"
                      >
                        <TableHead>
                          <TableRow>
                            {/* <StyledTableCell width="5%">
                          <Checkbox
                            color="primary"
                            indeterminate={
                              selectedEmps.length > 0 &&
                              selectedEmps.length < empListFromAPI.length
                            }
                            checked={
                              selectedEmps.length > 0 &&
                              selectedEmps.length === empListFromAPI.length
                            }
                            inputProps={{
                              'aria-label': 'select all emps',
                            }}
                            onChange={onSelectAllClick}
                          />
                        </StyledTableCell> */}
                            <StyledTableCell width="40%">
                              {t('empName')}
                            </StyledTableCell>
                            <StyledTableCell width="30%" align="left">
                              {t('numCourseEnr')}
                            </StyledTableCell>
                            <StyledTableCell width="30%" align="left">
                              {t('common:action.action')}
                            </StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visibleRows.map((emp, index) => {
                            // const isItemSelected = isSelected(emp.id);
                            // const labelId = `enhanced-table-checkbox-${index}`;

                            return (
                              <StyledTableRow
                                key={emp.id}
                                hover
                                // onClick={(event) => handleRowSelect(event, emp.id)}
                              >
                                {/* <StyledTableCell width="5%">
                              <Checkbox
                                color="primary"
                                checked={isItemSelected}
                                inputProps={{
                                  'aria-label': labelId,
                                }}
                                onClick={(event) =>
                                  handleRowSelect(event, emp.id)
                                }
                              />
                            </StyledTableCell> */}
                                <StyledTableCell width="40%" align="left">
                                  <Link
                                    href={`/company/employees/${emp.id}`}
                                    style={{ textDecoration: 'none' }}
                                  >
                                    <Avatar
                                      // src="/person.svg"
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
                                        emp?.firstName + ' ' + emp?.lastName
                                      )}
                                    </Avatar>
                                    <Typography
                                      sx={{
                                        marginLeft: '10px',
                                        display: 'inline-block',
                                        verticalAlign: 'middle',
                                      }}
                                    >
                                      {emp.firstName} {emp.lastName}
                                    </Typography>
                                  </Link>
                                </StyledTableCell>
                                <StyledTableCell width="30%" align="left">
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: 'inline-block',
                                      verticalAlign: 'middle',
                                    }}
                                  >
                                    {emp.totalCourses}
                                  </Typography>
                                </StyledTableCell>
                                <StyledTableCell
                                  width="30%"
                                  align="left"
                                  sx={{
                                    color:
                                      emp.currentCompanyId === companyInfo.id
                                        ? '#FF1A00 !important'
                                        : emp.currentCompanyId === null
                                        ? '#5BD139 !important'
                                        : 'inherit',
                                    fontSize: '15px',
                                    fontFamily: "'Open Sans', sans-serif",
                                  }}
                                >
                                  <span
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      onClickAction(emp);
                                    }}
                                  >
                                    {emp.currentCompanyId === companyInfo.id
                                      ? t('common:action.terminate')
                                      : emp.currentCompanyId === null
                                      ? t('common:action.assignAgain')
                                      : ''}
                                  </span>
                                </StyledTableCell>
                              </StyledTableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <CustomPagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={
                        searchText
                          ? filteredEmpList.length
                          : empListFromAPI.length
                      }
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </>
                ) : (
                  <>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                    >
                      <BadgeIcon
                        sx={(theme) => ({
                          fontSize: '100px',
                          color: theme.palette.primary.main,
                        })}
                      />
                      <Typography variant="h6" component="div" color="primary">
                        {t('noEmpFound')}
                      </Typography>
                    </Box>
                  </>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
};

CompanyEmployees.companyGuard = true;

CompanyEmployees.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default CompanyEmployees;
