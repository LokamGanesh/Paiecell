# Sample Credentials - Quick Reference

## Test Accounts

### 🔑 Admin Account
```
Email: admin@paie.com
Password: admin123
Role: admin
Access: Full platform access, event management, user management
```

### 👨‍🎓 Student Account
```
Email: student@paie.com
Password: student123
Role: student
Access: Browse events, register for events, view registrations
```

### 👔 Facilitator Account
```
Email: facilitator@paie.com
Password: facilitator123
Role: facilitator
Organization: Tech Corp India
Access: View facilitated events, access participant lists
```

### 🏢 Corporate Account
```
Email: corporate@paie.com
Password: corporate123
Role: facilitator
Organization: Innovation Labs
Access: View facilitated events, access participant lists
```

## Setup Instructions

1. Ensure MongoDB is running
2. Configure backend/.env with your MongoDB URI
3. Run the seed script:

```bash
cd backend
npm run seed
```

4. Start the application:

```bash
# From root directory
npm run dev
```

5. Login at http://localhost:8080 with any of the credentials above

## Creating Custom Test Users

You can also register new users through the UI:
- Students: Use the "Student" tab in signup dialog
- Corporate/Facilitators: Use the "Corporate/Facilitator" tab in signup dialog
- Admins: Must be created manually in the database or promoted by existing admins

## Security Notes

⚠️ **Important**: These are sample credentials for development only. 
- Never use these in production
- Change all default passwords before deploying
- Use strong, unique passwords for production accounts
