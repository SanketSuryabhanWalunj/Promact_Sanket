import { ReactNode } from 'react';
import Container from '@mui/system/Container';
import Typography from '@mui/material/Typography';

import { ProfileLayout } from '../../../layouts/components/ProfileLayout';

import SummaryBoxes from '../../../views/company/report/SummaryBoxes';
import CourseMatrics from '../../../views/company/report/CourseMetrics';
import TerminatedEmployees from '../../../views/company/report/TerminatedEmployees';
import CourseEnrollmentChart from '../../../views/company/report/CourseEnrollmentChart';

import { useTranslation } from 'next-i18next';

//company report function
const CompanyReport = () => {
  const { t, ready } = useTranslation(['company', 'common']);

  if (!ready) {
    return <></>;
  }

  return (
    <>
      {/* page container  */}
      <Container
        maxWidth="xl"
        sx={{
          marginTop: '15px',
          padding: { xs: '0 20px', lg: '0 50px !important' },
        }}
      >
        <Typography
          sx={{
            color: '#6C107F',
            fontSize: '24px',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '24px',
          }}
        >
          {t('report')}
        </Typography>

        <SummaryBoxes />

        <CourseMatrics />

        <TerminatedEmployees />

        <CourseEnrollmentChart />
      </Container>
    </>
  );
};

CompanyReport.companyGuard = true;

CompanyReport.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default CompanyReport;
