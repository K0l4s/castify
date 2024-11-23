import axios from "axios";
import Cookie from "js-cookie";
// import { BaseApi } from "./BaseApi";
const BaseApi = "http://localhost:8081";
export const axiosInstance = axios.create({
    baseURL: BaseApi,
    headers: {
        "Content-Type": "application/json",
    },
});
export const axiosInstanceAuth = axios.create({
    baseURL: BaseApi,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookie.get("token"),
    },
});

export const axiosInstanceFile = axios.create({
    baseURL: BaseApi,
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Bearer " + Cookie.get("token"),
    },
});
