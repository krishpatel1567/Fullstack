import apiClient from "../utils/apiClient.js";

export const videoService = {
  uploadVideo: async (videoFile, thumbnail, title, description) => {
    const formData = new FormData();
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnail);
    formData.append('title', title);
    formData.append('description', description);
    const response = await apiClient.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getAllVideos: async (page = 1, limit = 10, userId) => {
    const params = { page, limit };
    if (userId) {
      params.userId = userId;
    }
    const response = await apiClient.get('/videos', {
      params,
    });
    return response.data.data.videos || [];
  },

  getVideoById: async (videoId) => {
    const response = await apiClient.get(`/videos/${videoId}`);
    return response.data.data;
  },

  deleteVideo: async (videoId) => {
    const response = await apiClient.delete(`/videos/${videoId}`);
    return response.data;
  },

  updateVideo: async (videoId, { title, description, thumbnail }) => {
    const formData = new FormData();
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    if (thumbnail) formData.append('thumbnail', thumbnail);
    const response = await apiClient.patch(`/videos/${videoId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  togglePublish: async (videoId) => {
    const response = await apiClient.patch(`/videos/toggle/publish/${videoId}`);
    return response.data.data;
  },
};

export default videoService;
