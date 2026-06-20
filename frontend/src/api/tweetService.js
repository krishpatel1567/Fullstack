import apiClient from "../utils/apiClient.js";

export const tweetService = {
  createTweet: async (content) => {
    const response = await apiClient.post('/tweets/create', { content });
    return response.data.data;
  },

  getAllTweets: async () => {
    const response = await apiClient.get('/tweets');
    return response.data.data.tweets || [];
  },

  getUserTweets: async (userId) => {
    const response = await apiClient.get(`/tweets/user/${userId}`);
    return response.data.data.tweets || [];
  },

  updateTweet: async (tweetId, content) => {
    const response = await apiClient.patch(`/tweets/update/${tweetId}`, { content });
    return response.data.data;
  },

  deleteTweet: async (tweetId) => {
    const response = await apiClient.delete(`/tweets/delete/${tweetId}`);
    return response.data;
  },
};

export default tweetService;
