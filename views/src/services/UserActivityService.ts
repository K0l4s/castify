import { axiosInstanceAuth } from "../utils/axiosInstance";

export const getUserActivities = async (page: number) => {
  try {
    const response = await axiosInstanceAuth(`/api/v1/activities/view-podcast?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};