export type ContentSectionType = {
  serialNumber: number;
  sectionTitle: string;
  sectionData: string;
  fieldType: number;
  contentId: string;
  createdDateTime: string;
};

export type LessonContentType = {
  id: string;
  serialNumber: number;
  contentTitle: string;
  contentData: string;
  lessonId: string;
  sections: ContentSectionType[];
};

export type ModuleLessonType = {
  id: string;
  serialNumber: number;
  name: string;
  moduleId: string;
  contents: LessonContentType[];
  currentModuleSerialNumber: number;
};

export type ModuleWithLessonType = {
  id: string;
  serialNumber: number;
  name: string;
  courseId: string;
  lessons: ModuleLessonType[];
  hasExam: boolean;
};
