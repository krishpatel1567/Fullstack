import { create } from 'zustand';
import tweetService from '../api/tweetService';

export const useTweetStore = create((set) => ({
  tweets: [],
  isLoading: false,
  error: null,

  createTweet: async (content) => {
    set({ isLoading: true, error: null });
    try {
      const tweet = await tweetService.createTweet(content);
      set((state) => ({
        tweets: [tweet, ...state.tweets],
        isLoading: false,
      }));
      return tweet;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create tweet', isLoading: false });
      throw err;
    }
  },

  fetchAllTweets: async () => {
    set({ isLoading: true, error: null });
    try {
      const tweets = await tweetService.getAllTweets();
      set({ tweets, isLoading: false });
      return tweets;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch tweets', isLoading: false });
      throw err;
    }
  },

  fetchUserTweets: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const tweets = await tweetService.getUserTweets(userId);
      set({ tweets, isLoading: false });
      return tweets;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch tweets', isLoading: false });
      throw err;
    }
  },

  updateTweet: async (tweetId, content) => {
    try {
      const tweet = await tweetService.updateTweet(tweetId, content);
      set((state) => ({
        tweets: state.tweets.map((t) => (t._id === tweetId ? tweet : t)),
      }));
      return tweet;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update tweet' });
      throw err;
    }
  },

  deleteTweet: async (tweetId) => {
    try {
      await tweetService.deleteTweet(tweetId);
      set((state) => ({
        tweets: state.tweets.filter((t) => t._id !== tweetId),
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete tweet' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
