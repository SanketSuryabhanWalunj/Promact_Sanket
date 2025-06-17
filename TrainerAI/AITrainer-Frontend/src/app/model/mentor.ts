export interface Mentor {
  mentorId: string;
  firstName: string;
  lastName: string;
}

export interface InternshipRequestDto {
  batchId: string;
  CourseId: string[];
  MentorId: string[];
}

