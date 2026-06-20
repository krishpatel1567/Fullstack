import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { userService } from '../api/userService';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function WatchHistoryPage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getWatchHistory();
      setHistory(data || []);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div>Please login to view history</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">⏱️ Watch History</h1>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading history..." />
        ) : history.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">You haven't watched any videos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {history.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
