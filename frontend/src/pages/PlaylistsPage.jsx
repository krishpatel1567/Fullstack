import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { playlistService } from '../api/playlistService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { PageLayout, Container, SectionHeader } from '../components/ui/Layout';
import { EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function PlaylistsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadPlaylists();
    }
  }, [user]);

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const data = await playlistService.getUserPlaylists(user._id);
      setPlaylists(data || []);
    } catch (err) {
      toast.error('Failed to load playlists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!name.trim()) {
      toast.error('Playlist name is required');
      return;
    }
    setIsCreating(true);
    try {
      const newPlaylist = await playlistService.createPlaylist(name, description);
      setPlaylists([newPlaylist, ...playlists]);
      setName('');
      setDescription('');
      setShowCreateForm(false);
      toast.success('Playlist created!');
    } catch (err) {
      toast.error('Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this playlist?')) {
      try {
        await playlistService.deletePlaylist(playlistId);
        setPlaylists(playlists.filter(p => p._id !== playlistId));
        toast.success('Playlist deleted');
      } catch (err) {
        toast.error('Failed to delete playlist');
      }
    }
  };

  if (!user) return (
    <PageLayout>
      <Container>
        <EmptyState title="Not Authenticated" description="Please login to view your playlists." />
      </Container>
    </PageLayout>
  );

  return (
    <PageLayout>
      <Container>
        <SectionHeader 
          title="My Playlists" 
          description="Organize your favorite videos into custom playlists."
          actions={
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create Playlist'}
            </Button>
          }
        />

        {showCreateForm && (
          <Card className="mb-8 p-6 max-w-xl">
            <h3 className="text-lg font-semibold mb-4">Create New Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <Input
                  placeholder="e.g. My Favorites"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
                <Textarea
                  placeholder="What's this playlist about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePlaylist} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : playlists.length === 0 ? (
          <EmptyState 
            icon="📚"
            title="No playlists yet"
            description="You haven't created any playlists. Create one to organize your videos!"
            action={
              <Button onClick={() => setShowCreateForm(true)}>
                Create your first playlist
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden border border-border flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                
                <div className="flex flex-col min-w-0 px-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {playlist.name}
                    </h3>
                    <button
                      onClick={(e) => handleDeletePlaylist(playlist._id, e)}
                      className="text-foreground-muted hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete playlist"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                  {playlist.description && (
                    <p className="text-[13px] text-foreground-muted mt-1 line-clamp-1">
                      {playlist.description}
                    </p>
                  )}
                  <p className="text-[12px] text-foreground-muted mt-1">
                    {playlist.videos?.length || 0} videos
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
