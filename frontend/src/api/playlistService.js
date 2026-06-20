import apiClient from "../utils/apiClient.js";

export const playlistService = {
  createPlaylist: async (name, description) => {
    const response = await apiClient.post('/playlist', { name, description });
    return response.data.data;
  },

  getUserPlaylists: async (userId) => {
    const response = await apiClient.get(`/playlist/user/${userId}`);
    return response.data.data;
  },

  getPlaylistById: async (playlistId) => {
    const response = await apiClient.get(`/playlist/${playlistId}`);
    return response.data.data;
  },

  updatePlaylist: async (playlistId, { name, description }) => {
    const response = await apiClient.patch(`/playlist/${playlistId}`, {
      name,
      description,
    });
    return response.data.data;
  },

  deletePlaylist: async (playlistId) => {
    const response = await apiClient.delete(`/playlist/${playlistId}`);
    return response.data;
  },

  addVideoToPlaylist: async (videoId, playlistId) => {
    const response = await apiClient.patch(`/playlist/add/${videoId}/${playlistId}`);
    return response.data.data;
  },

  removeVideoFromPlaylist: async (videoId, playlistId) => {
    const response = await apiClient.patch(`/playlist/remove/${videoId}/${playlistId}`);
    return response.data.data;
  },
};

export default playlistService;
