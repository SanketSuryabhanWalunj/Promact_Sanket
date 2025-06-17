import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import {
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useContext,
  // useContext
} from 'react';

import { ProfileLayout } from '../../../layouts/components/ProfileLayout';

import ExploreCourseList from '../../../views/courses/ExploreCourseList';
import ExploreCompanyCourseList from '../../../views/courses/ExploreCompanyCourseList';
import MyCourseBox from '../../../views/courses/MyCourseBox';

import axios from 'axios';
import useSearchHook from '../../../hooks/useSearchHook';
import {
  ExploreCourseItemType,
  SubscribedCourseType,
  UserSubscribedCourseType,
} from '../../../types/courses';
import { InfoContext } from '../../../contexts/InfoContext';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const ListCourses = () => {
  const router = useRouter();
  const { companyInfo, empInfo, isCompany } = useContext(InfoContext);

  const [courses, setCourses] = useState<ExploreCourseItemType[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [isCoursesError, setIsCoursesError] = useState(false);
  const [coursesErrorMsg, setCoursesErrorMsg] = useState('');

  const { searchText, searchComponent } = useSearchHook(400);

  const [searchedCourses, setSearchedCourses] = useState<
    ExploreCourseItemType[]
  >([]);

  const [userCourses, setUserCourses] = useState<UserSubscribedCourseType[]>(
    []
  );
  const [isUserCoursesLoading, setIsUserCoursesLoading] = useState(false);
  const [isUserCoursesErr, setIsUserCoursesErr] = useState(false);

  const [companyCourses, setCompanyCourses] = useState<SubscribedCourseType[]>(
    []
  );
  const [isCompanyCoursesLoading, setIsCompanyCoursesLoading] = useState(false);
  const [isCompanyCoursesErr, setIsCompanyCoursesErr] = useState(false);

  const { t, ready } = useTranslation(['course', 'common']);

 // Method to get all courses
  const getAllCourses = async () => {
    try {
      setIsCoursesLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/courses/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        },
         
      );
   
      if (response.status === 200) {
        setCourses(response.data);
        setIsCoursesLoading(false);
        setIsCoursesError(false);
        setCoursesErrorMsg('');
      }
    } catch (error) {
      setIsCoursesLoading(true);
      setIsCoursesError(true);
      setCoursesErrorMsg(t('common:error.unspecific'));
    }
  };
  
 // Method to get user courses
  const getUserCourses = useCallback(async () => {
    try {
      setIsUserCoursesLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/courses-for-individual/${empInfo.id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        },
      );
   
      if (response.status === 200) {
        setUserCourses(response.data);
        setIsUserCoursesLoading(false);
        setIsUserCoursesErr(false);
      }
    } catch (error) {
      setIsUserCoursesLoading(false);
      setIsUserCoursesErr(true);
    }
  }, [empInfo.id]);

 // Method to get company courses
  const getCompanyCourses = useCallback(async () => {
    try {
      setIsCompanyCoursesLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/course/subscribed-courses-by-company-id/${companyInfo.id}/?culture=${router.locale}`,
        {
          headers: {
            'Accept-Language': router.locale, // Set content type for FormDatas  
          },
        },
      );

      if (response.status === 200) {
        setCompanyCourses(response.data);
        setIsCompanyCoursesLoading(false);
        setIsCompanyCoursesErr(false);
      }
    } catch (error) {
      setIsCompanyCoursesLoading(false);
      setIsCompanyCoursesErr(true);
    }
  }, [companyInfo.id]);

  useEffect(() => {
    getAllCourses();

    if (!isCompany) {
      getUserCourses();
    } else {
      getCompanyCourses();
    }
  }, [getCompanyCourses, getUserCourses, isCompany]);

 // Method to filtercourses keyword
  const filterCoursesFromKeyword = useCallback(() => {
    const arr = courses.filter((course) => {
      if (
        course.name.toLowerCase().search(searchText?.toLowerCase() as string) >=
        0
      ) {
        return true;
      } else {
        return false;
      }
    });

    setSearchedCourses(arr);
  }, [courses, searchText]);

  useEffect(() => {
    if (searchText) {
      filterCoursesFromKeyword();
    }
  }, [filterCoursesFromKeyword, searchText]);

  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          marginTop: '15px',
          padding: { xs: '0 20px', lg: '0 50px !important' },
        }}
      >
        {isCoursesLoading ||
        isUserCoursesLoading ||
        isCompanyCoursesLoading ||
        !ready ? (
          <>
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          </>
        ) : (
          <>
            {isCoursesError || isUserCoursesErr || isCompanyCoursesErr ? (
              <>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography variant="h5" component="div">
                    {coursesErrorMsg
                      ? coursesErrorMsg
                      : t('common:error.unspecific')}
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                {searchComponent()}
                {(userCourses.length > 0 || companyCourses.length > 0) && (
                  <MyCourseBox />
                )}
                {isCompany ? (
                  <>
                    <ExploreCompanyCourseList
                      courses={searchText ? searchedCourses : courses}
                      userCourses={userCourses}
                    ></ExploreCompanyCourseList>
                  </>
                ) : (
                  <ExploreCourseList
                    courses={searchText ? searchedCourses : courses}
                    userCourses={userCourses}
                  />
                )}
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
};

ListCourses.authGuard = true;

ListCourses.getLayout = (page: ReactNode) => (
  <ProfileLayout>{page}</ProfileLayout>
);

export default ListCourses;
