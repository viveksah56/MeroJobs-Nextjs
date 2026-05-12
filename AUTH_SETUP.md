# Authentication Setup - Mero Jobs

This document outlines the professional authentication system implemented for Mero Jobs using modern web technologies.

## Architecture Overview

### Technologies Used
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React version with hooks
- **Axios** - HTTP client for API requests
- **TanStack React Query (v5)** - Server state management and caching
- **js-cookie** - Cookie management
- **TypeScript** - Type-safe development

### Key Features
- Cookie-based token storage (secure, HttpOnly compatible)
- Automatic token refresh on 401 responses
- Protected route middleware
- Type-safe API interactions
- Optimistic state management
- Request/response interceptors

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          # Login page (metadata & layout)
│   ├── dashboard/page.tsx          # Protected dashboard
│   └── layout.tsx                  # Root layout with providers
├── hooks/
│   └── useAuth.ts                  # Main authentication hook
├── lib/
│   ├── api.ts                      # Axios instance with interceptors
│   └── types/auth.ts               # TypeScript interfaces
├── provider/
│   └── query-provider.tsx          # React Query provider wrapper
├── service/
│   └── auth.service.ts             # API service layer
├── views/
│   └── auth/login-form.tsx         # Login form component
├── middleware.ts                   # Route protection middleware
└── .env.local                      # Environment variables

```

## Setup Instructions

### 1. Environment Variables

The `.env.local` file contains all necessary configuration:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Database credentials (from backend setup)
DB_URL=...
DB_USERNAME=...
DB_PASSWORD=...

# JWT Configuration
JWT_SECRET=...
JWT_EXPIRATION=3600000        # 1 hour in milliseconds
JWT_REFRESH_EXPIRATION=86400000  # 24 hours

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 2. API Requirements

Your backend API must implement the following endpoints:

#### POST `/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "job_seeker"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST `/auth/logout`
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/auth/verify`
Verify current token validity
**Response:** Same as login response

#### POST `/auth/refresh`
Refresh access token using refresh token
**Response:** Same as login response

### 3. Hook Usage

The `useAuth` hook provides all authentication functionality:

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const {
    user,              // Current user or null
    isAuthenticated,   // Boolean check
    isLoading,        // Loading state during login
    isHydrated,       // Whether auth state is initialized
    login,            // Login function (email, password) => Promise
    logout,           // Logout function
    error             // Last error object
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (!isHydrated) return null; // Wait for auth state initialization

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## Authentication Flow

### 1. Login Process
```
User submits credentials
        ↓
Login form validates input (Zod)
        ↓
useAuth.login() called
        ↓
authService.login() makes API request
        ↓
Response received with token + user data
        ↓
Token stored in secure cookie
        ↓
User data stored in cookie
        ↓
Redirect to /dashboard
```

### 2. Protected Routes
```
User navigates to /dashboard
        ↓
Middleware checks for auth_token cookie
        ↓
Token present? → Proceed
Token missing? → Redirect to /login
```

### 3. Token Refresh
```
API returns 401 (Unauthorized)
        ↓
Axios interceptor catches error
        ↓
If 401 && not login page → Redirect to /login
```

## Cookie Storage Details

### Token Cookie
- **Name:** `auth_token`
- **Expires:** 7 days
- **Secure:** true (HTTPS only in production)
- **SameSite:** Strict
- **HttpOnly:** Can be configured on backend

### User Cookie
- **Name:** `user_data`
- **Content:** JSON stringified user object
- **Expires:** 7 days
- **Secure:** true (HTTPS only in production)
- **SameSite:** Strict

## API Client Configuration

The Axios instance in `src/lib/api.ts` is configured with:

### Default Headers
```typescript
{
  'Content-Type': 'application/json'
}
```

### Interceptors
- **Request:** Adds authorization headers if needed
- **Response:** Handles 401 errors by redirecting to login

### Base URL
Configured from `NEXT_PUBLIC_API_URL` environment variable

## Type Safety

All authentication types are defined in `src/lib/types/auth.ts`:

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}
```

## Security Best Practices

1. **HTTPS Only** - Set `secure: true` for cookies in production
2. **SameSite Cookies** - Prevents CSRF attacks
3. **JWT Validation** - Tokens are validated via JWT decode
4. **Automatic Logout** - Expired tokens are detected and cleared
5. **Protected Routes** - Middleware prevents unauthorized access
6. **Type Safety** - TypeScript prevents security vulnerabilities
7. **Error Handling** - Sensitive errors are not exposed to users

## Troubleshooting

### Login fails with "Invalid credentials"
- Verify API endpoint is accessible
- Check `NEXT_PUBLIC_API_URL` configuration
- Ensure credentials are correct
- Check backend API implementation

### User logged out immediately
- Check token expiration time in `.env.local`
- Verify cookie configuration (secure, sameSite)
- Check browser cookie settings

### Protected routes not working
- Ensure `middleware.ts` is in project root
- Verify route names in `protectedRoutes` array
- Check cookie name matches (`auth_token`)

### Hydration mismatch
- Always check `isHydrated` state before rendering user-specific content
- Use `'use client'` directive in client components

## Advanced Customization

### Adding OAuth
To add Google OAuth:

1. Update `authService.ts` with OAuth endpoint
2. Create OAuth callback handler
3. Update login form with OAuth button
4. Configure OAuth provider settings

### Custom Token Storage
To use localStorage instead (not recommended):

Edit `useAuth.ts`:
```typescript
// Instead of setCookie/getCookie
localStorage.setItem('auth_token', token);
const token = localStorage.getItem('auth_token');
```

### Adding Refresh Token Logic
Extend the refresh interceptor in `api.ts`:

```typescript
let isRefreshing = false;

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      try {
        await authService.refreshToken();
        return api(error.config);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

## Production Deployment

Before deploying to production:

1. Update `NEXT_PUBLIC_API_URL` to production API URL
2. Set `NODE_ENV=production` for secure cookies
3. Enable HTTPS for all endpoints
4. Configure CORS in backend
5. Update JWT secret in backend
6. Set appropriate token expiration times
7. Test login flow thoroughly
8. Monitor auth errors in production

## Support

For issues or questions about the authentication setup, refer to:
- [Next.js Documentation](https://nextjs.org)
- [Axios Documentation](https://axios-http.com)
- [React Query Documentation](https://tanstack.com/query)
- [JWT.io](https://jwt.io)
