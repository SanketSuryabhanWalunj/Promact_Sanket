import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import UploadIcon from '@mui/icons-material/Upload';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { styled } from '@mui/material/styles';
import axios, { isAxiosError } from 'axios';
// import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';

const VisuallyHiddenInput = styled('input')({
  opacity: '0',
  overflow: 'hidden',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: '100%',
  height: '100%',
  cursor: 'pointer',
});

type AddBulkEmployeesType = {
  onCancelClick: () => void;
};

const AddBulkEmployees = (props: AddBulkEmployeesType) => {
  const { onCancelClick } = props;

  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isTemplateError, setIsTemplateError] = useState(false);
  const [templateErrorMsg, setTemplateErrorMsg] = useState('');

  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');

  const [uploadFile, setUploadFile] = useState<File>();

  const router = useRouter();

  const { t, ready } = useTranslation(['company', 'common']);

 // Method to download template
  const onClickDownload = async () => {
    try {
      setIsTemplateLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/download-template`,
        {
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
        el.setAttribute('download', filename || 'template');
        el.click();

        window.URL.revokeObjectURL(`${blob}`);
        setIsTemplateLoading(false);
        setIsTemplateError(false);
        setTemplateErrorMsg('');
      }
    } catch (error) {
      setIsTemplateLoading(false);
      setIsTemplateError(true);
      setTemplateErrorMsg(t('noOfEmployeeText'));
    }
  };
   // Method to handle file upload 
   // @param: e for change event
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setIsUploadError(false);
      setUploadErrorMsg('');
      setUploadFile(e.target.files[0]);
      e.target.value = '';
    }
  };
 // Method to post upload file
  const handleFilePost = async () => {
    try {
      if (uploadFile) {
        setIsUploadLoading(true);
        setIsUploadError(false);
        setUploadErrorMsg('');
        const formData = new FormData();
        formData.append('formFile', uploadFile as File);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/upload-file`,
          formData,
          {
            headers: { 'Content-type': 'multipart/form-data' },
            
          }
        );
        if (response.status === 200 || response.status === 204) {
          setIsUploadLoading(false);
          router.reload();
        } else {
          setIsUploadLoading(false);
          setIsUploadError(true);
          setUploadErrorMsg(t('common:somethingWentWrong'));
        }
      } else {
        setIsUploadError(true);
        setUploadErrorMsg(t('pleaseSelectText'));
      }
    } catch (error) {
      setIsUploadLoading(false);
      setIsUploadError(true);
      if (isAxiosError(error)) {
        if (error.status === 500) {
          setUploadErrorMsg(t('common:somethingWentWrong'));
        } else if (error?.response?.data?.error?.message) {
          setUploadErrorMsg(error?.response?.data?.error?.message);
        } else {
          setUploadErrorMsg(t('common:somethingWentWrong'));
        }
      } else {
        setUploadErrorMsg(t('common:somethingWentWrong'));
      }
    }
  };

  if (!ready) {
    <></>;
  }

  return (
    <>
      <Box
        sx={{
          border: '1px solid #D6D6D6',
          borderRadius: '10px',
          position: 'relative',
          width: '100%',
          height: '99px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: '10px',
          cursor: 'pointer',
        }}
      >
        <UploadIcon
          sx={{
            color: '#D6D6D6',
            marginBottom: '10px',
            fontSize: '30px',
          }}
        ></UploadIcon>
        <Typography sx={{ color: '#666666', fontSize: '12px' }}>
          {t('uploadFileText')}
        </Typography>
        <VisuallyHiddenInput
          type="file"
          onChange={handleFileUpload}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel (.XLS)"
        />
      </Box>

      {isUploadError && (
        <Alert severity="error" sx={{ my: '10px' }}>
          {uploadErrorMsg}
        </Alert>
      )}

      <Typography
        variant="body1"
        component="div"
        sx={{ my: '10px', px: '20px' }}
      >
        {uploadFile?.name}
      </Typography>

      <Button
        sx={{
          color: '#fff',
          background: '#5BD139',
          borderRadius: '25px',
          fontSize: '14px',
          fontFamily: "'Outfit', sans-serif",
          width: '100%',
          marginBottom: '11px',
          border: '1px solid #5BD139',
          '&:hover': {
            backgroundBlendMode: 'lighten',
            backgroundColor: '#fff',
            border: '1px solid #5BD139',
            color: '#5BD139',
          },
        }}
        onClick={handleFilePost}
        disabled={isUploadLoading}
      >
        {isUploadLoading ? (
          <CircularProgress size="24px" sx={{ color: '#fff' }} />
        ) : (
          <>{t('common:action.uploadTemplate')}</>
        )}
      </Button>
      <Button
        sx={{
          color: '#fff',
          background: '#666',
          borderRadius: '25px',
          fontSize: '14px',
          fontFamily: "'Outfit', sans-serif",
          width: '100%',
          marginBottom: '22px',
          border: '1px solid #666',
          '&:hover': {
            backgroundBlendMode: 'lighten',
            backgroundColor: '#fff',
            border: '1px solid #666',
            color: '#666',
          },
        }}
        onClick={onCancelClick}
        disabled={isUploadLoading}
      >
        {t('common:action.cancel')}
      </Button>
      <Box
        sx={{
          background: '#F3F3F3',
          border: '1px solid #D6D6D6',
          borderRadius: '10px',
          padding: '10px 20px',
        }}
      >
        <Typography
          sx={{
            color: '#666666',
            fontSize: '16px',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '10px',
          }}
        >
          {t('dataTemplate')}
        </Typography>
        <Typography
          sx={{
            color: '#666666',
            fontSize: '12px',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '10px',
          }}
        >
          {t('dataTemplateText')}
        </Typography>
        <Button
          sx={{
            color: '#fff',
            fontSize: '12px',
            background: '#484848',
            borderRadius: '25px',
            border: '1px solid #484848',
            '&:hover': {
              backgroundBlendMode: 'lighten',
              backgroundColor: '#fff',
              border: '1px solid #484848',
              color: '#484848',
            },
          }}
          onClick={onClickDownload}
          disabled={isTemplateLoading}
        >
          {isTemplateLoading ? (
            <CircularProgress size="20px" sx={{ color: '#fff' }} />
          ) : (
            <>{t('common:action.download')}</>
          )}
        </Button>
      </Box>
      {isTemplateError && (
        <Alert severity="error" sx={{ mt: '20px' }}>
          {templateErrorMsg}
        </Alert>
      )}
    </>
  );
};

export default AddBulkEmployees;
