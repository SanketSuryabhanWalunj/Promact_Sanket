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

import { useContext, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import { CompanyEmployeeType } from '../../../types/company';
import useEmpUserBasicForm from '../../../hooks/useEmpUserBasicForm';
import { EmpInfoType } from '../../../types/emp';
import axios from 'axios';
import { useRouter } from 'next/router';
import AddressForm from '../address-form/AddressForm';

import { AddressFormType } from '../../../types/address';

import { InfoContext } from '../../../contexts/InfoContext';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { TextFieldProps, TextareaAutosize } from '@mui/material';
import { t } from 'i18next';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    // padding: '40px 110px 0 0',
    marginBottom: '0',
  },
  '& .MuiPaper-rounded': {
    borderRadius: '20px',
    // maxHeight: 'calc(100% - 8px)',
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
    // padding: '8px 110px 40px 60px',
    justifyContent: 'flex-start',
  },
}));

const EditEmpInfo = ({ empDetails }: { empDetails: EmpInfoType }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [tabValue, setTabValue] = useState('1');

  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [addressErrMsg, setAddressErrMsg] = useState('');

  const { empInfo } = useContext(InfoContext);

  const { t, ready } = useTranslation(['user','individualAuth', 'common']);

  const personalFormDefaultValue = useMemo(
    () => ({
      firstName: empDetails.firstName,
      lastName: empDetails.lastName,
      email: empDetails.email,
      contact: empDetails.contactNumber,
      designation: empDetails.designation,
      bio: empDetails.bio || ''
    }),
    [
      empDetails.contactNumber,
      empDetails.email,
      empDetails.firstName,
      empDetails.lastName,
      empDetails.designation,
      empDetails.bio || ''
    ]
  );

  const addressFormDefaultValue = useMemo(
    () => ({
      addressLine1: empDetails.address1,
      addressLine2: empDetails.address2,
      addressLine3: empDetails.address3,
      city: empDetails.city,
      state: empDetails.state,
      country: empDetails.country,
      postalCode: empDetails.postalcode,
      lat: empDetails.latitude,
      lon: empDetails.longitude,
    }),
    [
      empDetails.address1,
      empDetails.address2,
      empDetails.address3,
      empDetails.city,
      empDetails.country,
      empDetails.latitude,
      empDetails.longitude,
      empDetails.postalcode,
      empDetails.state,
    ]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const onDialogClose = (_event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setOpen(!open);
      setTabValue('1');
    }
  };

  const onSubmitPersonalForm = async (
    data: typeof personalFormDefaultValue
  ) => {
    try {
      setIsSubmitting(true);
      const dataToSend = {
        ...empDetails,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNumber: data.contact,
        designation: data.designation,
        bio: data.bio || ''
      };
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/user-details`,
        dataToSend,
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
      setIsSubmitting(false);
      setIsSubmitError(true);
      setSubmitErrMsg(ready ? t('common:error.unspecific') : '');
    }
  };

  const onSubmitAddressForm = async (data: AddressFormType) => {
    try {
      setAddressSubmitting(true);
      const dataToSend = {
        ...empDetails,
        address1: data.addressLine1,
        address2: data.addressLine2,
        address3: data.addressLine3,
        country: data.country,
        state: data.state,
        city: data.city,
        postalCode: data.postalCode,
        latitude: data.lat,
        longitude: data.lon,
      };
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/user/user-details`,
        dataToSend,
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
      setAddressSubmitting(false);
      setAddressError(true);
      setAddressErrMsg(ready ? t('common:error.unspecific') : '');
    }
  };

  const { basicForm, setIsSubmitting, setIsSubmitError, setSubmitErrMsg } =
    useEmpUserBasicForm(
      personalFormDefaultValue,
      onSubmitPersonalForm,
      handleClose
    );

  return (
    <>
   
      <IconButton
        sx={{ fontSize: { xs: '20px', md: '21px',  }, color: '#5C00A8', padding: '5px', display: 'inline-block', verticalAlign: 'middle'}}
        onClick={handleOpen}
      >
        <EditIcon />
      </IconButton>
      
       <label style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '5px', fontSize: '14px', color: '#5C00A8'}}>{t('individualAuth:edit')}</label>
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
              <Tab label={t('user:personalText')} value="1" />
              <Tab label={t('user:addressText')} value="2" />
            </TabList>
            <TabPanel value="1" sx={{ px: 0 }}>
              {basicForm()}
            </TabPanel>
            <TabPanel value="2">
              <AddressForm
                formDefaultValues={addressFormDefaultValue}
                onSubmitClick={onSubmitAddressForm}
                onCancelClick={handleClose}
                loading={addressSubmitting}
                errorMsg={addressErrMsg}
                showMap={true}
                editable={empInfo.id === empDetails.id}
              />
            </TabPanel>
          </TabContext>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

export default EditEmpInfo;
