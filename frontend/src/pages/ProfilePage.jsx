import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService } from '../api/userService';
import { subscriptionService } from '../api/subscriptionService';
import { videoService } from '../api/videoService';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userVideos, setUserVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribers, setSubscribers] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUserProfile(userId);
      setProfile(data);
      setFullName(data.fullName);
      setEmail(data.email);
      loadUserVideos();
      loadSubscribers();
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserVideos = async () => {
    try {
      const videos = await videoService.getAllVideos();
      const filtered = videos.filter(v => v.owner?._id === userId);
      setUserVideos(filtered);
    } catch (err) {
      console.error('Failed to load videos');
    }
  };

  const loadSubscribers = async () => {
    try {
      const data = await subscriptionService.getChannelSubscribers(userId);
      setSubscribers(data?.length || 0);
    } catch (err) {
      console.error('Failed to load subscribers');
    }
  };

  const handleSubscribe = async () => {
    try {
      await subscriptionService.toggleSubscription(userId);
      setIsSubscribed(!isSubscribed);
      setSubscribers(isSubscribed ? subscribers - 1 : subscribers + 1);
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed!');
    } catch (err) {
      toast.error('Failed to toggle subscription');
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await userService.updateAccountDetails(fullName, email);
      setProfile({ ...profile, fullName, email });
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return <div className="text-center py-12">Profile not found</div>;

  const isOwnProfile = currentUser?._id === userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-48"></div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-md p-6 -mt-24 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-32 h-32 rounded-full bg-blue-500 text-white flex items-center justify-center text-5xl border-4 border-white shadow-lg flex-shrink-0 overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <span>{profile.username?.[0]?.toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">{profile.username}</h1>
              <p className="text-gray-600">{profile.fullName}</p>
              <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                <span>📺 {userVideos.length} videos</span>
                <span>👥 {subscribers} subscribers</span>
              </div>
            </div>

            {!isOwnProfile && currentUser && (
              <button
                onClick={handleSubscribe}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  isSubscribed
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isSubscribed ? '✓ Subscribed' : '+ Subscribe'}
              </button>
            )}

            {isOwnProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold whitespace-nowrap"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-2 justify-end">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(profile.fullName);
                      setEmail(profile.email);
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🎬 Videos</h2>
          {userVideos.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">{profile.username} has no videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {userVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
