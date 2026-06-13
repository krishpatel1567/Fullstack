import { create } from 'zustand';
import { authService } from '../api/authService';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      set({ user: data.user, isLoading: false });
      return data.user;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (fullName, email, username, password, avatar) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(fullName, email, username, password, avatar);
      set({ user: data, isLoading: false });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Logout failed', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;