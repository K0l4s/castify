import { axiosInstanceAuth } from "../utils/axiosInstance";

export const creatorService = {
    getFollowers: async (pageNumber:number, pageSize:number) => {
        return await axiosInstanceAuth.get('/api/v1/user/followers?pageNumber=' + pageNumber + '&pageSize=' + pageSize);
    },
    getDashboard: async () => {
        return await axiosInstanceAuth.get('/api/v1/creator/statistics');
    }
}