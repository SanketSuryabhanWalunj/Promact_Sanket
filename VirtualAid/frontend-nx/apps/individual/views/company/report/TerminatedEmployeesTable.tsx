import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';

import StyledTableCell from '../../../components/styled/TableCell';
import StyledTableRow from '../../../components/styled/TableRow';

import { TerminatedEmployeeType } from '../../../types/company';
import { getDisplayDate } from '@virtual-aid-frontend/utils';

import { useTranslation } from 'next-i18next';

type TerminatedEmployeesTableProps = {
  empList: TerminatedEmployeeType[];
};

const TerminatedEmployeesTable = (props: TerminatedEmployeesTableProps) => {
  const { empList } = props;

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
              <StyledTableCell width="35%" align="left">
                {t('terEmpName')}
              </StyledTableCell>
              <StyledTableCell width="35%" align="left">
                {t('terEmpEmail')}
              </StyledTableCell>
              <StyledTableCell width="30%" align="left">
                {t('terEmpDate')}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {empList.map((emp) => (
              <StyledTableRow key={emp.userId}>
                <StyledTableCell width="35%" align="left">
                  {emp.employeeName}
                </StyledTableCell>
                <StyledTableCell width="35%" align="left">
                  {emp.employeeEmail}
                </StyledTableCell>
                <StyledTableCell width="30%" align="left">
                  {getDisplayDate(emp.terminationDate)}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TerminatedEmployeesTable;
