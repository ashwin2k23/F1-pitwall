# F1 Personal Dashboard

The ultimate personal dashboard for tracking the Formula 1 season. Built with the MERN stack (MongoDB, Express, React, Node.js) featuring modern 2025 SaaS aesthetics (glassmorphism, subtle gradients, dark mode default) and highly interactive Framer Motion animations.

## Features

- **Authentication**: JWT-based sign up and login.
- **Race Calendar**: Interactive countdown to the next scheduled race.
- **Standings Visualization**: Driver points tracking using Recharts.
- **Drag-and-Drop Dashboard**: Rearrange your data widgets securely.
- **Custom Preferences**: Change favorite team and driver, saving directly to your account.
- **Glassmorphism UI**: Beautiful, immersive Framer Motion powered dashboard experience.

## Installation Steps

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or Local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/f1-dashboard.git
cd f1-dashboard
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Configure your Environment variables (see section below), then start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Configure your Environment variables, then start Vite:
```bash
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/f1dashboard
JWT_SECRET=supersecret_f1_dashboard_key2025
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `/frontend` directory:
```env
VITE_API_URL=http://localhost:5000
```

## Deployment Guide

### Vercel (Frontend)
1. Push your repository to GitHub.
2. Sign in to Vercel and import your repository.
3. Configure settings: 
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
4. Add Environment Variable: `VITE_API_URL` pointing to your Render backend URL.
5. Deploy.

### Render (Backend)
1. Sign in to Render and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`).
5. Deploy.

### MongoDB Atlas
1. Create a new cluster on MongoDB Atlas.
2. Under "Database Access", create a database user and securely store the password.
3. Under "Network Access", allow access from anywhere (`0.0.0.0/0`) since Render uses dynamic IPs.
4. Click "Connect" on your cluster, select "Connect your application", and copy the generated `MONGO_URI` connection string to your Render/Backend `.env` variables.
