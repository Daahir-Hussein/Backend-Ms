# Authentication Setup Guide

## Installation

1. Install required dependencies:
```bash
cd backend
npm install bcryptjs jsonwebtoken
```

## Setup

1. Create a `.env` file in the backend directory:
```env
DATABASE_URL=mongodb://localhost:27017/al_taqwa_school
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
```

2. Run the setup script to create default admin user:
```bash
npm run setup
```

This will create:
- Email: `admin@altaqwa.com`
- Password: `admin123`
- Role: `admin`

⚠️ **Important**: Change the default admin password after first login!

## API Endpoints

### Public Endpoints

#### Register User
```
POST /api/auth/register
Body: {
  email: "string",
  password: "string",
  role: "admin" | "teacher",
  teacherId: "ObjectId" (required if role is teacher),
  fullName: "string"
}
```

#### Login
```
POST /api/auth/login
Body: {
  email: "string",
  password: "string",
  role: "admin" | "teacher" (optional)
}
Response: {
  token: "JWT_TOKEN",
  user: {
    id: "userId",
    email: "email",
    role: "role",
    name: "fullName",
    classId: "classId" (for teachers)
  }
}
```

### Protected Endpoints (Require Bearer Token)

#### Get Current User
```
GET /api/auth/me
Headers: {
  Authorization: "Bearer JWT_TOKEN"
}
```

#### Change Password
```
PUT /api/auth/change-password
Headers: {
  Authorization: "Bearer JWT_TOKEN"
}
Body: {
  currentPassword: "string",
  newPassword: "string"
}
```

## Creating Teacher Accounts

To create a teacher account:

1. First, create a teacher in the teachers collection
2. Then register a user account linked to that teacher:

```javascript
POST /api/auth/register
{
  "email": "teacher@example.com",
  "password": "teacher123",
  "role": "teacher",
  "teacherId": "TEACHER_ID_FROM_TEACHERS_COLLECTION",
  "fullName": "Teacher Name"
}
```

## Protecting Routes

To protect routes, use the authentication middleware:

```javascript
const { authenticate, authorize } = require("./middleware/authMiddleware");

// Protect route - requires authentication
router.get("/protected", authenticate, controller.method);

// Protect route - requires admin role
router.get("/admin-only", authenticate, authorize("admin"), controller.method);

// Protect route - requires teacher or admin
router.get("/teacher-or-admin", authenticate, authorize("teacher", "admin"), controller.method);
```

## Frontend Integration

The frontend automatically:
- Sends JWT token in Authorization header for all API calls
- Stores token in localStorage
- Includes token in requests after login

## Security Notes

1. **Change JWT_SECRET**: Use a strong, random secret in production
2. **Use HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Tokens expire after 7 days (configurable)
4. **Password Requirements**: Minimum 6 characters (can be increased)
5. **Rate Limiting**: Consider adding rate limiting for login endpoints










