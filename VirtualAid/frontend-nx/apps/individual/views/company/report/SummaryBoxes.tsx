import Grid from '@mui/material/Grid';
import Box, { BoxProps } from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import { styled } from '@mui/material/styles';

import GroupsIcon from '@mui/icons-material/Groups';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { InfoContext } from '../../../contexts/InfoContext';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const GridItem = styled(Grid)(({ theme }) => ({
  paddingRight: '0 !important',
  [theme.breakpoints.up('md')]: {
    paddingRight: '16px !important',
  },
  [theme.breakpoints.up('lg')]: {
    paddingRight: '16px !important',
  },
}));

const StyledBox = styled(Box)(() => ({
  background: '#fff',
  width: '100%',
  height: '120px',
  borderRadius: '15px',
  border: '1px solid #E5E5E5',
  padding: '15px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const IconBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bg',
})<BoxProps & { bg?: string }>(({ bg }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  background: bg ? bg : '#fff',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const ContentBox = styled(Box)(() => ({
  paddingLeft: '15px',
  display: 'inline-block',
  width: 'calc(100% - 50px)',
}));

const KeyText = styled(Box)(() => ({
  color: '#666666',
  fontSize: '12px',
  fontFamily: 'Open Sans, Regular',
  wordBreak: 'break-all'
}));

const ValueText = styled(Box)(() => ({
  color: '#666666',
  fontFamily: 'Open Sans, Regular',
  fontSize: '32px',
  fontWeight: '600',
}));

const SkeletonLoader = () => (
  <Skeleton variant="rectangular" width="100%" height="120px" />
);

const SummaryBoxes = () => {
  const { companyInfo } = useContext(InfoContext);
  const [summaryData, setSummaryData] = useState({
    totalEmployeesEnrolled: 0,
    totalCertifiedCount: 0,
    totalNotAttendingTreaning: 0,
    totalTerminatedEmployee: 0,
  });

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isDataErr, setIsDataErr] = useState(false);
  const [dataErrMsg, setDataErrMsg] = useState('');

  const { t, ready } = useTranslation(['company', 'common']);
  const router = useRouter();
  
  const getSummaryData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company-dashboard/report-master-count/${companyInfo.id}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setSummaryData(response.data);
        setIsDataLoading(false);
        setIsDataErr(false);
        setDataErrMsg('');
      }
    } catch (error) {
      setIsDataLoading(false);
      setIsDataErr(true);
      setDataErrMsg(t('common:somethingWentWrong'));
    }
  }, [companyInfo.id]);

  useEffect(() => {
    getSummaryData();
  }, [getSummaryData]);

  return (
    <Grid
      container
      spacing={1}
      sx={{
        width: '100%',
        marginLeft: '0',
        marginBottom: '20px',
      }}
    >
      {isDataErr ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          {dataErrMsg}
        </Box>
      ) : (
        <>
          <GridItem item xs={12} md={6} lg={3}>
            {isDataLoading || !ready ? (
              <SkeletonLoader />
            ) : (
              <StyledBox>
                <IconBox bg="#59508D">
                  <GroupsIcon sx={{ fontSize: '30px' }} />
                </IconBox>
                <ContentBox>
                  <KeyText>{t('totalEnrolledEmps')}</KeyText>
                  <ValueText>{summaryData.totalEmployeesEnrolled}</ValueText>
                </ContentBox>
              </StyledBox>
            )}
          </GridItem>

          <GridItem item xs={12} md={6} lg={3}>
            {isDataLoading ? (
              <SkeletonLoader />
            ) : (
              <StyledBox>
                <IconBox bg="#BC5090">
                  <BadgeIcon sx={{ fontSize: '30px' }} />
                </IconBox>
                <ContentBox>
                  <KeyText>{t('completedCertificate')}</KeyText>
                  <ValueText>{summaryData.totalCertifiedCount}</ValueText>
                </ContentBox>
              </StyledBox>
            )}
          </GridItem>

          <GridItem item xs={12} md={6} lg={3}>
            {isDataLoading ? (
              <SkeletonLoader />
            ) : (
              <StyledBox>
                <IconBox bg="#F3A533">
                  <PersonOffIcon sx={{ fontSize: '30px' }} />
                </IconBox>
                <ContentBox>
                  <KeyText>{t('notAttendingTraining')}</KeyText>
                  <ValueText>{summaryData.totalNotAttendingTreaning}</ValueText>
                </ContentBox>
              </StyledBox>
            )}
          </GridItem>

          <GridItem item xs={12} md={6} lg={3}>
            {isDataLoading ? (
              <SkeletonLoader />
            ) : (
              <StyledBox>
                <IconBox bg="#EB5F5E">
                  <CancelIcon sx={{ fontSize: '30px' }} />
                </IconBox>
                <ContentBox>
                  <KeyText>{t('totalTerEmps')}</KeyText>
                  <ValueText>{summaryData.totalTerminatedEmployee}</ValueText>
                </ContentBox>
              </StyledBox>
            )}
          </GridItem>
        </>
      )}
    </Grid>
  );
};

export default SummaryBoxes;
