# Forgot Password Feature

## Overview
The forgot password feature allows users to reset their password via email verification.

## How It Works

### User Flow
1. User clicks "Forgot password?" link in the login dialog
2. User enters their email address
3. System generates a secure reset token and saves it to the database
4. User receives a password reset link (in development, the link is logged to console)
5. User clicks the link and is taken to the reset password page
6. User enters and confirms their new password
7. Password is updated and user can login with the new password

### Backend Implementation

#### Database Changes
- Added `resetPasswordToken` and `resetPasswordExpires` fields to User model
- Token expires after 1 hour for security

#### API Endpoints

**POST /api/auth/forgot-password**
- Request body: `{ email: string }`
- Generates a secure token using crypto
- Stores hashed token in database with expiration
- Returns success message (doesn't reveal if email exists)

**POST /api/auth/reset-password/:token**
- Request body: `{ password: string }`
- Validates token and expiration
- Updates user password
- Clears reset token fields

### Frontend Implementation

#### Components
- `ForgotPasswordDialog.tsx` - Dialog for requesting password reset
- `ResetPassword.tsx` - Page for setting new password

#### Features
- Email validation
- Password strength validation (min 6 characters)
- Password confirmation matching
- Show/hide password toggle
- Loading states
- Error handling with toast notifications

## Development Mode

In development, the reset URL is:
- Logged to the backend console
- Returned in the API response (removed in production)

Example: `http://localhost:5173/reset-password/abc123token`

## Production Setup

### Email Integration (TODO)
To enable email sending in production, you'll need to:

1. Install nodemailer:
```bash
cd backend
npm install nodemailer
```

2. Add email configuration to `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://your-domain.com
```

3. Create email service in `backend/src/utils/email.js`:
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendPasswordResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
};
```

4. Update `backend/src/routes/auth.js` to use the email service:
```javascript
import { sendPasswordResetEmail } from '../utils/email.js';

// In the forgot-password route, replace console.log with:
await sendPasswordResetEmail(user.email, resetUrl);
```

## Security Features

- Tokens are hashed before storage (SHA-256)
- Tokens expire after 1 hour
- API doesn't reveal if email exists (prevents enumeration)
- Password must be at least 6 characters
- Passwords are hashed with bcrypt before storage

## Testing

### Manual Testing
1. Start the backend and frontend servers
2. Click "Forgot password?" in login dialog
3. Enter a registered email
4. Check backend console for reset URL
5. Copy the URL and paste in browser
6. Enter new password and confirm
7. Try logging in with the new password

### Test Scenarios
- Valid email → Success message
- Invalid email → Success message (doesn't reveal)
- Expired token → Error message
- Invalid token → Error message
- Password mismatch → Error message
- Password too short → Error message
