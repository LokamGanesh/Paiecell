# User Roles & Access Control

## Sample Credentials

For testing and development, use these sample accounts:

| Role | Email | Password | User Type | Organization |
|------|-------|----------|-----------|--------------|
| **Admin** | admin@paie.com | admin123 | student | - |
| **Student** | student@paie.com | student123 | student | - |
| **Facilitator** | facilitator@paie.com | facilitator123 | corporate | Tech Corp India |
| **Corporate** | corporate@paie.com | corporate123 | corporate | Innovation Labs |

### Seeding Sample Data

To populate your database with these sample users:

```bash
cd backend
npm run seed
```

This will:
- Clear all existing users
- Create the 4 sample accounts above
- Display the credentials in the console

## Overview

The PAIE platform supports multiple user types with different roles and permissions to accommodate various actors in the system.

## Registration Policy

- **Students**: Can self-register through the public registration form
- **Facilitators/Corporate Guests**: Must be created by admin users
- **YES+ Partners**: External integration only (no platform account needed)

## User Roles

### 1. Student (role: 'student')
Default role for student users who register for events.

**Capabilities:**
- Register and login to the platform
- Browse available events
- Register for events
- Receive event confirmations and reminders
- View their registration history

**User Type:** `student`

### 2. Admin/PAIE Team (role: 'admin')
Administrative users who manage the platform.

**Capabilities:**
- Full access to all platform features
- Create, update, and delete events
- View and manage all registrations
- Track attendance and participation
- Send communications to users
- Manage user accounts
- Access admin dashboard

**User Type:** `student` (default)

### 3. Corporate Guests/Facilitators (role: 'facilitator')
External facilitators, corporate guests, or workshop leaders.

**Registration:** Must be created by admin users (no self-registration)

**Capabilities:**
- Register and login to the platform
- View events they're facilitating
- Access participant lists for their events
- Submit event materials or resources
- View event analytics for their sessions

**User Type:** `corporate`

### 4. YES+ Partners (External)
Art of Living/YES+ partners don't need platform accounts. They use external ASPLACE registration links integrated into the YES+ page.

**Implementation:** 
- ASPLACE registration link with UTM tracking
- Link: `https://asplace.artofliving.org/register?utm_source=paie&utm_medium=website&utm_campaign=campus`
- UTM parameters allow Art of Living to track campus referrals
- No platform account needed for partners
- Admin panel shows tracking metrics for monitoring engagement

## Database Schema

### User Model Fields

```javascript
{
  name: String,           // Full name
  email: String,          // Unique email address
  password: String,       // Hashed password
  role: String,           // 'student' | 'admin' | 'facilitator'
  userType: String,       // 'student' | 'corporate' | 'partner'
  organization: String,   // Company/organization (optional)
  phone: String,          // Contact number (optional)
  timestamps: true        // createdAt, updatedAt
}
```

## API Endpoints

### Public Registration (Students Only)
```
POST /api/auth/register
Body: {
  name: string,
  email: string,
  password: string,
  phone: string,
  college: string,
  department: string,
  year: string
}
Note: Automatically sets role='student' and userType='student'
```

### Login (All Users)
```
POST /api/auth/login
Body: {
  identifier: string,  // Email or phone number
  password: string
}
```

### Admin User Creation
Facilitators and corporate users must be created by admins through the admin panel or directly in the database.

## Middleware

### Authentication Middleware

- `auth` - Verifies JWT token and attaches user to request
- `adminAuth` - Requires admin role
- `facilitatorAuth` - Requires facilitator or admin role
- `studentAuth` - Requires student or admin role

### Usage Example

```javascript
import { auth, adminAuth, facilitatorAuth } from './middleware/auth.js';

// Protected route (any authenticated user)
router.get('/profile', auth, getProfile);

// Admin only route
router.post('/events', auth, adminAuth, createEvent);

// Facilitator or admin route
router.get('/events/:id/participants', auth, facilitatorAuth, getParticipants);

// Student or admin route
router.post('/events/:id/register', auth, studentAuth, registerForEvent);
```

## Frontend Usage

### Role Checking Hook

```typescript
import { useRole } from '@/hooks/use-role';

const MyComponent = () => {
  const { 
    isStudent, 
    isAdmin, 
    isFacilitator,
    isCorporate,
    hasAdminAccess,
    hasFacilitatorAccess 
  } = useRole();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isFacilitator) {
    return <FacilitatorView />;
  }

  return <StudentView />;
};
```

### Registration Components

- `LoginDialog` - Login form supporting email or phone number
- `SignupDialog` - Student-only registration form with all required fields

Note: Corporate/Facilitator accounts are created by admins, not through public registration.

## Default Behavior

- Public registration creates student accounts only
- All student fields (college, department, year) are required for registration
- Facilitator/corporate accounts must be created by admins
- Admin accounts must be created manually or promoted by existing admins
- Login supports both email and phone number as identifier

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days
- Role-based middleware prevents unauthorized access
- Admin role cannot be self-assigned during registration
