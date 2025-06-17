export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

// export type UserDataType = {
//   id: number
//   role: string
//   email: string
//   fullName: string
//   username: string
//   password: string
//   avatar?: string | null
// }

export type UserDataType = {
  id: string
  role: string
  email: string
  firstName: string
  lastName: string
  contactNumber: string
  address1: string
  address2: string
  address3: string
  country: string
  state: string
  city: string
  postalCode: string
  isActive: boolean
  currentCompanyId: string | null
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
}
