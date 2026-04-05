# Finance Dashboard API

A backend REST API for a finance dashboard system with role-based access control, built with Node.js, Express, Prisma ORM, and PostgreSQL (hosted on Neon).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL via Neon (serverless) |
| Auth | JWT (jsonwebtoken) |
| Validation | Zod |
| Password hashing | bcryptjs |

---

## Project Structure

```
finance-dashboard-api/
├── prisma/
│   ├── schema.prisma       # All DB models and enums
│   └── seed.js             # Seeds admin, analyst, viewer + categories
├── src/
│   ├── config/
│   │   └── prisma.js       # Prisma client singleton
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT verification
│   │   ├── rbac.middleware.js     # Role-based access control
│   │   ├── validate.middleware.js # Zod validation factory
│   │   └── error.middleware.js    # Global error handler + AppError
│   ├── validations/
│   │   └── schemas.js      # All Zod schemas
│   ├── services/           # Business logic (no Express deps)
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── transaction.service.js
│   │   ├── category.service.js
│   │   └── dashboard.service.js
│   ├── controllers/        # HTTP layer — calls services, sends responses
│   ├── routes/             # Route definitions with middleware chains
│   └── app.js              # Express setup, route mounting, server start
├── .env.example
├── .gitignore
└── package.json
```

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd finance-dashboard-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
```

Get your `DATABASE_URL` from the **Neon dashboard** → your project → Connection string.

### 3. Push schema and generate Prisma client

```bash
npm run db:push       # Pushes schema to Neon DB
npm run db:generate   # Generates Prisma client
```

### 4. Seed the database

```bash
node prisma/seed.js
```

This creates 3 test users and 12 default categories.

### 5. Start the server

```bash
npm run dev    # Development (nodemon)
npm start      # Production
```

---

## Roles and Permissions

| Action | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| View own transactions | ✅ | ✅ | ✅ |
| View all transactions | ❌ | ❌ | ✅ |
| Create transactions | ❌ | ✅ | ✅ |
| Update transactions | ❌ | ✅ (own) | ✅ (any) |
| Delete transactions | ❌ | ❌ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View analytics (trends, categories) | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Manage categories | ❌ | ❌ | ✅ |

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |

**POST /api/auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "VIEWER"   // optional, defaults to VIEWER
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

---

### Users (ADMIN only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update role or status |
| DELETE | `/api/users/:id` | Delete user |

**PATCH /api/users/:id**
```json
{
  "role": "ANALYST",
  "status": "INACTIVE"
}
```

---

### Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | Any role | List all categories |
| POST | `/api/categories` | ADMIN | Create category |
| DELETE | `/api/categories/:id` | ADMIN | Delete category |

**POST /api/categories**
```json
{
  "name": "Salary",
  "type": "INCOME"
}
```

---

### Transactions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/transactions` | Any role | List transactions (filtered/paginated) |
| GET | `/api/transactions/:id` | Any role | Get transaction by ID |
| POST | `/api/transactions` | ANALYST+ | Create transaction |
| PATCH | `/api/transactions/:id` | ANALYST+ | Update transaction |
| DELETE | `/api/transactions/:id` | ADMIN | Soft delete transaction |

**Query parameters for GET /api/transactions:**

| Param | Example | Description |
|---|---|---|
| `type` | `INCOME` or `EXPENSE` | Filter by type |
| `categoryId` | `clxxx...` | Filter by category |
| `startDate` | `2024-01-01` | Filter from date |
| `endDate` | `2024-12-31` | Filter to date |
| `page` | `1` | Page number |
| `limit` | `10` | Results per page |

**POST /api/transactions**
```json
{
  "amount": 5000,
  "type": "INCOME",
  "categoryId": "category-id-here",
  "description": "Monthly salary",
  "date": "2024-03-01T00:00:00.000Z"
}
```

---

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Any role | Total income, expenses, net balance |
| GET | `/api/dashboard/recent` | Any role | Recent transactions |
| GET | `/api/dashboard/categories` | ANALYST+ | Totals grouped by category |
| GET | `/api/dashboard/monthly?year=2024` | ANALYST+ | Monthly income/expense trends |
| GET | `/api/dashboard/weekly` | ANALYST+ | Last 7 days breakdown |

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [           // only on validation failures
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

## Success Response Format

```json
{
  "success": true,
  "data": { ... }
}
```

Paginated responses also include:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## Design Decisions & Assumptions

- **Soft delete on transactions**: Transactions are never hard-deleted — `isDeleted: true` flag is set instead. This preserves data integrity for financial records.
- **Category-type consistency**: A transaction's type must match its category's type (e.g., you cannot assign an EXPENSE category to an INCOME transaction).
- **Role hierarchy**: Roles are hierarchical — ADMIN > ANALYST > VIEWER. Higher roles inherit all permissions of lower roles.
- **Scope isolation**: Non-admin users can only see and modify their own transactions. Admins see everything.
- **Password never returned**: The `password` field is excluded from all user query selects.
- **JWT payload is minimal**: Only `userId` is stored in the token. Full user data is always fetched fresh from DB on each request (catches status changes).
- **Neon DB**: Uses `?sslmode=require` in the connection string — required for Neon's serverless PostgreSQL.

---

## Seeded Test Credentials

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@finance.com | admin123 |
| ANALYST | analyst@finance.com | analyst123 |
| VIEWER | viewer@finance.com | viewer123 |
