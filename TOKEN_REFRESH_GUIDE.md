# Token Refresh Implementation Guide

## Overview

The frontend now implements **automatic token refresh** to keep users logged in seamlessly without interrupting their experience. When a JWT token is close to expiring, the system automatically refreshes it using the refresh token.

---

## Architecture

### 4-Layer Token Management

```
┌─────────────────────────────────────────┐
│ useAuth Hook (Controller Layer)         │
│ • Login/Logout                          │
│ • Schedule refresh                      │
│ • Periodic token validation             │
└────────────┬────────────────────────────┘
             │
┌────────────┴────────────────────────────┐
│ authService (Service Layer)              │
│ • login()                                │
│ • logout()                               │
│ • refreshToken()                         │
│ • isAuthenticated()                      │
│ • shouldRefreshToken()                   │
└────────────┬────────────────────────────┘
             │
┌────────────┴────────────────────────────┐
│ tokenManager (Token Layer)               │
│ • getAccessToken()                       │
│ • getRefreshToken()                      │
│ • setTokens()                            │
│ • clearTokens()                          │
│ • isTokenExpired()                       │
│ • isTokenExpiringSoon()                  │
│ • scheduleTokenRefresh()                 │
└────────────┬────────────────────────────┘
             │
┌────────────┴────────────────────────────┐
│ Axios Instance (HTTP Layer)              │
│ • Request interceptor (add token)        │
│ • Response interceptor (handle 401)      │
│ • Auto-refresh on 401 error              │
│ • Request queue for concurrent reqs      │
└─────────────────────────────────────────┘
```

---

## Files Created/Modified

### 1. **src/lib/token.ts** (NEW - 148 lines)
Core token management utility

**Key Functions:**
- `getAccessToken()` - Retrieve current access token
- `getRefreshToken()` - Retrieve refresh token
- `setTokens()` - Store tokens securely
- `clearTokens()` - Remove tokens
- `isTokenExpired()` - Check expiration
- `isTokenExpiringSoon()` - Check if expiring in next 60 seconds
- `scheduleTokenRefresh()` - Schedule automatic refresh

**Example:**
```typescript
import { tokenManager } from '@/lib/token';

const token = tokenManager.getAccessToken();
if (tokenManager.isTokenExpiringSoon(token)) {
  // Refresh before expiry
}
```

### 2. **src/lib/api.ts** (MODIFIED - 120 lines)
Enhanced Axios instance with automatic refresh logic

**Features:**
- Request interceptor adds token to all requests
- Response interceptor handles 401 errors
- Automatic token refresh on 401
- Request queuing during refresh (prevents concurrent refresh calls)
- Fallback logout on final 401

**How it works:**
1. Request sent with Authorization header
2. If 401 received:
   - If not already refreshing: initiate refresh
   - If refreshing: queue request
3. Refresh endpoint called with refresh token
4. New token stored in cookies
5. Queued requests retried with new token
6. Original request retried

**Example:**
```typescript
// Automatically adds "Authorization: Bearer {token}" header
const response = await api.get('/jobs');

// If 401: automatically refreshes token and retries
```

### 3. **src/service/auth.service.ts** (MODIFIED - 70 lines)
Enhanced authentication service

**New Methods:**
- `refreshToken(refreshToken?)` - Refresh access token
- `getAccessToken()` - Get current token
- `isAuthenticated()` - Check if user logged in and token valid
- `shouldRefreshToken()` - Check if token expiring soon

**Example:**
```typescript
import { authService } from '@/service/auth.service';

// Refresh manually
const response = await authService.refreshToken();

// Check if should refresh
if (authService.shouldRefreshToken()) {
  await authService.refreshToken();
}
```

### 4. **src/hooks/useAuth.ts** (MODIFIED - 120 lines)
Enhanced authentication hook with automatic token refresh

**New Features:**
- Automatic token refresh scheduling
- Periodic token validation (every 30 seconds)
- Cleanup of scheduled tasks
- New `isRefreshing` state
- New `refreshToken()` method

**Example:**
```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';

export function Dashboard() {
  const { user, isAuthenticated, isRefreshing, logout } = useAuth();

  if (isRefreshing) {
    return <p>Refreshing session...</p>;
  }

  if (!isAuthenticated) {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <h1>Welcome {user?.firstName}</h1>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

---

## Token Refresh Flow

### Scenario 1: User Has Valid Token

```
User opens app
    ↓
useAuth hook initializes
    ↓
Check token in cookies
    ↓
Token valid? YES
    ↓
Schedule automatic refresh
    ↓
Set up 30-second validation interval
    ↓
User can make requests
    ↓
60 seconds before expiry → Auto-refresh token
```

### Scenario 2: Token Expired, User Makes Request

```
User makes API call
    ↓
Axios adds token to header
    ↓
Request sent to backend
    ↓
Backend returns 401 (token expired)
    ↓
Axios interceptor catches 401
    ↓
Is refresh already happening? NO
    ↓
Call POST /auth/refresh with refresh token
    ↓
Backend returns new access token
    ↓
tokenManager stores new token
    ↓
Retry original request with new token
    ↓
Request succeeds (200)
    ↓
User never sees error
```

### Scenario 3: Concurrent Requests During Refresh

```
3 requests made simultaneously
    ↓
All 401 because token expired
    ↓
First request triggers refresh
    ↓
Requests 2 & 3 added to queue
    ↓
Refresh completes
    ↓
Requests 2 & 3 retried with new token
    ↓
All requests succeed
```

### Scenario 4: Refresh Token Also Expired

```
User opens stale tab (days later)
    ↓
useAuth initializes
    ↓
Check token: EXPIRED
    ↓
Try to refresh with refresh token
    ↓
Backend rejects refresh token: EXPIRED
    ↓
Axios interceptor catches error
    ↓
Clear all tokens
    ↓
Redirect to /login
```

---

## Configuration

### Token Expiry Buffer

In `src/lib/token.ts`:
```typescript
const TOKEN_EXPIRY_BUFFER = 60; // Refresh 60 seconds before expiry
```

This prevents edge cases where token expires mid-request. Adjust based on your needs:
- **30 seconds** - Aggressive (more requests)
- **60 seconds** - Balanced (default)
- **300 seconds** - Conservative (fewer requests)

### Token Validation Interval

In `src/hooks/useAuth.ts`:
```typescript
const REFRESH_CHECK_INTERVAL = 30000; // Check every 30 seconds
```

How often to validate token status. Adjust based on needs:
- **10000** (10s) - Very frequent, more overhead
- **30000** (30s) - Balanced (default)
- **60000** (1m) - Less frequent, might miss expiry

### Cookie Settings

In `src/lib/token.ts`:
```typescript
const cookieOptions = {
  expires: 7,                          // 7 days
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'Strict',                  // CSRF protection
};
```

---

## Backend Requirements

### Refresh Token Endpoint

Your Java backend must implement:

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token (optional)",
    "user": {
      "id": "123",
      "email": "user@test.com",
      "firstName": "John"
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "INVALID_REFRESH_TOKEN",
  "message": "Refresh token expired or invalid"
}
```

### Login Response

Login endpoint must return both tokens:

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "access_token",
    "refreshToken": "refresh_token",
    "user": { ... }
  }
}
```

---

## Usage Examples

### Example 1: Basic Login/Logout

```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Automatically redirects to dashboard
      // Token auto-refreshes in background
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSubmit(
        formData.get('email') as string,
        formData.get('password') as string,
      );
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

### Example 2: Check Authentication Status

```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';

export function UserMenu() {
  const { user, isAuthenticated, isRefreshing, logout } = useAuth();

  if (!isAuthenticated) {
    return <a href="/login">Login</a>;
  }

  return (
    <div>
      {isRefreshing && <span className="spinner" />}
      <span>{user?.firstName}</span>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### Example 3: Manual Token Refresh

```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';

export function ManualRefreshButton() {
  const { refreshToken, isRefreshing, user } = useAuth();

  const handleRefresh = async () => {
    try {
      await refreshToken();
      console.log('Token refreshed');
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  return (
    <button onClick={handleRefresh} disabled={isRefreshing || !user}>
      {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
    </button>
  );
}
```

### Example 4: Protected Component

```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';

export function Dashboard() {
  const { isAuthenticated, isRefreshing, isHydrated } = useAuth();
  const { data: jobs } = useJobs();

  if (!isHydrated) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  return (
    <div>
      {isRefreshing && <p>Refreshing session...</p>}
      <h1>Jobs</h1>
      <ul>
        {jobs?.map((job) => (
          <li key={job.id}>{job.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Security Features

### 1. Secure Cookie Storage
- HttpOnly cookies prevent JavaScript access
- Secure flag ensures HTTPS only in production
- SameSite=Strict prevents CSRF attacks

### 2. Token Expiration Handling
- Tokens refresh 60 seconds before expiry
- Expired tokens immediately rejected
- Invalid refresh tokens trigger logout

### 3. Request Queuing
- Prevents multiple simultaneous refresh calls
- All requests wait for single refresh completion
- Prevents race conditions

### 4. Automatic Cleanup
- Intervals cleared on logout
- Timeouts cancelled on unmount
- No memory leaks

---

## Troubleshooting

### Problem: User keeps getting logged out

**Solution 1:** Check backend refresh endpoint
```bash
# Test with curl
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your_token"}'
```

**Solution 2:** Verify refresh token is returned from login
```json
// Backend login response should include:
{
  "data": {
    "token": "...",
    "refreshToken": "..."  // <- Must be present
  }
}
```

### Problem: Token not refreshing automatically

**Check:**
1. Is `useAuth()` hook being used?
2. Is token expiry buffer correct?
3. Is periodic validation interval running?

**Debug:**
```typescript
import { tokenManager } from '@/lib/token';

const token = tokenManager.getAccessToken();
console.log('Token valid:', tokenManager.isTokenValid(token));
console.log('Expiring soon:', tokenManager.isTokenExpiringSoon(token));
console.log('Time until expiry:', tokenManager.getTimeUntilExpiry(token), 'seconds');
```

### Problem: 401 errors still showing to user

**Solution:** Ensure axios interceptor is properly retrying
```typescript
// In api.ts, check that originalRequest is retried:
return api(originalRequest);
```

### Problem: Refresh token expired error

This is expected when user hasn't used app for days. They should log in again:
```typescript
// User redirected to /login
// This is correct behavior
```

---

## Best Practices

### Do ✅
- Use `useAuth()` hook in components that need auth
- Check `isHydrated` before rendering protected content
- Show loading state during `isRefreshing`
- Call `logout()` to properly clean up
- Test token expiry in development

### Don't ❌
- Don't manually parse tokens in components
- Don't store tokens in localStorage
- Don't make direct token API calls (use authService instead)
- Don't ignore refresh errors
- Don't forget to handle 401 responses

---

## Testing

### Test 1: Normal Login Flow
```
1. Open app
2. Login with valid credentials
3. Should redirect to dashboard
4. Token stored in cookies
```

### Test 2: Automatic Token Refresh
```
1. Login
2. Open DevTools → Application → Cookies
3. Note token expiry time
4. Wait or mock time forward
5. Make API request
6. Token should auto-refresh
7. Request succeeds
```

### Test 3: Expired Refresh Token
```
1. Login
2. Clear all cookies manually
3. Make API request
4. Should redirect to /login
5. No error visible to user
```

### Test 4: Concurrent Requests
```
1. Login
2. Open console, set token expiry to very soon
3. Make 5 API requests simultaneously
4. Should see only ONE refresh request
5. All 5 original requests succeed
```

---

## Summary

**What happens:**
- User logs in → Tokens stored in secure cookies
- User makes requests → Token added to headers
- Token expiring → Auto-refresh before expiry
- Token expired → Auto-refresh on 401 response
- Refresh token expired → Redirect to login

**Files involved:**
1. `src/lib/token.ts` - Token utilities
2. `src/lib/api.ts` - Axios interceptors
3. `src/service/auth.service.ts` - Auth methods
4. `src/hooks/useAuth.ts` - Auth state management

**No manual intervention needed** - all handled automatically in background!

EOF
cat /vercel/share/v0-project/TOKEN_REFRESH_GUIDE.md
