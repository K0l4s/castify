
export enum ReportType{
    U = 'USER',
    P = 'PODCAST',
    C = 'COMMENT'
}
export interface ReportRequest{
    title:string;
    detail:string;
    type:ReportType;
    target:string;
}
