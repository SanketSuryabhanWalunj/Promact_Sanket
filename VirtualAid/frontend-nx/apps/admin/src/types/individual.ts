// export type IndividualType = {
//   avatar: string
//   email: string
//   firstName: string
//   lastName: string
//   coursesEnrolled: number
//   progressValue: number
//   country: string
// }



export type IndividualType = {
  profileImage: string
  email: string
  fullName: string
  noOfCoursesEnrolled: number
  progress: number
  country: string
  id: string
  isDeleted: boolean
  company: string
  consentToShareData: boolean
}

export type IndividualDetailsType = {
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
  profileImage: string
  isActive: boolean
  isDeleted: boolean
  currentCompanyId: string
  latitude: string | number
  longitude: string | number
  consentToShareData: boolean
  currentCompanyName: string
}

export type IndividualProfileType = {
  id: string
  fullName: string
  email: string
  noOfCoursesEnrolled: number
  noOfCertificate: number
  status: string
  contactNumber: string
  language: string[]
  country: string
  profileImage: string
  companyName: string
}

export type FullIndividualFormType = {
  firstName: string
  lastName: string
  email: string
  contact: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  country: string
  state: string
  city: string
  postalCode: string
}

export type IndividualRegisterType = {
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  currentCompanyId?: string
}

export type IndividualCountType = {
  loggedInCount: number
  analyticsPercentage: string
}

export type userCourseSubScribedAdminType = {
  courseId: string,
  examType: string,
  totalAmount: number,
  planType: string,
  totalCount: number,
  remainingCount: number,
}

export type LiveExamType = {
    examDate: string;
    allocatedSeatsCount: number;
    courseId: string;
    remaningSeatsCount: number;
}
export type LiveExamApprovedType = {
  userId: string;
  userCourseEnrollmentId: number;
  marks: number;
}
export type LiveExamDetailType = {
  id: number;
  examDate: string;
  allocatedSeatsCount: number;
  courseId: string;
  courseName: string;
  remaningSeatsCount: number;
}
export type LiveExamAnalytics = {
  examDateAcceptedCount: number,
  analyticsPercentage: string
}
export type UserCourseEnrollments = {
  id:number;
  user: IndividualDetailsType;
  courseSubscriptionId: number, 
  enrolledDate: string;
  courseStartDate: string
  courseEndDate: string
  progress: number,
  currentModuleId: string,
  currentModulePorgress: number,
  currentLessonId: string,
  isExamConducted: true,
  isCompleted: true,
  expirationDate: string
  certificateExpirationDate: string
  examType: string,
  liveExamDate: string
  isLiveExamDateApproved: true,
  liveExamMarkes: number,
  isLiveExamCompleted: true
} 
export type CourseDetailsType = {
  id: string
  name: string
  price: number
  description: string
  shortDescription: string
  totalNoOfHours: number
  noOfModules: number
  learningOutcomes: string[]
  progress: number
  isCompleted: boolean
  expirationDate: string
  modules: string[],
  enrolledDate: string,
  examDetailId: 0,
  examType: string,
  certificateExpirationDate: string
}
export type LiveExamRequestDetailType = {
  id: string;
  courseDetail: {
    id: string;
    name: string;
    price: number;
    description: string;
    shortDescription: string;
    totalNoOfHours: number
    noOfModules: number
    learningOutcomes: string[]
    progress: number
    isCompleted: boolean
    expirationDate: string
    modules: string[],
    enrolledDate: string,
    examDetailId: 0,
    examType: string,
    certificateExpirationDate: string
    // Add other properties from courseDetail as needed
  };
  userCourseEnrollments: {
    id: number;
    certificateExpirationDate: string;
    courseEndDate: string;
    courseStartDate: string;
    courseSubscriptionId: number;
    currentLessonId: string;
    currentModuleId: string;
    currentModulePorgress: number;
    enrolledDate: string;
    examType: string;
    expirationDate: string;
    isCompleted: boolean;
    isExamConducted: boolean;
    isLiveExamCompleted: boolean;
    isLiveExamDateApproved: boolean;
    liveExamDate: string;
    liveExamMarkes: number | null;
    progress: number;
    user: {
      address1: string;
      address2: string;
      address3: string;
      bannerImage: string | null;
      bio: string | null;
      city: string;
      consentToShareData: boolean;
      contactNumber: string;
      country: string;
      currentCompanyId: string | null;
      currentCompanyName: string | null;
      designation: string | null;
      email: string;
      firstName: string;
      id: string;
      isActive: boolean;
      isDeleted: boolean;
      lastName: string;
      latitude: number | null;
      longitude: number | null;
      postalcode: string;
      profileImage: string;
      state: string;
    };
  };
}