# How to Run Medicine Adherence Reminder

## 🚀 Quick Start (Every Time You Want to Run)

### **Option 1: Double-Click Method** (Easiest)
1. Double-click `start-app.bat`
2. Wait for servers to start
3. Open browser to `http://localhost:5173`

### **Option 2: Command Line Method**
```bash
# In project directory
npm run dev
```

Then open: `http://localhost:5173`

---

## 📋 Step-by-Step Instructions

### **First Time Setup** (Only Once)

1. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

2. **Configure Environment**
   - Make sure `.env` file exists with:
     ```
     VITE_API_URL=http://localhost:5002
     ```
   - Make sure `backend/config.env` has your MongoDB connection

### **Every Time You Run**

#### **Starting:**
```bash
npm run dev
```

#### **Stopping:**
- Press `Ctrl + C` in the terminal
- OR double-click `stop-servers.bat`

---

## 🔧 Troubleshooting

### **Problem: "Port Already in Use" Error**

**Solution 1: Use the stop script**
```bash
stop-servers.bat
npm run dev
```

**Solution 2: Manual command**
```bash
powershell -Command "Get-NetTCPConnection -LocalPort 5002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }"
npm run dev
```

### **Problem: "Cannot find module" Error**

**Solution:**
```bash
npm install
cd backend && npm install && cd ..
npm run dev
```

### **Problem: "Network Error" in Browser**

**Solution:**
1. Check if backend is running (should see "Server is running on port 5002")
2. Check if MongoDB is connected (should see "MongoDB Connected")
3. Verify `.env` has `VITE_API_URL=http://localhost:5002`

### **Problem: Frontend shows blank page**

**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Make sure you're on `http://localhost:5173` (not 5174)
4. Clear browser cache (Ctrl + Shift + Delete)

---

## 📁 Helpful Files

- **start-app.bat** - Starts both servers
- **stop-servers.bat** - Stops all running servers
- **test-backend.html** - Test if backend is working
- **TROUBLESHOOTING.md** - Detailed troubleshooting guide
- **FIXES_APPLIED.md** - Documentation of all fixes

---

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002/api
- **Health Check**: http://localhost:5002/api/health

---

## ⚙️ Configuration

### **Ports Used:**
- Frontend: `5173` (or `5174` if 5173 is busy)
- Backend: `5002`

### **Environment Variables:**
- `.env` - Frontend configuration
- `backend/config.env` - Backend configuration

---

## 🎯 Common Workflow

### **Daily Development:**
```bash
# 1. Start servers
npm run dev

# 2. Open browser
# http://localhost:5173

# 3. Make changes to code
# (Vite will auto-reload frontend)
# (Nodemon will auto-reload backend)

# 4. When done, stop servers
# Press Ctrl+C in terminal
```

### **If Servers Won't Start:**
```bash
# 1. Stop all servers
stop-servers.bat

# 2. Start fresh
npm run dev
```

### **If You See Errors:**
```bash
# 1. Check browser console (F12)
# 2. Check terminal for backend errors
# 3. Refer to TROUBLESHOOTING.md
```

---

## 📝 Quick Reference

| Action | Command |
|--------|---------|
| Start everything | `npm run dev` |
| Start frontend only | `npm run dev-frontend` |
| Start backend only | `cd backend && npm run dev` |
| Stop servers | `Ctrl + C` or `stop-servers.bat` |
| Kill port 5002 | `stop-servers.bat` |
| Test backend | Open `test-backend.html` |
| Install dependencies | `npm install` |

---

## ✅ Checklist Before Running

- [ ] Node.js is installed
- [ ] Dependencies are installed (`npm install`)
- [ ] `.env` file exists with correct port
- [ ] `backend/config.env` has MongoDB connection string
- [ ] No other apps using port 5002 or 5173
- [ ] Internet connection (for MongoDB Atlas)

---

## 🆘 Need Help?

1. Check `TROUBLESHOOTING.md` for detailed solutions
2. Check browser console (F12) for frontend errors
3. Check terminal for backend errors
4. Verify all configuration files have correct ports (5002)

---

**Happy Coding! 🎉**
