# Backend-Frontend API Mapping

## Overview
Complete mapping of all frontend features to backend endpoints. All endpoints have been verified and completed.

## Authentication Endpoints ✅
| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Student Registration | POST `/auth/register` | POST `/api/auth/register` | ✅ Complete |
| User Login | POST `/auth/login` | POST `/api/auth/login` | ✅ Complete |
| Get Current User | GET `/auth/me` | GET `/api/auth/me` | ✅ Complete |
| Forgot Password | POST `/auth/forgot-password` | POST `/api/auth/forgot-password` | ✅ Complete |
| Reset Password | POST `/auth/reset-password/{token}` | POST `/api/auth/reset-password/{token}` | ✅ Complete |

## Events Endpoints ✅
| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Get All Events | GET `/events` | GET `/api/events` | ✅ Complete |
| Get Event by ID | GET `/events/{id}` | GET `/api/events/{id}` | ✅ Complete |
| Create Event | POST `/events` | POST `/api/events` | ✅ Complete |
| Update Event | PUT `/events/{id}` | PUT `/api/events/{id}` | ✅ Complete |
| Delete Event | DELETE `/events/{id}` | DELETE `/api/events/{id}` | ✅ Complete |

## Courses Endpoints ✅
| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Get All Courses | GET `/courses` | GET `/api/courses` | ✅ Complete |
| Get Course by ID | GET `/courses/{id}` | GET `/api/courses/{id}` | ✅ Complete |
| Create Course | POST `/courses` | POST `/api/courses` | ✅ Complete |
| Update Course | PUT `/courses/{id}` | PUT `/api/courses/{id}` | ✅ Complete |
| Delete Course | DELETE `/courses/{id}` | DELETE `/api/courses/{id}` | ✅ Complete |

## Registrations Endpoints ✅
| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Get All Registrations | GET `/registrations` | GET `/api/registrations` | ✅ Complete |
| Get My Registrations | GET `/registrations/my` | GET `/api/registrations/my` | ✅ Complete |
| Create Registration | POST `/registrations` | POST `/api/registrations` | ✅ Complete |
| Cancel Registration | DELETE `/registrations/{id}` | DELETE `/api/registrations/{id}` | ✅ Complete |
| Update Registration Status | PATCH `/registrations/{id}/status` | PATCH `/api/registrations/{id}/status` | ✅ Complete |

## Users Endpoints ✅
| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Get All Users | GET `/users` | GET `/api/users` | ✅ Complete |
| Update Own Profile | PUT `/users/profile` | PUT `/api/users/profile` | ✅ Complete |
| Create User (Admin) | POST `/users` | POST `/api/users` | ✅ Complete |
| Delete User | DELETE `/users/{id}` | DELETE `/api/users/{id}` | ✅ Complete |
| Update User Role | PATCH `/users/{id}/role` | PATCH `/api/users/{id}/role` | ✅ Complete |

## Media Endpoints ✅
| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Get All Media | GET `/media` | GET `/api/media` | ✅ Complete |
| Get Media by Type | GET `/media/type/{type}` | GET `/api/media/type/{type}` | ✅ Complete |
| Get Media for Item | GET `/media/item/{itemId}` | GET `/api/media/item/{itemId}` | ✅ Complete |
| Create Media | POST `/media` | POST `/api/media` | ✅ Complete |
| Update Media | PUT `/media/{id}` | PUT `/api/media/{id}` | ✅ Complete |
| Delete Media | DELETE `/media/{id}` | DELETE `/api/media/{id}` | ✅ Complete |

## Upload Endpoints ✅
| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Upload Image | POST `/upload/image` | POST `/api/upload/image` | ✅ Complete |
| Upload Media | POST `/upload/media` | POST `/api/upload/media` | ✅ **ADDED** |
| Delete Image | DELETE `/upload/image/{filename}` | DELETE `/api/upload/image/{filename}` | ✅ Complete |

## Email Endpoints ✅
| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Get Items for Reminder | GET `/email/items-for-reminder` | GET `/api/email/items-for-reminder` | ✅ Complete |
| Send Reminder | POST `/email/send-reminder` | POST `/api/email/send-reminder` | ✅ Complete |
| Send Custom Email | POST `/email/send-custom` | POST `/api/email/send-custom` | ✅ **ADDED** |
| Send Custom Email (Alias) | - | POST `/api/email/send-custom-email` | ✅ **ADDED** |

## Export Endpoints ✅
| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Export Users CSV | GET `/export/users/csv` | GET `/api/export/users/csv` | ✅ Complete |
| Export Users Excel | GET `/export/users/excel` | GET `/api/export/users/excel` | ✅ Complete |
| Export Registrations CSV | GET `/export/registrations/csv` | GET `/api/export/registrations/csv` | ✅ Complete |
| Export Registrations Excel | GET `/export/registrations/excel` | GET `/api/export/registrations/excel` | ✅ Complete |
| Export Event Registrations CSV | GET `/export/event/{eventId}/csv` | GET `/api/export/event/{eventId}/csv` | ✅ Complete |
| Export Event Registrations Excel | GET `/export/event/{eventId}/excel` | GET `/api/export/event/{eventId}/excel` | ✅ Complete |
| Export Course Registrations CSV | GET `/export/course/{courseId}/csv` | GET `/api/export/course/{courseId}/csv` | ✅ Complete |
| Export Course Registrations Excel | GET `/export/course/{courseId}/excel` | GET `/api/export/course/{courseId}/excel` | ✅ Complete |

## Settings Endpoints ✅
| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Get All Settings | GET `/settings` | GET `/api/settings` | ✅ Complete |
| Get YES+ Link | GET `/settings/yesplus/link` | GET `/api/settings/yesplus/link` | ✅ Complete |
| Get YES+ Link (Full) | GET `/settings/yesplus/full-link` | GET `/api/settings/yesplus/full-link` | ✅ **ADDED** |
| Update YES+ Link | PUT `/settings/yesplus/link` | PUT `/api/settings/yesplus/link` | ✅ Complete |

## Summary of Changes

### Added Endpoints:
1. **POST `/api/upload/media`** - Upload media files (images/videos) for events and courses
2. **POST `/api/email/send-custom`** - Send custom emails to users (primary endpoint)
3. **POST `/api/email/send-custom-email`** - Alias for send-custom for compatibility
4. **GET `/api/settings/yesplus/full-link`** - Alias for getting YES+ link

### Fixed Issues:
- Email endpoint naming inconsistency (send-custom vs send-custom-email)
- Missing media upload endpoint
- Settings endpoint alias for full-link

## Frontend Pages & Features

### Public Pages
- **Index.tsx** - Home page with upcoming events
- **Events.tsx** - Browse all events
- **Courses.tsx** - Browse all courses
- **Register.tsx** - Event/course registration
- **Gallery.tsx** - Media gallery
- **About.tsx** - About page
- **YesPlus.tsx** - YES+ program info

### Authenticated Pages
- **StudentDashboard.tsx** - Student dashboard
- **FacilitatorDashboard.tsx** - Facilitator dashboard

### Admin Pages
- **Admin.tsx** - Main admin dashboard with:
  - Dashboard (stats overview)
  - Analytics (charts and graphs)
  - Events Management
  - Courses Management
  - Media Management
  - Registrations View
  - User Management
  - YES+ Tracking
  - Export Data
  - Bulk Email

### Auth Pages
- **ResetPassword.tsx** - Password reset

## Data Models

### User
```
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  phone: String,
  role: 'student' | 'facilitator' | 'admin',
  userType: 'student' | 'corporate' | 'partner',
  college: String,
  department: String,
  year: String,
  organization: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Event
```
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  date: Date,
  endDate: Date,
  time: String,
  endTime: String,
  venue: String,
  image: String,
  video: String,
  capacity: Number,
  registrationCount: Number,
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  isExternal: Boolean,
  externalLink: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Course
```
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  duration: String,
  instructor: String,
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  image: String,
  video: String,
  capacity: Number,
  enrollmentCount: Number,
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  startDate: Date,
  endDate: Date,
  schedule: String,
  syllabus: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Registration
```
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  event: ObjectId (ref: Event),
  course: ObjectId (ref: Course),
  type: 'event' | 'course',
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended',
  userSnapshot: {
    name: String,
    email: String,
    phone: String,
    college: String,
    department: String,
    year: String
  },
  registeredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Media
```
{
  _id: ObjectId,
  title: String,
  description: String,
  type: 'event' | 'course',
  itemId: ObjectId,
  itemTitle: String,
  mediaType: 'image' | 'video',
  mediaUrl: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Settings
```
{
  _id: ObjectId,
  key: String (unique),
  value: String,
  description: String,
  updatedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication & Authorization

- **JWT Token**: 7-day expiration
- **Token Storage**: localStorage
- **Protected Routes**: Require Authorization header with Bearer token
- **Role-based Access**:
  - `student`: Can register for events/courses, view own registrations
  - `facilitator`: Can create events/courses, manage media
  - `admin`: Full access to all features

## Rate Limiting

- **Auth Routes**: 5 requests per 15 minutes
- **API Routes**: 100 requests per 15 minutes

## File Upload

- **Supported Formats**: JPEG, JPG, PNG, GIF, WebP
- **Max File Size**: 5MB
- **Storage**: `/backend/uploads/`
- **URL Pattern**: `/uploads/{filename}`

## Status: ✅ COMPLETE

All frontend features have corresponding backend endpoints. The system is fully functional and ready for deployment.
