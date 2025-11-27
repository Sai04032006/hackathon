# JWT Login Testing Guide

## Issues Fixed

### 1. AdminServiceImpl.java
- ✅ Fixed Admin model handling (no ID field, uses username as primary key)
- ✅ Added backward compatibility for existing plain text passwords
- ✅ Added error handling and logging

### 2. BuyerServiceImpl.java
- ✅ Fixed Optional<Buyer> handling in findByEmail method
- ✅ Added password encoding to reset password method
- ✅ Added backward compatibility for existing plain text passwords
- ✅ Added error handling and logging

### 3. JwtUtil.java
- ✅ Fixed null userId handling for Admin users
- ✅ Added proper error handling for token extraction

## Testing Steps

### 1. Start the Application

#### Backend (Spring Boot)
```bash
cd SPRINGBOOTWORKSPACE/SDPProject
mvn spring-boot:run
```

#### Frontend (React)
```bash
cd REACTJS/frontend
npm start
```

### 2. Test Admin Login

**URL**: `POST http://localhost:2004/admin/checkadminlogin`

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "admin": {
    "username": "admin",
    "password": "$2a$10$..."
  },
  "role": "ADMIN"
}
```

### 3. Test Buyer Login

**URL**: `POST http://localhost:2004/buyer/checkbuyerlogin`

**Request Body**:
```json
{
  "email": "buyer@example.com",
  "password": "buyer123"
}
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "buyer": {
    "id": 1,
    "name": "John Doe",
    "email": "buyer@example.com",
    "password": "$2a$10$...",
    "mobileno": "1234567890"
  },
  "role": "BUYER"
}
```

### 4. Test Seller Login

**URL**: `POST http://localhost:2004/seller/checksellerlogin`

**Request Body**:
```json
{
  "username": "seller1",
  "password": "seller123"
}
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "seller": {
    "id": 1,
    "name": "Jane Seller",
    "username": "seller1",
    "email": "seller@example.com",
    "status": "Approved",
    "password": "$2a$10$..."
  },
  "role": "SELLER"
}
```

### 5. Test Protected Endpoints

Use the JWT token in the Authorization header:

**Header**:
```
Authorization: Bearer <your-jwt-token>
```

**Example Protected Endpoint**:
```
GET http://localhost:2004/admin/viewallsellers
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

## Common Issues and Solutions

### Issue 1: "User not found" Error
**Cause**: User doesn't exist in database
**Solution**: 
1. Check if user exists in database
2. Verify username/email spelling
3. Create test user if needed

### Issue 2: "Invalid credentials" Error
**Cause**: Wrong password or user not approved (for sellers)
**Solution**:
1. Check password spelling
2. For sellers, ensure status is "Approved"
3. Check database for user status

### Issue 3: "Token expired" Error
**Cause**: JWT token has expired (24 hours)
**Solution**:
1. Login again to get new token
2. Check system time settings

### Issue 4: CORS Error
**Cause**: Frontend and backend on different ports
**Solution**:
1. Ensure CORS is properly configured
2. Check SecurityConfig.java
3. Verify frontend is running on correct port

### Issue 5: Database Connection Error
**Cause**: MySQL not running or wrong credentials
**Solution**:
1. Start MySQL service
2. Check application.properties
3. Verify database exists: `sdpproject`

## Database Setup

If you need to create test users, use these SQL commands:

### Admin User
```sql
INSERT INTO admin_table (username, password) VALUES ('admin', 'admin123');
```

### Buyer User
```sql
INSERT INTO buyer_table (buyer_name, buyer_email, buyer_pwd, buyer_mobileno) 
VALUES ('John Doe', 'buyer@example.com', 'buyer123', '1234567890');
```

### Seller User
```sql
INSERT INTO seller_table (seller_name, seller_email, seller_username, seller_pwd, seller_mobileno, seller_nationalidno, seller_location, seller_status) 
VALUES ('Jane Seller', 'seller@example.com', 'seller1', 'seller123', '9876543210', '123456789', 'New York', 'Approved');
```

## Frontend Testing

1. Open browser to `http://localhost:5173`
2. Navigate to login pages:
   - Admin: `/adminlogin`
   - Buyer: `/buyerlogin`
   - Seller: `/sellerlogin`
3. Enter credentials and test login
4. Check browser developer tools:
   - Network tab: Verify token in response
   - Application tab: Verify token in sessionStorage

## Debugging Tips

1. **Check Backend Logs**: Look for error messages in Spring Boot console
2. **Check Browser Console**: Look for JavaScript errors
3. **Check Network Tab**: Verify API calls and responses
4. **Verify Database**: Check if users exist and have correct data

## Success Indicators

✅ Login returns 200 status code
✅ Response contains JWT token
✅ Token is stored in sessionStorage
✅ Protected endpoints work with token
✅ Logout clears token and redirects properly
