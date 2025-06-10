import { updateUser } from "../models/User";
import { store } from "../redux/store";
import { axiosInstance, axiosInstanceAuth, axiosInstanceFile } from "../utils/axiosInstance";
import Cookies from 'js-cookie';

const getAxiosInstance = () => {
  const state = store.getState();
  const isAuthenticated = state.auth.isAuthenticated;
  return isAuthenticated ? axiosInstanceAuth : axiosInstance;
}

export const userService = {
    getUserByToken: async (token: string) => {

        return await axiosInstance.get(`/api/v1/user/auth`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    },
    getUserDetails: async (username?: string) => {
        const accessToken = Cookies.get('token');
        if (username)
            // try{
            // return await axiosInstanceAuth.get(`/api/v1/user?username=${username}`);
            // }catch(e){
            //     return await axiosInstance.get(`/api/v1/user?username=${username}`);
            // }
            if (accessToken)
                return await axiosInstanceAuth.get(`/api/v1/user?username=${username}`);
            else
                return await axiosInstance.get(`/api/v1/user?username=${username}`);
        else
            return await axiosInstanceAuth.get(`/api/v1/user`);
    },
    getUserAuth: async () => {
        return await axiosInstanceAuth.get(`/api/v1/user/auth`);
    },
    updateUser: async (user: updateUser) => {
        return await axiosInstanceAuth.put(`/api/v1/user`, user);
    },
    deleteUser: async () => {
        // return await axiosInstance.delete(`${BaseApi}api/v1/user`);
    },
    followUser: async (targetUsername: string) => {
        return await axiosInstanceAuth.put(`/api/v1/user/follow?username=${targetUsername}`)
    },
    getSuggestUser: async () => {
        return await axiosInstanceAuth.get(`/api/v1/user/recommend`);
    },
    changeAvatar: async (avatar: File) => {
        const formData = new FormData();
        formData.append('avatar', avatar);
        return await axiosInstanceFile.put(`/api/v1/user/avatar`, formData);
    },
    changeCover: async (cover: File) => {
        const formData = new FormData();
        formData.append('cover', cover);
        return await axiosInstanceFile.put(`/api/v1/user/cover`, formData);
    },
    getAllUser: async (pageNumber: number, pageSize: number, keyword?: string) => {
        if (keyword)
            return await axiosInstanceAuth.get(`/api/v1/admin/user?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
        return await axiosInstanceAuth.get(`/api/v1/admin/user?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    },
    toggleBanUser: async (userId: string) => {
        return await axiosInstanceAuth.put(`/api/v1/admin/user/ban?userId=${userId}`);
    },
    searchUser: async (pageNumber: number, pageSize: number, keyword: string) => {
        const accessToken = Cookies.get('token');
        if (accessToken)
            return await axiosInstanceAuth.get(`/api/v1/search/user?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
        else
            return await axiosInstance.get(`/api/v1/search/user?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
        // return await axiosInstanceAuth.get(`/api/v1/search/user?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
    },
    searchPodcast: async (pageNumber: number, pageSize: number, keyword: string) => {
        const accessToken = Cookies.get('token');
        if (accessToken)
            return await axiosInstanceAuth.get(`/api/v1/search/post?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
        else
            return await axiosInstance.get(`/api/v1/search/post?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
        // return await axiosInstanceAuth.get(`/api/v1/search/post?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
    },
    getFollowers: async (username: string, pageNumber: number, pageSize: number) => {
        const accessToken = Cookies.get('token');

        if (accessToken)
            return await axiosInstanceAuth.get(`/api/v1/user/list/follower?username=${username}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return await axiosInstance.get(`/api/v1/user/list/follower?username=${username}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
    },
    getFollowings: async (username: string, pageNumber: number, pageSize: number) => {
        const accessToken = Cookies.get('token');
        if (accessToken)
            return await axiosInstanceAuth.get(`/api/v1/user/list/following?username=${username}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return await axiosInstance.get(`/api/v1/user/list/following?username=${username}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
    },
    getFriends: async (pageNumber: number, pageSize: number, keyword?: string) => {
        if (keyword)
            return await axiosInstanceAuth.get(`/api/v1/user/list/friends?keyword=${keyword}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return await axiosInstanceAuth.get(`/api/v1/user/list/friends?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    },
    updateGenreFavorites: async (genreIds: string[]) => {
        return await axiosInstanceAuth.post(`/api/v1/user/favorite-genres`, { genreIds });
    },
    getFavoriteGenres: async () => {
        return await axiosInstanceAuth.get(`/api/v1/user/favorite-genres`);
    },

    getSuggestedGenres: async () => {
        const axiosClient = getAxiosInstance();
        return await axiosClient.get(`/api/v1/user/suggested-genres`);
    },
};