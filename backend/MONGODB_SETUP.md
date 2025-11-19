# MongoDB Setup Guide for Medicine Adherence App

## 🚀 Quick Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Update `backend/config.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medicine-adherence?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB Installation

#### Windows:
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install MongoDB
3. Start MongoDB service:
   ```bash
   net start MongoDB
   ```
4. MongoDB will run on `mongodb://localhost:27017`

#### macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 🔧 Configuration

### Environment Variables
Update `backend/config.env`:
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/medicine-adherence

# MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medicine-adherence?retryWrites=true&w=majority
```

### Database Structure
The app will automatically create these collections:
- `users` - User accounts and profiles
- `medicines` - Medicine information and schedules
- `doses` - Dose tracking and adherence data

## 📊 MongoDB Models

### User Model
- Email, role, profile information
- Preferences and settings
- Activity tracking

### Medicine Model
- Medicine details and dosage
- Schedule information
- Side effects and interactions

### Dose Model
- Individual dose tracking
- Status (taken, missed, skipped)
- Timestamps and notes

## 🚀 Starting the Application

1. Make sure MongoDB is running
2. Start the backend:
   ```bash
   cd backend
   npm start
   ```
3. The app will automatically connect to MongoDB

## 🔍 Database Operations

### Using MongoDB Compass (GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to your MongoDB instance
3. Browse and manage your data visually

### Using MongoDB Shell
```bash
# Connect to local MongoDB
mongosh

# Connect to MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/medicine-adherence"

# Show databases
show dbs

# Use medicine-adherence database
use medicine-adherence

# Show collections
show collections

# Query users
db.users.find()

# Query medicines
db.medicines.find()

# Query doses
db.doses.find()
```

## 📈 Performance Features

### Indexes
The models include optimized indexes for:
- User lookups by email
- Medicine queries by user and date
- Dose queries by user, date, and status

### Aggregation Pipelines
- Adherence statistics
- Date range queries
- User analytics

## 🛡️ Security Features

### Data Validation
- Schema validation with Mongoose
- Email format validation
- Required field validation
- Enum validation for roles and statuses

### Data Protection
- Password hashing (when implemented)
- JWT token authentication
- Role-based access control

## 🔄 Migration from SQLite

The app has been updated to use MongoDB instead of SQLite:
- All database operations now use Mongoose ODM
- Models provide better data validation
- Improved query performance with indexes
- Better scalability for production use

## 📝 Sample Queries

### Find user's medicines
```javascript
db.medicines.find({ userId: ObjectId("user_id"), isActive: true })
```

### Find today's doses
```javascript
db.doses.find({
  userId: ObjectId("user_id"),
  date: {
    $gte: new Date("2024-01-01"),
    $lt: new Date("2024-01-02")
  }
})
```

### Get adherence statistics
```javascript
db.doses.aggregate([
  {
    $match: {
      userId: ObjectId("user_id"),
      date: { $gte: new Date("2024-01-01"), $lte: new Date("2024-01-31") }
    }
  },
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
])
```

## 🆘 Troubleshooting

### Connection Issues
1. Check if MongoDB is running
2. Verify connection string in config.env
3. Check firewall settings
4. Ensure network connectivity (for Atlas)

### Authentication Issues
1. Verify username/password for Atlas
2. Check IP whitelist settings
3. Ensure proper connection string format

### Performance Issues
1. Check if indexes are created
2. Monitor query performance
3. Consider connection pooling

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/)


