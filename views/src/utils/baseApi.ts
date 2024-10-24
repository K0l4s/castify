import axios from "axios";
import { Envs } from "./env";


const baseURL = Envs.apiRemote;

const baseApi = axios.create({
  baseURL,
  withCredentials: true,
});

export default baseApi;
