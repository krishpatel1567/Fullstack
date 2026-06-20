import { Routes, Route } from "react-router-dom"
import Navbar from "../components/Navbar"
import ErrorBoundary from "../components/ErrorBoundary"

import HomePage from "../pages/HomePage"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import TweetsPage from "../pages/TweetsPage"
import VideosPage from "../pages/VideosPage"
import VideoUploadPage from "../pages/VideoUploadPage"
import VideoDetailPage from "../pages/VideoDetailPage"
import PlaylistsPage from "../pages/PlaylistsPage"
import ProfilePage from "../pages/ProfilePage"
import WatchHistoryPage from "../pages/WatchHistoryPage"

const LayoutWithNavbar = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
)

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<LayoutWithNavbar><HomePage /></LayoutWithNavbar>} />
        <Route path="/videos" element={<LayoutWithNavbar><VideosPage /></LayoutWithNavbar>} />
        <Route path="/video/:videoId" element={<LayoutWithNavbar><VideoDetailPage /></LayoutWithNavbar>} />
        <Route path="/upload" element={<LayoutWithNavbar><VideoUploadPage /></LayoutWithNavbar>} />
        <Route path="/tweets" element={<LayoutWithNavbar><TweetsPage /></LayoutWithNavbar>} />
        <Route path="/playlists" element={<LayoutWithNavbar><PlaylistsPage /></LayoutWithNavbar>} />
        <Route path="/profile/:userId" element={<LayoutWithNavbar><ProfilePage /></LayoutWithNavbar>} />
        <Route path="/watch-history" element={<LayoutWithNavbar><WatchHistoryPage /></LayoutWithNavbar>} />
      </Routes>
    </ErrorBoundary>
  )
}

export default AppRoutes
