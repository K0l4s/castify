
import { ReportRequest } from "../models/Report";
import { axiosInstanceAuth } from "../utils/axiosInstance";

export const reportService = {
    senReport: async (report: ReportRequest) => {
        return axiosInstanceAuth.post(`/api/v1/report`, report);
    }
};
