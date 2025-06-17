export interface SubmitAssignmentDto {
  assignmentId: string;
  githubLink: string;
  topicId: string;
  internshipId: string;
}

export interface Course {
  courseId: string;
  courseName: string;
  internshipId: string;
}

export interface CourseDetails {
  id: string;
  journalTemplate_Id: string | null;
  name: string;
  duration: number;
  durationType: string;
  trainingLevel: string;
  quiz: boolean;
  quizTime: number;
  quizCount: number;
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
  journalTemplate: any; // Use `any` if journalTemplate structure is unknown
}

export interface Topic {
  id: string;
  courseId: string;
  course: CourseDetails;
  topicName: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
  duration: number;
  index: number;
  quizLink: string;
  quizId: string | null;
  quizDuration: number;
}

export interface Assignment {
  assignmentId: string;
  assignmentTitle: string;
  submissionId: string;
  submissionLink: string;
  submittedDate: string;
  assignment: any; // Use `any` if assignment structure is unknown
}

export interface TopicInfo {
  topic: Topic;
  quiz: any; // Use `any` if quiz structure is unknown
  assginment: Assignment[];
  journal: any; // Use `any` if journal structure is unknown
  startDate: string;
  endDate: string;
}

export interface InternshipDataDto {
  activeCourseName: string | null;
  allCourseName: Course[];
  topicInfo: TopicInfo[];
  internshipId: string;
  behaviourTemplateId: string;
  endDate: string;
}

export interface CourseSelectionDto {
  courseSelectId: string;
  internshipId: string;
}

export interface AssignmentContentDto {
  assignmentTitle: string;
  course: string;
  topic: string;
  objective: string;
  instructions: Instruction[];
  gradingCriteria: GradingCriteria[];
}

export interface Instruction {
  part: number;
  note: string;
}

export interface GradingCriteria {
  part: number;
  percentage: string;
}

export interface AssignmentDto {
  content: AssignmentContentDto;
  marks: number;
}

export interface SubmissionDto {
  assignmentId: string | null;
  assignmentTitle: string;
  submissionId: string;
  submissionLink: string;
  submittedDate: string;
  assignment: AssignmentDto[];
}
