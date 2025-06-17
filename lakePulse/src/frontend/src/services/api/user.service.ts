import { CognitoIdentityProvider, UserType, AttributeType } from '@aws-sdk/client-cognito-identity-provider';
import { APP_STRINGS } from '../../constants/strings';

import { CognitoUserSession, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
interface CognitoUserResponse {
  Users: Array<UserType>;
}

export const CURRENT_USER_KEY = 'currentUserProfile';
export const CURRENT_USER_ROLE_KEY = 'idToken';
interface UserProfile {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  family_name: any;
  username: string;
  email: string;
  given_name: string;
  state: string;
  phone?: string;
  sub: string;
  address?: string;
  profilePicture?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  role?: string;
}
// Add this utility function to check token expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const tokenData = JSON.parse(token);
    if (!tokenData.id_token) return true;

    const base64Url = tokenData.id_token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    const { exp } = JSON.parse(jsonPayload);
    // Add a small buffer (e.g., 10 seconds) to prevent edge cases
    return Date.now() >= (exp * 1000 - 10000);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Update the refreshTokenIfNeeded function
export const refreshTokenIfNeeded = () => {
  const storedToken = localStorage.getItem("idToken");
  if (!storedToken) return;

  try {
    // Only proceed if token is actually expired
    if (!isTokenExpired(storedToken)) {
      return; // Token is still valid, no need to refresh
    }

    const { id_token, refresh_token, profile } = JSON.parse(storedToken);

    const poolData = {
      UserPoolId: "us-east-1_GkBxP8TKA",
      ClientId: "239trf2b7oiirhjs7d1u957atm",
    };

    const userPool = new CognitoUserPool(poolData);
    const user = new CognitoUser({
      Username: profile.email,
      Pool: userPool,
    });

    user.getSession((err: any, session: CognitoUserSession) => {
      if (err) {
        // Only logout if it's an actual authentication error
        if (err.name === 'NotAuthorizedException' || err.name === 'TokenExpiredError') {
          handleTokenExpiration();
        }
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const tokenExpiry = session.getIdToken().getExpiration();

      // Only refresh if token is about to expire in the next 5 minutes
      if (tokenExpiry - currentTime < 300) {
        user.refreshSession(session.getRefreshToken(), (err, newSession) => {
          if (err) {
            // Only logout for actual authentication errors
            if (err.name === 'NotAuthorizedException' || err.name === 'TokenExpiredError') {
              handleTokenExpiration();
            }
            return;
          }

          // Store the new tokens
          const newIdToken = newSession.getIdToken().getJwtToken();
          localStorage.setItem(
            "idToken",
            JSON.stringify({
              id_token: newIdToken,
              refresh_token: refresh_token,
              profile: profile
            })
          );
        });
      }
    });
  } catch (error) {
    // Only logout if we can't parse the token or it's invalid
    if (error instanceof SyntaxError || error.name === 'TokenExpiredError') {
      handleTokenExpiration();
    }
    console.error("Token refresh error:", error);
  }
};

// Update the getAuthToken function to check expiration
export const getAuthToken = (): { userId: string; idToken: string } => {
  const userDataStr = localStorage.getItem('idToken');
  if (!userDataStr) {
    handleTokenExpiration();
    throw new Error(APP_STRINGS.NO_AUTH_TOKEN);
  }

  try {
    const userData = JSON.parse(userDataStr);
    const idToken = userData.id_token;
    const userId = userData.profile?.sub || userData.profile?.["cognito:username"];

    if (!idToken || !userId) {
      handleTokenExpiration();
      throw new Error(APP_STRINGS.NO_AUTH_TOKEN);
    }

    // Only check expiration when getting the token
    if (isTokenExpired(userDataStr)) {
      handleTokenExpiration();
      throw new Error(APP_STRINGS.NO_AUTH_TOKEN);
    }

    return { userId, idToken };
  } catch (error) {
    handleTokenExpiration();
    throw new Error(APP_STRINGS.NO_AUTH_TOKEN);
  }
};

// Update the handleTokenExpiration function
const handleTokenExpiration = () => {
  // Clear only authentication-related items
  localStorage.removeItem('idToken');
  localStorage.removeItem('currentUserProfile');
  window.location.href = '/login';
};

// Update any API call function to use the new token check
// Example for an API call:
export const makeApiCall = async (endpoint: string) => {
  try {
    const { idToken } = getAuthToken(); // This will handle expiration check

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Only logout for actual authentication errors
      const errorData = await response.json();
      if (errorData.error === 'TokenExpiredError' || errorData.error === 'NotAuthorizedException') {
        handleTokenExpiration();
      }
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    if (error.message === APP_STRINGS.NO_AUTH_TOKEN) {
      // Token was already handled by getAuthToken
      throw error;
    }
    // Handle other errors without logging out
    console.error('API call error:', error);
    throw error;
  }
};

export const getUserAttributes = async (username: string) => {
  
  try {
    const tokenData = localStorage.getItem('idToken');
    if (!tokenData || isTokenExpired(tokenData)) {
      handleTokenExpiration();
      return false;
    }

    const token = JSON.parse(tokenData).id_token;
    
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/user/attributes/${username}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,

        }
      }
    );
   
    if (!response.ok) {
      throw new Error(APP_STRINGS.ERROR_FETCHING_USER_ATTRIBUTES);
    }

    return await response.json();
  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_USER_ATTRIBUTES, error);
    throw error;
  }
};

export const getCognitoUsers = async (): Promise<CognitoUserResponse> => {
  try {
    const cognitoISP = new CognitoIdentityProvider({
      region: import.meta.env.VITE_AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      }
    });

    const response = await cognitoISP.listUsers({
      UserPoolId: import.meta.env.VITE_USER_POOL_ID,
      Limit: 60
    });
    
    return {
      Users: response.Users?.map(user => ({
        Username: user.Username || '',
        Attributes: user.Attributes?.map(attr => ({
          Name: attr.Name || '',
          Value: attr.Value || ''
        })) || []
        
      })) || []
    };
  } catch (error) {
    console.error(APP_STRINGS.ERROR_FETCHING_COGNITO_USERS, error);
    throw error;
  }
};

const mapCognitoUserToProfile = (user: UserType): UserProfile => {
  const getAttributeValue = (name: string) => 
    user.Attributes?.find((attr: AttributeType) => attr.Name === name)?.Value || '';

  return {
    username: user.Username || '',
    email: getAttributeValue('email'),
    given_name: getAttributeValue('given_name'),
    state: getAttributeValue('custom:state'),
    phone: getAttributeValue('phone_number'),
    sub: getAttributeValue('sub'),
    address: getAttributeValue('address'),
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

export const getStoredUserProfile = (): UserProfile | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};
export const getUserRole = (): string | null => {
  const stored = localStorage.getItem(CURRENT_USER_ROLE_KEY);
  return stored ? JSON.parse(stored).profile?.role : null;
};
interface UserProfileUpdate {
  given_name: string;
  family_name: string;
  address: string;
  city?: string;
  country?: string;
  zipCode?: string;
  profilePicture?: string | File;
}

export const updateUserProfile = async (profile: UserProfileUpdate): Promise<void> => {
  try {
    const { userId } = getAuthToken();
    const cognitoISP = new CognitoIdentityProvider({
      region: import.meta.env.VITE_AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      }
    });

    const userAttributes = [
      { Name: 'given_name', Value: profile.given_name || '' },
      { Name: 'family_name', Value: profile.family_name || '' },
      { Name: 'address', Value: profile.address || '' }
    ].filter(attr => attr.Value !== '');

    await cognitoISP.adminUpdateUserAttributes({
      UserPoolId: import.meta.env.VITE_USER_POOL_ID,
      Username: userId,
      UserAttributes: userAttributes
    });

    // Force immediate refresh and update
    const updatedProfile = await getCurrentUser();
    if (updatedProfile) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event('userProfileUpdated'));
    }
  } catch (error) {
    console.error(APP_STRINGS.ERROR_UPDATING_USER_PROFILE, error);
    throw error;
  }
};

export const updateUserProfilePicture = async (file: File): Promise<string> => {
  try {
    const { userId } = getAuthToken();

    // Convert and resize image with smaller size
    const resizedImage = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Much smaller dimensions
          const MAX_SIZE = 64; // Reduced from 300 to 64
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }

          // Much lower quality JPEG
          const base64String = canvas.toDataURL('image/jpeg', 0.4); // Reduced quality to 0.4
          
          // Verify string length is under limit
          if (base64String.length > 2048) {
            reject(new Error(APP_STRINGS.IMAGE_TOO_LARGE));
            return;
          }
          
          resolve(base64String);
        };
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Update Cognito first
    const cognitoISP = new CognitoIdentityProvider({
      region: import.meta.env.VITE_AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      }
    });

    await cognitoISP.adminUpdateUserAttributes({
      UserPoolId: import.meta.env.VITE_USER_POOL_ID,
      Username: userId,
      UserAttributes: [
        {
          Name: 'picture',
          Value: resizedImage
        }
      ]
    });

    // Get fresh user data
    const response = await cognitoISP.listUsers({
      UserPoolId: import.meta.env.VITE_USER_POOL_ID,
      Filter: `sub = "${userId}"`
    });

    if (response.Users && response.Users.length > 0) {
      const userProfile = mapCognitoUserToProfile(response.Users[0]);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userProfile));
      
      // Dispatch event for UI update
      window.dispatchEvent(new Event('profileUpdated'));
    }

    return resizedImage;
  } catch (error) {
    console.error(APP_STRINGS.ERROR_UPDATING_PROFILE_PICTURE, error);
    throw error;
  }
};

export const deleteProfilePicture = async (): Promise<void> => {
  try {
    const { userId } = getAuthToken();
    
    const cognitoISP = new CognitoIdentityProvider({
      region: import.meta.env.VITE_AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      }
    });

    await cognitoISP.adminUpdateUserAttributes({
      UserPoolId: import.meta.env.VITE_USER_POOL_ID,
      Username: userId,
      UserAttributes: [
        {
          Name: 'picture',
          Value: '' // Empty string to remove picture
        }
      ]
    });

    // Update local storage
    const currentProfile = getStoredUserProfile();
    if (currentProfile) {
      currentProfile.profilePicture = '';
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentProfile));
      window.dispatchEvent(new Event('profileUpdated'));
    }
  } catch (error) {
    console.error(APP_STRINGS.ERROR_DELETING_PROFILE_PICTURE, error);
    throw error;
  }
};

// Add this function to handle the Shopify webhook checkout
export const getShopifyCheckoutUrl = async (email: string, variantId: string = '57197622198621') => {
  try {
    const tokenData = localStorage.getItem('idToken');
    if (!tokenData || isTokenExpired(tokenData)) {
      handleTokenExpiration();
      return false;
    }

    const token = JSON.parse(tokenData).id_token;
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/shopify-webhook/checkout?email=${email}&variantId=${variantId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get checkout URL');
    }

    // Check if the response is JSON or plain text
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data.url;
    } else {
      // If it's not JSON, get the URL directly as text
      const url = await response.text();
      return url;
    }
  } catch (error) {
    console.error('Error getting checkout URL:', error);
    throw error;
  }
};

// Add this new function
export const checkUserSubscriptionStatus = async (userId: string) => {
  try {
    const tokenData = localStorage.getItem('idToken');
    if (!tokenData || isTokenExpired(tokenData)) {
      handleTokenExpiration();
      return false;
    }

    const token = JSON.parse(tokenData).id_token;
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/lakeSubscription/user-subscription-status?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check subscription status');
    }

    const data = await response.json();
    return data === true; // Make sure to return a boolean
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false; // Default to false if there's an error
  }
};