import { mentorDetails } from "./internship";

export interface topicDetails{
    internshipId :string,
    topicInfo :topicList,
    courseName :string,
    journalId : string,
    courseDuration :number,
    courseEndDate :Date,
    courseStartDate :Date
}
export interface topicList{
    topics : topic,
    assignment : assignmentInfo[],
    topicStartDate : Date,
    topicEndDate : Date,
}
export interface topic {
    id: string,
    courseId: string,
    topicName: string,
    createdDate: Date,
    updatedDate: Date,
    isDeleted: boolean,
    duration: number,
    quizLink: string,
    quizId: string,
    quizDuration: number,

}
export interface assignmentInfo{
    id: string,
    name:string
    submissionLink: string,
    content: assignmentResponseDto,
    marks: number,
    isPublished : boolean,
}   

export interface assignmentResponseDto{
    assignmentTitle: string;
    course: string;
    topic: string;
    objective: string;
    instructions: Instruction[];
    gradingCriteria: GradingCriterion[];
}
    
export interface Instruction {
    part: number;
    note: string;
}
    
export interface GradingCriterion {
    part: number;
    percentage: string;
}
export interface internInternshipList{
    id: string,
    batchName: string,
    firstName :string,
    lastName: string,
    careerPath: string,
    courseName :string,
    mentorsName : mentorDetails[],
    duration :number,
    startDate :Date,
    status :string,
    endTime: Date
}