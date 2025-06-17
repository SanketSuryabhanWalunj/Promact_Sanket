export type QuizQuestionOptionType = {
  id: number;
  optionText: string;
  isCorrect: boolean;
  creationTime: string;
  lastModificationTime: string;
};

export type QuizQuestionType = {
  id: number;
  examDetailsId: string;
  questionText: string;
  creationTime: string;
  lastModificationTime: string;
  questionOptions: QuizQuestionOptionType[];
};

export type ExamDetailsType = {
  id: number;
  examName: string;
  durationTime: number;
  noOfQuestions: number;
  courseId: string;
  creationTime: string;
  lastModificationTime: string;
};

export type SaveQuizAnswerType = {
  chosedOptionId: number;
  questionId: number;
  isSaved: boolean;
};
