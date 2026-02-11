# Plant Store Backend

Node.js + Express API with JWT auth and MongoDB database.

## Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Set `MONGODB_URI` to your MongoDB connection string
     - Local: `mongodb://localhost:27017/plant-store`
     - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/plant-store?retryWrites=true&w=majority`

3. **Seed users (run once):**
```bash
npm run seed
```

Creates:
- **Admin:** `admin@forest.com` / `admin123`
- **Client:** `client@forest.com` / `client123`

## Run

```bash
npm run dev   # with watch
# or
npm start
```

API: `http://localhost:3000`

**Note:** Make sure MongoDB is running before starting the server.

## Endpoints

- `POST /api/auth/login` — body: `{ email, password }`
- `POST /api/auth/register` — body: `{ email, password, name? }`
- `GET /api/auth/me` — Bearer token required

- `GET /api/plants` — list plants (public)
- `GET /api/plants/:id` — get plant (public)
- `POST /api/plants` — create (admin)
- `PUT /api/plants/:id` — update (admin)
- `DELETE /api/plants/:id` — delete (admin)

- `GET /api/orders` — my orders (client)
- `GET /api/orders/all` — all orders (admin)
- `GET /api/orders/:id` — get order (auth)
- `POST /api/orders` — create order, body: `{ items: [{ plantId, quantity }] }` (client)
- `PATCH /api/orders/:id/status` — body: `{ status }` (admin)
