import apiClient from "../utils/apiClient.js";

export const userService = {
  getUserProfile: async (username) => {
    const response = await apiClient.post('/users/username', { username });
    return response.data.data;
  },

  getWatchHistory: async () => {
    const response = await apiClient.get('/users/history');
    return response.data.data;
  },

  updateAccountDetails: async (fullName, email) => {
    const response = await apiClient.patch('/users/update-account', {
      fullName,
      email,
    });
    return response.data.data;
  },

  updateAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    const response = await apiClient.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  updateCoverImage: async (coverImageFile) => {
    const formData = new FormData();
    formData.append('coverImage', coverImageFile);
    const response = await apiClient.patch('/users/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.post('/users/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

export default userService;
