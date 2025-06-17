import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';

import StyledTableCell from '../../../components/styled/TableCell';
import StyledTableRow from '../../../components/styled/TableRow';

import { ReportCourseMetricType } from '../../../types/courses';

import { useTranslation } from 'next-i18next';

type CourseMetricsTableProps = {
  courseMetricList: ReportCourseMetricType[];
};

const CourseMetricsTable = (props: CourseMetricsTableProps) => {
  const { courseMetricList } = props;

  const { t, ready } = useTranslation(['company', 'common']);

  if (!ready) {
    return <></>;
  }

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: '15px', marginTop: '10px' }}
      >
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell width="30%">{t('courseName')}</StyledTableCell>

              <StyledTableCell width="20%" align="left">
                {t('enrolledEmps')}
              </StyledTableCell>
              <StyledTableCell width="30%" align="left">
                {t('completedCertification')}
              </StyledTableCell>
              <StyledTableCell width="20%" align="left">
                {t('courseExpired')}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courseMetricList.map((course) => (
              <StyledTableRow key={course.courseId}>
                <StyledTableCell width="30%" align="left">
                  <Typography
                    sx={{
                      display: 'inline-block',
                      verticalAlign: 'middle',
                    }}
                  >
                    {course.courseName}
                  </Typography>
                </StyledTableCell>

                <StyledTableCell width="20%" align="left">
                  {course.enrolledCount}
                </StyledTableCell>
                <StyledTableCell width="30%" align="left">
                  {course.certifiedCount}
                </StyledTableCell>
                <StyledTableCell width="20%" align="left">
                  {course.courseExpiredCount}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CourseMetricsTable;
