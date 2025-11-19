# 🔍 How to Check Your MongoDB Database

## ✅ **Your MongoDB Connection is Working!**

Great news! Your MongoDB Atlas connection is successful. Here are all the ways you can check your database:

---

## 🌐 **1. MongoDB Atlas Web Interface (Recommended)**

### **Steps:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in with your account
3. Click on **"Cluster0"**
4. Click **"Browse Collections"** button
5. You'll see your database: **`medicine-adherence`**

### **What you'll see:**
- **`users`** collection - User accounts
- **`medicines`** collection - Medicine information  
- **`doses`** collection - Dose tracking data

---

## 🖥️ **2. API Endpoints (From Browser/Postman)**

### **Database Stats:**
```
GET http://localhost:5000/api/database/stats
```

### **Recent Data (requires login):**
```
GET http://localhost:5000/api/database/recent
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Health Check:**
```
GET http://localhost:5000/api/health
```

---

## 💻 **3. Command Line Script**

### **Run the database viewer:**
```bash
cd backend
node view-database.js
```

This will show you:
- Database statistics
- Collection counts
- Recent users, medicines, and doses
- Sample queries

---

## 🔧 **4. Test Your Save Medicine Feature**

### **Steps:**
1. **Start your servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend  
   npm run dev
   ```

2. **Open your app:**
   - Go to `http://localhost:5173`
   - Login with your credentials
   - Go to "Medicines" tab
   - Click "Add New Medicine"
   - Fill in the form and click "Save Medicine"

3. **Check the database:**
   - Go back to MongoDB Atlas
   - Refresh the collections view
   - You'll see your new medicine in the `medicines` collection!

---

## 📊 **5. MongoDB Compass (Desktop GUI)**

### **Download & Install:**
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Use connection string: `mongodb+srv://hanush:Hanush@2005@cluster0.z70jnke.mongodb.net/medicine-adherence`
3. Connect and browse your data with a beautiful GUI

---

## 🎯 **What You Should See**

### **After adding a medicine:**
```json
{
  "_id": "ObjectId",
  "userId": "your-user-id",
  "name": "dolo650",
  "dosage": "1 tablet",
  "times": ["10:00"],
  "schedule": {
    "startDate": "2025-10-05",
    "endDate": "2025-10-07"
  },
  "isActive": true,
  "createdAt": "2025-10-04T...",
  "updatedAt": "2025-10-04T..."
}
```

### **Database Collections:**
- **users** - User profiles and authentication
- **medicines** - Medicine information and schedules
- **doses** - Individual dose tracking records

---

## 🚀 **Quick Test**

1. **Add a medicine** through your app
2. **Check MongoDB Atlas** - you'll see it immediately!
3. **Run the viewer script** - it will show the count increased

Your database is working perfectly! The "Save Medicine" button should now work without any issues. 🎉

---

## 🔍 **Sample Queries (Advanced)**

If you want to run queries directly:

```javascript
// Find all medicines
db.medicines.find()

// Find medicines for a specific user
db.medicines.find({ userId: "USER_ID" })

// Find today's doses
db.doses.find({ date: new Date() })

// Find taken doses
db.doses.find({ status: "taken" })
```

Your MongoDB setup is complete and working! 🚀💊


