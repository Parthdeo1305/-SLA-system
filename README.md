# ShipTrack — Shipment Tracking System

> A production-grade SaaS logistics platform for tracking shipments, detecting SLA breaches in real time, and giving operations teams the visibility they need to take action before customers are impacted.

---

## Features

- 🔐 **JWT Authentication** — Sign up, login, protected routes, role-based access
- 📦 **Order Management** — Create, view, update orders through a 5-stage status lifecycle
- ⚠️ **SLA Breach Detection** — Automatic delay flagging, delay duration display, pre-breach warnings
- 📊 **Operations Dashboard** — KPI cards, filterable orders table, real-time auto-refresh
- 🎨 **Premium Dark UI** — Responsive, professional design with colour-coded status indicators
- 🌱 **Seed Data** — 20 realistic orders across all statuses for instant demo

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express 4 |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | Joi |
| Security | Helmet, express-rate-limit, CORS |
| Icons | lucide-react |
| Date handling | date-fns |

---

## Prerequisites

- **Node.js** ≥ 18.0
- **MongoDB** — local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier
- **npm** ≥ 9.0

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd SLA
```

### 2. Backend setup

```bash
cd backend
npm install

# Copy the environment template
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/shipment_tracker
JWT_SECRET=your_long_random_secret_here_at_least_32_chars
JWT_EXPIRE=7d
ALLOWED_ORIGINS=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

You should see:
```
[Config] Environment variables validated ✓
[DB] MongoDB connected: localhost
[Server] Running in development mode on port 5000
[Server] Health check → http://localhost:5000/health
```

### 3. Seed sample data (optional but recommended)

```bash
npm run seed
```

Output:
```
✅ Seed complete!
─────────────────────────────────────────
Test Credentials:
  Operations Manager: sarah@logisticsco.com / Password123!
  Warehouse Staff:    raj@logisticsco.com   / Password123!
  Admin:              alex@logisticsco.com  / Password123!
─────────────────────────────────────────
```

### 4. Frontend setup

```bash
cd ../frontend
npm install

# The .env.local file is already created with:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

---

## API Usage Examples

### Authentication

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!",
    "role": "operations_manager"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "sarah@logisticsco.com", "password": "Password123!"}'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "Sarah Chen", "role": "operations_manager" }
}
```

Save the token for subsequent requests:
```bash
export TOKEN="your_token_here"
```

### Orders

**Create an order:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Acme Corp",
    "promisedDeliveryTime": "2026-05-01T18:00:00.000Z",
    "notes": "Fragile cargo"
  }'
```

**List all orders:**
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

**List delayed orders only:**
```bash
curl "http://localhost:5000/api/orders?delayed=true" \
  -H "Authorization: Bearer $TOKEN"
```

**Filter by status:**
```bash
curl "http://localhost:5000/api/orders?status=In+Transit" \
  -H "Authorization: Bearer $TOKEN"
```

**Get dashboard stats:**
```bash
curl http://localhost:5000/api/orders/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Update order status:**
```bash
curl -X PATCH http://localhost:5000/api/orders/<ORDER_ID> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Picked"}'
```

**Health check (no auth required):**
```bash
curl http://localhost:5000/health
```

---

## Sample Test Data

After running `npm run seed`, the database contains:

| Customer | Status | SLA Scenario |
|---|---|---|
| Acme Corporation | Delivered | ✅ On time |
| Global Imports Ltd | Delivered | ✅ On time |
| Pinnacle Pharma | In Transit | ✅ Due in 4h |
| NovaBuild Supplies | In Transit | ⚡ Due in 30m |
| Horizon Textiles | In Transit | 🔴 Delayed 3h |
| Atlas Chemicals | In Transit | 🔴 Delayed 6h |
| Sterling Auto Parts | In Transit | 🔴 Delayed 10h |
| Vega Medical | Picked | 🔴 Delayed 4h |
| Omega Print Solutions | Created | 🔴 Delayed 2h |
| Cascade Building Co | Failed | ❌ Recipient refused |
| ... + 10 more | Various | Various |

---

## 🚀 Deployment (Free Tier)

ShipTrack is designed to be deployed entirely on free-tier services.

- **Frontend:** [Vercel](https://vercel.com) (Hobby Plan)
- **Backend:** [Render](https://render.com) (Free Web Service)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (M0 Cluster)

### 📘 Full Deployment Guide
For step-by-step instructions on setting up your accounts, configuring environment variables, and going live, see:
👉 **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)**

### ⚠️ Free-Tier Limitations
Since this setup uses free plans, please keep the following in mind:
- **Backend Sleep:** The Render backend will spin down after 15 minutes of inactivity. The first request after it sleeps can take **30-60 seconds** to wake up.
- **Database Storage:** MongoDB Atlas M0 is limited to **512MB** (plenty for this app, but not for large file storage).
- **Cold Starts:** If the login page hangs, check the network tab; the server is likely just waking up.

---

## 🔧 Environment Variables

### Backend (`/backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/sts` |
| `JWT_SECRET` | Secret for auth tokens | `change_me` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |

### Frontend (`/frontend/.env.local`)
| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL for API calls | `http://localhost:5000/api` |

---

## Project Structure

```
SLA/
├── backend/          ← Express API
├── frontend/         ← Next.js app
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── DESIGN_DOCUMENT.md
│   ├── PROJECT_DEEP_DIVE.md
│   ├── UI_UX_EXPLANATION.md
│   └── QUALITY_NOTES.md
└── README.md
```

---

## License

MIT — built as a production reference implementation for logistics SaaS.
