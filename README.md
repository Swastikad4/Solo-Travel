# 🇮🇳 SoloTravel India — Full-Stack AI Travel & Community Ecosystem

> **The definitive solo travel platform built exclusively for exploring India.**  
> Plan intelligent day-by-day itineraries with AI, explore 28 States & 8 Union Territories, connect with solo travelers via real-time Socket.IO chat, join regional travel clubs, share public itineraries, and manage community safety with an Admin dashboard.

---

## 🌟 Key Features Across 14 Phases

```
                       ┌────────────────────────────────────────────────────────┐
                       │               SoloTravel India Platform                │
                       └──────────────────────────┬─────────────────────────────┘
                                                  │
         ┌───────────────────┬────────────────────┼───────────────────┬───────────────────┐
         │                   │                    │                   │                   │
┌────────▼─────────┐┌────────▼─────────┐┌─────────▼─────────┐┌────────▼─────────┐┌────────▼─────────┐
│  AI Day-by-Day   ││ Traveler Connect ││  Travel Groups    ││  Public Sharing  ││ Admin Dashboard   │
│  Trip Planner    ││  & 1-on-1 Chat   ││  & Group Chat     ││  & AI Match      ││ & Moderation Hub  │
└──────────────────┘└──────────────────┘└───────────────────┘└───────────────────┘└───────────────────┘
```

### 1. 🤖 AI Travel Planner (India-Only)
- **Structured Day-by-Day Itineraries**: Generates detailed timelines (activities, timings, locations, estimated budgets, meal recommendations, transit).
- **Strict India Boundary Protection**: Automatically rejects destinations outside India with a friendly boundary message.
- **Dynamic AI Commands**: Modify existing plans on the fly (*"Make it cheaper"*, *"Add more trekking"*, *"Reduce travel time"*, *"Add local cuisine"*, *"Regenerate Day 2"*).
- **Automated Packing Lists & Safety Tips**: Curated for high-altitude Himalayan treks, desert safaris, coastal beaches, and heritage trails.

### 2. 🗺️ Maps, Live Weather & Solo Safety Hub
- **Visual Itinerary Route**: Hotel ➔ Attraction ➔ Restaurant ➔ Activity plotted on interactive location cards and map coordinates.
- **Weather Insights**: Real-time conditions, temperatures, forecasts, and monsoon/winter travel advisories.
- **Solo Safety & SOS**: 24/7 National Emergency Contacts (Police `112`, Women Helpline `1091`, Tourist Helpline `1363`), solo traveler safety scores, and trekking guidelines.

### 3. 💬 Traveler Discovery & Real-Time Chat
- **Discover Solo Explorers**: Search travelers by travel style (*Backpacker*, *Cultural*, *Adventure*), preferred Indian states, and interests.
- **Real-Time 1-to-1 Chat via Socket.IO**: Instant messaging, online/offline status indicators, timestamps, read receipts, and message deletion.
- **Safety & Privacy Controls**: Block/Unblock users, report abusive messages, and privacy settings (*Who can message me?*).

### 4. 👥 Regional Travel Groups & Community
- **Indian Travel Clubs**: Pre-seeded & user-created groups (*Goa Solo Travelers*, *Manali Trekkers*, *Kerala Backpackers*, *Rajasthan Heritage Explorers*).
- **Group Chat**: Real-time community discussions, active member lists, and group rule enforcement.
- **Group Admin Tools**: Edit group info, moderate discussions, and manage members.

### 5. 🔗 Public Itinerary Sharing & Smart Recommendations
- **Shareable Read-Only Trip Pages**: Generate public links (`/share/trip/:shareId`) displaying itinerary timelines and photos while **strictly hiding private expense breakdowns and personal notes**.
- **AI Recommendation Engine**: Rule-based matching scores (e.g. *Manali 94%*, *Kashmir 89%*, *Sikkim 86%*) tailored to user preferences and history.

### 6. 🛡️ Admin Dashboard & Moderation
- **KPI Metrics**: Total Users (1,250+), Destinations (100+), Trips (500+), Reviews (950+), Groups (80+), Reports (12+).
- **Visual Analytics**: 5 real-time charts (Popular destinations, Most active users, Trips created, Top states, Category distributions).
- **Moderation Queue**: Review incident reports, take disciplinary actions (*Warning*, *Account Suspension*), manage destinations, and toggle user RBAC roles.

### 7. 🔒 Enterprise Security & Robust Backend Quality
- **Authentication**: JWT authentication with Bcrypt password hashing (`salt >= 10`).
- **Input Sanitization**: Custom NoSQL query injection sanitizer and XSS entity encoder.
- **Rate Limiting**: Tiered limiters for general API calls and dedicated brute-force protection on authentication endpoints.
- **Standardized Error Codes**: Strict semantic responses (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Server Error`).
- **Zero Downtime Graceful Fallbacks**: Seamlessly functions with MongoDB Atlas or intelligent in-memory mock storage when offline.

---

## 🛠️ Technology Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 19, React Router 7, Axios, Socket.IO Client, Vanilla CSS (Glassmorphic Dark Theme) |
| **Backend** | Node.js, Express 5, Mongoose 9, Socket.IO 4, Helmet 8, Express Rate Limit 8, BcryptJS, JWT |
| **Database** | MongoDB Atlas with compound indexes & in-memory fallback engine |
| **Deployment** | Vercel (Frontend SPA) + Render (Backend Web Service) |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0+ or v20.0+
- **npm**: v9.0+
- **MongoDB**: Local MongoDB instance or free [MongoDB Atlas Cluster](https://www.mongodb.com/cloud/atlas) (optional — app includes automatic in-memory fallback).

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Swastikad4/solo-travel-app.git
cd solo-travel-app
```

---

### Step 2: Backend Setup
```bash
cd backend

# Copy environment template
cp .env.example .env

# Install backend dependencies
npm install

# Start development server (runs on http://localhost:5000)
npm run dev
# or
node server.js
```

---

### Step 3: Frontend Setup
```bash
cd ../frontend

# Copy environment template
cp .env.example .env

# Install frontend dependencies
npm install

# Start React development server (opens http://localhost:3000)
npm start
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```ini
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/soloTravelDB?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
ADMIN_KEY=Admin@123_BharatSecurePasskey
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env`)
```ini
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 📚 REST API Documentation

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register a new traveler | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | **Yes** |
| `PUT` | `/api/auth/profile` | Update bio, interests & style | **Yes** |

### 2. Destinations (`/api/destinations`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/destinations` | List destinations with filters & pagination | No |
| `GET` | `/api/destinations/featured` | Fetch top-rated featured spots | No |
| `GET` | `/api/destinations/recommendations` | AI personalized destination scoring | Optional |
| `GET` | `/api/destinations/:slug` | Detailed destination profile | No |

### 3. AI Travel Planner (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/ai/plan-trip` | Generate day-by-day India itinerary | No |
| `POST` | `/api/ai/modify-itinerary` | Execute AI modification prompt | No |
| `POST` | `/api/ai/optimize-budget` | Optimize budget allocation | No |
| `POST` | `/api/ai/validate-destination` | Enforce India boundary check | No |

### 4. Trips & Itineraries (`/api/trips`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/trips` | Get trips for current traveler | Optional |
| `POST` | `/api/trips` | Create a new trip itinerary | Optional |
| `GET` | `/api/trips/:id` | Fetch full trip itinerary | Optional |
| `PUT` | `/api/trips/:id` | Update trip activities/budget | Optional |
| `DELETE` | `/api/trips/:id` | Delete trip itinerary | Optional |
| `POST` | `/api/trips/:id/share` | Generate public share link | Optional |
| `GET` | `/api/trips/public/:shareId` | Fetch sanitized public trip | No |

### 5. 1-to-1 Chat & Discovery (`/api/chat` & `/api/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/users/discover` | Discover solo travelers by interests | **Yes** |
| `GET` | `/api/chat/conversations` | Get active chat threads | **Yes** |
| `POST` | `/api/chat/start` | Start conversation with user | **Yes** |
| `POST` | `/api/chat/send` | Send a direct message | **Yes** |
| `POST` | `/api/users/block/:id` | Block a user | **Yes** |
| `POST` | `/api/users/report` | Report user or message | **Yes** |

### 6. Travel Groups (`/api/groups`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/groups` | Browse regional travel groups | No |
| `POST` | `/api/groups` | Create a new travel community | **Yes** |
| `GET` | `/api/groups/:id` | View group details & members | No |
| `POST` | `/api/groups/:id/join` | Join travel group | **Yes** |
| `POST` | `/api/groups/:id/leave` | Leave travel group | **Yes** |
| `GET` | `/api/groups/:id/messages` | Get group message history | No |
| `POST` | `/api/groups/:id/messages` | Send message in group chat | **Yes** |

### 7. Admin Dashboard (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/admin/stats` | Live KPI counters & 5 visual charts | **Admin** |
| `GET` | `/api/admin/users` | Manage registered users & roles | **Admin** |
| `GET` | `/api/admin/reports` | Moderation queue for user reports | **Admin** |
| `PUT` | `/api/admin/reports/:id/resolve`| Resolve incident with disciplinary action | **Admin** |

---

## 🔌 Socket.IO Real-Time Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `setup` | Client ➔ Server | `userId` | Joins user-specific room and broadcasts online status |
| `join_group` | Client ➔ Server | `groupId` | Joins regional travel group room |
| `send_direct_message` | Client ➔ Server | `{ receiverId, content, conversationId }` | Sends instant direct message |
| `new_message` | Server ➔ Client | `{ message, conversationId, senderId }` | Received by recipient immediately |
| `send_group_message` | Client ➔ Server | `{ groupId, content, sender }` | Broadcasts message to group |
| `new_group_message` | Server ➔ Client | `{ groupId, message }` | Received by all active group members |
| `typing` / `stop_typing` | Bidirectional | `{ conversationId, senderId }` | Real-time typing status |

---

## 🧪 Testing & Verification

Run the master verification test suite covering all 9 core functional modules:

```bash
cd backend
node test_phase13_full_e2e.js
```

**Expected Output:**
```text
================================================================================
🚀 STARTING MASTER END-TO-END VERIFICATION SUITE — SOLOTRAVEL INDIA (PHASE 13)
================================================================================
  ✓ [TEST 1] User registration returns 201 with JWT token and profile
  ✓ [TEST 2] Admin login returns 200 with ADMIN role
  ...
  ✓ [TEST 30] Cleanly deleted test trip with 200 status
================================================================================
🎉 MASTER E2E TESTING COMPLETE: 30/30 TESTS PASSED SUCCESSFULLY!
================================================================================
```

---

## ☁️ Production Deployment

### Backend Deployment (Render)
1. Push code to GitHub repository.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set **Root Directory** to `backend`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: Your 32+ character JWT secret
   - `ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g., `https://solotravel-india.vercel.app`)

### Frontend Deployment (Vercel)
1. Create a new **Project** on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: `Create React App`
4. Build Command: `npm run build`
5. Output Directory: `build`
6. Add Environment Variable:
   - `REACT_APP_API_URL`: Your Render backend URL (e.g., `https://solotravel-backend.onrender.com`)

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
