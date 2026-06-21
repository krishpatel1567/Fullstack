import { create } from 'zustand';
import { authService } from '../api/authService';

export const useAuthStore = create((set) => {
  let initialUser = null;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        initialUser = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    (async () => {
      try {
        const current = await authService.getCurrentUser();
        if (current) {
          set({ user: current });
          localStorage.setItem('user', JSON.stringify(current));
        }
      } catch (e) {
        // ignore — user not authenticated
      }
    })();
  }

  return {
    user: initialUser,
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authService.login(email, password);
        const userObj = data.user || data;
        set({ user: userObj, isLoading: false });
        if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(userObj));
        return userObj;
      } catch (err) {
        set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
        throw err;
      }
    },

    register: async (fullName, email, username, password, avatar) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authService.register(fullName, email, username, password, avatar);
        const userObj = data.user || data;
        set({ user: userObj, isLoading: false });
        if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(userObj));
        return userObj;
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
        if (typeof window !== 'undefined') localStorage.removeItem('user');
      } catch (err) {
        set({ error: err.response?.data?.message || 'Logout failed', isLoading: false });
      }
    },

    clearError: () => set({ error: null }),
  };
});

export default useAuthStore;