# Hostel Management System

This is a comprehensive Hostel Management System with a React frontend and Node.js/Express backend.

## Deployment on Vercel

The project is pre-configured for deployment on Vercel.

### Required Environment Variables

When deploying to Vercel, navigate to **Settings > Environment Variables** and add the following:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/hostel_db?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `NODE_ENV` | Environment name | `production` |
| `SYNC_DB` | Set to `true` once to seed data on startup | `false` |

### Local Development

1. Install dependencies: `npm run install:all`
2. Configure frontend `.env` in `frontend/` (if using `VITE_API_URL`).
3. Configure backend `.env` in `backend/` with at least `MONGO_URI` and `JWT_SECRET`.
4. Run locally: `npm run dev` (run from root if orchestrated, or individually in `frontend` and `backend`).

### Build Command

The root `package.json` handles the build process:
```bash
npm run build
```
