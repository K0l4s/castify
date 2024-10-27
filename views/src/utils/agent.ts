import { AxiosResponse } from "axios";
import apiJWT from "./api";
import baseApi from "./baseApi";

const responseBody = (response: AxiosResponse) => response.data;
const requests = {
  get: <T>(url: string, params?: T) =>
    apiJWT.get(url, { params }).then(responseBody),
  post: <T>(url: string, body: T) => apiJWT.post(url, body).then(responseBody),
  post1: <T>(url: string, params?: T) =>
    apiJWT.post(url, { params }).then(responseBody),
  put: <T>(url: string, body: T) => apiJWT.put(url, body).then(responseBody),
  patch: <T>(url: string, body: T) =>
    apiJWT.patch(url, body).then(responseBody),
  del: <T>(url: string, params?: T) =>
    apiJWT.delete(url, { params }).then(responseBody),
  baseApiGet: <T>(url: string, params?: T) =>
    baseApi.get(url, { params }).then(responseBody),
  baseApiPost: <T>(url: string, body: T) =>
    baseApi.post(url, body).then(responseBody),
  baseApiChangePost: <T>(url: string, body: T, params?: T) =>
    baseApi.post(url, body, { params }).then(responseBody),
  baseApiPut: <T>(url: string, body: T) =>
    baseApi.put(url, body).then(responseBody),
  baseApiPatch: <T>(url: string, body: T) =>
    baseApi.patch(url, body).then(responseBody),
  baseApiDelete: <T>(url: string, params?: T) =>
    baseApi.delete(url, { params }).then(responseBody),
};
const auth = {
  login: (user: any) => requests.post("api/v1/auth/authenticate", user),
  register: (user: any) => requests.post("api/v1/auth/register", user),
  me: () => requests.get("api/v1/auth/me"),
  logout: () => requests.post("api/v1/auth/logout", {}),
  forgotPassword: (email: string) =>
    requests.post("api/v1/auth/forgot-password", { email }),
  resetPassword: (data: any) =>
    requests.post("api/v1/auth/reset-password", data),
  changePassword: (data: any) =>
    requests.post("api/v1/auth/change-password", data),
  verifyEmail: (token: string) =>
    requests.get(`api/v1/auth/verify-email/${token}`),
  resendEmail: (email: string) =>
    requests.post("api/v1/auth/resend-email", { email }),
  refreshToken: (refreshToken: string) => 
    requests.post("api/v1/auth/refresh-token", { refreshToken }),
};
const Podcasts = {
  list: (params: any) => requests.get("api/v1/podcasts", params),
  details: (id: string) => requests.get(`api/v1/podcasts/${id}`),
  create: (podcast: any) => requests.post("api/v1/podcasts", podcast),
  update: (podcast: any) =>
    requests.put(`api/v1/podcasts/${podcast.id}`, podcast),
  delete: (id: string) => requests.del(`api/v1/podcasts/${id}`),
};

const agent = {
    Podcasts,
    auth
};
export default agent;
