import { create } from 'zustand';
import videoService from '../api/videoService';

export const useVideoStore = create((set) => ({
  videos: [],
  currentVideo: null,
  isLoading: false,
  error: null,

  uploadVideo: async (videoFile, thumbnail, title, description) => {
    set({ isLoading: true, error: null });
    try {
      const video = await videoService.uploadVideo(videoFile, thumbnail, title, description);
      set((state) => ({
        videos: [video, ...state.videos],
        isLoading: false,
      }));
      return video;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Upload failed', isLoading: false });
      throw err;
    }
  },

  fetchAllVideos: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await videoService.getAllVideos();
      set({ videos: data, isLoading: false });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch videos', isLoading: false });
      throw err;
    }
  },

  fetchVideoById: async (videoId) => {
    set({ isLoading: true, error: null });
    try {
      const video = await videoService.getVideoById(videoId);
      set({ currentVideo: video, isLoading: false });
      return video;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch video', isLoading: false });
      throw err;
    }
  },

  deleteVideo: async (videoId) => {
    try {
      await videoService.deleteVideo(videoId);
      set((state) => ({
        videos: state.videos.filter((v) => v._id !== videoId),
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete video' });
      throw err;
    }
  },

  updateVideo: async (videoId, updates) => {
    try {
      const video = await videoService.updateVideo(videoId, updates);
      set((state) => ({
        videos: state.videos.map((v) => (v._id === videoId ? video : v)),
        currentVideo: state.currentVideo?._id === videoId ? video : state.currentVideo,
      }));
      return video;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update video' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
