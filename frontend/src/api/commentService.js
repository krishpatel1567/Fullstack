import apiClient from "../utils/apiClient.js";

export const commentService = {
  getVideoComments: async (videoId) => {
    const response = await apiClient.get(`/comments/${videoId}`);
    return response.data.data.comments || [];
  },

  addComment: async (videoId, content) => {
    const response = await apiClient.post(`/comments/${videoId}`, { content });
    return response.data.data;
  },

  deleteComment: async (commentId) => {
    const response = await apiClient.delete(`/comments/c/${commentId}`);
    return response.data;
  },

  updateComment: async (commentId, content) => {
    const response = await apiClient.patch(`/comments/c/${commentId}`, { content });
    return response.data.data;
  },
};

export default commentService;
