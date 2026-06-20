import apiClient from "../utils/apiClient.js";

export const likeService = {
  toggleVideoLike: async (videoId) => {
    const response = await apiClient.post(`/likes/toggle/v/${videoId}`);
    return response.data.data;
  },

  toggleCommentLike: async (commentId) => {
    const response = await apiClient.post(`/likes/toggle/c/${commentId}`);
    return response.data.data;
  },

  toggleTweetLike: async (tweetId) => {
    const response = await apiClient.post(`/likes/toggle/t/${tweetId}`);
    return response.data.data;
  },

  getLikedVideos: async () => {
    const response = await apiClient.get('/likes/videos');
    return response.data.data;
  },
};

export default likeService;
