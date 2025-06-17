import { axiosInstance } from './APIResource'
const ADMIN_API_BASE_URL = '/api/app/log-in-auth-users';

export const LoginWithEmail = async (email: string, culture:string) => {
  return await axiosInstance.post(`${ADMIN_API_BASE_URL}/generate-otp-for-admin/${email}/?culture=${culture}`)
}

export const AccountVerification = async (email: string, otp: string) => {
  return await axiosInstance.post(`${ADMIN_API_BASE_URL}/log-in-by-otp-for-admin`, {
    emailId: email,
    otpCode: otp
  })
}

export const ResendOtp = async (email: string,culture:string)  => {
  return await axiosInstance.post(`${ADMIN_API_BASE_URL}/generate-otp-for-admin/${email}/?culture=${culture}`)
}

export const Me = async () => {
  return await axiosInstance.post(`${ADMIN_API_BASE_URL}/me`, {}, { params: { isAdminPlatform: true } })
}
