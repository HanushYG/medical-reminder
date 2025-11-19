# Troubleshooting Guide

## Network Error: "Failed to load patients: Failed to fetch"

This error occurs when the frontend cannot connect to the backend server. Follow these steps:

### Step 1: Verify Backend is Running

1. Open a terminal and navigate to the project directory
2. Run: `cd backend && npm run dev`
3. You should see:
   ```
   Mongoose connected to MongoDB
   MongoDB Connected: ...
   Server is running on port 5002
   ```

### Step 2: Check Port Conflicts

If you see "EADDRINUSE" error:

1. Find the process using the port:
   ```bash
   netstat -ano | findstr :5002
   ```

2. Kill the process (replace PID with the actual process ID):
   ```bash
   taskkill /PID <PID> /F
   ```

3. Or use this one-liner:
   ```bash
   for /f "tokens=5" %a in ('netstat -aon ^| findstr :5002') do taskkill /f /pid %a
   ```

### Step 3: Verify Configuration

Check these files have the correct port (5002):

1. **backend/config.env**
   ```
   PORT=5002
   ```

2. **backend/server.js** (line 18)
   ```javascript
   const PORT = 5002;
   ```

3. **.env** (root directory)
   ```
   VITE_API_URL=http://localhost:5002
   ```

4. **src/service/api.js** (line 2)
   ```javascript
   const API_BASE = 'http://localhost:5002/api';
   ```

5. **src/auth/AuthContext.jsx** (lines 21 and 73)
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
   ```

### Step 4: Test Backend Connection

1. Make sure backend is running
2. Open `test-backend.html` in your browser
3. Click "Test Health Endpoint"
4. You should see a success message

### Step 5: Clear Cache and Restart

1. Stop all running servers (Ctrl+C)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close all terminals
4. Run: `start-app.bat` or `npm run dev`

### Step 6: Check MongoDB Connection

Ensure your MongoDB connection string in `backend/config.env` is correct:
```
MONGODB_URI=mongodb+srv://...
```

### Step 7: Check CORS Settings

In `backend/server.js`, verify CORS allows your frontend port:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
```

## Quick Start

1. Double-click `start-app.bat`
2. Wait for both servers to start
3. Open browser to `http://localhost:5174`

## Manual Start

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
npm run dev-frontend
```

## Common Issues

### Issue: "Cannot find module"
**Solution:** Run `npm install` in both root and backend directories

### Issue: "MongoDB connection failed"
**Solution:** Check your internet connection and MongoDB Atlas credentials

### Issue: "Port already in use"
**Solution:** Follow Step 2 above to kill the process using the port

### Issue: Login shows "Network error"
**Solution:** 
1. Check browser console (F12) for detailed error
2. Verify backend is running and accessible
3. Check all configuration files have port 5002
