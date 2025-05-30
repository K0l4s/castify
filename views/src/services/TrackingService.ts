import { axiosInstance, axiosInstanceAuth } from "../utils/axiosInstance";

export const trackService = {
    trackVisitor: async (url:string) => {
        try {
            await axiosInstance.post(`/api/v1/track`, {
                userAgent: navigator.userAgent,
                url
            });
            console.log("Tracking successfully sent for:", url);
        } catch (error) {
            console.error("Error tracking visitor:", error);
        }
    },
    getVideoTracking: async (podcastId:string) => {
        try {
            const response = await axiosInstanceAuth.get(`/api/v1/tracking/podcast`, {
                params: { podcastId }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching video tracking data:", error);
            throw error;
        }
    }
}