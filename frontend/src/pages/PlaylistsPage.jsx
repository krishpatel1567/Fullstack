import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { playlistService } from '../api/playlistService';
import LoadingSpinner from '../components/LoadingSpinner';
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

  const handleDeletePlaylist = async (playlistId) => {
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

  if (!user) return <div>Please login to view playlists</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">📚 My Playlists</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            {showCreateForm ? '✕ Cancel' : '+ Create Playlist'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-600">
            <input
              type="text"
              placeholder="Playlist name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading playlists..." />
        ) : playlists.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No playlists yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Create your first playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 flex items-center justify-center relative">
                  <span className="text-5xl">📚</span>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center">
                    <span className="text-white text-3xl">▶️</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{playlist.name}</h3>
                  {playlist.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{playlist.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{playlist.videos?.length || 0} videos</p>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => navigate(`/playlist/${playlist._id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeletePlaylist(playlist._id)}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
