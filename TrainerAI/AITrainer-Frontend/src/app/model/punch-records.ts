import { Timestamp, timestamp } from "rxjs";

export interface GetPunchRecordsDto {
    punchDate: Date;
}
export interface PunchRecordsDto {
    id: string;
    internId: string;
    punchDate: Date;
    isPunch: boolean;
    comments?: string;
    approvedBy?: string;
    approvedDate?: Date;
    isRequest: boolean;
    requestStatus: string | null;
    isStartDate: boolean;
    isApplyLeave: boolean;
    leaveStatus: string;
    leaveType: string;
    punchLogTime?: PunchLogTime[];
    leavePunchDto?: LeavePunchDto[];

}
export interface PunchLogTime {
    id: string;
    punchIn: Date;
    punchOut?: Date;
    totalTimeSpan: string;
    isPunchLog: boolean;
    isPunchLogin: boolean;
    isPunchLogOut: boolean;
    punchRecordId?: string;
    isDeleted: boolean;
    punchLogCategory: string;
    isPunchLogRequest: boolean;
    punchStatus: string;

}
export interface RequestPunchWeekly {
    StartDate: Date;
    EndDate: Date;
    Month: number;
    Year: number;
}
export interface RequestPunchDto {
    requestedPunchOutTime: Date;
    PunchInandOut: string[];
    Comments: string;
}
export interface AdminInternRequestDetailsDto {
    id: string;
    internId: string;
    internName: string;
    date: Date;
    requestPunches: Date[];
    requestedOn: Date;
    isRequest: boolean;
    approvedBy: string;
    approvedDate: Date;
    comments: string;
    status: string;
    isDeleted: boolean;
    requestReason: string;
}
export interface AdminInternApprovalRequestDto {
    punchId: string;
    status: string;
    comments: string;
    internId: string;
}
export interface InternRequestDetailsDto {
    id: string;
    internId: string;
    punchDate: Date;
    isPunch: boolean;
    comments: string;
    approvedBy: string;
    approvedDate: Date;
    isRequest: boolean;
    requestDate: Date;
    requestStatus: string;
    isDeleted: boolean;
    requestReason: string;
    punchLogTime: PunchLogTimeDto[];
}
export interface DeleteRequestDto {
    punchRecordRequestId: string;
}
export interface ListAdminAttendanceRequestViewDto {
    RequestApplication: AdminInternRequestDetailsDto[];
}

export interface LeavePunchDto {
    leaveStartDate: Date;
    leaveEndDate: Date;
    leaveStatus: string;
    leaveType: string;
    createdDate: Date;
}

export interface InternBatchDto {
    batchName: string;
    weekdaysNames: string[];
}
export interface PunchLogTimeDto {
    punchLogId: string;
    punchIn: Date;
    punchOut?: Date;
    isDeleted: boolean;
    isPunchLogin: boolean;
    isPunchLogOut: boolean;
    totalTimeSpan: string;
    punchStatus: string;
}
export interface PunchRecordRequestsDto {
    id: string;
    internId: string;
    requestDate: Date;
    requestPunches: Date[];
    requestReason: string;
    status: string;
    approvedBy: string;
    approvedDate: string;
    isDeleted: boolean;
}
export interface AdminInternPunchRecordRequestDetailsDto {
    id: string;
    internId: string;
    internName: string;
    date: Date;
    requestPunches: Date[];
    requestedOn: Date;
    isRequest: boolean;
    approvedBy: string;
    approvedDate: Date;
    comments: string;
    status: string;
    isDeleted: boolean;
    requestReason: string;
}

export interface punchRequestAttendanceDto {
    id: string;
    requestDate: Date;
    status: string;
}