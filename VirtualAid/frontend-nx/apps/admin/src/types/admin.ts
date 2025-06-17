export type AdminFormType = {
  firstName: string
  lastName: string
  contact: string
  email: string
}

export type AdminListObjType = {
  id: string
  fullName: string
  email: string
  noOfCoursesEnrolled: 0
  progress: 0
  country: string
  profileImage: string
  isDeleted: boolean
}

export type AdminDetailsType = {
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
  currentCompanyId: string
}

export type FeedBackType = {
  [key: string]: any;
  id: string,
    feedbackProviderName: string,
    feedbackProviderEmail: string,
    message: string,
    screenShots: [
      string
    ],
    category: string,
    userId: string,
    companyId: string,
    status: string,
    platform: string,
    feedbackDate: string
}
