import { axiosInstance } from './APIResource';
import { AdminDetailsType } from 'src/types/admin';

interface AdminBasicInfoType {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
}

const ADMIN_API_BASE_URL = '/api/app/admin'; // Define the base URL

export const getAdminsList = async (pageNo: number, pageSize: number) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/admin-list`, { params: { pageNo, pageSize } });
};

export const postAddNewAdmin = async (adminBasicInfo: AdminBasicInfoType, culture: string) => {
  return axiosInstance.post(`/api/app/auth-user-account/admin-registration/?culture=${culture}`, adminBasicInfo)
}

export const getAdminDetails = async (adminId: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/admin-details-by-id/${adminId}`);
};

export const putAdminDetails = async (adminDetails: AdminDetailsType) => {
  return axiosInstance.put(`${ADMIN_API_BASE_URL}/admin-details`, adminDetails);
};
export const getCompleteFeedBacks =  async (feedbackId: string, isDone: boolean) => {
  return axiosInstance.put(`${ADMIN_API_BASE_URL}/feedback-status/${feedbackId}`, {},
  { params: { isDone } })
}

export const getAllFeedbacks = async () => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/feedbacks`);
};

export const updateFeedbackStatus = async (feedbackId: string, isDone: boolean) => {
  return axiosInstance.put(`${ADMIN_API_BASE_URL}/feedback-status/${feedbackId}`, {}, { params: { isDone } });
};

export const getFeedbackFile = async () => {
  return axiosInstance.get(`/feedbacks-file`, { responseType: 'blob' });
};
