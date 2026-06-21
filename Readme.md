# VidTube — Fullstack MERN Video Platform

> My first fullstack project — a YouTube-style video and micro-blogging platform built with MongoDB, Express, React, and Node.js.

This repo is a monorepo with two independent apps:

- **`backend/`** — REST API (Node.js, Express 5, MongoDB/Mongoose, JWT auth, Cloudinary media storage)
- **`frontend/`** — Single-page app (React 19, Vite, Tailwind CSS v4, TanStack Query, Zustand)

It covers the core feature set of a video platform: user accounts with avatars/cover images, video upload and playback, comments, likes, subscriptions, playlists, a Twitter-style "tweets" feed, watch history, and a creator dashboard.

---

## Table of contents

- [VidTube — Fullstack MERN Video Platform](#vidtube--fullstack-mern-video-platform)
  - [Table of contents](#table-of-contents)
  - [Tech stack](#tech-stack)
  - [Features](#features)
  - [Project structure](#project-structure)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [1. Clone the repo](#1-clone-the-repo)
    - [2. Backend setup](#2-backend-setup)
    - [3. Frontend setup](#3-frontend-setup)
  - [Environment variables](#environment-variables)
  - [API reference](#api-reference)
  - [Data models](#data-models)
  - [Scripts](#scripts)
  - [Known limitations / roadmap](#known-limitations--roadmap)
  - [License](#license)

---

## Tech stack

| Layer | Technology |
|---|---|
| Database | MongoDB (via Mongoose ODM, `mongoose-aggregate-paginate-v2` for paginated aggregations) |
| Backend | Node.js, Express 5, JWT (access + refresh tokens), bcrypt, Multer, Cloudinary |
| Frontend | React 19, Vite, React Router 7, Tailwind CSS 4 |
| State / data fetching | Zustand (client state), TanStack Query (server state), Axios |
| Forms / validation | React Hook Form + Zod |
| UX | React Hot Toast, React Loading Skeleton |
| Tooling | ESLint, Prettier, Nodemon |

This is not a "vanilla" MERN tutorial stack — note React Query and Zustand are doing real work here (server cache vs. UI/auth state are kept separate), which is the harder, more correct pattern than stuffing everything into one global store.

## Features

**Auth & users**
- Register with avatar + optional cover image upload (multipart, stored on Cloudinary)
- Login / logout with JWT access + refresh token rotation, refresh token persisted as an httpOnly cookie
- Update account details, password, avatar, cover image
- Public channel profile (subscriber counts, etc.)

**Video**
- Upload video file + thumbnail, publish/unpublish toggle
- List, fetch, update, delete videos
- Watch history tracking per user

**Social**
- Comments on videos
- Likes on videos, comments, and tweets (toggle endpoints)
- Subscribe/unsubscribe to channels, list subscribers and subscriptions
- Tweet-style short posts (create/update/delete/list)
- Playlists (create, add/remove videos, fetch by id, list by user)

**Creator tools**
- Dashboard with channel stats and channel video list

## Project structure

```
Fullstack/
├── backend/
│   ├── src/
│   │   ├── controllers/      # request handlers, one per resource
│   │   ├── models/            # Mongoose schemas (User, Video, Comment, Like, Playlist, Subscription, Tweet)
│   │   ├── routes/            # Express routers, mounted under /api/v1
│   │   ├── middlewares/       # auth.middleware.js (JWT verify), multer.middleware.js (uploads)
│   │   ├── utils/              # apiError, apiResponse, asyncHandler, cloudinary
│   │   ├── db/                 # Mongo connection
│   │   ├── app.js              # Express app, CORS, route mounting
│   │   └── index.js            # entry point — loads env, connects DB, starts server
│   ├── public/                  # local temp storage for Multer before Cloudinary upload
│   └── .env.sample
└── frontend/
    ├── src/
    │   ├── api/                # one Axios service module per resource
    │   ├── components/         # Navbar, VideoCard, VideoPlayer, TweetCard, ui/...
    │   ├── pages/               # route-level pages
    │   ├── routes/              # AppRoutes.jsx — React Router route table
    │   ├── store/                # Zustand stores (auth, video, tweet)
    │   └── utils/apiClient.js   # Axios instance
    └── vite.config.js
```

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A MongoDB instance (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A [Cloudinary](https://cloudinary.com/) account (free tier works) for media storage

### 1. Clone the repo

```bash
git clone https://github.com/krishpatel1567/Fullstack.git
cd Fullstack
```

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the sample env file and fill in real values (see [Environment variables](#environment-variables)):

```bash
cp .env.sample .env
```

> ⚠️ **Heads up:** `src/index.js` currently loads the env file from `./env`, not `./.env`:
> ```js
> dotenv.config({ path: "./env" });
> ```
> Either rename your file to `env` (no leading dot) when running locally, or fix that line to `path: "./.env"` before running `npm run dev`. This is a real bug in the current code, not a documentation typo — worth fixing as your first PR.

Start the dev server (uses Nodemon, auto-reloads on changes):

```bash
npm run dev
```

By default the API listens on `http://localhost:3000` (or `PORT` from your env) and is mounted at `/api/v1`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`).

The API base URL is configurable via `VITE_API_BASE_URL` (`src/utils/apiClient.js`), falling back to `http://localhost:3000/api/v1` if unset:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
```

Set it in `frontend/.env.local` (gitignored, not committed) when pointing at a non-default backend:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Environment variables

These are the variables the backend actually reads (`backend/.env.sample`):

| Variable | Purpose |
|---|---|
| `PORT` | Port the Express server listens on |
| `MONGODB_URI` | MongoDB connection string (database name `videotube` is appended automatically) |
| `CORS_ORIGIN` | Allowed origin for CORS (set to your frontend URL) |
| `ACCESS_TOKEN_SECRET` | Secret used to sign JWT access tokens |
| `ACCESS_TOKEN_EXPIRY` | Access token lifetime (defaults to `15m` if unset) |
| `REFRESH_TOKEN_SECRET` | Secret used to sign JWT refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifetime (defaults to `7d` if unset) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Never commit your real `.env` file — `backend/.gitignore` already excludes `.env`.

The frontend reads one optional variable from `frontend/.env.local` (also gitignored):

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL the frontend calls for the API. Falls back to `http://localhost:3000/api/v1` if unset. |

## API reference

Base URL: `http://localhost:3000/api/v1`

All routes except `register`, `login`, `refresh-token`, and `healthcheck` require a valid access token (sent as an httpOnly cookie or `Authorization: Bearer <token>` header, verified by `verifyJWT` middleware).

<details>
<summary><strong>Users</strong> — <code>/users</code></summary>

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register (multipart: `avatar`, `coverImage`) |
| POST | `/login` | No | Login |
| POST | `/logout` | Yes | Logout |
| POST | `/refresh-token` | No | Exchange refresh token for new access token |
| POST | `/change-password` | Yes | Change current password |
| GET | `/current-user` | Yes | Get logged-in user |
| PATCH | `/update-account` | Yes | Update account details |
| PATCH | `/avatar` | Yes | Update avatar (multipart) |
| PATCH | `/cover-image` | Yes | Update cover image (multipart) |
| POST | `/:username` | Yes | Get channel profile by username |
| GET | `/history` | Yes | Get watch history |
| GET | `/channel/:userId` | Yes | Get channel profile by user id |

</details>

<details>
<summary><strong>Videos</strong> — <code>/videos</code></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/` | List videos |
| POST | `/` | Upload video (multipart: `videoFile`, `thumbnail`) |
| GET | `/:videoId` | Get video by id |
| PATCH | `/:videoId` | Update video (multipart: `thumbnail`) |
| DELETE | `/:videoId` | Delete video |
| PATCH | `/toggle/publish/:videoId` | Toggle publish status |

</details>

<details>
<summary><strong>Comments</strong> — <code>/comments</code></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/:videoId` | Get comments for a video |
| POST | `/:videoId` | Add comment |
| PATCH | `/c/:commentId` | Update comment |
| DELETE | `/c/:commentId` | Delete comment |

</details>

<details>
<summary><strong>Likes</strong> — <code>/likes</code></summary>

| Method | Path | Description |
|---|---|---|
| POST | `/toggle/v/:videoId` | Toggle like on a video |
| POST | `/toggle/c/:commentId` | Toggle like on a comment |
| POST | `/toggle/t/:tweetId` | Toggle like on a tweet |
| GET | `/videos` | Get liked videos |

</details>

<details>
<summary><strong>Subscriptions</strong> — <code>/subscriptions</code></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/c/:channelId` | Get channels a user is subscribed to |
| POST | `/c/:channelId` | Toggle subscription to a channel |
| GET | `/u/:channelId` | Get a channel's subscribers |

</details>

<details>
<summary><strong>Tweets</strong> — <code>/tweets</code></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/` | Get all tweets |
| POST | `/create` | Create tweet |
| GET | `/user/:userId` | Get tweets by user |
| PATCH | `/update/:tweetId` | Update tweet |
| DELETE | `/delete/:tweetId` | Delete tweet |

</details>

<details>
<summary><strong>Playlists</strong> — <code>/playlist</code></summary>

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create playlist |
| GET | `/:playlistId` | Get playlist by id |
| PATCH | `/:playlistId` | Update playlist |
| DELETE | `/:playlistId` | Delete playlist |
| PATCH | `/add/:videoId/:playlistId` | Add video to playlist |
| PATCH | `/remove/:videoId/:playlistId` | Remove video from playlist |
| GET | `/user/:userId` | Get playlists by user |

</details>

<details>
<summary><strong>Dashboard</strong> — <code>/dashboard</code></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/stats` | Channel stats |
| GET | `/videos` | Channel's videos |

</details>

<details>
<summary><strong>Healthcheck</strong> — <code>/healthcheck</code></summary>

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Liveness check |

</details>

## Data models

- **User** — username, email, fullName, avatar, coverImage, password (bcrypt-hashed), watchHistory (ref `Video[]`), refreshToken
- **Video** — file/thumbnail URLs, title, description, duration, views, isPublished, owner (ref `User`)
- **Comment** — content, video (ref), owner (ref)
- **Like** — references to video / comment / tweet + the liking user
- **Subscription** — subscriber + channel (both ref `User`)
- **Tweet** — content, owner (ref `User`)
- **Playlist** — name, description, videos (ref `Video[]`), owner (ref `User`)

## Scripts

**Backend** (`backend/package.json`)
```bash
npm run dev      # nodemon, auto-reload, loads env via -r dotenv/config
```

**Frontend** (`frontend/package.json`)
```bash
npm run dev       # start Vite dev server
npm run build      # production build
npm run preview    # preview the production build locally
npm run lint        # run ESLint
```

## Known limitations / roadmap

Documenting these honestly rather than glossing over them — useful both for you and for anyone evaluating the repo:

- No automated tests (unit, integration, or e2e) yet.
- No CI pipeline (GitHub Actions, etc.).
- No `LICENSE` file — add one if you want this to be reusable by others (e.g. MIT).
- The `dotenv.config({ path: "./env" })` bug in `backend/src/index.js` (see [Backend setup](#2-backend-setup)) — still unresolved as of this version.
- No rate limiting or request validation middleware (e.g. `express-validator`/Zod) visible on the backend routes — Zod is currently only used on the frontend forms.
- No deployment config (Dockerfile, docker-compose, or hosting-specific files) in the repo yet.

## License

No license file is currently included, which by default means **all rights reserved** — others can view the code but can't legally reuse, modify, or redistribute it. If you want this to be open source, add a `LICENSE` file (MIT is the common permissive choice for learning projects like this).