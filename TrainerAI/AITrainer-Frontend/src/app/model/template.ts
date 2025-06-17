export interface template{
    id : string,
    templateName :string ,
    description :string ,
    updatedDate : Date,
    isDeleted : boolean,
    options : categoryType[],
}
export interface categoryType{
    id : string,
    categoryName : string ,
    totalMarks : number ,
    updatedDate : Date,
    isDeleted : boolean,
}

export interface categoryItem{
    categoryId : string,
    receivedMarks : number,
    feedback : string,
}

export interface behaviourFeedback{
    templateName:string,
    categoryWiseFeedback: behaviourCategoryFeedback[] 
}

export interface behaviourCategoryFeedback{
    generalId:string ,
    categoryId:string ,
    categoryName:string ,
    feedback:string ,
    receivedMarks: number ,
    totalMarks:number ,
    type:string ,
    createdDate:Date ,
    isDeleted: boolean,
    isPublished: boolean,
}
export interface updateRequestData{
    generalId:string ,
    categoryId : string,
    receivedMarks : number,
    feedback : string
}

export interface BehaviourTemplateDto {
    id: string;
    templateName: string;
    description: string;
    updatedDate: Date;
    isDeleted: boolean;
    options: BehaviourCategoryDto[];
    isPublished: boolean;
}

interface BehaviourCategoryDto {
    id: string;
    categoryName: string;
    totalMarks: number;
    updatedDate: Date;
    isDeleted: boolean;
}

