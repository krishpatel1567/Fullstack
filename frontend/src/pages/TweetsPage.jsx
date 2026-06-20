import React, { useEffect, useState } from 'react';
import { useTweetStore } from '../store/tweetStore';
import { useAuthStore } from '../store/authStore';
import TweetCard from '../components/TweetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function TweetsPage() {
  const { user } = useAuthStore();
  const { tweets, isLoading, fetchAllTweets, createTweet, deleteTweet, updateTweet } = useTweetStore();
  const [newTweetContent, setNewTweetContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAllTweets();
  }, [fetchAllTweets]);

  const handleCreateTweet = async () => {
    if (!newTweetContent.trim()) {
      toast.error('Tweet cannot be empty');
      return;
    }
    setIsPosting(true);
    try {
      await createTweet(newTweetContent);
      setNewTweetContent('');
      toast.success('Tweet posted!');
    } catch (err) {
      toast.error('Failed to create tweet');
    } finally {
      setIsPosting(false);
    }
  };

  const filteredTweets = filter === 'my' 
    ? tweets.filter(t => t.owner?._id === user?._id)
    : tweets;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">📝 Tweets Feed</h1>

        {user && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{user.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newTweetContent}
                  onChange={(e) => setNewTweetContent(e.target.value)}
                  placeholder="What's happening?!"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-lg"
                  rows="4"
                />
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => setNewTweetContent('')}
                    className="px-6 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCreateTweet}
                    disabled={isPosting || !newTweetContent.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {isPosting ? '📤 Posting...' : 'Tweet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Tweets
          </button>
          {user && (
            <button
              onClick={() => setFilter('my')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'my'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              My Tweets
            </button>
          )}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading tweets..." />
          ) : filteredTweets.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No tweets to show</p>
            </div>
          ) : (
            filteredTweets.map((tweet) => (
              <TweetCard
                key={tweet._id}
                tweet={tweet}
                onDelete={deleteTweet}
                onUpdate={updateTweet}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
