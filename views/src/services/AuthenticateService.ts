// import axios from "axios";
import { LoginInput, RegisterInput } from "../models/Authentication";
// import Cookies from 'js-cookie';
import { axiosInstance } from "../utils/axiosInstance";

export const authenticateApi = {
    login: async (loginValue: LoginInput) => {
        return axiosInstance.post(`/api/v1/auth/authenticate`, loginValue)
            // return await axios.post(`${BaseApi}api/v1/auth/authenticate`, loginValue);
            
    },
    
    register: async (registerValue: RegisterInput) => {
        return axiosInstance.post(`api/v1/auth/register`, registerValue);
        // return response.data;
    }
};
