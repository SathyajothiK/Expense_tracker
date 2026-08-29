# GridZero Expense Tracker - Backend API Documentation

## Overview
Complete REST API backend for the GridZero Expense Tracker built with Node.js/Express and MongoDB.

## Architecture

```
server/
├── models/
│   ├── User.js              # User schema with password hashing
│   └── Transaction.js       # Transaction schema with account types & categories
├── controllers/
│   ├── authController.js    # Authentication logic (register, login, profile)
│   ├── transactionController.js  # CRUD operations for transactions
│   └── analyticsController.js    # Analytics aggregation pipelines
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── transactionRoutes.js # Transaction endpoints
│   └── analyticsRoutes.js   # Analytics endpoints
├── middleware/
│   └── authMiddleware.js    # JWT verification middleware
├── config/
│   └── db.js                # MongoDB connection
└── server.js                # Express app setup & route mounting
```

## API Endpoints

### Health Check
```
GET /api/health
Response: { status: 'ok', message: 'Server is running' }
```

---

## 1. AUTHENTICATION ENDPOINTS

### Register New User
```
POST /api/auth/register
Headers: Content-Type: application/json
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
Response (201): {
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login User
```
POST /api/auth/login
Headers: Content-Type: application/json
Body: {
  "email": "john@example.com",
  "password": "password123"
}
Response (200): {
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get User Profile (Protected)
```
GET /api/auth/me
Headers: Authorization: Bearer eyJhbGc...
Response (200): {
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 2. TRANSACTION ENDPOINTS (All Protected)

### Create Transaction
```
POST /api/transactions
Headers: Authorization: Bearer eyJhbGc...
Body: {
  "title": "Grocery Shopping",
  "merchant": "Whole Foods",
  "amount": 125.50,
  "type": "expense",                    // 'income' | 'expense' | 'saving'
  "category": "Food",                   // Housing | Food | Bills | Health | Travel | Shopping | Savings
  "accountType": "checking",            // checking | saving | investing | cash
  "date": "2024-01-15T10:30:00Z"
}
Response (201): {
  "success": true,
  "transaction": { ...transaction details }
}
```

### Get All Transactions (with Filtering)
```
GET /api/transactions?search=grocery&category=Food&limit=50
Headers: Authorization: Bearer eyJhbGc...
Query Parameters:
  - search: Search in title/merchant (optional)
  - category: Filter by category (optional)
  - limit: Max results (default: 50, optional)
Response (200): {
  "success": true,
  "count": 15,
  "transactions": [ {...}, {...}, ... ]
}
```

### Get Single Transaction
```
GET /api/transactions/:id
Headers: Authorization: Bearer eyJhbGc...
Response (200): {
  "success": true,
  "transaction": { ...transaction details }
}
```

### Update Transaction
```
PUT /api/transactions/:id
Headers: Authorization: Bearer eyJhbGc...
Body: {
  "title": "Updated Title",      // optional
  "amount": 150.00,              // optional
  "merchant": "New Merchant",    // optional
  "category": "Shopping"         // optional
  // ... other fields
}
Response (200): {
  "success": true,
  "transaction": { ...updated transaction }
}
```

### Delete Transaction
```
DELETE /api/transactions/:id
Headers: Authorization: Bearer eyJhbGc...
Response (200): {
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

## 3. ANALYTICS ENDPOINTS (All Protected)

### Get Account Balances
```
GET /api/analytics/accounts
Headers: Authorization: Bearer eyJhbGc...
Response (200): {
  "success": true,
  "totalBalance": 5250.75,
  "accountBalances": {
    "checking": 2500.50,
    "saving": 2000.25,
    "investing": 750.00,
    "cash": 0
  },
  "percentageGrowth": 12.5
}
```

### Get Timeline Data (for chart)
```
GET /api/analytics/timeline?period=monthly
Headers: Authorization: Bearer eyJhbGc...
Query Parameters:
  - period: 'monthly' (default) | 'weekly'
Response (200): {
  "success": true,
  "period": "monthly",
  "timelineData": [
    {
      "month": "2024-01",
      "balance": 5000.00,
      "amount": 500.00
    },
    {
      "month": "2024-02",
      "balance": 5250.75,
      "amount": 250.75
    }
  ]
}
```

### Get Budget Data (for radar chart)
```
GET /api/analytics/budget
Headers: Authorization: Bearer eyJhbGc...
Response (200): {
  "success": true,
  "totalExpenses": 2500.00,
  "budgetData": [
    {
      "category": "Housing",
      "amount": 1200.00,
      "percentage": 48.0
    },
    {
      "category": "Food",
      "amount": 400.00,
      "percentage": 16.0
    },
    {
      "category": "Shopping",
      "amount": 300.00,
      "percentage": 12.0
    },
    // ... other categories
  ]
}
```

### Get Financial Insights
```
GET /api/analytics/insights
Headers: Authorization: Bearer eyJhbGc...
Response (200): {
  "success": true,
  "spendingScore": 82,
  "savingRate": 23.5,
  "netWorth": 8500.75,
  "totalIncome": 5000.00,
  "totalExpense": 2500.00,
  "totalSavings": 1200.00,
  "currentMonthIncome": 1500.00,
  "currentMonthExpense": 800.00,
  "adviceChips": [
    "Great saving habits! Keep it up!",
    "You have excellent income to expense ratio"
  ]
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this transaction"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "User already exists with that email"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Error message details"
}
```

---

## Security Features

1. **Password Hashing**: Passwords hashed with bcryptjs (10 salt rounds)
2. **JWT Authentication**: 30-day token expiration
3. **Authorization Checks**: All protected endpoints verify user ownership
4. **Input Validation**: Required fields validated on all endpoints
5. **Database Indexing**: Optimized queries with indexes on user, date, and category

---

## Testing

Run the test suite:
```bash
node test-api.js
```

Make sure MongoDB is running and server is started before running tests.

---

## Environment Variables

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-secret-jwt-key-for-production-change-this
```

---

## Running the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

---

## Database Models

### User
- `name` - String (required)
- `email` - String (required, unique)
- `password` - String (required, hashed)
- `timestamps` - createdAt, updatedAt

### Transaction
- `user` - ObjectId reference to User (required)
- `title` - String (required)
- `merchant` - String (required)
- `amount` - Number (required)
- `type` - String: 'income' | 'expense' | 'saving' (required)
- `category` - String: Housing | Food | Bills | Health | Travel | Shopping | Savings (required)
- `accountType` - String: 'checking' | 'saving' | 'investing' | 'cash' (required)
- `date` - Date (required, default: now)
- `timestamps` - createdAt, updatedAt
- **Indexes**: user+date, user+category, user+accountType

---

## Response Format

All API responses follow a consistent format:

### Success (2xx)
```json
{
  "success": true,
  "data": { ... }
}
```

### Error (4xx, 5xx)
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Next Steps

1. Integrate with frontend React client
2. Add request validation middleware
3. Implement rate limiting
4. Add API logging
5. Set up automated backup
6. Deploy to production environment
