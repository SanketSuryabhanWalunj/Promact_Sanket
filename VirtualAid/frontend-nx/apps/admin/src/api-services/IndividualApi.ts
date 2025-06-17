import { axiosInstance } from './APIResource'

import { IndividualDetailsType, IndividualRegisterType, userCourseSubScribedAdminType, LiveExamApprovedType, LiveExamRequestDetailType, LiveExamType } from 'src/types/individual'
const ADMIN_API_BASE_URL = '/api/app/admin';

export const getIndividualPaginationList = async (pageNo: number, pageSize: number) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/individual-user-list`, { params: { pageNo, pageSize } })
}

export const postNewIndividual = async (individualRegister: IndividualRegisterType, culture: string) => {
  return axiosInstance.post(`/api/app/auth-user-account/user-registration/?culture=${culture}`, individualRegister)
}

export const getIndividualDetails = async (id: string) => {
  return axiosInstance.get(`/api/app/user/user-details-by-id/${id}`)
}

export const putIndividualDetailsUpdate = async (individualDetails: IndividualDetailsType) => {
  return axiosInstance.put(`/api/app/user/user-details`, individualDetails)
}

export const changeActiveStatusIndividual = async (individualId: string, isDeleted: boolean, culture: string) => {
  return axiosInstance.put(
    `${ADMIN_API_BASE_URL}/activate-or-inactivate-user-by-id/${individualId}/?culture=${culture}`,
    {},
    { params: { isDeleted } }
  )
}

export const getIndividualEnrolledCourseList = async (userId: string, pageNo: number, pageSize: number, culture: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/courses-enrolled-by-individual/${userId}/?culture=${culture}}`, { params: { pageNo, pageSize } })
}

export const getIndividualInvoice = async (userId: string, pageNo: number, pageSize: number) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/purchase-list-by-user-id/${userId}`, { params: { pageNo, pageSize } })
}

export const getIndividualProfile = async (id: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/individual-profile/${id}`)
}

export const getActiveIndividualCount = async () => {
  return axiosInstance.get(`/api/app/admin-report/active-individual-analytics`)
}

export const getCertificate = async (userId: string, examDetailId: number, culture: string) => {
  return axiosInstance.post(`/download-certificate`, {}, { params: { userId, examDetailId , culture}, responseType: 'blob' })
}

export const postAdminCourseSubscribedIndividualRequest = async (userCourseSubScribedType: userCourseSubScribedAdminType,userId: string) => {
  return axiosInstance.post(`/api/app/course/credit-course-to-individual/${userId}`, userCourseSubScribedType)
}
export const setdLiveExamDates = async(liveExamDetails: LiveExamType) => {
  return axiosInstance.post(`/api/app/live-exam/live-exam-details`,liveExamDetails )
}

export const setMarksLiveExamDates = async (userId: string, userCourseEnrollmentId: number, marks: number) => {
  return axiosInstance.post(
    `/api/app/live-exam/live-exam-markes`,
    {},
    {
      params: {
        userId,
        userCourseEnrollmentId,
        marks
      }
    }
  )
}

export const getLiveExamDetails = async (pageNo: number, pageSize: number) => {
  return axiosInstance.get(`/api/app/live-exam/live-exam-schedule-list`, { params: { pageNo, pageSize } })
}
export const getLiveAllocationAnalytics = async () => {
  return axiosInstance.get(`/api/app/live-exam/exam-date-accepted-analytics`)
}

export const getPendingExamDetails = async (pageNo: number, pageSize: number) => {
  return axiosInstance.get(`/api/app/live-exam/pending-live-exam-date-request`, { params: { pageNo, pageSize } })
}

export const editLiveExamDetails = async (liveExamId: number | null, setLiveExamDetails: LiveExamType) => {
  const { examDate, allocatedSeatsCount, courseId, remaningSeatsCount } = setLiveExamDetails
  const url = `/api/app/live-exam/live-exam-details/${liveExamId}?seatsCount=${allocatedSeatsCount}&courseId=${courseId}&examDate=${examDate}&remaningSeatsCount=${remaningSeatsCount}`
  try {
    const response = await axiosInstance.put(url, setLiveExamDetails)

    return response
  } catch (error) {
    // Handle error or throw it for the caller to handle
    throw error
  }
}
export const deleteLiveExam = async (liveExamId: number) => {
  return axiosInstance.delete(`/api/app/live-exam/live-exam-by-id/${liveExamId}`)
}

export const acceptLiveDateRequest = async (
  isAccepted: boolean,
  userId: string,
  courseId: string,
  userCourseEnrollmentId: number,
  culture: string
) => {
  return axiosInstance.post(
    `/api/app/live-exam/accept-reject-live-exam-date`,
    {},
    {
      params: {
        isAccepted,
        userId,
        courseId,
        userCourseEnrollmentId,
        culture
      }
    }
  )
}
export const getApprovedExamDetails = async (pageNo: number, pageSize: number) => {
  return axiosInstance.get(`/api/app/live-exam/approved-user-list`, { params: { pageNo, pageSize } })
}
