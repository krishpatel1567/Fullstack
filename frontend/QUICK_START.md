# 🚀 Getting Started - Login/Register Working

## What I've Created

✅ **API Service** (`src/api/authService.js`) - Connects frontend to backend
✅ **Auth Store** (`src/store/authStore.js`) - Manages user state globally  
✅ **Login Page** (`src/pages/LoginPage.jsx`) - Raw login form (no styling)
✅ **Register Page** (`src/pages/RegisterPage.jsx`) - With file upload handling
✅ **Home Page** (`src/pages/HomePage.jsx`) - Shows logged-in user
✅ **Cheat Sheet** (`FULLSTACK_PATTERN.md`) - Copy-paste templates for any feature

---

## Quick Start (5 minutes)

### 1. Start Backend
```bash
cd backend
npm run dev
```
Should see: `Server running on port 8000` (or your configured port)

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Should see: `Local: http://localhost:5173/`

### 3. Test Login
1. Open browser → `http://localhost:5173/register`
2. Fill out form with test data + avatar image
3. Click Register
4. Should redirect to home showing your username
5. Click Logout to test that too

### 4. Test Login Again
1. Go to `/login`
2. Use same email + password
3. Should log in successfully

---

## File Structure (What to Know)

```
frontend/
├── src/
│   ├── api/
│   │   └── authService.js          ← All backend calls
│   ├── store/
│   │   └── authStore.js            ← Global user state
│   ├── pages/
│   │   ├── LoginPage.jsx           ← Login form
│   │   ├── RegisterPage.jsx        ← Register + file upload
│   │   └── HomePage.jsx            ← Logged-in home
│   ├── routes/
│   │   └── AppRoutes.js            ← Route definitions
│   └── main.jsx                    ← App entry point
├── .env.local                      ← Backend API URL
└── FULLSTACK_PATTERN.md            ← Copy-paste templates
```

---

## How Each Part Works

### API Service (`authService.js`)
```javascript
// One file handles ALL API calls to auth endpoints
authService.login(email, password)
authService.register(fullName, email, username, password, avatar)
authService.logout()
authService.getCurrentUser()
```

### Store (`authStore.js`)
```javascript
// Global state - accessible from any component
const { user, login, register, logout, isLoading, error } = useAuthStore()

// Call from component → store updates state → component re-renders
await login(email, password)  // sets user state
```

### Page Component (`LoginPage.jsx`)
```javascript
// 1. Get store functions
const { login, isLoading, error } = useAuthStore()

// 2. Get form handling from React Hook Form
const { register, handleSubmit } = useForm()

// 3. On submit → call store → store calls API → redirects on success
const onSubmit = async (data) => {
  await login(data.email, data.password)
  navigate('/')
}
```

---

## The Pattern (Apply to Any Feature)

For **Videos**, **Tweets**, **Comments**, etc:

1. Create `src/api/videoService.js` with endpoints:
   ```javascript
   export const videoService = {
     getAll: () => apiClient.get('/videos'),
     upload: (title, file) => apiClient.post('/videos/upload', ...),
     delete: (id) => apiClient.delete(`/videos/${id}`),
   }
   ```

2. Create `src/store/videoStore.js` with store actions:
   ```javascript
   const useVideoStore = create((set) => ({
     videos: [],
     fetchAll: async () => { ... },
     upload: async () => { ... },
   }))
   ```

3. Create page component using store + form
4. Add route to `AppRoutes.js`

**That's it!** All your features follow this pattern.

---

## Common Issues

### 🔴 "Cannot POST /api/v1/users/login"
→ Backend not running. Check `http://localhost:8000/api/v1/healthcheck`

### 🔴 "CORS error"
→ Update backend `.env` → `CORS_ORIGIN=http://localhost:5173`

### 🔴 "User does not exist"
→ Register a test user first

### 🔴 "Avatar file is required"
→ Select an image in the register form before submitting

---

## Next Steps

Pick ONE feature and follow the pattern:

1. **Videos** - `GET /api/v1/videos`, `POST /videos/upload`
2. **Tweets** - `GET /tweets`, `POST /tweets`, `DELETE /tweets/:id`
3. **Like** - `POST /likes/:id`, `DELETE /likes/:id`
4. **Subscribe** - `POST /subscriptions/:id`
5. **Comments** - `GET /comments/:id`, `POST /comments`

See `FULLSTACK_PATTERN.md` for step-by-step templates!

---

## Architecture Recap

```
User Input (Form)
    ↓
React Hook Form (validation)
    ↓
handleSubmit() → onSubmit(data)
    ↓
useAuthStore().login(email, password)  [Call store action]
    ↓
authService.login(email, password)     [Call API]
    ↓
axios POST /api/v1/users/login
    ↓
Backend processes → returns user + tokens
    ↓
Store updates state: set({ user: data })
    ↓
Component re-renders with new user data
    ↓
navigate('/') → HomeP age shows username
```

Everything is connected! 🎉
