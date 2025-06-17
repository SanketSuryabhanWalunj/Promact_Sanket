import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { APP_STRINGS } from '../constants/strings';
import { mylakes } from '../types/api.types';
import { getMyLakes } from '../services/api/lake.service';

const Support = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [lakeData, setLakeData] = useState<mylakes[]>([]); // Replace `any` with the actual type if available


  useEffect(() => {
    const userProfileStr = localStorage.getItem("currentUserProfile");
      const userProfileRole = localStorage.getItem("idToken");
      if (userProfileStr && userProfileRole) {
        const userProfile = JSON.parse(userProfileRole);
        setUserRole(userProfile.profile.role);
      }


    const fetchMyLakes = async () => {
         try {
           const lakes = await getMyLakes();
           setLakeData(lakes);
         } catch (error) {
           console.error(APP_STRINGS.ERROR_FETCHING_LAKES, error);
         }
       };
   
       fetchMyLakes();
  }, []);
  return (
    <div>
    
      <main>
        <div>
          <div>
            <h1>
              {APP_STRINGS.SUPPORT_TITLE}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;
