import { create } from 'zustand';
import { tweetService } from '../api/tweetService';

export const useTweetStore = create((set) => ({
    tweets: [],
    isLoading: false,
    error: null,

    getAllTweets: async () => {
        set({ isLoading: true, error: null });
        try {
            const tweets = await tweetService.getAllTweets();
            set({ tweets, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    getUserTweets: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const tweets = await tweetService.getUserTweets(userId);
            set({ tweets, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },
    createTweet: async (content) => {
        set({ isLoading: true, error: null });
        try {
            const newTweet = await tweetService.createTweet(content);
            set((state) => ({ tweets: [newTweet, ...state.tweets], isLoading: false }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error
        }
    },
    updateTweet: async (tweetId, content) => {
        set({ isLoading: true, error: null });
        try {
            const updatedTweet = await tweetService.updateTweet(content, tweetId);
            set((state) => ({ tweets: state.tweets.map((tweet) => (tweet._id === tweetId ? updatedTweet : tweet)), isLoading: false }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },
    deleteTweet: async (tweetId) => {
        set({ isLoading: true, error: null });
        try {
            await tweetService.deleteTweet(tweetId);
            set((state) => ({ tweets: state.tweets.filter((tweet) => tweet._id !== tweetId), isLoading: false }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },
    toggleLike: async (tweetId) => {
        set({ isLoading: true, error: null });
        try {
            await tweetService.toggleTweetLike(tweetId);
        } catch (error) {
            set({ error: error.message, isLoading: false })
        }
    }
}));