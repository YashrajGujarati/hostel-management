# 🏠 Hostel Sphere - Project Navigation Guide

This document contains all the essential links and credentials for navigating the Hostel Management system during development.

## 🚀 Service URLs

| Service | URL | Status |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost:5173](http://localhost:5173) | Development |
| **Backend API** | [http://localhost:5000/api](http://localhost:5000/api) | Development |

---

## 🔑 Default Credentials

Use these accounts to explore different features of the application:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@hostel.com` | `admin123` |
| **Student** | `banna@hostel.com` | `banna123` |

---

## 📞 Contact Information

| Detail | Value |
| :--- | :--- |
| **Address** | Munjka, Rajkot 360005 |
| **Phone** | +91 63556 99781 |
| **Email** | hello@hostelsphere.com |

---

## 🗺️ Application Routes

### Public Pages
- **Landing Page**: [`/`](http://localhost:5173/)
- **About Us**: [`/about`](http://localhost:5173/about)
- **Facilities**: [`/facilities`](http://localhost:5173/facilities)
- **Gallery**: [`/gallery`](http://localhost:5173/gallery)
- **Contact Us**: [`/contact`](http://localhost:5173/contact)
- **Booking**: [`/book`](http://localhost:5173/book)
- **Rules**: [`/rules`](http://localhost:5173/rules)
- **Login**: [`/login`](http://localhost:5173/login)
- **Signup**: [`/signup`](http://localhost:5173/signup)
- **Food Menu**: [`/food-menu`](http://localhost:5173/food-menu)

### Protected Pages (Requires Login)
- **Student Dashboard**: [`/dashboard`](http://localhost:5173/dashboard)
- **Rooms**: [`/rooms`](http://localhost:5173/rooms)
- **Complaints**: [`/complaints`](http://localhost:5173/complaints)
- **Fee Payment**: [`/pay-fees`](http://localhost:5173/pay-fees)
- **Profile**: [`/profile`](http://localhost:5173/profile)

### Admin Pages (Admin Only)
- **Admin Dashboard**: [`/admin`](http://localhost:5173/admin)

---

## 🛠️ Management Commands

To start the services manually, run the following from the root directory:

```bash
# Start both Backend and Frontend
./run.bat
```

Or individually:

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```
