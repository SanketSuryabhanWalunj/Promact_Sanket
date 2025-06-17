import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/router';

import axios from 'axios';

import { useDispatch } from 'react-redux';

import { AppDispatch } from '../store';
import { fetchCompanyCart, fetchUserCart } from '../store/apps/cart';

import { EmpInfoType } from '../types/emp';
import FullPageSpinner from '../components/spinner/FullPageSpinner';

type CompanyInfoType = {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  companyName: string;
  email: string;
  contactNumber: string;
  designation: string;
  address1: string;
  address2: string;
  address3: string;
  bio: string;
  country: string;
  state: string;
  city: string;
  postalcode: string;
  isVerified: boolean;
  isLocked: boolean;
  profileImage: string;
  bannerImage:string;
  slogan: string;
  noOfEmployees: number;
};

// type EmpInfoType = {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   contactNumber: string;
//   address1: string;
//   address2: string;
//   address3: string;
//   country: string;
//   state: string;
//   city: string;
//   postalcode: string;
//   currentCompanyId: string;
// };

type InfoContextType = {
  companyInfo: CompanyInfoType | Record<string, never>;
  empInfo: EmpInfoType;
  isCompany: boolean;
  changeCompanyInfo: (newCompanyInfo: CompanyInfoType) => void;
  changeEmpInfo: (newEmpInfo: EmpInfoType) => void;
};

export const emptyEmpInfo = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  designation: '', 
  address1: '',
  address2: '',
  address3: '',
  bio: '',
  country: '',
  state: '',
  city: '',
  postalcode: '',
  currentCompanyId: '',
  latitude: '',
  longitude: '',
  profileImage: '',
  bannerImage: '',
  isActive: false,
  isDeleted: false,
  consentToShareData: false,
  currentCompanyName: '',
  slogan: '', 
  noOfEmployees: ''
};

export const InfoContext = createContext<InfoContextType>({
  companyInfo: {},
  empInfo: {} as EmpInfoType,
  isCompany: false,
  changeCompanyInfo: (newCompanyInfo: CompanyInfoType) => null,
  changeEmpInfo: (newEmpInfo: EmpInfoType) => null,
});

const InfoContextComponent = ({ children }: { children: ReactNode }) => {
  const [companyInfo, setCompanyInfo] = useState({});
  const [empInfo, setEmpInfo] = useState<EmpInfoType>({} as EmpInfoType);
  const [isCompany, setIsCompany] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  const changeCompanyInfo = useCallback((newCompanyInfo: CompanyInfoType) => {
    setCompanyInfo(newCompanyInfo);
    setIsCompany(true);
  }, []);

  const changeEmpInfo = useCallback((newEmpInfo: EmpInfoType) => {
    setEmpInfo(newEmpInfo);
    setIsCompany(false);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem(process.env.NEXT_PUBLIC_USER!);
        if (userData) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/log-in-auth-users/me`,
            {
              headers: {
                'Accept-Language': router.locale, // Set content type for FormData
              },
            },
            { params: { isAdminPlatform: false } },
           
          );
          if (response.status === 200) {
            if (response.data.roles[0].name === 'Individual') {
              
              // Clear the cart based on the condition
             
              changeEmpInfo(response.data.userDetails);
           
              if(router.route !== '/payments/success') {
                dispatch(fetchUserCart({ userId: response.data.userDetails.id }));
              }
              
            } else {
              changeCompanyInfo(response.data.company);
              if(router.route !== '/payments/success') {
              dispatch(
                fetchCompanyCart({ companyId: response.data.company.id })
              );
            }
            }
            setLoading(false);
          } else {
            setLoading(false);
            window.localStorage.removeItem(process.env.NEXT_PUBLIC_USER!);
            router.replace('/login');
          }
        } else {
          setLoading(false);
          window.localStorage.removeItem(process.env.NEXT_PUBLIC_USER!);
          // router.replace('/login');
        }
      } catch (error) {
        setLoading(false);
        window.localStorage.removeItem(process.env.NEXT_PUBLIC_USER!);
        router.replace('/login');
      }
    };

    initAuth();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeCompanyInfo, changeEmpInfo, dispatch]);

  return (
    <>
      {!loading ? (
        <InfoContext.Provider
          value={{
            companyInfo,
            empInfo,
            isCompany,
            changeCompanyInfo: changeCompanyInfo,
            changeEmpInfo: changeEmpInfo,
          }}
        >
          {children}
        </InfoContext.Provider>
      ) : (
        <>
          <FullPageSpinner />
        </>
      )}
    </>
  );
};

export default InfoContextComponent;
