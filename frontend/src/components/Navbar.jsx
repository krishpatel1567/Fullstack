import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from './ThemeProvider';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const isActive = (path) => location.pathname === path;
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Videos', path: '/videos' },
    { name: 'Tweets', path: '/tweets' },
    { name: 'Playlists', path: '/playlists' },
  ];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-8">
            

            <div className="hidden md:flex items-center space-x-1">
              {user && navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-surface-hover text-foreground'
                      : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/upload')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Upload
                </button>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium">{user.username?.[0]?.toUpperCase()}</span>
                    )}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl py-1 z-50">
                      <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{user.fullName || user.username}</p>
                        <p className="text-xs text-neutral-500 truncate">@{user.username}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate(`/profile/${user._id}`);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/watch-history');
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        History
                      </button>
                      <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
