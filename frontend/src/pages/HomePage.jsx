import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTweetStore } from '../store/tweetStore';
import { useVideoStore } from '../store/videoStore';
import TweetCard from '../components/TweetCard';
import VideoCard from '../components/VideoCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageLayout, Container, SectionHeader } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
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
      toast.success('Tweet posted');
    } catch (err) {
      toast.error('Failed to create tweet');
    } finally {
      setTweetLoading(false);
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <PageLayout>
      <Container>
        
        {/* Header Section */}
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Home</h1>
          <div className="flex items-center space-x-2 bg-surface-hover rounded-lg p-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'feed'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'videos'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Videos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xl:gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            
            {/* Create Tweet Form */}
            {activeTab === 'feed' && user && (
              <div className="mb-8 border-b-2 pb-3">
                <div className="flex items-start space-x-4">
                  <Avatar src={user.avatar} alt={user.username} />
                  <div className="flex-1">
                    <textarea
                      value={newTweetContent}
                      onChange={(e) => setNewTweetContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full p-2 bg-transparent border-none focus:ring-0 resize-none text-base outline-none placeholder:text-foreground-muted text-foreground"
                      rows="2"
                    />
                    <div className="flex justify-end items-center mt-2 pt-2 border-t border-border">
                      <Button
                        onClick={handleCreateTweet}
                        disabled={tweetLoading || !newTweetContent.trim()}
                        className="rounded-full px-5"
                      >
                        {tweetLoading ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Feed */}
            {activeTab === 'feed' && (
              <div className="space-y-4 animate-slide-up">
                {tweetsLoading ? (
                  <LoadingSpinner />
                ) : tweets.length === 0 ? (
                  <EmptyState title="No updates yet" />
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
              <div className="animate-slide-up">
                {videosLoading ? (
                  <LoadingSpinner />
                ) : videos.length === 0 ? (
                  <EmptyState 
                    title="No videos found" 
                    action={<Button onClick={() => navigate('/upload')}>Upload Video</Button>}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="hidden lg:block lg:col-span-1 border-l border-border pl-8">
            <div className="sticky top-24">
              <div className="flex items-center space-x-3 mb-6">
                <Avatar src={user.avatar} alt={user.username} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.fullName || user.username}</p>
                  <p className="text-xs text-foreground-muted truncate">@{user.username}</p>
                </div>
              </div>

              <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Quick Links</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => navigate('/upload')}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground-muted rounded-lg hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <span>Upload Video</span>
                </button>
                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground-muted rounded-lg hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => navigate('/playlists')}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground-muted rounded-lg hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  <span>Playlists</span>
                </button>
                <button
                  onClick={() => navigate('/watch-history')}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground-muted rounded-lg hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span>History</span>
                </button>
              </nav>
            </div>
          </div>
          
        </div>
      </Container>
    </PageLayout>
  );
}
