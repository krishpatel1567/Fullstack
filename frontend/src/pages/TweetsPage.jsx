import React, { useEffect, useState } from 'react';
import { useTweetStore } from '../store/tweetStore';
import { useAuthStore } from '../store/authStore';
import TweetCard from '../components/TweetCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { PageLayout, Container, SectionHeader } from '../components/ui/Layout';
import { EmptyState } from '../components/ui/EmptyState';
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
    ? tweets.filter(t => t.owner?._id === user?._id || t.owner === user?._id)
    : tweets;

  return (
    <PageLayout>
      <Container className="max-w-3xl">
        <SectionHeader title="Tweets Feed" />

        {user && (
          <div className="mb-8 border-b-2 pb-3">
            <div className="flex items-start space-x-4">
              <Avatar src={user.avatar} alt={user.username} />
              <div className="flex-1">
                <Textarea
                  value={newTweetContent}
                  onChange={(e) => setNewTweetContent(e.target.value)}
                  placeholder="What's happening?!"
                  className="w-full bg-transparent border-none focus:ring-0 resize-none text-base outline-none placeholder:text-foreground-muted min-h-[100px]"
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                  <div />
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => setNewTweetContent('')}
                      disabled={!newTweetContent}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleCreateTweet}
                      disabled={isPosting || !newTweetContent.trim()}
                    >
                      {isPosting ? 'Posting...' : 'Tweet'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-2 mb-6 p-1 bg-surface-hover rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            All Tweets
          </button>
          {user && (
            <button
              onClick={() => setFilter('my')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'my'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              My Tweets
            </button>
          )}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : filteredTweets.length === 0 ? (
            <EmptyState 
              title="No tweets to show" 
              description={filter === 'my' ? "You haven't posted anything yet." : "No one has posted any tweets yet."} 
            />
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
      </Container>
    </PageLayout>
  );
}
