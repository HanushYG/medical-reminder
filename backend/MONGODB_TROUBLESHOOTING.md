# 🚨 MongoDB Connection Troubleshooting Guide

## ❌ **Current Issue: Authentication Failed**

Your MongoDB connection is failing due to authentication issues. Here's how to fix it:

---

## 🔧 **Step 1: Verify Your MongoDB Atlas Credentials**

### **Check Your Atlas Dashboard:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Database Access"** in the left sidebar
3. Find your user `hanush`
4. **Click "Edit"** on the user
5. **Note down the exact username and password**

### **Common Issues:**
- ❌ Username might be different (case-sensitive)
- ❌ Password might have changed
- ❌ Special characters in password need encoding
- ❌ User might not have proper permissions

---

## 🔧 **Step 2: Check Your Connection String**

### **Current Connection String:**
```
mongodb+srv://hanush:Hanush%402005@cluster0.z70jnke.mongodb.net/medicine-adherence
```

### **Password Encoding Issues:**
If your password contains special characters, they need URL encoding:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- ` ` (space) → `%20`

---

## 🔧 **Step 3: Test Different Connection Strings**

### **Option 1: Reset Your Password**
1. Go to Atlas → Database Access
2. Click "Edit" on user `hanush`
3. Click "Edit Password"
4. Create a simple password (no special characters)
5. Update your `config.env` file

### **Option 2: Create a New Database User**
1. Go to Atlas → Database Access
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a simple username: `medtracker`
5. Create a simple password: `medtracker123`
6. Give it "Read and write to any database" permissions
7. Update your connection string

---

## 🔧 **Step 4: Update Your Connection String**

### **For New User:**
```env
MONGODB_URI=mongodb+srv://medtracker:medtracker123@cluster0.z70jnke.mongodb.net/medicine-adherence?retryWrites=true&w=majority&appName=Cluster0
```

### **For Current User (if password is simple):**
```env
MONGODB_URI=mongodb+srv://hanush:SIMPLE_PASSWORD@cluster0.z70jnke.mongodb.net/medicine-adherence?retryWrites=true&w=majority&appName=Cluster0
```

---

## 🔧 **Step 5: Check Network Access**

1. Go to Atlas → **"Network Access"**
2. Make sure your IP address is whitelisted
3. Or add `0.0.0.0/0` for all IPs (less secure but works for testing)

---

## 🔧 **Step 6: Test the Connection**

After updating your credentials:

```bash
cd backend
node test-connection.js
```

---

## 🎯 **Quick Fix Recommendations**

### **Recommended Approach:**
1. **Create a new user** in Atlas with simple credentials
2. **Update the connection string** in `config.env`
3. **Test the connection**
4. **Restart your server**

### **Simple Test User:**
- **Username:** `medtracker`
- **Password:** `medtracker123`
- **Permissions:** Read and write to any database

---

## 📊 **Once Connected, You'll See:**

### **In MongoDB Atlas:**
- Database: `medicine-adherence`
- Collections: `users`, `medicines`, `doses`

### **In Your App:**
- Save Medicine button will work
- Data will persist in MongoDB
- All CRUD operations will function

---

## 🆘 **Still Having Issues?**

1. **Double-check your Atlas credentials**
2. **Try creating a completely new user**
3. **Use a simple password without special characters**
4. **Verify your IP is whitelisted**
5. **Check if your cluster is running**

---

## 🚀 **After Fixing:**

1. **Test connection:** `node test-connection.js`
2. **Start server:** `npm start`
3. **Test app:** Add a medicine through your frontend
4. **Check Atlas:** You'll see your data immediately!

The issue is definitely with authentication - once we get the right credentials, everything will work perfectly! 🎉


