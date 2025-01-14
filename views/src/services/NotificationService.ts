import { axiosInstanceAuth } from "../utils/axiosInstance";

export const NotificationService = {
    getTotalUnRead: async () => {
        return axiosInstanceAuth.get(`/api/v1/notification/read`);
    },
    getAllNotification: async (pageNumber:number,pageSize:number) => {
        return axiosInstanceAuth.get(`/api/v1/notification?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    },
}