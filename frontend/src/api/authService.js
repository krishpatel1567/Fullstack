import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

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
