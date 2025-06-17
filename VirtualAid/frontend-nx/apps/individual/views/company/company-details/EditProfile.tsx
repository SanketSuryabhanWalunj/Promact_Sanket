import { useContext, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import IconButton from '@mui/material/IconButton';

import { styled } from '@mui/material/styles';
import CompanyPersonalForm from './CompanyPersonalForm';

import { AddressFormType } from '../../../types/address';
import { InfoContext } from '../../../contexts/InfoContext';
import axios from 'axios';
import AddressForm from '../../shared/address-form/AddressForm';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const EditProfile = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [tabValue, setTabValue] = useState('1');

  const [addressSubmitting, setAddresSubmitting] = useState(false);
  const [addressErrMsg, setAddressErrMsg] = useState('');

  const { companyInfo, changeCompanyInfo } = useContext(InfoContext);

  const { t, ready } = useTranslation(['company']);
  const router = useRouter();
  
  const defaultFormValues: AddressFormType = {
    addressLine1: companyInfo.address1 ? companyInfo.address1 : '',
    addressLine2: companyInfo.address2 ? companyInfo.address2 : '',
    addressLine3: companyInfo.address3 ? companyInfo.address3 : '',
    country: companyInfo.country ? companyInfo.country : '',
    state: companyInfo.state ? companyInfo.state : '',
    city: companyInfo.city ? companyInfo.city : '',
    postalCode: companyInfo.postalcode ? companyInfo.postalcode : '',
    lat: '',
    lon: '',
  };

 // Method handle tab change
 // @param: newValue for tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  // Method to close dialog
  // @param: reason for close dialog
  const onDialogClose = (_event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setOpen(!open);
      setTabValue('1');
    }
  };

  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogTitle-root': {
      // padding: '40px 110px 0 60px',
      marginBottom: '0',
    },
    '& .MuiPaper-rounded': {
      borderRadius: '20px',
      maxHeight: 'calc(100% - 8px)',
    },
    '& .MuiDialogContent-root': {
      [theme.breakpoints.up('sm')]: {
        // padding: '20px',
      },
      [theme.breakpoints.up('md')]: {
        // padding: '0 110px 0 60px',
      },
      [theme.breakpoints.up('lg')]: {
        // padding: '0 110px 0 60px',
      },
      // marginBottom: '20px',
    },
    '& .MuiDialogActions-root': {
      padding: '8px 110px 40px 60px',
      justifyContent: 'flex-start',
    },
  }));

 // Method to submit data for company address
 // @param: data for company address info
  const onSubmitClick = async (data: AddressFormType) => {
    try {
      setAddresSubmitting(true);
      setAddressErrMsg('');
      const dataToSend = {
        ...companyInfo,
        address1: data.addressLine1,
        address2: data.addressLine2,
        address3: data.addressLine3,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        latitude: data.lat,
        longitude: data.lon,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company/company-update`,
        dataToSend,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );

      if (response.status === 200) {
        setAddresSubmitting(false);
        setAddressErrMsg('');
        changeCompanyInfo(response.data);
        handleClose();
      }
    } catch (error) {
      setAddresSubmitting(false);
      setAddressErrMsg('');
    }
  };

  return (
    <>
      <IconButton
        sx={{ fontSize: { xs: '24px', md: '30px' }, color: '#AAAAAA' }}
        onClick={handleOpen}
      >
        <EditIcon />
      </IconButton>
      <BootstrapDialog
        open={open}
        onClose={onDialogClose}
        maxWidth="md"
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        disableEscapeKeyDown
      >
        <DialogTitle>
          <Typography
            color="black"
            sx={{
              fontSize: '26px',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {ready && t('updateProfile')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TabContext value={tabValue}>
            <TabList onChange={handleTabChange}>
              <Tab label={ready ? t('personal') : ''} value="1" />
              <Tab label={ready ? t('address') : ''} value="2" />
            </TabList>
            <TabPanel value="1" sx={{ px: 0 }}>
              <CompanyPersonalForm onCancelClick={handleClose} />
            </TabPanel>
            <TabPanel value="2" sx={{ px: 0 }}>
              <AddressForm
                onSubmitClick={onSubmitClick}
                formDefaultValues={defaultFormValues}
                onCancelClick={handleClose}
                loading={addressSubmitting}
                errorMsg={addressErrMsg}
                showMap={false}
                editable={true}
              />
            </TabPanel>
          </TabContext>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

export default EditProfile;
