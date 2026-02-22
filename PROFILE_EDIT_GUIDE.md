# Profile Edit Feature Guide

## Overview

Users can now edit their profile information and change their password through the "My Account" option available in multiple locations throughout the application.

## Access Points

### 1. Navbar Dropdown (All Pages)
- Click on your name in the top-right corner
- Select "Edit Profile" from the dropdown menu

### 2. Dashboard Pages
- Student Dashboard: Click "Edit" button on the Profile card
- Facilitator Dashboard: Click "Edit" button on the Profile card
- Admin Panel: Click "My Account" in the sidebar footer

## Editable Fields

### All Users
- Full Name
- Phone Number
- Password (optional - requires current password)

### Students
- College/Department
- Department
- Year

### Facilitators/Corporate Users
- Organization

### Read-Only Fields
- Email (cannot be changed)
- Role (cannot be changed by user)

## Password Change

To change your password:
1. Open the profile dialog
2. Enter your current password
3. Enter your new password (minimum 6 characters)
4. Confirm your new password
5. Click "Save Changes"
6. You will be logged out and need to login again with the new password

## Backend API

### Endpoint
```
PUT /api/users/profile
Authorization: Bearer <token>
```

### Request Body
```json
{
  "name": "Updated Name",
  "phone": "+91 98765 43210",
  "college": "Engineering College",
  "department": "Computer Science",
  "year": "3rd Year",
  "organization": "Tech Corp",
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### Response
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Updated Name",
    "phone": "+91 98765 43210",
    "role": "student",
    "userType": "student",
    "college": "Engineering College",
    "department": "Computer Science",
    "year": "3rd Year"
  }
}
```

## Features

- Real-time validation
- Role-specific fields (only relevant fields shown)
- Password strength validation (minimum 6 characters)
- Password confirmation matching
- Current password verification for password changes
- Automatic logout after password change
- Success/error notifications
- Responsive design for mobile and desktop

## Security

- Authentication required (JWT token)
- Current password verification for password changes
- Password hashing using bcrypt
- Email cannot be changed (prevents account takeover)
- Role cannot be changed by user (admin-only)

## User Experience

1. Click "Edit Profile" or "My Account"
2. Profile dialog opens with current information pre-filled
3. Edit desired fields
4. Click "Save Changes"
5. Success notification appears
6. Page refreshes to show updated information
7. If password was changed, user is logged out and redirected to login

## Error Handling

The system handles various error scenarios:
- Invalid current password
- Password mismatch (new password and confirmation)
- Password too short (less than 6 characters)
- Network errors
- Server errors

All errors are displayed as toast notifications with clear messages.

## Mobile Support

The profile dialog is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

The dialog scrolls vertically on smaller screens to accommodate all fields.
