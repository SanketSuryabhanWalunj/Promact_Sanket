import { axiosInstance } from './APIResource'
const ADMIN_API_BASE_URL = '/api/app/admin';
export const getAllCourses = async (pageNo: number, pageSize: number, culture: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/courses/`, { params: { pageNo, pageSize, culture } })
}

export const getCourseDetails = async (courseId: string, culture: string) => {
  return axiosInstance.get(`/api/app/course/course-detail/${courseId}/?culture=${culture}`)
}
