// import axios from "axios";

import { LoginInput } from "../models/Authentication";
// import { userRegister } from "../models/User";
// import Cookies from 'js-cookie';
import { axiosInstance } from "../utils/axiosInstance";

export const authenticateApi = {
    login: async (loginValue: LoginInput) => {
        return axiosInstance.post(`/api/v1/auth/authenticate`, loginValue)
        // return await axios.post(`${BaseApi}api/v1/auth/authenticate`, loginValue);

    },

    register: async (registerValue: any) => {
        return axiosInstance.post(`api/v1/auth/register`, registerValue);
        // return response.data;
    },
    logout: async () => {
        return axiosInstance.get(`/api/v1/auth/logout`);
    },
    vertify: async (token: string) => {
        return await axiosInstance.post(
            `/api/v1/auth/verify-email`,
            {}, // body của request để trống nếu không có dữ liệu cần gửi
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    },
    loginWithGoogle: async (token: string) => {
        return axiosInstance.post(`/api/v1/auth/google`, { token });
    },
    sendRefreshPassword: async (email: string) => {
        return axiosInstance.post(`/api/v1/auth/reset/send-request?email=${encodeURIComponent(email)}`);
    },

    resetPassword: async (token: string, newPassword: string) => {
        return axiosInstance.post(
            `/api/v1/auth/reset/change?newPassword=${encodeURIComponent(newPassword)}`,
            null,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    }



};
