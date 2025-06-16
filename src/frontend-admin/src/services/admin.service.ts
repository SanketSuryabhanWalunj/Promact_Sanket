import { APP_STRINGS } from '../constants/strings';
import axios from 'axios';
import { CognitoIdentityProvider, UserType, AttributeType } from '@aws-sdk/client-cognito-identity-provider';
import { UserProfile } from 'oidc-client-ts';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
export const CURRENT_USER_KEY = 'currentUserProfile';
export const CURRENT_USER_ROLE_KEY = 'currentUserProfile';

export const getUsers = async (pageSize: number, filter: string, paginationToken: string) => {
  const idToken = localStorage.getItem("adminToken");
  if (!idToken) {
    throw new Error(APP_STRINGS.NO_ID_TOKEN);
  }

  // Log the search parameters for debugging
  console.log('Search parameters:', { pageSize, filter, paginationToken });

  const response = await axios.get(`${API_BASE_URL}/api/superAdmin/cognito-users`, {
    params: {
      pageSize,
      filter: filter || undefined, // Only include filter if it has a value
      paginationToken: paginationToken || undefined, // Only include paginationToken if it has a value
    },
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  const userCounts = response.data.usersCount;
  
  const users = response.data.users.map((user: any) => {
    const name = user?.firstName;
    const familyName = user.familyName;
    return {
      id: user.userName,
      email: user.email,
      fullname: `${name} ${familyName}`,
      subscription: user?.subscription || 'N/A',
      phoneNumber: user.phoneNumber,
      role: user.role,
      lakeName: user.lakeName,
      status: user.status,
      userCreateDate: user.userCreateDate,
      userLastModifiedDate: user.userLastModifiedDate,
    };
  });

  return {
    userCounts, 
    users,
    paginationToken: response.data.paginationToken,
  };
};

export const updateUserRole = async (username: string, role: string) => {
  const idToken = localStorage.getItem("adminToken");
  if (!idToken) {
    throw new Error(APP_STRINGS.NO_ID_TOKEN);
  }

 

  await axios.put(`${API_BASE_URL}/api/superAdmin/user-role`, null, {
    params: {
      username,
      role,
    },
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

};

export const deleteUser = async (username: string) => {
  const idToken = localStorage.getItem("adminToken");
  if (!idToken) {
    throw new Error(APP_STRINGS.NO_ID_TOKEN);
  }
  await axios.delete(`${API_BASE_URL}/api/superAdmin/cognito-user`, {
    params: {
      username,
    },
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

};
// Common function to get authentication token
const getAuthToken = (): { userId: string; } => {
  const userDataStr = localStorage.getItem("currentUserProfile");
  if (!userDataStr) throw new Error(APP_STRINGS.NO_AUTH_TOKEN);

  const userData = JSON.parse(userDataStr);
  const userId = userData.sub || userData.username || userData.profile?.sub || userData.profile?.username;

  if (!userId) throw new Error(APP_STRINGS.NO_USER_ID);

  return { userId };
};

export const getMyLakesById = async () => {
  const { userId } = getAuthToken();
  const idToken = localStorage.getItem("adminToken");
  if (!idToken) {
    throw new Error(APP_STRINGS.NO_ID_TOKEN);
  }

  const response = await axios.get(`${API_BASE_URL}/api/user/my-lakes-by-id`, {
    params: {
      userId,
    },
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  return response.data;
};
const mapCognitoUserToProfile = (user: UserType): UserProfile => {
  const getAttributeValue = (name: string) => 
    user.Attributes?.find((attr: AttributeType) => attr.Name === name)?.Value || '';

  return {
    iss: '',
    aud: '',
    exp: 0,
    iat: 0,
    username: user.Username || '',
    email: getAttributeValue('email'),
    given_name: getAttributeValue('given_name'), 
    state: getAttributeValue('custom:state'),
    phone: getAttributeValue('phone_number'),
    sub: getAttributeValue('sub'),
    address: {
      formatted: getAttributeValue('address')
    },
    profilePicture: getAttributeValue('picture'),
    city: getAttributeValue('custom:city'),
    country: getAttributeValue('custom:country'),
    zipCode: getAttributeValue('custom:zipCode'),
    family_name: getAttributeValue('family_name'),
    role: getAttributeValue('custom:role')
  };
};
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
   
    const { userId } = getAuthToken();
    const cognitoISP = new CognitoIdentityProvider({
      region: import.meta.env.VITE_AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      }
    });

    const response = await cognitoISP.listUsers({
      UserPoolId: import.meta.env.VITE_USER_POOL_ID,
      Filter: `sub = "${userId}"`
    });
 
    if (response.Users && response.Users.length > 0) {
      const userProfile = mapCognitoUserToProfile(response.Users[0]);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userProfile));
    
      return userProfile;
    }
    
    return null;
  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_CURRENT_USER, error);
    throw error;
  }
};
export const removeLake = async (userId: string) => {

  try {
     const idToken = localStorage.getItem("adminToken");
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/user-lakes?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
    });

    if (!response.ok) {
      throw new Error(APP_STRINGS.ERROR_REMOVING_LAKE);
    }

    return true;
  } catch (error) {
    console.error(APP_STRINGS.ERROR_REMOVING_LAKE, error);
    throw error;
  }
};
  export const getStoredUserProfile = (): UserProfile | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};
export const getUserRole = (): string | null => {
  const stored = localStorage.getItem(CURRENT_USER_ROLE_KEY);
  return stored ? JSON.parse(stored).role : null;
};