import { CourseDetailsType } from './courses';

export type CartSliceInitialState = {
  loading: boolean;
  data: {
    items: CartItemType[];
    totalQty: number;
    totalAmount: number;
  };
  error: string;
};

export type CartItemType = {
  id: string;
  companyId: string;
  courseId: string;
  courseDetails: CourseDetailsType;
  courseCount: number;
  examType: string;
  planType: string;
};
