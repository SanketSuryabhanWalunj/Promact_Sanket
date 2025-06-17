import { axiosInstance } from './APIResource'

export const getAdminReport = async (year: number) => {
  return axiosInstance.get('/api/app/admin-report/admin-report', { params: { year } })
}
