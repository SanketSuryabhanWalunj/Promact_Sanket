import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { ReactNode, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCompanyCart } from '../../store/apps/cart';
import { AppDispatch, RootState } from '../../store';
import { InfoContext } from '../../contexts/InfoContext';

const InitialAPICallWrapper = ({ children }: { children: ReactNode }) => {
  const cartInstance = useSelector((state: RootState) => state.cart);

  const dispatch = useDispatch<AppDispatch>();

  const { companyInfo } = useContext(InfoContext);

  useEffect(() => {
    dispatch(fetchCompanyCart({ companyId: companyInfo.id }));
  }, [companyInfo.id, dispatch]);

  return (
    <>
      {cartInstance.loading ? (
        <>
          <Box display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        </>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default InitialAPICallWrapper;
