import { Key } from 'react'
import { CourseEnrolledEmployeeType, ModuleWithLessonType } from './company'

export type CoursesType = {
  value: Key | null | undefined
  id: string
  name: string
  price: number
  examType: string
}

export type CompanyPurchasedCourse = {
  id: number
  name: string
  courseId: string
  price: number
  purchasedAmount: number
  enrolledAmount: number
  purchasedDate: string
  expirationDate: string
  examType: string;
}
export type IndividualEnrolledCourse = {
  id: number
  name: string
  courseEnrolledDate: string
  progress: number
  examId: number
  certificateExpirationDate: string
  examType: string
}
export type UserSubscribedCourseType = {
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
  modules: string[]
}

export type CourseDetailsType = {
  id: string;
  description: string
  learningOutcomes: string[]
  modules: ModuleWithLessonType[]
  name: string
  noOfModules: number
  price: number
  shortDescription: string
  totalNoOfHours: number
}

export type SubscribedCourseType = {
  courseSubscriptionMappingId: number
  resCourseDetail: CourseDetailsType
  totalSubscriptionCount: number
  remainingSubscriptionCount: number
  employeeDetails: CourseEnrolledEmployeeType[]
}

