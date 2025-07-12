# Second Brain API Documentation

## Authentication Endpoints

### 1. User Registration (Multi-step)

#### Step 1: Initial Registration
- **POST** `/api/auth/register/step1`
- **Description**: Create a new user account with email and password
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response**: 
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

#### Step 2: Email Verification
- **POST** `/api/auth/verify-otp`
- **Description**: Verify email with OTP sent to user's email
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response**:
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

#### Step 3: Profile Setup
- **POST** `/api/auth/register/step2`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Complete basic profile information
- **Body**:
  ```json
  {
    "name": "John Doe",
    "username": "johndoe"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User updated successfully",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "completedSteps": 2
    },
    "token": "jwt_token"
  }
  ```

#### Step 4: Final Setup
- **POST** `/api/auth/register/step3`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Complete final profile setup and preferences
- **Body**:
  ```json
  {
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software developer passionate about productivity",
    "theme": "dark",
    "emailNotifications": true
  }
  ```
- **Response**:
  ```json
  {
    "message": "User updated successfully",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Software developer passionate about productivity",
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

### 2. Login & Logout

#### Login
- **POST** `/api/auth/login`
- **Description**: Authenticate user with email and password
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "username": "johndoe"
    },
    "token": "jwt_token"
  }
  ```

#### Logout
- **POST** `/api/auth/logout`
- **Description**: Logout user and clear session
- **Response**:
  ```json
  {
    "message": "Logout successful"
  }
  ```

### 3. Password Reset

#### Forgot Password
- **POST** `/api/auth/forgot-password`
- **Description**: Initiate password reset process
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "If an account with this email exists, a password reset OTP has been sent."
  }
  ```

#### Verify Password Reset OTP
- **POST** `/api/auth/verify-password-reset-otp`
- **Description**: Verify the password reset OTP (Step 1 of password reset)
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password reset OTP verified successfully! You can now set your new password."
  }
  ```

#### Reset Password
- **POST** `/api/auth/reset-password`
- **Description**: Set new password after OTP verification (Step 2 of password reset)
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "newPassword": "NewSecurePass123!"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password reset successfully!"
  }
  ```

### 4. Token Management

#### Refresh Token
- **POST** `/api/auth/refresh-token`
- **Description**: Refresh JWT access token
- **Body**:
  ```json
  {
    "refreshToken": "jwt_refresh_token"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Token refreshed successfully",
    "token": "new_jwt_token",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "completedSteps": 3,
      "emailVerified": true
    }
  }
  ```

### 5. Registration Status

#### Check Registration Step
- **GET** `/api/auth/registration-step`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get current registration step and user status
- **Response**:
  ```json
  {
    "completedSteps": 3,
    "emailVerified": true,
    "isVerified": true,
    "isActive": true,
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Software developer passionate about productivity",
      "preferences": {
        "theme": "dark",
        "emailNotifications": true
      }
    }
  }
  ```

### 6. OTP Management

#### Resend OTP
- **POST** `/api/auth/resend-otp`
- **Description**: Resend email verification OTP
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "New OTP sent successfully. Please check your email."
  }
  ```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Please enter a valid email address"
}
```

**Common validation error messages:**
- `"Please enter a valid email address"` - Invalid email format
- `"Password must be at least 8 characters long"` - Password too short
- `"Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"` - Password complexity requirement
- `"OTP must be exactly 6 digits"` - Invalid OTP format
- `"Name must be at least 3 characters long"` - Name too short
- `"Username must be at least 3 characters long"` - Username too short
- `"Please enter a valid URL for your avatar"` - Invalid avatar URL
- `"Bio cannot exceed 500 characters"` - Bio too long

### 401 Unauthorized
```json
{
  "message": "User not authenticated"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to send verification email. Please try again."
}
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters, maximum 20 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

## OTP Expiration

All OTPs (email verification and password reset) expire after 10 minutes for security reasons. 