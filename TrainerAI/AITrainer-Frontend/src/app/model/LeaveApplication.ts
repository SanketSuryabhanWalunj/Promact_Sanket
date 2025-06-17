import { imagsDetails } from "./feedback";

export interface applyLeave {
    leaveStartDate: Date,
    leaveEndDate: Date,
    leaveType: string,
    leaveReason: string
}
export interface leaveApproval {
    leaveStartDate: Date;
    name: string;
    leaveReason: string;
    totalDay: number;
    leaveEndDate: Date;
}
export enum LeaveType {
    SickLeave = 'Sick Leave',
    CasualLeave = 'Casual Leave',
    WorkFromHome = 'Work From Home',

}
export enum LeaveCategory {
    FirstHalf = 'First Half',
    SecondHalf = 'Second Half',
}
export interface leaveApplication {
    internId: string;
    leaveStartDate: Date;
    leaveEndDate: Date;
    totalDay: number;
    leaveType: string;
    leaveReason: string;
    leaveStatus: string;
    isDeleted: boolean;
    approvedBy: string;
    approvedDate: Date;
    comments: string;
    createdBy: string;
    updatedBy: string;
    createdDate: Date;
    updatedDate: Date;
    attachments: LeaveDocumentAttachmentDto
}
export interface AdminLeaveView {
    id: string;
    internId: string;
    name: string;
    leaveStartDate: Date;
    leaveEndDate: Date;
    totalDay: number;
    leaveType: string;
    leaveReason: string;
    leaveStatus: string;
    updatedBy: string;
    createdDate: string;
}
export interface ListAdminAttendanceView {
    leaveApplication: AdminLeaveView[];
}
export interface LeaveDocumentAttachmentDto {
    id: string;
    fileName: string;
    fileData: string;
}