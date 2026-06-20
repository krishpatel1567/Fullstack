  import apiClient from "../utils/apiClient.js";

export const subscriptionService = {
  toggleSubscription: async (channelId) => {
    const response = await apiClient.post(`/subscriptions/c/${channelId}`);
    return response.data.data;
  },

  getSubscribedChannels: async (userId) => {
    const response = await apiClient.get(`/subscriptions/c/${userId}`);
    return response.data.data;
  },

  getChannelSubscribers: async (channelId) => {
    const response = await apiClient.get(`/subscriptions/u/${channelId}`);
    return response.data.data;
  },
};

export default subscriptionService;
