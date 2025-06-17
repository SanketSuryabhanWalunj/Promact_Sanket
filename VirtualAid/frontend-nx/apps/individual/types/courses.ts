import { CourseEnrolledEmployeeType } from './company';
import { ModuleWithLessonType } from './course-content';

export type ExploreCourseItemType = {
  id: string;
  name: string;
  totalNoOfHours: number;
  noOfModules: number;
  shortDescription: string;
  price: number;
  certificateExpirationDate: string;
  examType: string[];
};

export type CourseModuelType = {
  srNo: number;
  name: string;
  lessons: string[];
};

export type CourseDetailsType = {
  description: string;
  enrolledDate: string;
  examDetailId: number;
  expirationDate: string;
  id: string;
  isCompleted: boolean;
  progress: number;
  learningOutcomes: string[];
  modules: ModuleWithLessonType[];
  name: string;
  noOfModules: number;
  price: number;
  shortDescription: string;
  totalNoOfHours: number;
  examType: string;
};

export type SubscribedCourseType = {
  courseSubscriptionMappingId: number;
  resCourseDetail: CourseDetailsType;
  totalSubscriptionCount: number;
  remainingSubscriptionCount: number;
  employeeDetails: CourseEnrolledEmployeeType[];
};

export type ReportCourseMetricType = {
  courseId: string;
  courseName: string;
  enrolledCount: number;
  certifiedCount: number;
  courseExpiredCount: number;
};

export type UserSubscribedCourseType = {
  id: string;
  name: string;
  price: number;
  description: string;
  shortDescription: string;
  totalNoOfHours: number;
  noOfModules: number;
  learningOutcomes: string[];
  progress: number;
  isCompleted: boolean;
  enrolledDate: string;
  expirationDate: string;
  modules: string[];
  examDetailId: number;
  certificateExpirationDate: string;
  examType: string;
  liveExamDate: string;
};
export type VrCodeType = {
  emailId: string;
  virtualRealityOtpCode: string;
  virtualRealitySystemLink: string;
}

export type UserCourseEnrollmentDetailsType = {
  id: number;
  user: CourseEnrolledEmployeeType;
  courseSubscriptionId: number;
  enrolledDate: string;
  courseStartDate: string;
  courseEndDate: string;
  progress: number;
  currentModuleId: string;
  currentModulePorgress: number;
  currentLessonId: string;
  isExamConducted: boolean;
  isCompleted: boolean;
  expirationDate: string;
  certificateExpirationDate: string;
  examType: string;
  liveExamDate: string;
  isLiveExamDateApproved: boolean | null;
  liveExamMarkes: number;
};

export type CompanyRequestedCourseCount = {
  companyId: number;
  courseId: number;
  examType: string;
  noOfCourses: number;
  requestMessage: string;
  contactNumber: number;
};

export enum FieldType {
  PointList = 3,
  VRContent = 4,
  // Add more field types as needed
}
