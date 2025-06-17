import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import axios from 'axios';

import { ProfileLayout } from '../../../../layouts/components/ProfileLayout';

import { InfoContext } from '../../../../contexts/InfoContext';
import { TerminatedEmployeeType } from '../../../../types/company';
import TerminatedEmployeesTable from '../../../../views/company/report/TerminatedEmployeesTable';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const TerminatedEmployeesPage = () => {
  const { companyInfo } = useContext(InfoContext);
  const [terEmpList, setTerEmpList] = useState<TerminatedEmployeeType[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isDataErr, setIsDataErr] = useState(false);

  const { t, ready } = useTranslation(['company', 'common']);
  const router = useRouter();
  
  const getTerminatedEmpsList = useCallback(async () => {
    try {
      setIsDataLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/company-dashboard/terminated-employee-list/${companyInfo.id}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        }
      );
      if (response.status === 200) {
        setTerEmpList(response.data);
        setIsDataLoading(false);
        setIsDataErr(false);
      }
    } catch (error) {
      setIsDataLoading(false);
      setIsDataErr(true);
    }
  }, [companyInfo.id]);

  useEffect(() => {
    getTerminatedEmpsList();
  }, [getTerminatedEmpsList]);

  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          marginTop: '15px',
          padding: { xs: '0 20px', lg: '0 50px !important' },
        }}
      >
        {isDataLoading && !ready ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {isDataErr ? (
              <>
                <Box display="flex" justifyContent="center" alignItems="center">
                  {t('common:error.unspecific')}
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
                  {t('terminatedEmployees')}
                </Typography>
                <TerminatedEmployeesTable empList={terEmpList} />
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
};

TerminatedEmployeesPage.companyGuard = true;

TerminatedEmployeesPage.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default TerminatedEmployeesPage;
