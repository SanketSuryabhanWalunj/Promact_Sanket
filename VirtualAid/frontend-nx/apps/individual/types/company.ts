export type CompanyEmployeeType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address1: string;
  address2: string;
  address3: string;
  country: string;
  state: string;
  city: string;
  postalcode: string;
  latitude: number;
  longitude: number;
  currentCompanyId: string;
  totalCourses: number;
  certificateExpirationDate: string;
};

export type CompanyInfoType = {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  companyName: string;
  email: string;
  contactNumber: string;
  designation: string;
  address1: string;
  address2: string;
  address3: string;
  bio: string;
  country: string;
  state: string;
  city: string;
  postalcode: string;
  isVerified: boolean;
  isLocked: boolean;
  profileImage: string;
  bannerImage:string;
  slogan: string;
  noOfEmployees: number;
};

export type CourseEnrolledEmployeeType = CompanyEmployeeType & {
  enrolledDate: string;
  progress: number;
  isPersonalCourse: boolean;
};

export type TerminatedEmployeeType = {
  id: string;
  companyId: string;
  userId: string;
  terminationDate: string;
  employeeName: string;
  employeeEmail: string;
};
