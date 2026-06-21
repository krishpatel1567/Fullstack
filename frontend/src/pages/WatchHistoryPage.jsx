import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { userService } from '../api/userService';
import VideoCard from '../components/VideoCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageLayout, Container, SectionHeader } from '../components/ui/Layout';
import { EmptyState } from '../components/ui/EmptyState';
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

  if (!user) return (
    <PageLayout>
      <Container>
        <EmptyState title="Not Authenticated" description="Please login to view your watch history." />
      </Container>
    </PageLayout>
  );

  return (
    <PageLayout>
      <Container>
        <SectionHeader 
          title="Watch History" 
          description="Keep track of all the videos you've watched."
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : history.length === 0 ? (
          <EmptyState 
            icon="⏱️"
            title="No history yet"
            description="You haven't watched any videos yet. Start exploring!"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {history.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
