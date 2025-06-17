import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import { styled } from '@mui/material/styles';

import { useState } from 'react';
import AddSingleEmployeeForm from './AddSingleEmployeeForm';
import AddBulkEmployees from './AddBulkEmployees';

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

const AddCompanyEmployeesDialog = () => {
  const [open, setOpen] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState('1');

  const { t, ready } = useTranslation(['company', 'common']);

   // Method to handle open dialog
  const handleOpen = () => {
    setOpen(true);
  };

   // Method to close dialog
  const handleClose = (_event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
      setCurrentTabValue('1');
    }
  };
 // Method to close through cancel
  const handleCloseThroughCancel = () => {
    setOpen(false);
    setCurrentTabValue('1');
  };

 // Method to tab change event
 // @param: newValue for getting tab value
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTabValue(newValue);
  };

  if (!ready) {
    return <></>;
  }

  return (
    <>
      <Button variant="gradient" onClick={handleOpen}>
        {t('addEmp')}
      </Button>

      <BootstrapDialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleClose}
        scroll="paper"
        sx={{ borderRadius: '20px' }}
        disableEscapeKeyDown
      >
        <DialogTitle
          sx={{
            color: '#000000',
            fontSize: '26px',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '14px',
          }}
        >
          {t('addEmpsTitle')}
        </DialogTitle>
        <DialogContent dividers sx={{ border: 'none', padding: '' }}>
          <TabContext value={currentTabValue}>
            <TabList onChange={handleTabChange}>
              <Tab label={t('addSingleEmp')} value="1" />
              <Tab label={t('addBulkEmps')} value="2" />
            </TabList>
            <TabPanel value="1" sx={{ px: 0 }}>
              <AddSingleEmployeeForm onCancelClick={handleCloseThroughCancel} />
            </TabPanel>
            <TabPanel value="2" sx={{ px: 0 }}>
              <AddBulkEmployees onCancelClick={handleCloseThroughCancel} />
            </TabPanel>
          </TabContext>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

export default AddCompanyEmployeesDialog;
