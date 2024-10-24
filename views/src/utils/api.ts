import axios from "axios";
import { Envs } from "./env";
const baseURL = Envs.apiRemote;

const apiJWT = axios.create({
  baseURL,
  withCredentials: true,
});

apiJWT.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  const expString = localStorage.getItem("exp");
  if (token && expString) {
    // if (parseInt(expString) < Date.now() / 1000) {
    //   try {
    //     const { data } = await apiRefreshToken.get(`api/v1/auth/refresh`);
    //     if (data) {
    //       config.headers.Authorization = `Bearer ${data.token}`;
    //       const expirationTime = Math.floor(Date.now() / 1000) + 90 * 60;
    //       localStorage.setItem("exp", expirationTime.toString());
    //     }
    //   } catch (error) {
    //     if (error instanceof AxiosError) {
    //       console.log(error.response?.data.error);
    //     } else {
    //       console.log(error);
    //     }
    //   }
    // } else {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiJWT;
