
import { ProgressList, ReportRequest, ReportStatus, ReportType } from "../models/Report";
import { axiosInstanceAuth } from "../utils/axiosInstance";

export const reportService = {
    senReport: async (report: ReportRequest) => {
        return axiosInstanceAuth.post(`/api/v1/report`, report);
    },
    getReports: async (pageNumber: number, pageSize: number, status?: ReportStatus,type?:ReportType,keyword?:String) => {
        // if (status === ReportStatus.a)
        //     return axiosInstanceAuth.get(`/api/v1/admin/report?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        // return axiosInstanceAuth.get(`/api/v1/admin/report?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${status}`);
        let url = `/api/v1/admin/report?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        if(status &&status!=ReportStatus.a) url += `&status=${status}`;
        if(type && type!=ReportType.A) url += `&type=${type}`;
        if(keyword) url += `&keyword=${keyword}`;
        console.log(url);
        return axiosInstanceAuth.get(url);
    },
    getReportUserInformation: async (userId: string) => {
        return axiosInstanceAuth.get(`/api/v1/admin/user/detail?userId=${userId}`);
    },
    getReportCommentInformation: async (commentId: string) => {
        return axiosInstanceAuth.get(`/api/v1/comment/detail?commentId=${commentId}`);
    },
    getReportPodcastInformation: async (podcastId: string) => {
        return axiosInstanceAuth.get(`/api/v1/podcast/${podcastId}`);
    },
    acptReport: async (reportId: string, progressList:ProgressList[]) => {
        return axiosInstanceAuth.put(`/api/v1/admin/report?reportId=${reportId}`, {status: ReportStatus.ACP, progressList});
    },
    declReport: async (reportId: string) => {
        return axiosInstanceAuth.put(`/api/v1/admin/report?reportId=${reportId}`, {status: ReportStatus.D});
    },
};
