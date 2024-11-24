import { axiosInstanceAuth } from "../utils/axiosInstance";

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