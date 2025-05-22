import { axiosInstance, axiosInstanceAuth } from "../utils/axiosInstance";

interface AddCommentPayload {
  podcastId: string;
  content: string;
  parentId?: string;
  mentionedUser?: string;
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

export const getCommentReplies = async (commentId: string, isAuthenticated = false) => {
  try {
    const axiosInstanceToUse = isAuthenticated ? axiosInstanceAuth : axiosInstance;
    const response = await axiosInstanceToUse.get(`/api/v1/comment/list/replies/${commentId}`);
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

export const deleteComment = async (commentIds: string[]) => {
  try {
    const response = await axiosInstanceAuth.delete("/api/v1/comment/delete", {
      data: commentIds,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editComment = async (commentId: string, content: string) => {
  try {
    const response = await axiosInstanceAuth.put(`/api/v1/comment/${commentId}/edit`, null, {
      params: { content }
    });
    return response.data;
  } catch (error) {
    console.error("Error editing comment: ", error);
    throw error;
  }
};