import { ExpressionType } from "@angular/compiler"
import { CareerPath } from "./career-path";

export interface internshipList{
    id: string,
    batchName: string,
    firstName :string,
    lastName: string,
    careerPath: CareerPath,
    courseName :string,
    mentors : mentorDetails[],
    duration :number,
    startDate :Date,
    status :boolean,
    endTime: Date
}
export interface mentorDetails{
    mentorId: string,
    firstName: string,
    lastName: string
}
export interface FeedbackResponse{
    id :string,
    reviewerId :string,
    reviewerName :string,
    message : MessageFormat,
    type : FeedbackType,
    createdDate : Date,
    updatedDate :Date,
    isEdited: boolean,
    isEditing: boolean,
}

export enum FeedbackType{
    Behaviour = "Behaviour",
    General = "General",
    Assignment = "Assignment",
    Journal = "Journal"
}

export interface MessageFormat{
    feedback : string, 
    improvementArea : string, 
    rating : number, 
    score : number, 
    comment : string, 
}

export interface batch{
    batchName: string;
    id : string;
}