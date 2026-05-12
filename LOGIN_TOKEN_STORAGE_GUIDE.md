
# Login Token Storage Guide

Complete guide on how tokens are stored on login and used for authentication.

---

## What Happens on Login

### Step-by-Step Flow

```
User enters credentials
     ↓
Click "Sign In" button
     ↓
Component calls: login(email, password)
     ↓
useAuth hook: loginMutation.mutate()
     ↓
authService.login(data)
     ↓
api.post('/auth/login', { email, password })
     ↓
Backend validates and returns:
{
  success: true,
  data: {
    token: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    refreshToken: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    user: {
      id: "123",
      email: "user@test.com",
      firstName: "John",
      lastName: "Doe",
      role: "EMPLOYEE"
    }
  }
}
     ↓
authService stores BOTH tokens:
tokenManager.setTokens(token, refreshToken)
     ↓
Tokens stored in secure httpOnly cookies:
- auth_token = {access token}
- refresh_token = {refresh token}
     ↓
useAuth hook receives response:
- Store user data in cookie
- Set React state: user = userData
- Schedule automatic token refresh
- Invalidate React Query cache
     ↓
Redirect to /dashboard
     ↓
User logged in and authenticated!
```

---

## What Gets Stored

### Access Token (Short-lived)
```
Key: auth_token
Value: {JWT token}
Expires: 7 days (cookie expiry)
Used for: Authenticating API requests
Created by: Backend on login
```

### Refresh Token (Long-lived)
```
Key: refresh_token
Value: {JWT refresh token}
Expires: 30 days (cookie expiry)
Used for: Refreshing access token when it expires
Created by: Backend on login
```

### User Data (In Cookie)
```
Key: user_data
Value: { id, email, firstName, lastName, role }
Expires: 7 days (cookie expiry)
Used for: UI display (name, profile, etc.)
Created by: useAuth hook from login response
```

---

## Code Flow: auth.service.ts

### Login Method

```typescript
export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // 1. Call backend login endpoint
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // 2. Extract tokens from response
    if (response.data?.data?.token) {
      // 3. Store BOTH tokens in cookies
      tokenManager.setTokens(
        response.data.data.token,        // Access token
        response.data.data.refreshToken, // Refresh token
      );
    }
    
    // 4. Return entire response
    return response.data;
  },
};
```

**What happens:**
- ✅ Access token stored in `auth_token` cookie
- ✅ Refresh token stored in `refresh_token` cookie
- ✅ Both are HttpOnly (JavaScript can't access)
- ✅ Both are Secure (HTTPS only in production)
- ✅ Both are SameSite=Strict (CSRF protection)

---

## Code Flow: useAuth Hook

### Login Mutation

```typescript
const loginMutation = useMutation({
  mutationFn: (data: LoginRequest) => authService.login(data),
  onSuccess: (response) => {
    // 1. Extract tokens and user data
    const token = response.data.token;
    const userData = response.data.user;
    
    // 2. Store user data in cookie (for UI)
    Cookies.set(USER_STORAGE_KEY, JSON.stringify(userData), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });
    
    // 3. Update React state
    setUser(userData);
    queryClient.setQueryData(['user'], userData);
    
    // 4. Schedule automatic token refresh
    scheduleTokenRefresh(token);
    
    // 5. Redirect to dashboard
    router.push('/dashboard');
  },
});
```

**What happens:**
- ✅ authService.login() already stored both tokens (step 1)
- ✅ useAuth hook stores user data in cookie (step 2)
- ✅ React state updated with user data (step 3)
- ✅ Automatic refresh scheduled (step 4)
- ✅ User redirected to dashboard (step 5)

---

## Secure Token Storage

### Why Cookies?

```typescript
// ✅ SECURE: HttpOnly Cookie (RECOMMENDED)
Cookies.set('auth_token', token, {
  secure: true,        // HTTPS only
  sameSite: 'Strict',  // CSRF protection
  httpOnly: true,      // JavaScript can't access (implied by Cookies library)
});
// ✓ Prevents XSS attacks
// ✓ Prevents CSRF attacks
// ✓ Sent with every request automatically
// ✓ Browser handles expiration

// ❌ INSECURE: localStorage
localStorage.setItem('auth_token', token);
// ✗ Vulnerable to XSS attacks
// ✗ No automatic expiration
// ✗ Not sent with requests (manual handling needed)
// ✗ Not CSRF protected

// ❌ INSECURE: Memory/State
const [token, setToken] = useState('');
// ✗ Lost on page refresh
// ✗ Not persistent
// ✗ Vulnerable to attacks
```

**Your implementation uses SECURE httpOnly cookies!** ✅

---

## Token Flow After Login

### How Tokens Are Used

```
Login successful → tokens stored in secure cookies

User navigates to /dashboard

Component makes API request:
  api.get('/jobs')
         ↓
Request Interceptor:
  Gets access token from cookie: auth_token
  Adds Authorization header: Bearer {token}
         ↓
Backend:
  Validates Authorization header
  Returns data
         ↓
Response Interceptor:
  If 401: Uses refresh token to get new access token
  If 200: Returns data to component
         ↓
Component displays data

User continues working...

60 seconds before token expiry:
  Automatic refresh triggered
  Calls /auth/refresh with refresh token
  Gets new access token
  Stores in auth_token cookie
  All future requests use new token
         ↓
User never sees interruption!
```

---

## Token Expiry and Refresh

### How Long Tokens Last

```typescript
// Access Token (auth_token)
// - Created: On login
// - Expires: Based on backend JWT exp claim
// - Typical: 1 hour
// - Action: Auto-refresh 60 seconds before expiry

// Refresh Token (refresh_token)
// - Created: On login
// - Expires: Based on backend JWT exp claim
// - Typical: 30 days or more
// - Action: Used to get new access token

// Cookie Expiry (browser-level)
// - Access token cookie: 7 days
// - Refresh token cookie: 30 days
// - User data cookie: 7 days
```

### Automatic Refresh Cycle

```typescript
// In tokenManager.scheduleTokenRefresh()

const timeUntilExpiry = tokenManager.getTimeUntilExpiry(token);
// Gets seconds until JWT exp claim expires
// Example: 3540 seconds (59 minutes)

const TOKEN_EXPIRY_BUFFER = 60;
// Refresh 60 seconds BEFORE expiry

const refreshTime = (timeUntilExpiry - TOKEN_EXPIRY_BUFFER) * 1000;
// refreshTime = (3540 - 60) * 1000 = 3480000ms = 58 minutes

const timeoutId = setTimeout(() => {
  onRefreshNeeded(); // Call refresh endpoint
}, refreshTime);

// After 58 minutes:
// POST /auth/refresh with refresh_token
// Get new access_token
// Store in auth_token cookie
// Schedule next refresh (in 59 minutes)
```

---

## Component Usage

### Simple Login Example

```typescript
'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // This triggers the entire flow:
      // 1. Call backend /auth/login
      // 2. Store both tokens in cookies
      // 3. Update React state with user
      // 4. Schedule automatic refresh
      // 5. Redirect to dashboard
      await login(email, password);
      
      // If we get here, everything succeeded
      // User is now logged in!
    } catch (err) {
      console.error('Login failed:', err);
      // Error displayed via error state
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

---

## Verify Tokens Are Stored

### Check in Browser

```
1. Open DevTools (F12)
2. Go to Application tab
3. Click Cookies
4. Select your domain
5. You should see:
   - auth_token: (your access JWT)
   - refresh_token: (your refresh JWT)
   - user_data: (your user JSON)
6. Each should have:
   - ✓ HttpOnly: checked
   - ✓ Secure: checked (if HTTPS)
   - ✓ SameSite: Strict
   - ✓ Expires: 7 days or 30 days from now
```

### Check with Code

```typescript
// Get access token
const accessToken = tokenManager.getAccessToken();
console.log('Access token:', accessToken);

// Get refresh token
const refreshToken = tokenManager.getRefreshToken();
console.log('Refresh token:', refreshToken);

// Check if valid
if (accessToken && tokenManager.isTokenValid(accessToken)) {
  console.log('Access token is valid');
  const timeLeft = tokenManager.getTimeUntilExpiry(accessToken);
  console.log(`Token expires in ${timeLeft} seconds`);
}

// Check if refresh is scheduled
if (tokenManager.isTokenExpiringSoon(accessToken)) {
  console.log('Token expiring soon, refresh needed');
}
```

---

## Backend Response Format (Required)

### Login Response

Your Java backend `/auth/login` must return:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InVzZXJAdGVzdC5jb20iLCJpYXQiOjE3MTMyMzQ1NzIsImV4cCI6MTcxMzIzODE3Mn0...",
    "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE3MTMyMzQ1NzIsImV4cCI6MTcxNTgyNjU3Mn0...",
    "user": {
      "id": "123",
      "email": "user@test.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE"
    }
  }
}
```

**Key requirements:**
- ✅ Both `token` and `refreshToken` returned
- ✅ `token` has exp claim (expiry time)
- ✅ `refreshToken` has exp claim (longer expiry)
- ✅ `user` object returned
- ✅ Standard JWT format

---

## Backend Implementation (Java)

### Login Endpoint

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
  // 1. Validate credentials
  User user = userService.findByEmail(request.getEmail());
  if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
    return ResponseEntity.badRequest()
      .body(new ApiResponse<>(false, null, "Invalid credentials"));
  }

  // 2. Generate access token (1 hour)
  String accessToken = jwtTokenProvider.generateToken(
    user,
    Duration.ofHours(1)
  );

  // 3. Generate refresh token (30 days)
  String refreshToken = jwtTokenProvider.generateToken(
    user,
    Duration.ofDays(30)
  );

  // 4. Store refresh token in database (optional but recommended)
  user.setRefreshToken(refreshToken);
  userService.save(user);

  // 5. Return both tokens
  return ResponseEntity.ok(
    new ApiResponse<>(true, new LoginResponse(
      accessToken,
      refreshToken,
      user
    ), "Login successful")
  );
}
```

### Response DTO

```java
public class LoginResponse {
  private String token;
  private String refreshToken;
  private UserDTO user;

  public LoginResponse(String token, String refreshToken, User user) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.user = new UserDTO(user);
  }

  // Getters...
}
```

---

## Troubleshooting

### Problem: Tokens Not Being Stored

**Check:**
1. Is login response returning both `token` and `refreshToken`?
   ```
   DevTools → Network → POST /auth/login → Response tab
   Should see both fields
   ```

2. Is authService.login() being called?
   ```typescript
   console.log('[v0] Login response:', response);
   // Should see tokens in response
   ```

3. Are cookies showing in DevTools?
   ```
   DevTools → Application → Cookies
   Should see auth_token, refresh_token, user_data
   ```

### Problem: Token Not Being Sent with Requests

**Check:**
1. Are cookies stored?
   ```
   DevTools → Application → Cookies
   Should see auth_token
   ```

2. Is request interceptor working?
   ```
   DevTools → Network → Any API request
   → Headers tab → Should see Authorization: Bearer {token}
   ```

3. Is api instance being used?
   ```typescript
   // ✅ Correct (uses interceptor)
   api.get('/jobs');
   
   // ❌ Wrong (no interceptor)
   fetch('/api/jobs');
   ```

### Problem: Token Not Auto-Refreshing

**Check:**
1. Is scheduleTokenRefresh called after login?
   ```typescript
   console.log('[v0] Scheduling refresh for token:', token);
   ```

2. Is token expiring soon?
   ```typescript
   const token = tokenManager.getAccessToken();
   const timeLeft = tokenManager.getTimeUntilExpiry(token);
   console.log('Token expires in:', timeLeft, 'seconds');
   ```

3. Are you waiting long enough?
   - Refresh scheduled 60 seconds BEFORE expiry
   - If token expires in 1 hour, refresh happens in 59 minutes
   - Use shorter token expiry for testing (e.g., 5 minutes)

---

## Summary

### Login Process
1. User submits credentials
2. Frontend calls `authService.login(email, password)`
3. Backend validates and returns `{ token, refreshToken, user }`
4. Frontend stores both tokens in secure httpOnly cookies
5. Frontend updates React state with user data
6. Frontend schedules automatic token refresh (60s before expiry)
7. Frontend redirects to dashboard
8. User is authenticated!

### Token Storage
- **Access Token** (`auth_token`): Short-lived, used for API requests
- **Refresh Token** (`refresh_token`): Long-lived, used to refresh access token
- **User Data** (`user_data`): For UI display
- **All Secure**: HttpOnly, Secure, SameSite=Strict

### Automatic Refresh
- Tokens refresh 60 seconds before expiry
- Automatic, no user action needed
- Seamless, user never sees interruption
- Works even for long-running sessions

### Everything Already Implemented
✅ Token storage on login
✅ Secure cookie handling
✅ Automatic refresh scheduling
✅ Token validation and expiry checking
✅ Request/response interceptors
✅ Error handling and fallback

**Just ensure your backend returns both `token` and `refreshToken` on login!**

