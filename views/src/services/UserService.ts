import { axiosInstance } from "../utils/axiosInstance";

export const userService = {
    getUser: async (token:string) => {
        return await axiosInstance.get(`/api/v1/user`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    },
    updateUser: async () => {
        // return await axiosInstance.put(`${BaseApi}api/v1/user`, user);
    },
    deleteUser: async () => {
        // return await axiosInstance.delete(`${BaseApi}api/v1/user`);
    },
};