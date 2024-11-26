import { axiosInstance, axiosInstanceAuth } from "../utils/axiosInstance";

interface AddCommentPayload {
  podcastId: string;
  content: string;
}

export const addComment = async (payload: AddCommentPayload) => {
  try {
    const response = await axiosInstanceAuth.post("/api/v1/comment/add", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPodcastComments = async (podcastId: string, page = 0, size = 10, sortBy = "latest", isAuthenticated = false) => {
  try {
    const axiosInstanceToUse = isAuthenticated ? axiosInstanceAuth : axiosInstance;
    const response = await axiosInstanceToUse.get(`/api/v1/comment/list/${podcastId}`, {
      params: {
        page,
        size,
        sortBy,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const likeComment = async (commentId: string) => {
  try {
    const response = await axiosInstanceAuth.post("/api/v1/comment/reaction", { commentId });
    return response.data;
  } catch (error) {
    throw error;
  }
}