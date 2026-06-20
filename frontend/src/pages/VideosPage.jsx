import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoStore } from '../store/videoStore';
import { useAuthStore } from '../store/authStore';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function VideosPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { videos, isLoading, fetchAllVideos } = useVideoStore();

  useEffect(() => {
    fetchAllVideos();
  }, [fetchAllVideos]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">🎥 Videos</h1>
          {user && (
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold transform hover:scale-105 transition-transform"
            >
              📤 Upload Video
            </button>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading videos..." />
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-lg p-16 text-center">
            <p className="text-gray-500 text-lg mb-4">No videos yet</p>
            {user && (
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Be the first to upload
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
