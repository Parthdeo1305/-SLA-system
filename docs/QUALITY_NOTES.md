# Quality Notes — Shipment Tracking System

---

## 1. Test Cases

### Authentication

| # | Test Case | Input | Expected Output |
|---|---|---|---|
| A1 | Register with valid data | name, email, password, role | 201 + JWT + user object |
| A2 | Register with duplicate email | existing email | 409 + "Email already registered" |
| A3 | Register with weak password | "password" (no uppercase, no number) | 400 + validation details |
| A4 | Login with correct credentials | valid email + password | 200 + JWT |
| A5 | Login with wrong password | valid email + wrong password | 401 + "Invalid email or password" |
| A6 | Login with non-existent email | unknown email | 401 + "Invalid email or password" (same msg, no enumeration) |
| A7 | Access /api/orders without JWT | no Authorization header | 401 + "No token provided" |
| A8 | Access /api/orders with expired JWT | expired token | 401 + "Token has expired" |
| A9 | Access /api/orders with malformed JWT | garbled token | 401 + "Invalid token" |

### Order Management

| # | Test Case | Input | Expected Output |
|---|---|---|---|
| O1 | Create order with all fields | customerName, promisedDeliveryTime | 201 + order with auto-assigned orderId |
| O2 | Create order with past SLA | promisedDeliveryTime in the past | 400 + "Delivery time must be in the future" |
| O3 | Create order without customerName | missing field | 400 + "Customer name is required" |
| O4 | List all orders | GET /api/orders | 200 + paginated array |
| O5 | Filter by status | ?status=In+Transit | Only In Transit orders |
| O6 | Filter delayed only | ?delayed=true | Orders past deadline with non-terminal status |
| O7 | Search by customer name | ?search=Acme | Orders matching "Acme" (case-insensitive) |
| O8 | Get single order | GET /api/orders/:id | 200 + full order object with SLA fields |
| O9 | Get non-existent order | GET /api/orders/fakeid | 404 + "Order not found" |
| O10 | Advance status (valid) | PATCH status: "Picked" (from "Created") | 200 + updated order |
| O11 | Invalid status transition | PATCH status: "Delivered" (from "Created") | 400 + "Cannot transition..." |
| O12 | Reverse status | PATCH status: "Created" (from "Delivered") | 400 + transition error |

### SLA Logic

| # | Test Case | Scenario | Expected |
|---|---|---|---|
| S1 | Order past deadline, In Transit | promisedDeliveryTime = 3h ago, status = In Transit | isDelayed=true, delayDuration="3h 0m" |
| S2 | Order past deadline, Delivered | promisedDeliveryTime = 3h ago, status = Delivered | isDelayed=false (terminal status) |
| S3 | Order due in 30 minutes | promisedDeliveryTime = now + 30m, status = In Transit | isDelayed=false, timeUntilDue="Due in 30m" |
| S4 | Order due in 65 minutes | promisedDeliveryTime = now + 65m | isDelayed=false, timeUntilDue=null (outside window) |
| S5 | Order just crossed deadline (<1m) | promisedDeliveryTime = now - 30s | isDelayed=true, delayDuration="< 1m" |
| S6 | Failed order, past deadline | status = Failed | isDelayed=false (terminal) |
| S7 | Created order, past deadline | status = Created | isDelayed=true (non-terminal) |
| S8 | Delay duration formatting | diffMs = 0 | "< 1m" |
| S9 | Delay duration formatting | diffMs = 90min | "1h 30m" |
| S10 | Delay duration formatting | diffMs = 120min exactly | "2h" |

### Frontend / UX Edge Cases

| # | Test Case | Expected |
|---|---|---|
| F1 | Access /dashboard without login | Redirect to /login |
| F2 | Access /login when already logged in | Redirect to /dashboard |
| F3 | Logout while on dashboard | Clear storage, clear cookie, redirect to /login |
| F4 | 401 response from API mid-session | Global interceptor clears auth and redirects to /login |
| F5 | API server down | Error state in dashboard with retry button |
| F6 | Create order with empty customer name | Client-side validation shows inline error |
| F7 | 30-second auto-refresh | Orders table updates without full page reload |

---

## 2. Security Considerations

### Password Security
- **bcrypt cost factor 12**: Deliberately slow to make brute-force attacks impractical. At cost 12, one hash takes ~300ms on modern hardware — 300ms × millions of attempts = infeasible.
- **Hash-only storage**: `passwordHash` is never returned in API responses due to Mongoose `select: false` and `toJSON.transform`. Even if the response object is serialised incorrectly, it's stripped.
- **Generic error messages**: Login returns "Invalid email or password" whether the email doesn't exist or the password is wrong. This prevents user enumeration attacks where an attacker tests valid emails.

### JWT Security
- **7-day expiry**: Balances usability (users don't log in every day) with security.
- **Secret via env var**: JWT_SECRET is never hardcoded. In production, use a 256-bit random string.
- **No sensitive data in payload**: The JWT payload only contains `{ id: userId }`. No email, no role. These are fetched fresh from the DB on each request.
- **Future improvement**: Add refresh tokens with rotation and a short (15m) access token expiry.

### API Security
- **Helmet.js**: Sets security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, etc.
- **Rate limiting**: 100 req/15min general, 10 req/15min on auth endpoints. Prevents brute-force login attacks.
- **CORS whitelist**: Only origins in `ALLOWED_ORIGINS` env var can make requests. All others receive a CORS error.
- **Joi input stripping**: `stripUnknown: true` removes any extra fields from the request body. This prevents prototype pollution and unexpected data reaching the DB.
- **10KB body limit**: `express.json({ limit: '10kb' })` prevents large-payload DoS attacks.

### Input Validation
- All inputs are validated server-side with Joi, even if client-side validation passes.
- Mongoose schema validators provide a third layer.

---

## 3. Performance Assumptions

| Metric | Assumption | Justification |
|---|---|---|
| Order write throughput | < 100 orders/hour | One logistics company, manual data entry |
| Concurrent users | < 50 | Operations team + warehouse staff |
| Monthly active orders | < 10,000 | Single-tenant, single region |
| API response time | < 200ms (p95) | MongoDB + compound index + no N+1 |
| Dashboard load time | < 1.5s | Two parallel API calls, small payloads |

The compound index `{ status: 1, promisedDeliveryTime: 1 }` is the most critical performance decision. Without it, filtering for delayed orders would be a full collection scan. With it, MongoDB can efficiently find all non-terminal orders past a given timestamp.

---

## 4. Known Limitations (v1.0)

1. **No refresh tokens**: Logging out from one tab doesn't invalidate tokens in other tabs.
2. **Polling, not push**: The 30-second refresh interval means updates can take up to 30 seconds to appear. WebSockets would eliminate this lag.
3. **Single-tenant**: All users see all orders. Multi-tenancy (organisation isolation) is not implemented.
4. **No audit log**: Order status changes are not logged with who made the change (only `updatedAt` is tracked).
5. **No email notifications**: No automated alerts when an order is delayed.

---

## 5. Future Improvements Roadmap

### v1.1 — Quick Wins
- [ ] Audit log: log every status change with userId, old status, new status, timestamp
- [ ] Email notifications via SendGrid when an order is delayed
- [ ] Refresh token rotation (15m access token, 7d refresh token)
- [ ] Export to CSV: download filtered order list

### v1.2 — Operational Intelligence
- [ ] **Real-time updates via WebSockets** (Socket.io): push order changes to all connected clients instantly
- [ ] SLA performance analytics: on-time delivery rate by week/month
- [ ] "At Risk" category: orders due in under 2 hours with status < In Transit
- [ ] Bulk status update: select multiple orders and advance all at once

### v2.0 — Scale & Integration
- [ ] **Kafka for event streaming**: Order status changes publish to a topic; SLA engine, notification service, and analytics service all subscribe independently
- [ ] **Multi-tenancy**: Organisation isolation with subdomain routing
- [ ] **Carrier API integration**: Auto-update status from DHL/FedEx/UPS tracking APIs
- [ ] **Microservices split**: Separate Auth, Orders, SLA Engine, Notifications into independent services
- [ ] **GPS tracking**: Live map view of In Transit shipments
- [ ] **Mobile app**: React Native app for warehouse staff (barcode scanner integration)
- [ ] **Penalty calculator**: Automatically calculate financial exposure from delayed orders based on contract terms

### Architecture Evolution (Monolith → Microservices)
```
v1.0: Monolith
  [Next.js] → [Express + MongoDB]

v2.0: Service-Oriented
  [Next.js] → [API Gateway (Kong)]
                ├── [Auth Service]       → [Users DB]
                ├── [Orders Service]     → [Orders DB]
                ├── [SLA Engine]         ← [Kafka: order.updated]
                ├── [Notification Svc]   ← [Kafka: sla.breached]
                └── [Analytics Service]  ← [Kafka: order.*]
```

The monolith-first approach is intentional. Don't split before you have real traffic data showing which service needs independent scaling.
