import { axiosInstanceAuth } from "../utils/axiosInstance";

export const creatorService = {
    getFollowers: async (pageNumber:number, pageSize:number) => {
        return await axiosInstanceAuth.get('/api/v1/user/followers?pageNumber=' + pageNumber + '&pageSize=' + pageSize);
    },
    getDashboard: async (startDate?: string, endDate?: string) => {
        // return await axiosInstanceAuth.get('/api/v1/creator/statistics');
        if(startDate === null || endDate === null || startDate === undefined || endDate === undefined)
            return axiosInstanceAuth.get('/api/v1/creator/statistics');
        return axiosInstanceAuth.get(`/api/v1/creator/statistics?startDate=${startDate}&endDate=${endDate}`);
    },
    getGraphDashboard: async (startDate?: string, endDate?: string) => {
        // return await axiosInstanceAuth.get('/api/v1/creator/statistics');
        if(startDate === null || endDate === null || startDate === undefined || endDate === undefined)
            return axiosInstanceAuth.get('/api/v1/creator/statistics/graph');
        return axiosInstanceAuth.get(`/api/v1/creator/statistics/graph?startDate=${startDate}&endDate=${endDate}`);
    }
    // if (startDate === null || endDate === null || startDate === undefined || endDate === undefined)
    //             return axiosInstanceAuth.get(`/api/v1/admin/statistics`);
    
    //         return axiosInstanceAuth.get(`/api/v1/admin/statistics?startDate=${startDate}&endDate=${endDate}`);
}