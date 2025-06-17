import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TablePagination, { TablePaginationOwnProps } from '@mui/material/TablePagination';
import StyledTableRow from '../../components/styled/TableRow';
import StyledTableCell from '../../components/styled/TableCell';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import MuiLink from '@mui/material/Link';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

import {
  ElementType,
  JSX,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';

import { ProfileLayout } from '../../layouts/components/ProfileLayout';
import { InfoContext } from '../../contexts/InfoContext';

import NextLink from 'next/link';

import { getDisplayDate } from '@virtual-aid-frontend/utils';

import { useTranslation } from 'next-i18next';
import { CommonProps } from '@mui/material/OverridableComponent';

const PaymentsPage = () => {
  const { isCompany, empInfo, companyInfo } = useContext(InfoContext);

  const [allPayments, setAllPayments] = useState<PaymentType[]>([]);
  const [paymentsLoading, setPaymentLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { t, ready } = useTranslation(['payment','company', 'common']);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = useMemo(() => {
    return allPayments.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [allPayments, page, rowsPerPage]);

  const getPayments = useCallback(async () => {
    try {
      setPaymentLoading(true);
      setPaymentsError(false);
      let url = '';

      if (isCompany) {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/payment/purchase-list-by-company-id/${companyInfo.id}`;
      } else {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/payment/purchase-list-by-user-id/${empInfo.id}`;
      }

      const response = await axios.get(url);

      if (response.status === 200) {
        setAllPayments(response.data);
        setPaymentLoading(false);
        setPaymentsError(false);
      } else {
        setPaymentLoading(false);
        setPaymentsError(true);
      }
    } catch (error) {
      setPaymentLoading(false);
      setPaymentsError(true);
    }
  }, [companyInfo.id, empInfo.id, isCompany]);

  useEffect(() => {
    getPayments();
  }, [getPayments]);
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
        {paymentsLoading ? (
          <>
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          </>
        ) : (
          <>
            {paymentsError ? (
              <>
                <Box display="flex" justifyContent="center" alignItems="center">
                  {t('common:error.unspecific')}
                </Box>
              </>
            ) : (
              <>
                {allPayments.length <= 0 ? (
                  <>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                      sx={{ minHeight: '500px' }}
                    >
                      <PaymentsOutlinedIcon
                        sx={(theme) => ({
                          fontSize: '100px',
                          color: theme.palette.primary.main,
                        })}
                      />
                      <Typography variant="h5" component="div" color="primary">
                        {t('noPaymentsProcessed')}
                      </Typography>
                      <Typography variant="subtitle2" component="div">
                        {t('paymentsWillBeHere')}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography
                      sx={{
                        color: '#666666',
                        fontSize: '16px',
                        fontFamily: "'Outfit', sans-serif",
                        marginBottom: '10px',
                      }}
                    >
                      {t('recentPurchase')}
                    </Typography>
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
                            <StyledTableCell width="40%">
                              {t('invoiceNumber')}
                            </StyledTableCell>

                            <StyledTableCell width="40%" align="left">
                              {t('purchasedDate')}
                            </StyledTableCell>
                            <StyledTableCell width="20%" align="left">
                              {t('downloadInvoice')}
                            </StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visibleRows.map((row) => (
                            <StyledTableRow key={row.id}>
                              <StyledTableCell width="40%" align="left">
                                <Typography
                                  sx={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  {row.transactionId}
                                </Typography>
                              </StyledTableCell>

                              <StyledTableCell width="40%" align="left">
                                {getDisplayDate(row.purchaseDate)}
                              </StyledTableCell>
                              <StyledTableCell width="20%" align="left">
                                <MuiLink
                                  component={NextLink}
                                  target="_blank"
                                  href={row.invoiceMasterLink}
                                  sx={{ textDecoration: 'none' }}
                                >
                                  <FileDownloadOutlinedIcon
                                    sx={{ color: '#666' }}
                                  />
                                </MuiLink>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <CustomPagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={allPayments.length}
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
      </Container>
    </>
  );
};

PaymentsPage.authGuard = true;

PaymentsPage.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default PaymentsPage;
