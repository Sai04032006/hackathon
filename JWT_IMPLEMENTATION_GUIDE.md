# JWT Token Implementation Guide

## Overview
This project now implements JWT (JSON Web Token) authentication for secure user sessions across the SAVE N SERVE application.

## Backend Changes

### 1. Dependencies Added
- `spring-boot-starter-security` - Spring Security framework
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` - JWT token handling libraries

### 2. New Classes Created
- **JwtUtil.java** - Utility class for JWT token generation, validation, and extraction
- **JwtAuthenticationFilter.java** - Filter to validate JWT tokens on protected endpoints
- **SecurityConfig.java** - Security configuration for endpoint protection and CORS

### 3. Updated Services
- **AdminServiceImpl** - Added password encoding and JWT token generation
- **BuyerServiceImpl** - Added password encoding and JWT token generation  
- **SellerServiceImpl** - Added password encoding and JWT token generation

### 4. Updated Controllers
- **AdminController** - Returns JWT token on successful login
- **BuyerController** - Returns JWT token on successful login
- **SellerController** - Returns JWT token on successful login

### 5. Updated Repositories
- Added `findByUsername` method to AdminRepository and SellerRepository

## Frontend Changes

### 1. Updated AuthContext
- Added JWT token management
- Added user data storage
- Added role-based authentication
- Added helper functions for API calls

### 2. Updated Login Components
- **AdminLogin** - Uses new JWT authentication flow
- **BuyerLogin** - Uses new JWT authentication flow
- **SellerLogin** - Uses new JWT authentication flow

### 3. Updated Navigation
- **AdminNavBar** - Uses new logout functionality

### 4. New API Utility
- **api.js** - Centralized axios instance with automatic token handling

## Security Features

### 1. Password Encryption
- All passwords are now encrypted using BCryptPasswordEncoder
- Passwords are hashed before storing in database
- Login verification uses secure password matching

### 2. JWT Token Security
- Tokens expire after 24 hours
- Tokens contain user role and ID information
- Tokens are signed with a secret key
- Automatic token validation on protected endpoints

### 3. Role-Based Access Control
- Admin endpoints require ADMIN role
- Seller endpoints require SELLER or ADMIN role
- Buyer endpoints require BUYER or ADMIN role
- Public endpoints (login, registration) don't require authentication

### 4. CORS Configuration
- Configured to allow cross-origin requests
- Supports all HTTP methods
- Allows credentials for authenticated requests

## API Endpoints

### Public Endpoints (No Authentication Required)
- `POST /admin/checkadminlogin` - Admin login
- `POST /buyer/checkbuyerlogin` - Buyer login
- `POST /seller/checksellerlogin` - Seller login
- `POST /buyer/registration` - Buyer registration
- `POST /seller/registration` - Seller registration
- Password reset endpoints

### Protected Endpoints (Authentication Required)
- All other endpoints require valid JWT token in Authorization header
- Format: `Authorization: Bearer <token>`

## Usage Examples

### Frontend API Calls
```javascript
import api from './utils/api';

// Authenticated API call (token automatically added)
const response = await api.get('/admin/viewallsellers');

// Login call
const loginResponse = await axios.post('/buyer/checkbuyerlogin', {
  email: 'user@example.com',
  password: 'password'
});

// Handle login response
if (loginResponse.status === 200) {
  handleLogin(loginResponse.data); // Sets token and user data
}
```

### Backend Service Usage
```java
// Generate token after successful login
Map<String, Object> response = service.generateBuyerToken(buyer);
return ResponseEntity.ok(response);

// Validate token in filter
if (jwtUtil.validateToken(jwt)) {
    // Allow access
}
```

## Testing the Implementation

### 1. Start the Backend
```bash
cd SPRINGBOOTWORKSPACE/SDPProject
mvn spring-boot:run
```

### 2. Start the Frontend
```bash
cd REACTJS/frontend
npm start
```

### 3. Test Authentication Flow
1. Navigate to login page
2. Enter credentials
3. Check browser developer tools for JWT token in sessionStorage
4. Verify protected endpoints work with token
5. Test logout functionality

## Security Considerations

1. **Token Storage**: Tokens are stored in sessionStorage (cleared on browser close)
2. **Token Expiration**: Tokens expire after 24 hours
3. **Password Security**: All passwords are encrypted using BCrypt
4. **CORS**: Properly configured for production deployment
5. **Error Handling**: 401 responses automatically clear auth data

## Future Enhancements

1. **Refresh Tokens**: Implement refresh token mechanism for longer sessions
2. **Token Blacklisting**: Add token blacklist for logout functionality
3. **Rate Limiting**: Add rate limiting for login attempts
4. **Audit Logging**: Log authentication events for security monitoring
5. **Multi-Factor Authentication**: Add 2FA support for enhanced security

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure CORS configuration allows your frontend domain
2. **Token Expired**: Check token expiration time and implement refresh logic
3. **Password Mismatch**: Ensure existing users have encrypted passwords
4. **Authorization Errors**: Verify user roles and endpoint permissions

### Debug Steps
1. Check browser network tab for Authorization headers
2. Verify token format in sessionStorage
3. Check backend logs for authentication errors
4. Validate JWT token structure using online JWT decoder
