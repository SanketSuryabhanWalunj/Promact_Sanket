export interface courseList {
  id: string;
  name: string;
  duration: number;
  durationType: string;
  trainingLevel: string;
  quiz: boolean;
  isDeleted: boolean;
}

export interface courseDetailList {
  id: string;
  name: string;
  duration: number;
  durationType: string;
  trainingLevel: string;
  quiz: boolean;
  quizTime: number;
  quizCount: number;
  createdDate: string;
  journalTemplateId: string | null;
  templateName:string;
  topics: Topic[];
}
export interface Topic {
  id: string;
  topicName: string;
  index: number;
  duration: number;
  quizLink: string;
  assignment: Assignment[];
  quiz: Quiz[];
}
export interface Assignment {
  id: string;
  name: string;
  content: Content;
  marks: string;
}
export interface Content{
  instructions:Intructions[];
  gradingCriteria:GradingCriteria[];
}
export interface Intructions{
  part:number;
  note:string;
}
export interface GradingCriteria
{
  part:number;
  percentage:string;
}
export interface Quiz {
  id: string;
  title: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
  marks:number;
}

export interface createTemplate {
  courseId: string;
  templateId: string;
}

export interface AssignmentEdit{
    partDetails:PartDetails[]
}
export interface PartDetails{
  PartNo :string,
  PartPercentage:string,
  PartNote:string
}