import { GovernorDetailsType } from 'src/types/governor'
import { axiosInstance } from './APIResource'

interface GovernorBasicInfoType {
  firstName: string
  lastName: string
  email: string
  contactNumber: string
}
const ADMIN_API_BASE_URL = '/api/app/governor';
export const postNewGovernor = async (governorBasicInfo: GovernorBasicInfoType) => {
  return axiosInstance.post(`${ADMIN_API_BASE_URL}/governor`, governorBasicInfo)
}

export const getGovernorsList = async () => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/governor-list`)
}

export const getGovernorDetails = async (govId: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/governor-by-id/${govId}`)
}

export const putGovernorDetails = async (govrnorDetails: GovernorDetailsType) => {
  return axiosInstance.put(`${ADMIN_API_BASE_URL}/governor`, govrnorDetails)
}

export const postActiveInactiveGovernor = async (govId: string, isDelete: boolean) => {
  return axiosInstance.post(
    `${ADMIN_API_BASE_URL}/active-inactive-governor-by-id/${govId}`,
    {},
    {
      params: {
        isDelete
      }
    }
  )
}

export const getCountOfIndividualsWithConsentPerStates = async (country: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/of-individuals-with-consent-state-wise-by-country`, {
    params: { country }
  })
}

export const getIndividualsOfState = async (state: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/individual-count-by-state`, { params: { state } })
}

export const getIndividualLocationDetails = async (individualId: string) => {
  return axiosInstance.get(`${ADMIN_API_BASE_URL}/individual-location-details/${individualId}`)
}
