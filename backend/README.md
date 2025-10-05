# Medicine Adherence Reminder - Backend API

A Node.js/Express backend API for the Medicine Adherence Reminder application.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Medicine Management**: CRUD operations for medicines with scheduling
- **Dose Tracking**: Track medication adherence with timestamps
- **Analytics**: Comprehensive analytics and reporting
- **Database**: SQLite database with proper relationships
- **Security**: Rate limiting, CORS, helmet security headers

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Medicines
- `GET /api/medicines` - Get all medicines for user
- `GET /api/medicines/:id` - Get specific medicine
- `POST /api/medicines` - Create new medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Doses
- `GET /api/doses/date/:date` - Get doses for specific date
- `GET /api/doses/history` - Get dose history
- `PUT /api/doses/:id` - Update dose status
- `PUT /api/doses/bulk/:date` - Bulk update doses for date

### Analytics
- `GET /api/analytics/adherence` - Get adherence analytics
- `GET /api/analytics/medicines` - Get medicine-specific analytics
- `GET /api/analytics/summary` - Get adherence summary
- `GET /api/analytics/trends` - Get trend analysis

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `config.env` and update the JWT_SECRET
   - Update PORT if needed (default: 5000)

4. Start the server:
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` by default.

## Database Schema

### Users Table
- `id` (TEXT, PRIMARY KEY)
- `email` (TEXT, UNIQUE, NOT NULL)
- `role` (TEXT, NOT NULL) - 'patient', 'caregiver', 'doctor'
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### Medicines Table
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `name` (TEXT, NOT NULL)
- `dosage` (TEXT)
- `times` (TEXT, JSON array)
- `start_date` (DATE)
- `end_date` (DATE)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### Doses Table
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `medicine_id` (TEXT, FOREIGN KEY)
- `date` (TEXT, NOT NULL)
- `time` (TEXT, NOT NULL)
- `status` (TEXT, NOT NULL) - 'Taken', 'Not taken', 'Missed'
- `timestamp` (DATETIME)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## API Usage Examples

### Authentication
```javascript
// Signup
const response = await fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    role: 'patient'
  })
});

// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    role: 'patient'
  })
});

const { token } = await response.json();
```

### Medicines
```javascript
// Get all medicines
const response = await fetch('http://localhost:5000/api/medicines', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Create medicine
const response = await fetch('http://localhost:5000/api/medicines', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Aspirin',
    dosage: '100mg',
    times: ['08:00', '20:00'],
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  })
});
```

### Doses
```javascript
// Get today's doses
const today = new Date().toISOString().slice(0, 10);
const response = await fetch(`http://localhost:5000/api/doses/date/${today}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Update dose status
const response = await fetch(`http://localhost:5000/api/doses/${doseId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'Taken'
  })
});
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domains
- **Helmet**: Security headers
- **Input Validation**: Express-validator for request validation
- **SQL Injection Protection**: Parameterized queries

## Error Handling

The API returns consistent error responses:
```json
{
  "error": "Error message",
  "message": "Detailed message (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### File Structure
```
backend/
├── database/
│   ├── db.js          # Database connection and initialization
│   └── medicine_adherence.db  # SQLite database file
├── middleware/
│   └── auth.js        # Authentication middleware
├── routes/
│   ├── auth.js        # Authentication routes
│   ├── medicines.js   # Medicine CRUD routes
│   ├── doses.js       # Dose tracking routes
│   └── analytics.js   # Analytics routes
├── config.env         # Environment variables
├── package.json       # Dependencies and scripts
├── server.js          # Main server file
└── README.md          # This file
```

### Adding New Features

1. Create route files in `routes/` directory
2. Add middleware in `middleware/` directory if needed
3. Update database schema in `database/db.js` if required
4. Add routes to `server.js`
5. Update this README with new endpoints

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a strong JWT_SECRET
3. Configure proper CORS origins
4. Set up database backups
5. Use a process manager like PM2
6. Set up reverse proxy (nginx)
7. Enable HTTPS

## License

ISC
