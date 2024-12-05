import { shortUser } from "./User";


export enum ReportType {
    U = 'USER',
    P = 'POST',
    C = 'COMMENT',
    A = 'all'
}
export enum ReportStatus {
    P = 'PENDING',
    ACP = 'ACCEPTED',
    D = 'DECLINED',
    a = 'all'
}
export interface ReportRequest {
    title: string;
    detail: string;
    type: ReportType;
    target: string;
}

export interface Report {
    id: string;
    title: string;
    detail: string;
    type: ReportType;
    createdDay: Date;
    target: string;
    status: ReportStatus;
    userRequest: shortUser;
    userResponse: shortUser;
    handleMethod: string[];
}
export enum ReportProgressType {
    BU = 'BAN_USER',
    DP = 'DEL_PODCAST',
    DC = 'DEL_COMMENT',
}
export interface ProgressList{
    type: ReportProgressType;
    targetId: string;
}
export interface ProgressReport {
    status: ReportStatus;
    progressList: ProgressList[];
}