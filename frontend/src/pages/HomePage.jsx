import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTweetStore } from '../store/tweetStore';
import { useVideoStore } from '../store/videoStore';
import TweetCard from '../components/TweetCard';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tweets, isLoading: tweetsLoading, fetchAllTweets, deleteTweet, updateTweet } = useTweetStore();
  const { videos, isLoading: videosLoading, fetchAllVideos } = useVideoStore();
  const [newTweetContent, setNewTweetContent] = useState('');
  const [tweetLoading, setTweetLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAllTweets();
    fetchAllVideos();
  }, [user, navigate]);

  const handleCreateTweet = async () => {
    if (!newTweetContent.trim()) {
      toast.error('Tweet cannot be empty');
      return;
    }
    setTweetLoading(true);
    try {
      await useTweetStore.getState().createTweet(newTweetContent);
      setNewTweetContent('');
      toast.success('Tweet posted!');
    } catch (err) {
      toast.error('Failed to create tweet');
    } finally {
      setTweetLoading(false);
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {user && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-600">
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
                      placeholder="What's on your mind?"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3"
                    />
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                          📸
                        </button>
                        <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                          😊
                        </button>
                      </div>
                      <button
                        onClick={handleCreateTweet}
                        disabled={tweetLoading || !newTweetContent.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {tweetLoading ? '📤 Posting...' : 'Post Tweet'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeTab === 'feed'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                📝 Feed
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeTab === 'videos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                🎥 Videos
              </button>
            </div>

            {activeTab === 'feed' && (
              <div className="space-y-4">
                {tweetsLoading ? (
                  <LoadingSpinner message="Loading tweets..." />
                ) : tweets.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-lg">No tweets yet. Be the first!</p>
                  </div>
                ) : (
                  tweets.map((tweet) => (
                    <TweetCard
                      key={tweet._id}
                      tweet={tweet}
                      onDelete={deleteTweet}
                      onUpdate={updateTweet}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                {videosLoading ? (
                  <LoadingSpinner message="Loading videos..." />
                ) : videos.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-lg">No videos yet. Upload one!</p>
                    <button
                      onClick={() => navigate('/upload')}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload Video
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videos.map((video) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/upload')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-semibold"
                >
                  📤 Upload Video
                </button>
                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-semibold"
                >
                  👤 My Profile
                </button>
                <button
                  onClick={() => navigate('/playlists')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-semibold"
                >
                  📚 My Playlists
                </button>
                <button
                  onClick={() => navigate('/watch-history')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-semibold"
                >
                  ⏱️ Watch History
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  👋 Welcome back, <strong>{user.username}</strong>!
                </p>
                <p className="text-xs text-gray-600 mt-2">Keep sharing amazing content</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
