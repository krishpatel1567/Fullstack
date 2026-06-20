import apiClient from "../utils/apiClient.js"

export const tweetService = {

    getUserTweets : async (userId) => {
        const response = await apiClient.get(`/tweets/user/${userId}`)
        return response.data.data
    },

    createTweet : async (content) => {
        const response = await apiClient.post('/tweets/create',{content})
        return response.data.data
    },

    updateTweet : async (content,tweetId) => {
        const response = await apiClient.patch(`/tweets/${tweetId}` , { content })
        return response.data.data
    },

    deleteTweet : async (tweetId) => {
        const response = await apiClient.delete(`/tweets/${tweetId}`)
        return response.data.data
    },

    toggleTweetLike : async (tweetId) => {
        const response = await apiClient.post(`/likes/t/${tweetId}`)
        return response.data.data
    },
    getAllTweets : async () => {
        const response = await apiClient.get('/tweets')
        return response.data.data
    }
    
}