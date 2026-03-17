# Hostel Management System

This is a comprehensive Hostel Management System with a React frontend and Node.js/Express backend.

## Deployment on Vercel

The project is pre-configured for deployment on Vercel.

### Required Environment Variables

When deploying to Vercel, navigate to **Settings > Environment Variables** and add the following:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host address | `db.example.com` |
| `DB_NAME` | Name of the database | `hostel_db` |
| `DB_USER` | Database username | `admin` |
| `DB_PASS` | Database password | `********` |
| `DB_PORT` | Database port (default 3306) | `3306` |
| `DB_SSL` | Enable SSL for DB (true/false) | `true` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `NODE_ENV` | Environment name | `production` |
| `SYNC_DB` | Set to 'true' once to sync schema | `false` |

### Local Development

1. Install dependencies: `npm run install:all`
2. Configure frontend `.env` in `frontend/` (if using VITE_API_URL).
3. Configure backend `.env` in `backend/`.
4. Run locally: `npm run dev` (run from root if orchestrated, or individually in `frontend` and `backend`).

### Build Command

The root `package.json` handles the build process:
```bash
npm run build
```
