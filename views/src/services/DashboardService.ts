
import { axiosInstanceAuth } from "../utils/axiosInstance";
export const DashboardService = {
    getDashboardInformation(startDate?: Date, endDate?: Date) {
        if (startDate === null || endDate === null || startDate === undefined || endDate === undefined)
            return axiosInstanceAuth.get(`/api/v1/admin/statistics`);

        return axiosInstanceAuth.get(`/api/v1/admin/statistics?startDate=${startDate}&endDate=${endDate}`);
    }

};