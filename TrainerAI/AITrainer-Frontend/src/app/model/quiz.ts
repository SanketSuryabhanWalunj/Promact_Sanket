export interface QuizQuestyResponseDto {
    scoreAchieved: any,
    percentage: any,
    singleMultipleQuestionACs: SingleMultipleQuestionAC[];
    answeredOptionACs:answeredOptionACs[];
}

export interface SingleMultipleQuestionAC {
    questionDetail:string,
    singleMultipleAnswerQuestionOption: SingleMultipleAnswerQuestionOption[];
}
export interface  SingleMultipleAnswerQuestionOption
{
    singleMultipleAnswerQuestionID:string,
    option:string,
    isAnswer:boolean,
    id:string
}
export interface answeredOptionACs{
    answeredOption:string,
    questionId:string

}