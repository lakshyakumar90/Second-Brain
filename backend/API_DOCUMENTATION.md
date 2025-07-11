# API Documentation - Email OTP Verification System

## Authentication Endpoints

### 1. Register Step 1 - Create Account
**POST** `/api/auth/register/step1`

Creates a new user account and sends OTP verification email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "message": "User created successfully. Please check your email for verification OTP.",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "completedSteps": 1,
    "emailVerified": false
  },
  "token": "jwt_token"
}
```

**Validation Rules:**
- Email must be valid format
- Password must be 8-20 characters with uppercase, lowercase, number, and special character

---

### 2. Verify OTP
**POST** `/api/auth/verify-otp`

Verifies the email OTP and activates the user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully!",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "completedSteps": 2,
    "emailVerified": true
  },
  "token": "jwt_token"
}
```

**Error Responses:**
- `400` - Invalid OTP format
- `400` - OTP expired
- `400` - Invalid OTP
- `400` - Email already verified
- `404` - User not found

---

### 3. Resend OTP
**POST** `/api/auth/resend-otp`

Sends a new OTP to the user's email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "New OTP sent successfully. Please check your email."
}
```

**Error Responses:**
- `400` - Email already verified
- `404` - User not found
- `500` - Email sending failed

---

### 4. Register Step 2 - Profile Information
**POST** `/api/auth/register/step2`

Updates user profile information (requires email verification).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe"
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "completedSteps": 2
  },
  "token": "jwt_token"
}
```

**Validation Rules:**
- Name: 3-20 characters
- Username: 3-20 characters, unique
- Requires email verification

---

### 5. Register Step 3 - Preferences
**POST** `/api/auth/register/step3`

Sets user preferences and completes registration.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Software developer",
  "theme": "dark",
  "emailNotifications": true
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "user_id",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software developer",
    "preferences": {
      "theme": "dark",
      "emailNotifications": true
    },
    "completedSteps": 3,
    "isVerified": true,
    "isActive": true
  },
  "token": "jwt_token"
}
```

---

### 6. Login
**POST** `/api/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  },
  "token": "jwt_token"
}
```

**Error Responses:**
- `400` - Invalid credentials
- `400` - Email not verified (with `requiresVerification: true`)

---

### 7. Logout
**POST** `/api/auth/logout`

Logs out user by clearing JWT cookie.

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## User Model Schema

```typescript
interface IUser {
  _id: ObjectId;
  email: string;
  password: string;
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin" | "moderator";
  completedSteps: number;
  
  // Email verification fields
  emailVerified: boolean;
  emailOtp?: string;
  emailOtpExpires?: Date;
  
  // Other fields...
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Environment Variables

Required environment variables for email functionality:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Database
MONGODB_URI=mongodb://localhost:27017/second-brain
```

---

## Frontend Integration

### Registration Flow
1. User submits email/password → `POST /api/auth/register/step1`
2. User receives OTP email
3. User enters OTP → `POST /api/auth/verify-otp`
4. User completes profile → `POST /api/auth/register/step2`
5. User sets preferences → `POST /api/auth/register/step3`

### Login Flow
1. User submits credentials → `POST /api/auth/login`
2. If email not verified, show OTP verification screen
3. User verifies email → `POST /api/auth/verify-otp`
4. User can then login normally

---

## Security Features

- **OTP Expiration**: 10 minutes
- **JWT Token**: 12 hours expiration
- **Password Requirements**: 8-20 chars with complexity
- **Email Verification**: Required before account activation
- **Rate Limiting**: Recommended for OTP endpoints
- **HTTPS**: Required in production

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error 