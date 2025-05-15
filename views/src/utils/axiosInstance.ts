import axios from "axios";
import Cookie from "js-cookie";
// import { BaseApi } from "./BaseApi";
// export const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
export const BaseApi = import.meta.env.VITE_DOMAIN;;
// export const BaseApi = "http://14.225.198.232:9091";

// export const BaseApi = "https://0ac8-2402-800-6e0b-3ce1-761a-d053-e4a0-26a0.ngrok-free.app"
// export const BaseApi = "https://destined-fly-rested.ngrok-free.app";
// export const BaseApi = "https://525b-2402-800-63b6-96c5-801f-41b5-9d40-7623.ngrok-free.app"
export const axiosInstance = axios.create({
    baseURL: BaseApi,
    headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420"
    },
});
export const axiosInstanceAuth = axios.create({
    baseURL: BaseApi,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookie.get("token"),
        "ngrok-skip-browser-warning": "69420"
    },
});

export const axiosInstanceFile = axios.create({
    baseURL: BaseApi,
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Bearer " + Cookie.get("token"),
        "ngrok-skip-browser-warning": "69420"
    },
});


export const axiosInstanceLocation = axios.create({
    baseURL: "https://open.oapi.vn/location/",
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420"
    },
});