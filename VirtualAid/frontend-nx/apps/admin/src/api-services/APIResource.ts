import axiosStatic, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import authConfig from 'src/configs/auth'

// Creating axios instance. Same axios instance will be used for calling each API.
export const axiosInstance = axiosStatic.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
})

/* 
  Request interceptor for axios instance.
  It will add the Authorization token (if available) in all the request that will be send to backend.
*/
axiosInstance.interceptors.request.use(request => {
  const authToken = localStorage.getItem(authConfig.storageTokenKeyName)
  if (authToken) {
    request.headers.Authorization = `Bearer ${authToken}`
  }

  return request
})

/* 
  Response inteceptor for axios instance.
  If response status is 401 then redirect user to sign in page.
*/
axiosInstance.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    if (error.response && error.response.status === 401) {

      if (window.location.pathname === '/login' || window.location.pathname === '/verify-account') {
        return Promise.reject(error)
      } else {
        localStorage.removeItem(authConfig.storageUserDataKeyName)
        localStorage.removeItem(authConfig.storageTokenKeyName)
        window.location.replace('/login')
      }
    } else if (error.response && error.response.status === 404) {
      if (
        error.response.data.error.message === 'There is no entity Company with id = !' ||
        error.response.data.error.messgae === 'There is no entity User Details with id = !'
      ) {
        localStorage.removeItem(authConfig.storageUserDataKeyName)
        localStorage.removeItem(authConfig.storageTokenKeyName)
        window.location.replace('/login')
      } else {
        return Promise.reject(error)
      }
    } else {
      return Promise.reject(error)
    }

  }
)
