export type GovernorDetailsType = {
  id: string
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  address1: string
  address2: string
  address3: string
  country: string
  state: string
  city: string
  postalcode: string
  isActive: boolean
  isDeleted: boolean
  currentCompanyId: string
  profileImage: string
}

export type GovernorFormType = {
  firstName: string
  lastName: string
  contact: string
  email: string
}

export type IndividualsOfStateType = {
  id: string
  firstName: string
  lastName: string
  email: string
}
