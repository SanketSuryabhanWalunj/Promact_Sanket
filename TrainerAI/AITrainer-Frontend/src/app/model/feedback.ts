import { CareerPath } from "./career-path";
import { adminInfo } from "./intern";

export interface assignmentFeedback{
    id :string,
    reviewerName :string,
    feedback :string,
    score : number,
    createdDate :Date,
    totalMarks :number,
    isPublished :boolean
}

export interface journalFeedback{
    id:string,
    reviewerName:string,
    feedbackPoints:string,
    rating:number,
    createdDate:Date,
    improvementArea:string,
    adminReview:string,
    isPublished: boolean
}
export interface feedbackDetails{
    internId : string;
    name:string;
    careerPath : CareerPath;
    feedbackList:feedbackList[];
    emailId:string;

}
export interface feedbackList {
showLessFeedback: boolean;
showLessImprovementArea: boolean;
showLessComment: boolean;
showLess: boolean;
showFullText: boolean;
    assignmentReceivedMarks?: number | null;
    assignmentTotalMarks?: number | null;
    behaviouralScore?: number | null;
    behaviouralTotalScore?: number | null;
    comment?: string | null;
    courseName?: string | null;
    feedback?: string | null;
    improvementArea?: string | null;
    journalRating?: number | null;
    reviewerName?: string | null;
    topicName?: string | null;
    type?: string | null;
    updatedDate?: Date | null ;
}
export interface feedbackDashboard
{
    id: string;
    careerPath:string;
    courses : string;
    emailId :string;
    name :string;
    overallFeedback:overallFeedback;
}
export interface overallFeedback
{
    id: string,
    internId: string,
    behaviourPerformance:string,
    technicalPerformance : string,
    rightFit: string,
    detailedFeedback: string,
    updatedByName: string,
    createdDate: Date,
    createdByName: string,
    updatedDate: Date,
    isDeleted:boolean,
    isPublished: boolean
}
export interface FeedbackFiltersDTO {
    careerPaths: string[];
    courses: string[];
    reviewers: string[];
    name:string[];
  }
  export interface assignmentFeedback{
    id :string,
    reviewerName :string,
    feedback :string,
    score : number,
    createdDate :Date,
    totalMarks :number,
    isPublished :boolean
}

export interface journalFeedback{
    id:string,
    reviewerName:string,
    feedbackPoints:string,
    rating:number,
    createdDate:Date,
    improvementArea:string,
    adminReview:string,
    isPublished: boolean
}
export interface feedbackDetails{
    internId : string;
    name:string;
    careerPath : CareerPath;
    feedbackList:feedbackList[];
    emailId:string;

}
export interface FeedbackItem {
    showFullText: boolean;
    showLessImprovementArea: boolean;
    showLessComment: boolean;
    showLessFeedback: boolean;
    assignmentReceivedMarks?: number | null;
    assignmentTotalMarks?: number | null;
    behaviouralScore?: number | null;
    behaviouralTotalScore?: number | null;
    comment?: string | null;
    courseName?: string | null;
    feedback?: string | null;
    improvementArea?: string | null;
    journalRating?: number | null;
    reviewerName?: string | null;
    topicName?: string | null;
    type?: string | null;
    updatedDate?: Date | null;
  }

export interface FeedbackFiltersDTO {
    careerPaths: string[];
    courses: string[];
    reviewers: string[];
  }
export interface overallFeedbackRequest{
    id:string,
    internId: string,
    behaviourPerformance:string,
    technicalPerformance : string,
    rightFit: string,
    detailedFeedback: string,
}
  export interface FeedbackWithImageRes{
    showFullComments: boolean;
    reporterInfo: ReporterInfoDTO | null;
    showAllAdmins: boolean;
    showFullText: boolean;
    id :string,
    reporterId : string,
    type : string,
    title : string,
    description : string,
    comments?: string,
    commentedBy?:string,
    createdDate : Date,
    updatedDate : Date,
    createdBy : string,
    updatedBy : string,
    isDeleted : boolean,
    status : string,
    admins : adminInfo[] |null,
    imageUrls : imagsDetails[],
    showLessDescription: boolean;
  }

  export interface imagsDetails{
    fileName:string,
    id:string
  }

  export interface  DecodedToken {
    [key: string]: string;
  }
  
  export interface ReporterInfoDTO {
    reporterId: string;
    reporterName: string;
    reporterEmail: string;
    reporterCareerPath: string;
}

  export enum FeedbackType {
    Feedback = 'Feedback',
    Bug = 'Bug'
  }

  export enum FeedbackStatus{
    Pending = "Pending",
    InProgress = "InProgress",
    Resolved = "Resolved",
    Rejected = "Rejected"
  }

  export enum imagedetails{
    input ='input',
    file ='file',
    image='image/*',
    none ='none',
    change ='change'
  }

  export { CareerPath };

