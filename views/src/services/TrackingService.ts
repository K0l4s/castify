import { axiosInstance } from "../utils/axiosInstance";

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
    }
}