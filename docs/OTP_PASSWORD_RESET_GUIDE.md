# OTP-Based Password Reset Implementation

## Overview
The PAIE Cell platform now includes a secure OTP (One-Time Password) based password reset flow using email verification.

## Flow

### Step 1: Request OTP
- User clicks "Forgot Password"
- Enters their email address
- System generates a 6-digit OTP and sends it via email
- OTP expires in 10 minutes

### Step 2: Verify OTP
- User enters the OTP received in their email
- System validates the OTP
- Maximum 5 failed attempts allowed
- If verified, a reset token is generated (valid for 30 minutes)

### Step 3: Set New Password
- User enters their new password (minimum 6 characters)
- Confirms the password
- Password is updated in the database
- User can now login with the new password

## Backend Implementation

### New Database Fields (User Model)
- `otp`: Stores the generated OTP
- `otpExpires`: Timestamp when OTP expires
- `otpAttempts`: Counter for failed OTP verification attempts

### New API Endpoints

#### 1. POST `/api/auth/forgot-password`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists, an OTP has been sent to your email.",
  "otp": "123456" // Only in development mode
}
```

#### 2. POST `/api/auth/verify-otp`
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "resetToken": "token_string"
}
```

#### 3. POST `/api/auth/resend-otp`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists, a new OTP has been sent.",
  "otp": "654321" // Only in development mode
}
```

#### 4. POST `/api/auth/reset-password/:token`
**Request:**
```json
{
  "password": "newPassword123"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

## Frontend Implementation

### Updated ForgotPasswordDialog Component
The component now has three steps:

1. **Email Step**: User enters email
2. **OTP Step**: User enters 6-digit OTP with resend option
3. **Password Step**: User sets new password

### Features
- Real-time OTP timer (10 minutes)
- Resend OTP button (enabled after timer expires)
- Password confirmation validation
- Loading states and error handling
- Toast notifications for user feedback

## Email Configuration

### Required Environment Variables
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=PAIE Cell
```

### Gmail Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `EMAIL_PASSWORD`

### Email Template
The OTP email includes:
- User's name
- 6-digit OTP in large, readable format
- Expiration time (10 minutes)
- Security notice

## Development Mode

In development mode (`NODE_ENV=development`):
- OTP is logged to console
- OTP is returned in API response for testing
- Check browser console or server logs to see the OTP

## Security Features

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **Attempt Limiting**: Maximum 5 failed OTP attempts
3. **Reset Token Expiration**: Reset tokens expire after 30 minutes
4. **Password Hashing**: Passwords are hashed using bcrypt
5. **Email Verification**: Only registered emails can request password reset

## Testing

### Manual Testing Steps
1. Click "Forgot Password" on login page
2. Enter your email address
3. Check email for OTP (or console in development)
4. Enter the OTP
5. Set new password
6. Login with new credentials

### Development Testing
- Use the OTP shown in console/response
- Test with invalid OTP (should fail after 5 attempts)
- Test with expired OTP (wait 10+ minutes)
- Test password mismatch validation

## Troubleshooting

### OTP Not Received
- Check spam/junk folder
- Verify email configuration in `.env`
- Check server logs for email sending errors
- In development, check browser console for OTP

### "Too many failed attempts"
- Wait for OTP to expire (10 minutes) or request a new one
- Click "Resend OTP" button

### "Invalid or expired reset token"
- The reset token expired (30 minutes)
- Request a new password reset

## Future Enhancements
- SMS-based OTP option
- Email templates customization
- OTP length configuration
- Rate limiting per email address
