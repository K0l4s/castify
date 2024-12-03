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

export const removeUserActivity = async (id: string) => {
  try {
    const response = await axiosInstanceAuth.delete(`/api/v1/activities/remove/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error removing user activity:', error);
    throw error;
  }
};

export const removeAllUserActivities = async () => {
  try {
    const response = await axiosInstanceAuth.delete(`/api/v1/activities/remove/all`);
    return response.data;
  } catch (error) {
    console.error('Error removing all user activities:', error);
    throw error;
  }
};