
import { axiosInstanceAuth } from "../utils/axiosInstance";
export const DashboardService = {
    getDashboardInformation(startDate?: string, endDate?: string) {
        if (startDate === null || endDate === null || startDate === undefined || endDate === undefined)
            return axiosInstanceAuth.get(`/api/v1/admin/statistics`);

        return axiosInstanceAuth.get(`/api/v1/admin/statistics?startDate=${startDate}&endDate=${endDate}`);
    },
    getAdminGraphDashboard: async (startDate?: string, endDate?: string) => {
        // return await axiosInstanceAuth.get('/api/v1/creator/statistics');
        if(startDate === null || endDate === null || startDate === undefined || endDate === undefined)
            return axiosInstanceAuth.get('/api/v1/admin/statistics/graph');
        return axiosInstanceAuth.get(`/api/v1/admin/statistics/graph?startDate=${startDate}&endDate=${endDate}`);
    }
};
