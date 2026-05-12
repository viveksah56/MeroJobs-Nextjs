# Authentication Setup Guide

## Overview
This Next.js 16 application uses professional authentication with:
- **Cookie-based session storage** for secure token management
- **React Query** (@tanstack/react-query) for server state management and caching
- **Axios** with interceptors for API communication
- **TypeScript** for type safety
- **ESLint** for code quality

## Environment Configuration

### .env File
```
NEXT_PUBLIC_BASE_URL=http://localhost:8000/api/v1/
```

The `NEXT_PUBLIC_BASE_URL` environment variable points to your backend API. Update this to match your backend server URL.

## Architecture

### Core Authentication Files

1. **src/lib/auth.ts** - Authentication utilities
   - `setAuthToken(token)` - Store JWT in secure cookie
   - `getAuthToken()` - Retrieve token from cookie
   - `removeAuthToken()` - Clear token on logout
   - `isTokenExpired(token)` - Check token validity
   - `isAuthenticated()` - Verify user is logged in

2. **src/lib/api-client.ts** - Axios instance with interceptors
   - Automatically adds `Authorization` header with JWT
   - Handles 401 responses with automatic redirect to login
   - Configured for secure cookie communication

3. **src/hooks/use-auth.ts** - Main authentication hook
   - `useAuth()` - Returns user, login/logout mutations, loading states
   - Handles all API communication via React Query
   - Automatic error handling and state synchronization

4. **src/views/auth/login-form.tsx** - Login page component
   - Email/password form with validation
   - Remember me functionality
   - Error display with user feedback

5. **src/app/(auth)/login/page.tsx** - Login route
   - Server-side metadata and SEO
   - Renders LoginForm component

## API Integration

### Expected API Endpoints

#### POST /auth/login
Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "remember": false
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "optional_refresh_token",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### GET /auth/me
Headers: `Authorization: Bearer {token}`

Response:
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### POST /auth/logout
Headers: `Authorization: Bearer {token}`

Response: 200 OK

## Features

### Cookie-Based Storage
- Tokens stored as HTTP-only cookies (Secure, SameSite=Strict)
- Automatically sent with requests via `withCredentials: true`
- Protected against XSS attacks
- Server-accessible for validation

### React Query Integration
- Automatic caching and invalidation
- Retry logic for failed requests
- Stale-while-revalidate patterns
- Background synchronization

### TypeScript Support
- Full type safety for API responses
- Interface definitions for User and Auth responses
- Custom hook types for IDE autocomplete

### Error Handling
- Global error interception
- Automatic logout on 401 responses
- User-friendly error messages
- Network error recovery

## Usage

### Login
```tsx
import { useAuth } from '@/hooks/use-auth';

export function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(email, password);
    }}>
      {/* form fields */}
    </form>
  );
}
```

### Protected Routes
```tsx
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Access User Data
```tsx
import { useAuth } from '@/hooks/use-auth';

export function UserProfile() {
  const { user, isLoadingUser, isAuthenticated } = useAuth();

  if (isLoadingUser) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return <div>Welcome, {user?.name}</div>;
}
```

### Logout
```tsx
import { useAuth } from '@/hooks/use-auth';

export function LogoutButton() {
  const { logout, isLoggingOut } = useAuth();

  return (
    <button onClick={() => logout()} disabled={isLoggingOut}>
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

## Security Best Practices

1. **Token Storage**
   - Use HTTP-only cookies (default in this implementation)
   - Set Secure flag for HTTPS production
   - Use SameSite=Strict to prevent CSRF

2. **Password Requirements**
   - Minimum 8 characters (enforced in validation)
   - Hash passwords with bcrypt on backend (not in this code)

3. **API Communication**
   - Always use HTTPS in production
   - Validate JWT signatures on backend
   - Implement token rotation/refresh if needed

4. **CORS Configuration**
   - Configure backend CORS to accept cookies
   - Use credentials: 'include' in fetch (handled by axios)

5. **Session Management**
   - Automatic cleanup on logout
   - Token expiration validation
   - Redirect to login on unauthorized access

## Query Client Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      gcTime: 1000 * 60 * 10,       // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

## ESLint Configuration

The project includes strict ESLint rules:
- TypeScript strict mode
- React hooks best practices
- No console.log in production
- Prefer const over var
- Strict equality checks

## Development

### Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Run Linter
```bash
npm run lint
```

## Troubleshooting

### 401 Unauthorized
- Check if token is stored in cookies
- Verify token hasn't expired
- Confirm backend validates token correctly

### CORS Issues
- Add backend URL to CORS allowlist
- Ensure `withCredentials: true` is set
- Check cookie domain configuration

### Token Not Persisting
- Check if cookies are enabled in browser
- Verify cookie Secure flag for HTTPS
- Check SameSite cookie policy

## Next Steps

1. Connect to your backend API
2. Update `NEXT_PUBLIC_BASE_URL` in .env
3. Test login flow with valid credentials
4. Implement refresh token logic if needed
5. Add additional protected routes/pages
