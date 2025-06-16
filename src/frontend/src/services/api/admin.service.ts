import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface CognitoUser {
  username: string;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  userStatus: {
    value: string;
  };
  userCreateDate: string;
  userLastModifiedDate: string;
}

interface GetUsersResponse {
  users: CognitoUser[];
  paginationToken: string;
}

export const getUsers = async (pageSize: number, filter: string, paginationToken: string) => {
  try {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) {
      throw new Error("No idToken found in local storage");
    }

    const parsedToken = JSON.parse(idToken);
    const bearerToken = parsedToken.id_token;

    const response = await axios.get<GetUsersResponse>(`${API_BASE_URL}/api/superAdmin/cognito-users`, {
      params: {
        pageSize,
        filter,
        paginationToken,
      },
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    // Map the response data to the expected format
    const users = response.data.users.map((user) => {
      const attributes = user.attributes || [];
      const getName = (attrName: string) => 
        attributes.find(attr => attr.name === attrName)?.value || '';

      return {
        id: user.username,
        email: getName('email'),
        fullname: `${getName('given_name')} ${getName('family_name')}`.trim(),
        phoneNumber: getName('phone_number'),
        role: getName('custom:role'),
        status: user.userStatus?.value || 'UNKNOWN',
        userCreateDate: user.userCreateDate,
        userLastModifiedDate: user.userLastModifiedDate,
      };
    });

    return {
      users,
      paginationToken: response.data.paginationToken,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.clear();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const updateUserRole = async (username: string, role: string) => {
  try {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) {
      throw new Error("No idToken found in local storage");
    }

    const parsedToken = JSON.parse(idToken);
    const bearerToken = parsedToken.id_token;

    await axios.put(`${API_BASE_URL}/api/superAdmin/user-role`, null, {
      params: {
        username,
        role,
      },
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const deleteUser = async (username: string) => {
  try {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) {
      throw new Error("No idToken found in local storage");
    }

    const parsedToken = JSON.parse(idToken);
    const bearerToken = parsedToken.id_token;

    await axios.delete(`${API_BASE_URL}/api/superAdmin/cognito-user`, {
      params: {
        username,
      },
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw error;
  }
};
