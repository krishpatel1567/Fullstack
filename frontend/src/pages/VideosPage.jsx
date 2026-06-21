import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoStore } from '../store/videoStore';
import { useAuthStore } from '../store/authStore';
import VideoCard from '../components/VideoCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { PageLayout, Container, SectionHeader } from '../components/ui/Layout';
import { EmptyState } from '../components/ui/EmptyState';

export default function VideosPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { videos, isLoading, fetchAllVideos } = useVideoStore();

  useEffect(() => {
    fetchAllVideos();
  }, [fetchAllVideos]);

  return (
    <PageLayout>
      <Container>
        <SectionHeader 
          title="Videos" 
          description="Browse the latest videos uploaded by the community."
          actions={user && (
            <Button onClick={() => navigate('/upload')}>
              Upload Video
            </Button>
          )}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : videos.length === 0 ? (
          <EmptyState 
            icon="🎥"
            title="No videos yet"
            description="There are no videos available right now. Check back later or upload one yourself."
            action={user && (
              <Button onClick={() => navigate('/upload')}>
                Be the first to upload
              </Button>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
