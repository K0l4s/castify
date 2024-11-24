import { updateUser } from "../models/User";
import { axiosInstance, axiosInstanceAuth } from "../utils/axiosInstance";

export const userService = {
    getUserByToken: async (token:string) => {

            return await axiosInstance.get(`/api/v1/user/auth`,
                {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    },
    getUserDetails: async (username?:string) => {
        if(username)
            return await axiosInstanceAuth.get(`/api/v1/user?username=${username}`);
        else
            return await axiosInstanceAuth.get(`/api/v1/user`);
    },
    getUserAuth: async () => {
        return await axiosInstanceAuth.get(`/api/v1/user/auth`);
    },
    updateUser: async (user:updateUser) => {
        return await axiosInstanceAuth.put(`/api/v1/user`, user);
    },
    deleteUser: async () => {
        // return await axiosInstance.delete(`${BaseApi}api/v1/user`);
    },
    followUser: async (targetUsername:string) => {
        return await axiosInstanceAuth.put(`/api/v1/user/follow?username=${targetUsername}`)
    }
};