export type CourseCompanyRequestType = {
  id: string
  companyId: string
  courseId: string
  course: courseType
  examType: string
  noOfCourses: number
  requestMessage: string
  isFinished: boolean
  status: string
  contactNumber: string
}
export type courseType = {
  id: string
  name: string
  totalNoOfHours: string
  noOfModules: string
  shortDescription: string
  price: string
  examTypes: []
}
export type CompanyType = {
  id: string
  noOfEmployees: number
  companyName: string
  email: string
  noOfCoursesPurchased: number
  country: string
  profileImage: string
  isDeleted: boolean
  customCourseRequests: CourseCompanyRequestType[]
}
export type CompanyProfileType = {
  id: string
  companyName: string
  email: string
  employeesEnrolled: number
  coursesPurchased: number
  status: string
  contactNumber: string
  languages: string[]
  country: string
  profileImage: string
  customCourseRequests: CourseCompanyRequestType[]
}

export type CompanyDetailsType = {
  id: string
  creationTime: string
  creatorId: string
  lastModificationTime: string
  lastModifierId: string
  companyName: string
  email: string
  contactNumber: string
  address1: string
  address2: string
  address3: string
  country: string
  state: string
  city: string
  postalcode: string
  isVerified: boolean
  isLocked: boolean
  isDeleted: boolean
  profileImage: string
}

export type CompanyEmployeeType = {
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
  currentCompanyId: string
  totalCourses: number
  profileImage: string
}

export type FullCompanyFormType = {
  companyName: string
  companyEmail: string
  companyContact: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  country: string
  state: string
  city: string
  postalCode: string
}

export type CompanyRegisterType = {
  companyName: string
  email: string
  contactNumber: string
}

export type CourseEnrolledEmployeeType = CompanyEmployeeType & {
  enrolledDate: string
  progress: number
  isPersonalCourse: boolean
}

export type ModuleWithLessonType = {
  id: string
  serialNumber: number
  name: string
  courseId: string
  lessons: ModuleWithLessonType[]
}

export type CompanyCountType = {
  loggedInCount: 0
  analyticsPercentage: string
}

export type CompanyPendingReuestType = {
  pendingRequestCount: 0
  analyticsPercentage: string
}

export type courseAcceptRejectType = {
  requestId: string
  status: string
}
export type courseSubscritionAdminType = {
  companysId: string
  courseId: string
  examType: string
  totalAmount: number
  planType: string
  totalCount: number
  remainingCount: number
 
}
export type SubscribedAssignedAdmin = {
  examtype: string
  courseName: string
  count: number
  totalAmount: number
  culture: string
}