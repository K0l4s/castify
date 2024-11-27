import { axiosInstanceLocation } from "../utils/axiosInstance";

export const locationService = {
    getProvinces: async () => {
        return await axiosInstanceLocation.get('provinces?page=0&size=63');
    },
    getDistricts: async (provinceId: string) => {
        return await axiosInstanceLocation.get(`districts/${provinceId}?page=0&size=100`);
    },
    getWards: async (districtId: string) => {
        return await axiosInstanceLocation.get(`/wards/${districtId}?page=0&size=100`);
    }
};