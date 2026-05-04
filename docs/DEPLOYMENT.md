# 🚀 ShipTrack Deployment Guide (Free Tier)

This guide provides a step-by-step walkthrough for deploying the ShipTrack Shipment Tracking System using **100% free-tier services**.

## 🏗️ Architecture Overview

| Service | Role | Provider | Tier |
|---|---|---|---|
| **Frontend** | Next.js App | [Vercel](https://vercel.com) | Hobby (Free) |
| **Backend** | Express API | [Render](https://render.com) | Web Service (Free) |
| **Database** | NoSQL Store | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | M0 (Free) |

---

## 1. 🗄️ Database: MongoDB Atlas

1. **Sign Up:** Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Create Cluster:** Choose the **M0 Free Tier**. Pick a region closest to you.
3. **Database Access:** Create a database user (username/password). Save these credentials!
4. **Network Access:** 
   - Add a new IP address.
   - For Render compatibility, choose **"Allow Access from Anywhere"** (`0.0.0.0/0`).
5. **Get Connection String:**
   - Click "Connect" -> "Drivers" -> "Node.js".
   - Copy the `mongodb+srv://...` connection string.
   - Replace `<password>` with your actual password.

---

## 2. 🖥️ Backend: Render

1. **Sign Up:** Create an account at [render.com](https://render.com) (login with GitHub recommended).
2. **New Web Service:**
   - Click "New +" -> "Web Service".
   - Connect your GitHub repository.
3. **Configure Service:**
   - **Name:** `shiptrack-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
4. **Environment Variables:**
   Click "Advanced" -> "Add Environment Variable":
   | Key | Value | Note |
   |---|---|---|
   | `MONGO_URI` | `mongodb+srv://...` | Your Atlas string from Step 1 |
   | `JWT_SECRET` | `your_long_random_string` | Generate a secure string |
   | `NODE_ENV` | `production` | Enables production optimisations |
   | `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Set this *after* frontend deployment |
5. **Deploy:** Click "Create Web Service".

> [!NOTE]
> **Free Tier Sleep:** Render's free tier spins down after 15 minutes of inactivity. The first request after a break can take **30–60 seconds** to wake the server.

---

## 3. 🌐 Frontend: Vercel

1. **Sign Up:** Create an account at [vercel.com](https://vercel.com).
2. **New Project:**
   - Click "Add New" -> "Project".
   - Import your GitHub repository.
3. **Configure Project:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Next.js`
4. **Environment Variables:**
   Add the following:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api` |
5. **Deploy:** Click "Deploy".
6. **Update Backend CORS:**
   - Once the Vercel deployment finishes, copy your assigned domain (e.g., `https://shiptrack.vercel.app`).
   - Go back to **Render** -> Environment -> Update `ALLOWED_ORIGINS` with this URL.

---

## 🛠️ Production Verification Checklist

- [ ] **Health Check:** Visit `https://your-backend.onrender.com/health` (should return `{ "status": "ok" }`).
- [ ] **HTTPS:** Ensure both frontend and backend are using `https`.
- [ ] **CORS:** Verify you can login. If you get "CORS Error", double-check `ALLOWED_ORIGINS` in Render.
- [ ] **Cold Start:** If the app hangs on the login page for 30s during the first visit, it's just the Render server waking up.

## 🔑 Key Production Environment Variables

### Backend (`/backend`)
- `PORT`: (Set automatically by Render)
- `MONGO_URI`: Your Atlas connection string.
- `JWT_SECRET`: Random string for signing tokens.
- `ALLOWED_ORIGINS`: Comma-separated list of frontend URLs.

### Frontend (`/frontend`)
- `NEXT_PUBLIC_API_URL`: The full URL to your backend `/api` endpoint.
