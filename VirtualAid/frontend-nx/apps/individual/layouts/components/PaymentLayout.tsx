import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Menu, { MenuProps } from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import { styled, alpha } from '@mui/material/styles';

import IconButton from '@mui/material/IconButton';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { useRouter } from 'next/router';

import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';

import { InfoContext } from '../../contexts/InfoContext';
import FullPageSpinner from '../../components/spinner/FullPageSpinner';
import { AppDispatch, RootState } from '../../store';
import { fetchCompanyCart, fetchUserCart } from '../../store/apps/cart';

const PaymentLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const { companyInfo, empInfo, isCompany } = useContext(InfoContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isUseEffectClean1 = useRef(true);

  const cartInstance = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    const fetchData = async () => {
      try {
        const companyId = companyInfo.id;
        const userId = empInfo.id;
        
        // Clear the cart based on the condition
        let clearCartUrl = '';
        if (isCompany) {
          clearCartUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/cart/cart-for-user/${companyId}`;
        } else {
          clearCartUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/cart/cart-for-user/${userId}`;
        }
        
        await axios.delete(clearCartUrl);
  
        // Now that the cart is cleared, you can fetch user cart or company cart
        if (userId) {
          await dispatch(fetchUserCart({ userId }));
        } else if (companyId) {
          await dispatch(fetchCompanyCart({ companyId }));
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
  
    fetchData();
  }, [companyInfo.id, dispatch, empInfo.id, isCompany]);

 
    
 

  return (
    <>
      <Container maxWidth="xl" sx={{ p: { xs: 0 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: { xs: '20px', md: '32px 50px' },
          }}
        >
          <Box>
            <img
              src="/logo.png"
              className="logo"
              style={{ maxHeight: '16px' }}
              alt="logo"
            />
          </Box>
          <Box>
            <IconButton
              onClick={() => {
                router.push('/cart');
              }}
              sx={{
                marginRight: '20px',
                color: '#212121',
              }}
            >
              <Badge badgeContent={cartInstance.data.totalQty} color="primary">
                <ShoppingBagIcon
                  sx={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    fontSize: '21px',
                  }}
                />
              </Badge>
            </IconButton>
            <IconButton
              sx={{
                color: '#212121',
              }}
            >
              <NotificationsIcon
                sx={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  fontSize: '21px',
                }}
              />
            </IconButton>
          </Box>
        </Box>
        {children}
      </Container>
    </>
  );
};
export default PaymentLayout;
