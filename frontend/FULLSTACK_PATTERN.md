# Full Stack Pattern - Quick Guide

## Architecture Overview

```
Frontend (React) 
  ├─ Pages (UI components)
  ├─ API Service (axios - backend calls)
  ├─ Store (Zustand - state management)
  └─ React Hook Form (form handling)
       ↓ (HTTP requests)
Backend (Express)
  ├─ Routes (/api/v1/...)
  ├─ Controllers (business logic)
  ├─ Models (MongoDB schemas)
  └─ Middlewares (auth, validation)
```

---

## Pattern for Any Feature (Copy-Paste Template)

### 1️⃣ CREATE API SERVICE (`src/api/featureService.js`)

```javascript
import apiClient from './authService';

export const videoService = {
  getAllVideos: async () => {
    const response = await apiClient.get('/videos');
    return response.data.data;
  },

  uploadVideo: async (title, description, videoFile) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('videoFile', videoFile);

    const response = await apiClient.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  deleteVideo: async (videoId) => {
    await apiClient.delete(`/videos/${videoId}`);
  },
};
```

### 2️⃣ CREATE ZUSTAND STORE (`src/store/videoStore.js`)

```javascript
import { create } from 'zustand';
import { videoService } from '../api/videoService';

export const useVideoStore = create((set) => ({
  videos: [],
  isLoading: false,
  error: null,

  fetchVideos: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await videoService.getAllVideos();
      set({ videos: data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch', isLoading: false });
    }
  },

  uploadVideo: async (title, description, videoFile) => {
    set({ isLoading: true, error: null });
    try {
      const data = await videoService.uploadVideo(title, description, videoFile);
      set((state) => ({ 
        videos: [data, ...state.videos], 
        isLoading: false 
      }));
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Upload failed', isLoading: false });
      throw err;
    }
  },

  deleteVideo: async (videoId) => {
    set({ isLoading: true });
    try {
      await videoService.deleteVideo(videoId);
      set((state) => ({
        videos: state.videos.filter((v) => v._id !== videoId),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Delete failed', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
```

### 3️⃣ CREATE PAGE COMPONENT (`src/pages/VideoPage.jsx`)

```javascript
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useVideoStore } from '../store/videoStore';

export default function VideoPage() {
  const { videos, isLoading, error, fetchVideos, uploadVideo } = useVideoStore();
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    fetchVideos();
  }, []);

  const onSubmit = async (data) => {
    try {
      const file = data.videoFile[0];
      await uploadVideo(data.title, data.description, file);
      toast.success('Video uploaded!');
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Videos</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('title')} placeholder="Title" />
        <input {...register('description')} placeholder="Description" />
        <input {...register('videoFile')} type="file" accept="video/*" />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <div>
        {videos.map((video) => (
          <div key={video._id} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h3>{video.title}</h3>
            <p>{video.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4️⃣ UPDATE ROUTES (`src/routes/AppRoutes.js`)

```javascript
import { Routes, Route } from "react-router-dom"
import HomePage from "../pages/HomePage"
import LoginPage from "../pages/LoginPage"
import VideoPage from "../pages/VideoPage"  // ← Add new route

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/videos" element={<VideoPage />} />  {/* ← Add this */}
    </Routes>
  )
}

export default AppRoutes
```

---

## Key Tools & Why

| Tool | Purpose | Example |
|------|---------|---------|
| **React Hook Form** | Form validation & state | `useForm()`, `register()`, `handleSubmit()` |
| **Axios** | HTTP requests | `apiClient.post()`, `apiClient.get()` |
| **Zustand** | Global state (auth, videos, etc) | `useVideoStore()` |
| **React Hot Toast** | Notifications | `toast.success()`, `toast.error()` |
| **React Router** | Navigation | `useNavigate()`, `<Route>` |

---

## How It Works (Flow)

```
User fills form
    ↓
handleSubmit() → validation (React Hook Form)
    ↓
onSubmit() called with valid data
    ↓
Call store action: uploadVideo(data)
    ↓
Store calls API service: videoService.uploadVideo()
    ↓
API service uses axios: apiClient.post('/videos/upload', formData)
    ↓
Backend receives request → processes → returns response
    ↓
Store updates state with response data
    ↓
Component re-renders with new data
    ↓
Show success toast
```

---

## Testing Your Login

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Navigate to login:**
   - Go to `http://localhost:5173/login`
   - Use test credentials from your DB
   - Click login → should see success message
   - Home page shows logged-in user

---

## Common Patterns to Apply

### Fetch Data on Page Load
```javascript
useEffect(() => {
  fetchVideos();
}, []);
```

### Handle File Upload
```javascript
const file = data.fileField[0];
await uploadVideo(file);
```

### Protect Routes (Auth Required)
```javascript
const ProtectedRoute = ({ element }) => {
  const { user } = useAuthStore();
  return user ? element : <Navigate to="/login" />;
};
```

### Add to Store: Pagination, Filtering
```javascript
const useVideoStore = create((set) => ({
  filters: { category: 'all', page: 1 },
  setFilters: (filters) => set({ filters }),
  // Then use in fetchVideos: videoService.getVideos(filters)
}));
```

---

## What to Build Next

1. **Register page** - same pattern as login
2. **Tweet/Video upload** - same pattern with file handling
3. **Like/Subscribe** - simple POST with just IDs
4. **List/Search** - fetch with filters in store
5. **Comments** - nested CRUD operations

Just follow the 4-step template above for each! 🚀
