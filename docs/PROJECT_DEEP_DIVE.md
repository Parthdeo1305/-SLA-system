# PROJECT_DEEP_DIVE.md — Shipment Tracking System
## "Teaching a Junior Developer How This Works"

---

## 1. Folder Structure at a Glance

```
E:/SLA/
├── backend/                  ← Node.js + Express REST API
│   ├── config/
│   │   ├── db.js             ← MongoDB connection logic
│   │   └── env.js            ← Fail-fast env var validation
│   ├── controllers/
│   │   ├── authController.js ← register / login / me
│   │   └── orderController.js← CRUD + stats + SLA serialisation
│   ├── middleware/
│   │   ├── auth.js           ← JWT verify + role authorisation
│   │   ├── errorHandler.js   ← centralised error handler + asyncHandler
│   │   ├── rateLimiter.js    ← brute-force protection
│   │   └── validate.js       ← Joi schemas + middleware factory
│   ├── models/
│   │   ├── User.js           ← Mongoose schema with bcrypt
│   │   └── Order.js          ← Schema with auto-ID, virtual SLA fields
│   ├── routes/
│   │   ├── authRoutes.js     ← /api/auth/*
│   │   └── orderRoutes.js    ← /api/orders/*
│   ├── services/
│   │   └── slaService.js     ← Core delay detection logic (pure functions)
│   ├── scripts/
│   │   └── seed.js           ← Sample data generator
│   └── server.js             ← Express app bootstrap

├── frontend/                 ← Next.js 14 App Router
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx    ← Login form
│   │   │   └── signup/page.tsx   ← Registration form
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        ← Wraps in AppShell
│   │   │   └── page.tsx          ← Main dashboard
│   │   ├── orders/
│   │   │   ├── layout.tsx
│   │   │   ├── new/page.tsx      ← Create order form
│   │   │   └── [id]/page.tsx     ← Order detail + timeline
│   │   ├── layout.tsx            ← Root layout (metadata, fonts)
│   │   ├── page.tsx              ← Redirects to /dashboard
│   │   └── globals.css           ← Design tokens + base styles
│   ├── components/
│   │   ├── ui/
│   │   │   ├── StatusBadge.tsx   ← Colour-coded status chip with SLA info
│   │   │   ├── Card.tsx          ← Surface container
│   │   │   ├── Button.tsx        ← Variants + loading state
│   │   │   └── Input.tsx         ← Labelled input with error state
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx     ← KPI summary card
│   │   │   ├── OrdersTable.tsx   ← Main table with quick actions
│   │   │   └── FilterBar.tsx     ← Search + status + delayed toggle
│   │   └── layout/
│   │       └── AppShell.tsx      ← Sidebar navigation
│   ├── hooks/
│   │   ├── useAuth.ts            ← Auth state + login/register/logout
│   │   └── useOrders.ts          ← Orders fetch + 30s auto-refresh
│   ├── services/api/
│   │   ├── client.ts             ← Axios instance with JWT interceptor
│   │   ├── auth.ts               ← Auth API calls
│   │   └── orders.ts             ← Orders API calls + TypeScript types
│   └── middleware.ts             ← Next.js edge route protection
│
├── docs/                     ← Documentation
└── README.md
```

---

## 2. File Purpose — Every File Explained

### Backend

#### `server.js`
The entry point. It:
1. Calls `validateEnv()` — dies immediately if required env vars are missing
2. Creates the Express app
3. Applies global middleware in order: Helmet → CORS → JSON parser → Morgan → Rate limiter
4. Mounts route handlers at `/api/auth` and `/api/orders`
5. Adds a 404 handler and the global `errorHandler` last
6. Connects to MongoDB then starts listening

**Why this order matters:** Middleware in Express is a pipeline. If you put `errorHandler` before routes, it'll never catch route errors. If you put CORS after your routes, preflight requests fail.

#### `config/db.js`
Wraps `mongoose.connect()` with a try/catch and `process.exit(1)` on failure. The exit prevents a "zombie server" that's running but can't serve any requests.

#### `config/env.js`
Checks for required environment variables on startup. This is the "fail fast" principle — you want to know your config is wrong *before* your first real user request, not during it.

#### `models/User.js`
- **`select: false` on passwordHash**: Mongoose won't include the field in query results by default. You have to explicitly request it with `.select('+passwordHash')`. This prevents accidental exposure.
- **`pre('save')` hook**: Hashes the password *only when it changes*. This means editing a user's role won't re-hash an already-hashed password.
- **`toJSON.transform`**: Strips `passwordHash` and `__v` from every JSON response as a second layer of safety.

#### `models/Order.js`
- **`orderId` counter**: We use a separate `Counter` collection to generate sequential, human-readable IDs like `STS-20260429-0001`. MongoDB's ObjectIds are random and not user-friendly.
- **Virtual fields**: `isDelayed`, `delayDuration`, `timeUntilDue` are computed on every document access using `computeSLAStatus()`. They're *never stored in MongoDB*. This is important — it means the delay status is always up-to-date.
- **`STATUS_TRANSITIONS` static**: A plain JavaScript object that defines what the next allowed status is. The controller uses this to enforce the one-way status flow.
- **Agent Accountability & Audit Trail**:
    - **`deliveryAgent`**: Once an order moves to "Picked", an agent (ID, Name, Phone) must be assigned. This ensures clear responsibility for every package.
    - **`transitLogs`**: An automated audit trail. Every status change (Created → Picked → In Transit → Delivered/Failed) appends a new entry with the operator's ID, a timestamp, and optional location/notes. This mimics real-world logistics systems like FedEx or DHL.

#### `services/slaService.js`
This is the heart of the business logic. Three pure functions:

1. **`computeSLAStatus(order, now)`** — Takes an order and computes three things:
   - `isDelayed` — are we past the deadline with a non-terminal status?
   - `delayDuration` — formatted string like "2h 15m"
   - `timeUntilDue` — formatted string like "Due in 30m" (only within 60 mins)

2. **`formatDuration(ms)`** — Converts milliseconds to human-readable duration.

3. **`filterDelayed(orders)`** — Utility for in-memory filtering.

**Why pure functions?** They're trivially unit testable. You can call `computeSLAStatus({ status: 'In Transit', promisedDeliveryTime: someDate }, mockNow)` without a database connection.

#### `middleware/auth.js`
- **`protect`**: Reads `Authorization: Bearer <token>`, verifies with `jwt.verify()`, then looks up the user in MongoDB. The DB lookup is important — it catches cases where a user was deleted but their token is still valid.
- **`authorise(...roles)`**: A factory function. It returns a middleware function that checks `req.user.role`. Usage: `router.delete('/users/:id', protect, authorise('admin'), handler)`.

#### `middleware/errorHandler.js`
- **`asyncHandler(fn)`**: Wraps async route handlers in a `Promise.resolve().catch(next)`. Without this, an unhandled promise rejection in an async route won't reach the error handler — Express wouldn't know about it.
- **`errorHandler`**: Centralised error formatting. It handles Mongoose errors (duplicate key, validation, bad cast) and JWT errors. Stack traces are only included in `development` mode.

#### `controllers/orderController.js`
- **`getStats`**: Uses MongoDB's `$group` aggregation to count by status in a single query, plus a separate `countDocuments` for delayed. This is much faster than fetching all orders and counting in JavaScript.
- **`serializeOrder`**: Every time we return an order, we call `computeSLAStatus()` to compute the fresh SLA fields. This guarantees the response always reflects the current time.

---

### Frontend

#### `middleware.ts` (Next.js Edge)
This runs at the CDN edge *before* any page renders. It reads a cookie called `sts_auth`. If the cookie is absent on a protected route, the user is redirected to `/login`.

**Why a cookie instead of localStorage?** Next.js middleware runs in the Edge Runtime, which has no access to browser APIs like `localStorage`. Cookies are sent with every HTTP request, so they're readable at the edge.

**Important:** This cookie is a presence indicator only, not the actual JWT. The actual JWT is in `localStorage` and is validated by the Express API on every request. The cookie just prevents the page from rendering for unauthenticated users.

#### `hooks/useAuth.ts`
Manages auth state in React. On mount, it reads the stored user from `localStorage`. On login, it:
1. Calls the API
2. Stores the JWT in `localStorage`
3. Stores the user object in `localStorage`
4. Updates React state
5. Redirects to `/dashboard`

On logout: clears both storage items, clears state, redirects to `/login`.

#### `hooks/useOrders.ts`
Fetches orders and stats simultaneously using `Promise.all()` to minimise waterfalls. Sets up a `setInterval` for 30-second auto-refresh. The interval is cleaned up in the `useEffect` return function to prevent memory leaks.

#### `services/api/client.ts`
The Axios instance. Two interceptors:
1. **Request**: Reads `sts_token` from localStorage and injects it as `Authorization: Bearer`
2. **Response**: If any request returns `401`, clears auth data and redirects to `/login`

This means you'll never need to manually handle auth errors in individual components.

---

## 3. Data Flow — Frontend to Backend to DB

### Login Flow
```
User types email/password → LoginPage.handleSubmit()
  → useAuth.login()
    → authApi.login()
      → POST /api/auth/login
        → validate(loginSchema) middleware → strips unknown fields
        → authController.login()
          → User.findOne({ email }).select('+passwordHash')
          → user.comparePassword(password) → bcrypt.compare()
          → jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
          → res.json({ success: true, token, user })
      ← { token, user }
    ← token stored in localStorage
    ← user stored in localStorage
    ← cookie 'sts_auth=1' set for middleware
  ← router.push('/dashboard')
```

### Fetch Orders Flow
```
DashboardPage mounts → useOrders({ status, delayed, search })
  → Promise.all([
      ordersApi.list(params)     → GET /api/orders?status=...&delayed=...
      ordersApi.getStats()       → GET /api/orders/stats
    ])
    → protect middleware: verify JWT, attach req.user
    → orderController.listOrders()
      → Order.find(filter).sort().skip().limit().populate('createdBy')
      → orders.map(serializeOrder)
        → computeSLAStatus(order) called for EACH order
      → res.json({ orders, total, page, totalPages })
    ← orders array with isDelayed, delayDuration, timeUntilDue
  ← setOrders(orders), setStats(stats)
← Dashboard renders table with real-time SLA data
```

---

## 4. SLA Logic Breakdown

```javascript
computeSLAStatus(order, now = new Date())

// Step 1: Is the order in a terminal state?
if ['Delivered', 'Failed'].includes(order.status):
  return { isDelayed: false, ... }  // SLA irrelevant

// Step 2: Have we passed the deadline?
diffMs = now - order.promisedDeliveryTime
if diffMs > 0:
  // We're late!
  hours = floor(diffMs / 3600000)
  minutes = floor((diffMs % 3600000) / 60000)
  return { isDelayed: true, delayDuration: '2h 15m', ... }

// Step 3: Are we within the 60-minute warning window?
remainingMs = -diffMs  // deadline - now
if remainingMs <= 3600000:
  minutes = ceil(remainingMs / 60000)
  return { isDelayed: false, timeUntilDue: 'Due in 30m' }

// Step 4: On track, no urgency
return { isDelayed: false, ... }
```

**The 60-minute warning threshold** gives the operations team a heads-up before the breach happens, allowing them to escalate or contact the driver.

---

## 5. Authentication — How It Really Works

```
[Client]              [Next.js Middleware]        [Express API]
   |                        |                          |
   | -- login request ----> |                          |
   |                        | -- POST /auth/login -->  |
   |                        |                    verify password
   |                        |                    sign JWT (7d)
   |                        | <-- { token, user } --   |
   | <-- redirect to /dash  |                          |
   |                        |                          |
   | store token in localStorage                       |
   | set cookie sts_auth=1                             |
   |                        |                          |
   | -- GET /dashboard ---> |                          |
   |                   cookie present?                 |
   |                   yes → allow render              |
   |                        |                          |
   | -- GET /api/orders --> | -----------------------> |
   |                        |          read Auth header|
   |                        |          jwt.verify()    |
   |                        |          find user in DB |
   |                        |          attach req.user |
   |                        | <-- { orders } --------- |
   | <-- render data ----   |                          |
```

---

## 6. Why These Tech Choices

| Choice | Reason |
|---|---|
| **MongoDB** | Schema-free means we can add fields (e.g., GPS coordinates, carrier info) without migrations. Perfect for an evolving logistics product. |
| **Mongoose virtuals** | SLA is always derived from the current clock. Storing it would mean running a cron job every minute. Virtuals eliminate that infrastructure entirely. |
| **Joi validation** | Declarative schemas that are readable and composable. Catching invalid inputs at the API boundary protects the DB from bad data. |
| **Next.js App Router** | React Server Components allow future server-side rendering of the dashboard without client-side fetching overhead. |
| **Axios interceptors** | Centralise JWT injection and 401 handling. Without this, every API call would need identical error-handling code. |
| **Express asyncHandler** | Eliminates try/catch boilerplate in every controller function, reducing lines of code and human error. |

---

## 7. How the System Scales

### Current Architecture (Monolith)
Works well up to approximately:
- 10,000 active orders/month
- 50 concurrent users
- Single server instance

### Scaling Path

**Step 1 — Database Indexes** (already done)
The compound index `{ status, promisedDeliveryTime }` ensures the "delayed orders" query uses an index scan, not a collection scan.

**Step 2 — Horizontal Scaling**
Because JWT is stateless (no server-side session), you can run multiple Express instances behind a load balancer with zero configuration changes.

**Step 3 — Caching**
Add Redis for `GET /api/orders/stats`. Stats change infrequently but are read on every dashboard load. A 30-second TTL cache reduces MongoDB reads dramatically.

**Step 4 — Real-time Updates**
Replace 30-second polling with WebSockets (Socket.io). The server emits `order:updated` events when an order changes. Clients subscribe and update their UI instantly.

**Step 5 — Microservices**
Split the SLA computation into a separate `SLA Engine` service that subscribes to an event queue (Kafka). This allows the engine to scale independently if you have millions of orders.
