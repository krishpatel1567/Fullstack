# 📚 Full Stack Explanation - Complete Guide

---

## 🎯 What is a Full Stack App?

```
FRONTEND (React - Browser)          BACKEND (Express - Server)          DATABASE (MongoDB)
┌─────────────────────┐            ┌──────────────────────┐            ┌──────────────┐
│  User clicks button │            │  Receives request    │            │  Stores data │
│  Form submits data  │──HTTP──→   │  Processes logic     │───SQL──→   │  Returns data│
│  Shows response     │←─JSON──    │  Queries database    │←───────    │              │
└─────────────────────┘            └──────────────────────┘            └──────────────┘
```

**Flow Example: User Registration**
```
1. User fills form (Full Name, Email, Password, Avatar)
2. Frontend sends this data to Backend via HTTP
3. Backend receives → validates → uploads avatar to Cloudinary → saves to MongoDB
4. Backend sends back user object
5. Frontend receives → stores in app state → shows success message
```

---

## 1️⃣ AXIOS - Making HTTP Requests

### What is Axios?
It's a library that sends HTTP requests from frontend to backend. Think of it as a "messenger" that carries data between frontend and backend.

### Without Axios (vanilla JavaScript)
```javascript
// Old way - lots of code:
fetch('http://localhost:3000/api/v1/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: 'test@test.com', password: '123' }),
  credentials: 'include'
})
.then(res => res.json())
.then(data => console.log(data))
```

### With Axios (clean and simple)
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,  // Send cookies automatically
});

// Now just:
const response = await apiClient.post('/users/login', {
  email: 'test@test.com',
  password: '123'
});

console.log(response.data.data);  // User object from backend
```

### Key Axios Concepts

#### 1. **Creating a client** (set up once)
```javascript
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',  // Base URL for all requests
  withCredentials: true,                      // Include cookies
});
```
- `baseURL` - The backend server address. ALL requests will start with this.
- `withCredentials: true` - Automatically sends login cookies to backend

#### 2. **GET Request** (fetch data)
```javascript
// Backend endpoint: GET /api/v1/videos
const videos = await apiClient.get('/videos');
console.log(videos.data.data);  // Array of videos
```

#### 3. **POST Request** (send data)
```javascript
// Backend endpoint: POST /api/v1/users/login
const response = await apiClient.post('/users/login', {
  email: 'test@test.com',
  password: 'password123'
});

console.log(response.data.data);  // { user, accessToken, refreshToken }
```

#### 4. **File Upload** (FormData)
```javascript
// When uploading files, use FormData not JSON
const formData = new FormData();
formData.append('title', 'My Video');
formData.append('videoFile', fileFromInput);  // Actual file

// Send it
const response = await apiClient.post('/videos/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

#### 5. **DELETE Request**
```javascript
// Backend endpoint: DELETE /api/v1/videos/123
await apiClient.delete('/videos/123');
```

#### 6. **PATCH/PUT Request** (update data)
```javascript
// Backend endpoint: PATCH /api/v1/users/profile
await apiClient.patch('/users/profile', {
  fullName: 'New Name',
  email: 'newemail@test.com'
});
```

### Real Example: Video Service
```javascript
// src/api/videoService.js
import apiClient from './authService';

export const videoService = {
  // GET all videos
  getAll: async () => {
    const response = await apiClient.get('/videos');
    return response.data.data;  // Array of videos
  },

  // POST new video
  upload: async (title, description, videoFile) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('videoFile', videoFile);

    const response = await apiClient.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;  // New video object
  },

  // DELETE video
  delete: async (videoId) => {
    await apiClient.delete(`/videos/${videoId}`);
  },

  // LIKE video
  like: async (videoId) => {
    const response = await apiClient.post(`/videos/${videoId}/like`);
    return response.data.data;
  }
};
```

**Backend endpoints this connects to:**
```
GET  /api/v1/videos           ← getAll()
POST /api/v1/videos/upload    ← upload()
DELETE /api/v1/videos/{id}    ← delete()
POST /api/v1/videos/{id}/like ← like()
```

---

## 2️⃣ ZUSTAND - Global State Management

### What is State?
State = data that changes over time in your app.

Example states:
```javascript
// User logged in?
state.user = { username: 'john', email: 'john@test.com' }

// Loading data?
state.isLoading = true

// Error occurred?
state.error = 'Email already exists'

// List of videos?
state.videos = [{ id: 1, title: '...' }, ...]
```

### Without Zustand (passing props down)
```javascript
// Parent component has state
function App() {
  const [user, setUser] = useState(null);

  return (
    <Layout user={user} setUser={setUser}>
      <Dashboard user={user} setUser={setUser}>
        <Profile user={user} setUser={setUser}>
          <Button user={user} setUser={setUser} />
        </Profile>
      </Dashboard>
    </Layout>
  );
}

// Passing through 5 levels just to reach Button!
```

### With Zustand (access from anywhere)
```javascript
// Store (one place for all user data)
export const useAuthStore = create((set) => ({
  user: null,

  login: async (email, password) => {
    // Set loading
    set({ isLoading: true });
    
    // Call API
    const data = await authService.login(email, password);
    
    // Update state
    set({ user: data, isLoading: false });
  }
}));

// Now use it anywhere without props:
function Button() {
  const { user, login } = useAuthStore();  // ← Direct access!
  
  return <button onClick={() => login('email', 'pass')}>Login</button>;
}

function Profile() {
  const { user } = useAuthStore();  // ← Still have access!
  
  return <h1>{user.username}</h1>;
}
```

### How Zustand Works

#### Step 1: Create a Store
```javascript
// src/store/authStore.js
import { create } from 'zustand';
import { authService } from '../api/authService';

export const useAuthStore = create((set) => ({
  // STATE (data)
  user: null,
  isLoading: false,
  error: null,

  // ACTIONS (functions to change state)
  login: async (email, password) => {
    set({ isLoading: true, error: null });  // Start loading
    try {
      const data = await authService.login(email, password);
      set({ user: data.user, isLoading: false });  // Store user
      return data.user;
    } catch (err) {
      set({ error: err.message, isLoading: false });  // Store error
      throw err;
    }
  },

  logout: () => {
    set({ user: null });  // Clear user
  }
}));
```

#### Step 2: Use in Component
```javascript
function LoginPage() {
  // Pull state and actions from store
  const { user, isLoading, error, login } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login('email@test.com', 'password123');
      // Component re-renders automatically when user state changes
    } catch (err) {
      console.log(error);  // error is automatically updated
    }
  };

  return (
    <div>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {user && <p>Welcome {user.username}!</p>}
    </div>
  );
}
```

### Real Example: Video Store
```javascript
// src/store/videoStore.js
import { create } from 'zustand';
import { videoService } from '../api/videoService';

export const useVideoStore = create((set) => ({
  // STATE
  videos: [],
  isLoading: false,
  error: null,

  // ACTIONS
  fetchVideos: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await videoService.getAll();
      set({ videos: data, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to load videos', isLoading: false });
    }
  },

  uploadVideo: async (title, description, file) => {
    set({ isLoading: true, error: null });
    try {
      const newVideo = await videoService.upload(title, description, file);
      set((state) => ({
        videos: [newVideo, ...state.videos],  // Add to top of list
        isLoading: false
      }));
      return newVideo;
    } catch (err) {
      set({ error: 'Upload failed', isLoading: false });
    }
  },

  deleteVideo: async (videoId) => {
    try {
      await videoService.delete(videoId);
      set((state) => ({
        videos: state.videos.filter(v => v._id !== videoId)  // Remove from list
      }));
    } catch (err) {
      set({ error: 'Delete failed' });
    }
  }
}));
```

### Usage in Components
```javascript
function VideoPage() {
  const { videos, isLoading, uploadVideo, deleteVideo } = useVideoStore();

  // Upload video
  const handleUpload = async () => {
    await uploadVideo('My Video', 'Description', fileObject);
    // videos array automatically updates!
  };

  // Delete video
  const handleDelete = async (videoId) => {
    await deleteVideo(videoId);
    // videos array updates - video removed!
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {videos.map(video => (
        <div key={video._id}>
          <h3>{video.title}</h3>
          <button onClick={() => handleDelete(video._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 3️⃣ REACT HOOK FORM - Form Handling

### What is React Hook Form?
It simplifies form validation and submission. It handles:
- Getting form input values
- Validating data (required, email format, etc)
- Showing error messages
- Submitting data

### Without React Hook Form
```javascript
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});  // Clear old errors

    // Manual validation
    if (!email) {
      setErrors({ email: 'Email required' });
      return;
    }
    if (!password) {
      setErrors({ password: 'Password required' });
      return;
    }
    if (!email.includes('@')) {
      setErrors({ email: 'Invalid email' });
      return;
    }

    setIsSubmitting(true);
    try {
      await loginUser(email, password);
    } catch (err) {
      setErrors({ form: err.message });
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      {errors.email && <p>{errors.email}</p>}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {errors.password && <p>{errors.password}</p>}

      <button disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### With React Hook Form (much simpler!)
```javascript
import { useForm } from 'react-hook-form';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isLoading } = useAuthStore();

  const onSubmit = async (data) => {
    await login(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Register field - automatically handles state & validation */}
      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        placeholder="Email"
      />
      {errors.email && <p style={{color: 'red'}}>{errors.email.message}</p>}

      <input
        type="password"
        {...register('password', { required: 'Password required' })}
        placeholder="Password"
      />
      {errors.password && <p style={{color: 'red'}}>{errors.password.message}</p>}

      <button type="submit" disabled={isLoading}>Submit</button>
    </form>
  );
}
```

### Breakdown of `register()`

```javascript
{...register('email', { 
  required: 'Email is required',  // Validation rule 1
  pattern: { ... }                 // Validation rule 2
})}
```

This does:
1. **Tracks input value** - automatically
2. **Validates on blur** - checks rules
3. **Shows errors** - if validation fails
4. **Passes data to onSubmit** - only if all validation passes

### Real Example: Register Form
```javascript
function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerUser, isLoading } = useAuthStore();

  const onSubmit = async (data) => {
    const file = data.avatar[0];  // Get first file from input
    await registerUser(
      data.fullName,
      data.email,
      data.username,
      data.password,
      file
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Full Name */}
      <input
        {...register('fullName', { required: 'Full name required' })}
        placeholder="Full Name"
      />
      {errors.fullName && <p>{errors.fullName.message}</p>}

      {/* Email with format validation */}
      <input
        {...register('email', {
          required: 'Email required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email'
          }
        })}
        placeholder="Email"
      />
      {errors.email && <p>{errors.email.message}</p>}

      {/* Username with min length */}
      <input
        {...register('username', {
          required: 'Username required',
          minLength: { value: 3, message: 'Min 3 characters' }
        })}
        placeholder="Username"
      />
      {errors.username && <p>{errors.username.message}</p>}

      {/* Password with min length */}
      <input
        type="password"
        {...register('password', {
          required: 'Password required',
          minLength: { value: 6, message: 'Min 6 characters' }
        })}
        placeholder="Password"
      />
      {errors.password && <p>{errors.password.message}</p>}

      {/* File upload */}
      <input
        {...register('avatar', { required: 'Avatar required' })}
        type="file"
        accept="image/*"
      />
      {errors.avatar && <p>{errors.avatar.message}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

---

## 🔗 How Everything Works Together

### Complete Flow: User Registration

```
1. USER OPENS REGISTER PAGE
   └─ Component mounts
   └─ Renders form with React Hook Form

2. USER FILLS FORM & CLICKS REGISTER
   └─ React Hook Form validates:
      • Email format correct? ✓
      • Password min 6 chars? ✓
      • Avatar selected? ✓
   └─ If validation fails → show error messages
   └─ If all pass → call onSubmit()

3. onSubmit() CALLED WITH VALIDATED DATA
   └─ Calls store action: registerUser(fullName, email, username, password, avatar)

4. STORE UPDATES STATE
   └─ set({ isLoading: true, error: null })
   └─ Calls API service: authService.register(...)

5. AXIOS SENDS HTTP REQUEST
   └─ Creates FormData with all fields
   └─ Sends POST to: http://localhost:3000/api/v1/users/register
   └─ Includes cookies (withCredentials: true)

6. BACKEND RECEIVES REQUEST
   └─ Validates data
   └─ Uploads avatar to Cloudinary
   └─ Saves user to MongoDB
   └─ Returns: { user: {...}, accessToken, refreshToken }

7. AXIOS RECEIVES RESPONSE
   └─ response.data.data = user object

8. STORE UPDATES STATE
   └─ set({ user: data, isLoading: false })

9. COMPONENT AUTOMATICALLY RE-RENDERS
   └─ isLoading changes false → button becomes enabled
   └─ user state updated → automatically redirects to home
   └─ Toast shows success message

10. HOME PAGE DISPLAYS USER
    └─ Reads user from store: useAuthStore().user
    └─ Shows: "Welcome john_doe!"
```

### Code Flow Diagram
```
RegisterPage.jsx
    ↓ (user fills form)
useForm() ← React Hook Form
    ↓ (validates & submits)
handleSubmit(onSubmit)
    ↓
useAuthStore().register()  ← Zustand Store
    ↓
authService.register()  ← Axios Service
    ↓
axios.post() ← Axios
    ↓
POST /api/v1/users/register ← Backend
    ↓
MongoDB saves user
    ↓ (Backend responds)
axios returns response
    ↓
Store updates state: set({ user: data })
    ↓ (Component auto re-renders)
Component shows success
```

---

## 📋 Building The Rest - Step by Step

### To build Tweet feature:

#### Step 1: Create API Service
```javascript
// src/api/tweetService.js
import apiClient from './authService';

export const tweetService = {
  getAll: async () => {
    const response = await apiClient.get('/tweets');
    return response.data.data;
  },

  create: async (content) => {
    const response = await apiClient.post('/tweets', { content });
    return response.data.data;
  },

  delete: async (tweetId) => {
    await apiClient.delete(`/tweets/${tweetId}`);
  },

  like: async (tweetId) => {
    const response = await apiClient.post(`/tweets/${tweetId}/like`);
    return response.data.data;
  }
};
```

#### Step 2: Create Zustand Store
```javascript
// src/store/tweetStore.js
import { create } from 'zustand';
import { tweetService } from '../api/tweetService';

export const useTweetStore = create((set) => ({
  tweets: [],
  isLoading: false,
  error: null,

  fetchTweets: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await tweetService.getAll();
      set({ tweets: data, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to load tweets', isLoading: false });
    }
  },

  createTweet: async (content) => {
    set({ isLoading: true, error: null });
    try {
      const newTweet = await tweetService.create(content);
      set((state) => ({
        tweets: [newTweet, ...state.tweets],
        isLoading: false
      }));
    } catch (err) {
      set({ error: 'Failed to create tweet', isLoading: false });
    }
  },

  deleteTweet: async (tweetId) => {
    try {
      await tweetService.delete(tweetId);
      set((state) => ({
        tweets: state.tweets.filter(t => t._id !== tweetId)
      }));
    } catch (err) {
      set({ error: 'Failed to delete tweet' });
    }
  },

  likeTweet: async (tweetId) => {
    try {
      await tweetService.like(tweetId);
      set((state) => ({
        tweets: state.tweets.map(t => 
          t._id === tweetId ? { ...t, likedByUser: !t.likedByUser } : t
        )
      }));
    } catch (err) {
      set({ error: 'Failed to like tweet' });
    }
  }
}));
```

#### Step 3: Create Component
```javascript
// src/pages/TweetPage.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTweetStore } from '../store/tweetStore';

function TweetPage() {
  const { tweets, isLoading, createTweet, deleteTweet, likeTweet } = useTweetStore();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    // Load tweets on page load
    useTweetStore.getState().fetchTweets();
  }, []);

  const onSubmit = async (data) => {
    try {
      await createTweet(data.content);
      reset();  // Clear form
      toast.success('Tweet posted!');
    } catch (err) {
      toast.error('Failed to post');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Tweets</h1>

      {/* Create Tweet Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '20px' }}>
        <textarea
          {...register('content', { required: 'Tweet content required' })}
          placeholder="What's on your mind?"
          rows={3}
          style={{ width: '100%', padding: '10px' }}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Posting...' : 'Post Tweet'}
        </button>
      </form>

      {/* Tweets List */}
      {tweets.map(tweet => (
        <div key={tweet._id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
          <p>{tweet.content}</p>
          <small>{new Date(tweet.createdAt).toLocaleString()}</small>
          
          <button onClick={() => likeTweet(tweet._id)}>
            ❤️ {tweet.likes}
          </button>
          
          <button onClick={() => deleteTweet(tweet._id)} style={{ marginLeft: '10px' }}>
            🗑️ Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default TweetPage;
```

#### Step 4: Add Route
```javascript
// src/routes/AppRoutes.js
import TweetPage from "../pages/TweetPage"

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/tweets" element={<TweetPage />} />  {/* ← Add this */}
    </Routes>
  )
}
```

**THAT'S IT!** Same pattern for every feature. 🚀

---

## 💡 Key Takeaways

| Concept | Purpose | Example |
|---------|---------|---------|
| **Axios** | Make HTTP requests | `apiClient.post('/tweets', data)` |
| **Zustand Store** | Global state + actions | `useAuthStore()` anywhere in app |
| **React Hook Form** | Form validation | `{...register('email', rules)}` |
| **API Service** | Organize all API calls | `tweetService.create()` |
| **Component** | Render UI + use store | `const { tweets } = useTweetStore()` |

---

## 🎓 Understanding Async/Await

```javascript
// What happens when you call API:
async function login(email, password) {
  // 1. Start request
  const response = await apiClient.post('/users/login', { email, password });
  //    ↑ "await" = wait for response (could take 1-2 seconds)
  
  // 2. Response received, continue
  console.log(response.data.data);  // Now we have the data
}

// What if you forget await?
function login(email, password) {
  const response = apiClient.post(...);  // ❌ Missing await
  console.log(response);  // ❌ This prints Promise object, not data!
}
```

**Always use `await` when calling APIs!**

---

## 🔧 Common Patterns

### Pattern: Fetch Data on Page Load
```javascript
useEffect(() => {
  useTweetStore.getState().fetchTweets();
}, []);
```

### Pattern: Handle File Upload
```javascript
const onSubmit = async (data) => {
  const file = data.videoFile[0];  // Get first file
  await uploadVideo(data.title, file);
};
```

### Pattern: Update List After Delete
```javascript
deleteTweet: async (tweetId) => {
  await tweetService.delete(tweetId);
  set((state) => ({
    tweets: state.tweets.filter(t => t._id !== tweetId)  // Remove from list
  }));
}
```

### Pattern: Show Loading State
```javascript
<button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Click me'}
</button>
```

---

## 🎉 You're Ready!

You now understand:
- ✅ Axios (making API requests)
- ✅ Zustand (managing app state)
- ✅ React Hook Form (handling forms)
- ✅ How they work together

**Next Features to Build:**
1. Videos (with file upload - like register)
2. Tweets (simple CRUD)
3. Comments (nested data)
4. Like/Subscribe (simple POST/DELETE)
5. Search/Filter (with query params)

Use the **same pattern for each!** 🚀
