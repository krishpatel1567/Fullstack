import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService } from '../api/userService';
import { subscriptionService } from '../api/subscriptionService';
import { videoService } from '../api/videoService';
import VideoCard from '../components/VideoCard';
import {LoadingSpinner} from '../components/LoadingSpinner';
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
      setIsSubscribed(data.isSubscribed || false);
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
      const videos = await videoService.getAllVideos(1, 100, userId);
      setUserVideos(videos);
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
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed');
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
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  if (!profile) return <div className="text-neutral-500 text-center py-20 font-medium">Profile not found</div>;

  const isOwnProfile = currentUser?._id === userId;
  const avatarUrl = profile.avatar || currentUser?.avatar; // fallback for "My Profile" if not populated

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans text-neutral-900 dark:text-neutral-100 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black pb-20">
      {/* Cover Banner */}
      <div className="h-40 sm:h-56 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
        {profile.coverImage ? (
          <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800"></div>
        )}
      </div>

      <div className="max-w-[1000px] mx-auto px-6">
        {/* Profile Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-16 mb-12 gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white dark:bg-black p-1 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-500 flex items-center justify-center text-3xl font-light border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-medium">{profile.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
            </div>

            <div className="pb-2">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{profile.fullName || profile.username}</h1>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium">@{profile.username}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">{subscribers} <span className="font-normal opacity-80">subscribers</span></span>
                <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                <span className="font-medium">{userVideos.length} <span className="font-normal opacity-80">videos</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-2">
            {!isOwnProfile && currentUser && (
              <button
                onClick={handleSubscribe}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  isSubscribed
                    ? 'bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    : 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}

            {isOwnProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 bg-white dark:bg-black rounded-full text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 mb-12 max-w-xl">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Profile Settings</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
              </div>
              <div className="flex space-x-3 justify-end pt-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(profile.fullName);
                    setEmail(profile.email);
                  }}
                  className="px-4 py-2 text-neutral-700 dark:text-neutral-300 bg-transparent rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-neutral-100 dark:border-neutral-900 pt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Videos</h2>
          </div>
          
          {userVideos.length === 0 ? (
            <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-16 text-center">
              <p className="text-neutral-500 font-medium">No videos uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
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
