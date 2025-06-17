export interface userList {
    id: string,
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    createdBy: string,
    mobileNumber: string,
    batchName: string,
    collegeName: string,
    createdDate: string,
    updatedDate: string,
    isDeleted: string,
    inProgressCourses: courseInfo[],
    upcomingCourses: courseInfo[],
    organization: string;
    techStacks: TechStackDTO[];
    careerPath: CareerPathDTO;
    projectMangers: ProjectManagerDTO[];
    projectManagersEmails: string[];
    projectManagersNames: string[];
}

export interface ProjectManagerDTO {
    id: string; 
    name: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface TechStackDTO {
    name: string;
}

export interface CareerPathDTO {
    id: string;
    name: string;
}

export interface assignCourse {
    internId: string,
    startDate: Date,
    courseId: string,
    batchId: string,
    templateId: string,
    mentorId: string[],
}
export interface dismissCourse {
    internId: string,
    courseId: string
}
export interface courseInfo {
    courseId: string,
    name: string,
    duration: number,
    durationType: string
}
export interface courseList {
    id: string,
    name: string,
    duration: number,
    durationType: string,
    trainingLevel: string
}
export interface organization {
    isDeleted: boolean,
    id: string,
    name: string,
    contactNo: string
}
export interface adminInfo {
    checked: boolean,
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    organization: string,
    contactNo: string,
    isDeleted: boolean,
    type: string;
}
export interface internDetails {
    courseId: string,
    courseName: string,
    internId: string,
    internName: string,
    internshipId: string,
    mentorId: string,
    mentorName: string,
    startDate: string,
    submissions: SubmissionArrayDto[];
}

export class SubmissionArrayDto {
    id!: string;
    isPublished!: boolean;
    isSaved!: boolean;
    isSubmitted!: boolean;
    name!: string;
    publisherId!: string;
    publisherName!: string;
    submissionId!: string;
    isAssignment!: boolean;
}
export interface Detail_Fields {
    internshipCount: number;
    submissionCount: number,
    unSubmittedCount: number,
    publishedCount: number,
    unpublishedCount: number

}
export interface internCourseDetails {
  firstName: string;
  lastName: string;
  courseId: string;
  courseName: string;
}
export interface searchQueryParameters {
  search: string | null;
  page: number | null;
}
export interface filterQueryParameters {
  page: number | null;
  filter: string | null;
}
export enum role{
    Intern = 'Intern',
    Admin = 'Admin',
    SuperAdmin ='SuperAdmin'  
}