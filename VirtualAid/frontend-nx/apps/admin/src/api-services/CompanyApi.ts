import { axiosInstance } from './APIResource'

import { CompanyDetailsType, CompanyRegisterType, courseAcceptRejectType, courseSubscritionAdminType, courseType,SubscribedAssignedAdmin } from 'src/types/company'
const ADMIN_API_BASE_URL = '/api/app/admin'; // Define the base URL

export const getCompanyListPagination = async (pageNo: number, pageSize: number, culture:string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/company-list`, { params: { pageNo, pageSize, culture } })
}

export const getPendingCompanyList = async (pageNo: number, pageSize: number) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/pending-company-list`, { params: { pageNo, pageSize } })
}

export const getCompanyProfile = async (id: string, culture: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/company-profile/${id}/?culture=${culture}`)
}

export const getCompanyDetails = async (id: string) => {
  return axiosInstance.get(`/api/app/company/company-by-company-id/${id}`)
}

export const postCompanyDetailsUpdate = async (companyUpdate: CompanyDetailsType) => {
  return axiosInstance.post(`/api/app/company/company-update`, companyUpdate)
}
export const postAdminCourseAcceptRequest = async (requestId: string) => {
  return axiosInstance.post(`${ADMIN_API_BASE_URL}/accept-or-reject-course-request/${requestId}?status=1`)
}
export const postAdminCourseSubscribedRequest = async (companyCourseSubscribedAdmin: courseSubscritionAdminType[],buyerId: string) => {
  return axiosInstance.post(`/api/app/course/subscribe-bulk-courses/${buyerId}?isCompany=true`, companyCourseSubscribedAdmin)
}

export const getCompanyEmps = async (companyId: string, pageNo: number, pageSize: number) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/employee-list/${companyId}`, { params: { pageNo, pageSize } })
}

export const getCompanyPurchasedCourses = async (companyId: string, pageNo: number, pageSize: number, culture:string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/courses-purchased-by-company/${companyId}`, { params: { pageNo, pageSize, culture } })
}

export const getEmpProfile = async (empId: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/employee-profile/${empId}`)
}

export const getCompanyInvoices = async (companyId: string, pageNo: number, pageSize: number) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/purchase-list-by-company-id/${companyId}`, { params: { pageNo, pageSize } })
}

export const addNewCompany = async (companyRegister: CompanyRegisterType, culture: string) => {
  return axiosInstance.post(`/api/app/auth-company-account/company-registration/?culture=${culture}`, companyRegister)
}

export const changeActiveStatusCompany = async (companyId: string, isActive: boolean, culture: string) => {
  return axiosInstance.put(
    `${ADMIN_API_BASE_URL}/activate-or-inactivate-company-by-id/${companyId}/?culture=${culture}`,
    {},
    { params: { isActive }, }
  )
}

export const acceptRejectCompany = async (companyId: string, isActive: boolean, culture: string) => {
  return axiosInstance.post(`${ADMIN_API_BASE_URL}/accept-or-reject-company-by-id/${companyId}/?culture=${culture}`, {}, { params: { isActive } })
}

export const getActiveAllCompanyReuest = async () => {
  return axiosInstance.get(`/api/app/admin-report/pending-companies-analytics`)
}

export const getActiveCompanyCount = async () => {
  return axiosInstance.get(`/api/app/admin-report/active-company-analytics`)
}

export const getCourseCount = async (culture: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/pending-course-request/?culture=${culture}`)
}

export const editAssignedCourses = async (companyId: string, subscribedAssignedAdmin: SubscribedAssignedAdmin) => {
  const { examtype, count, courseName, totalAmount, culture } = subscribedAssignedAdmin;
  const url = `/api/app/course/subscribed-courses-by-company-id/${companyId}?examtype=${examtype}&requiredTotalCount=${count}&courseName=${courseName}&culture=${culture}`;
  try {
    const response = await axiosInstance.put(url, subscribedAssignedAdmin);
    return response;
  } catch (error) {
    // Handle error or throw it for the caller to handle
    throw error;
  }
}
