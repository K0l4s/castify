import { updateUser } from "../models/User";
import { axiosInstance, axiosInstanceAuth, axiosInstanceFile } from "../utils/axiosInstance";
import Cookies from 'js-cookie';
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
        const accessToken = Cookies.get('token');
        if(username)
            // try{
            // return await axiosInstanceAuth.get(`/api/v1/user?username=${username}`);
            // }catch(e){
            //     return await axiosInstance.get(`/api/v1/user?username=${username}`);
            // }
            if(accessToken)
                return await axiosInstanceAuth.get(`/api/v1/user?username=${username}`);
            else
                return await axiosInstance.get(`/api/v1/user?username=${username}`);
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
    },
    getSuggestUser: async () => {
        return await axiosInstanceAuth.get(`/api/v1/user/recommend`);
    },
    changeAvatar: async (avatar:File) => {
        const formData = new FormData();
        formData.append('avatar', avatar);
        return await axiosInstanceFile.put(`/api/v1/user/avatar`, formData);
    },
    changeCover: async (cover:File) => {
        const formData = new FormData();
        formData.append('cover', cover);
        return await axiosInstanceFile.put(`/api/v1/user/cover`, formData);
    },
    getAllUser: async (pageNumber: number, pageSize:number,keyword?:string) => {
        if(keyword)
            return await axiosInstanceAuth.get(`/api/v1/admin/user?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
        return await axiosInstanceAuth.get(`/api/v1/admin/user?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    },
    toggleBanUser: async (userId:string) => {
        return await axiosInstanceAuth.put(`/api/v1/admin/user/ban?userId=${userId}`);
    },
    searchUser: async (pageNumber:number,pageSize:number,keyword:string) => {
        const accessToken = Cookies.get('token');
        if(accessToken)
            return await axiosInstanceAuth.get(`/api/v1/search/user?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
        else
            return await axiosInstance.get(`/api/v1/search/user?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
        // return await axiosInstanceAuth.get(`/api/v1/search/user?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
    },
    searchPodcast: async (pageNumber:number,pageSize:number,keyword:string) => {
        const accessToken = Cookies.get('token');
        if(accessToken)
            return await axiosInstanceAuth.get(`/api/v1/search/post?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
        else
            return await axiosInstance.get(`/api/v1/search/post?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
        // return await axiosInstanceAuth.get(`/api/v1/search/post?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
    }
};