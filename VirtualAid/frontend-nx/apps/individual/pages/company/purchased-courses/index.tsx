import CompanyPurchasedCourses from '../../../views/courses/CompanyPurchasedCourses';
import Container from '@mui/material/Container';
import { ProfileLayout } from '../../../layouts/components/ProfileLayout';
import { ReactNode } from 'react';

const MyCourseList = () => {
  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          marginTop: '15px',
          padding: { xs: '0 20px', lg: '0 50px !important' },
        }}
      >
        <CompanyPurchasedCourses />
      </Container>
    </>
  );
};

MyCourseList.companyGuard = true;

MyCourseList.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default MyCourseList;
