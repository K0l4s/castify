import { axiosInstanceAuth } from "../utils/axiosInstance";

export const userService = {
    getUser: async () => {
        return await axiosInstanceAuth.get(`/api/v1/user`);
    },
    updateUser: async () => {
        // return await axiosInstance.put(`${BaseApi}api/v1/user`, user);
    },
    deleteUser: async () => {
        // return await axiosInstance.delete(`${BaseApi}api/v1/user`);
    },
};