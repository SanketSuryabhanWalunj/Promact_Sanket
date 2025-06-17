// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios Imports
import { isAxiosError } from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'

// ** Axios Call Imports
import { AccountVerification, Me } from 'src/api-services/AuthApi'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      try {
        const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
        if (storedToken) {
          const userData = window.localStorage.getItem(authConfig.storageUserDataKeyName)!
          if (userData) {
            const response = await Me()
            if (response.status === 200) {
              const userData = response.data.userDetails
              userData.role = response.data.roles[0].name.toLowerCase()
              setUser(userData)
            } else {
              localStorage.removeItem(authConfig.storageUserDataKeyName)
              localStorage.removeItem(authConfig.storageTokenKeyName)
              setUser(null)
              setLoading(false)
              router.replace('/login')
            }
          } else {
            localStorage.removeItem(authConfig.storageUserDataKeyName)
            localStorage.removeItem(authConfig.storageTokenKeyName)
            setUser(null)
            setLoading(false)
            router.replace('/login')
          }
          setLoading(false)
        } else {
          localStorage.removeItem(authConfig.storageUserDataKeyName)
          localStorage.removeItem(authConfig.storageTokenKeyName)
          setUser(null)
          setLoading(false)

          // router.replace('/login')
        }
      } catch (error) {
        localStorage.removeItem(authConfig.storageUserDataKeyName)
        localStorage.removeItem(authConfig.storageTokenKeyName)
        setUser(null)
        setLoading(false)
        router.replace('/login')
      }

      /* 
        Template code. Keeping it for reference
      */
      /* 
      if (storedToken) {
        setLoading(true)
        await axios
          .get(authConfig.meEndpoint, {
            headers: {
              Authorization: storedToken
            }
          })
          .then(async response => {
            setLoading(false)
            setUser({ ...response.data.userData })
          })
          .catch(() => {
            localStorage.removeItem('userData')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('accessToken')
            setUser(null)
            setLoading(false)
            if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
              router.replace('/login')
            }
          })
      } else {
        setLoading(false)
      }
       */
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* 
    Template code. Keeping it for reference
  */
  /* 
  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    axios
      .post(authConfig.loginEndpoint, params)
      .then(async response => {
        params.rememberMe
          ? window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
          : null
        const returnUrl = router.query.returnUrl

        setUser({ ...response.data.userData })
        params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(response.data.userData)) : null

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

        router.replace(redirectURL as string)
      })

      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }
   */

  const handleLogin = async (params: LoginParams, errorCallback?: ErrCallbackType) => {
    try {
      const response = await AccountVerification(params.email, params.password)

      if (response.status === 200) {
        const userData = response.data.userDetails
        userData.role = response.data.roles[0].name.toLowerCase()
        window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.token)
        window.localStorage.setItem(authConfig.storageUserDataKeyName, JSON.stringify(userData))
        setUser(userData)
        router.replace('/')
      }
    } catch (error) {
      if (errorCallback) {
        if (isAxiosError(error)) {
          if (error?.response?.data?.error?.code === 400 || error?.response?.data?.error?.code === '400') {
            errorCallback({ errMsg: 'Your account has been temporarily locked.' })
          } else if (error?.response?.data?.error?.code === 404 || error?.response?.data?.error?.code === '404') {
            errorCallback({
              errMsg: `We couldn't find the OTP you entered. Please make sure you have the correct code and try again. If you haven't received an OTP, please request a new OTP.`
            })
          } else if (error?.response?.data?.error?.code === 409 || error?.response?.data?.error?.code === '409') {
            errorCallback({
              errMsg: `Sorry, the OTP you entered is incorrect. Please double-check the code and try again. If you're having trouble, you can request a new OTP.`
            })
          } else {
            errorCallback({ errMsg: 'Something went wrong' })
          }
        } else {
          errorCallback({ errMsg: 'Something went wrong' })
        }
      }
    }
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem(authConfig.storageUserDataKeyName)
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
