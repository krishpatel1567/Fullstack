import apiClient from "../utils/apiClient.js";

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/users/login', {
      email,
      password,
    });
    return response.data.data;
  },

  register: async (fullName, email, username, password, avatar) => {
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);
    if (avatar) formData.append('avatar', avatar);

    const response = await apiClient.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  logout: async () => {
    await apiClient.post('/users/logout');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/users/current-user');
    return response.data.data;
  },
};

export default apiClient;
