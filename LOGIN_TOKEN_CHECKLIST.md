
# Login Token Storage - Implementation Checklist

Quick checklist to ensure token storage is working correctly.

---

## Frontend (Next.js) - Already Implemented ✅

- [x] **Token Manager** (`src/lib/token.ts`)
  - [x] `setTokens(accessToken, refreshToken)` - Store both tokens
  - [x] `getAccessToken()` - Retrieve access token
  - [x] `getRefreshToken()` - Retrieve refresh token
  - [x] `clearTokens()` - Clear both tokens
  - [x] Secure HttpOnly cookies
  - [x] Token validation and expiry checking

- [x] **Auth Service** (`src/service/auth.service.ts`)
  - [x] `login(email, password)` - Call backend + store tokens
  - [x] `refreshToken()` - Refresh using refresh token
  - [x] `logout()` - Clear tokens
  - [x] Automatic token storage after login

- [x] **useAuth Hook** (`src/hooks/useAuth.ts`)
  - [x] `loginMutation` - Handles login flow
  - [x] `scheduleTokenRefresh()` - Schedule automatic refresh
  - [x] Periodic token validation
  - [x] Cleanup on logout
  - [x] Returns: `user`, `isAuthenticated`, `login`, `logout`, etc.

- [x] **Axios Interceptors** (`src/lib/api.ts`)
  - [x] Request interceptor - Add Authorization header
  - [x] Response interceptor - Handle 401 + auto-refresh
  - [x] Request queuing - Prevent race conditions

---

## Backend (Java) - You Need to Implement

### POST /auth/login

- [ ] Accept: `{ email, password }`
- [ ] Validate email and password
- [ ] If invalid: Return 400 with error message
- [ ] If valid:
  - [ ] Generate access JWT token
    - [ ] Include user info (id, email, name, role)
    - [ ] Set expiry to 1 hour (or your preference)
    - [ ] Example: `exp: (now + 3600 seconds)`
  - [ ] Generate refresh JWT token
    - [ ] Include user id
    - [ ] Set expiry to 30 days (or your preference)
    - [ ] Example: `exp: (now + 2592000 seconds)`
  - [ ] (Optional) Store refresh token in database
  - [ ] Return: `{ success: true, data: { token, refreshToken, user } }`

### Response Format

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
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

---

## Testing Checklist

### Test 1: Login Stores Tokens

```
Steps:
1. Open app in browser
2. Go to login page
3. Enter valid credentials
4. Click "Sign In"
5. Wait for redirect to dashboard

Expected:
- ✅ Page redirects to /dashboard
- ✅ Dashboard loads
- ✅ User name appears in header

Verify with DevTools:
- ✅ Application → Cookies
- ✅ See: auth_token
- ✅ See: refresh_token
- ✅ See: user_data
- ✅ All have expiry times
```

### Test 2: Tokens Used in API Requests

```
Steps:
1. Login successfully
2. Open DevTools → Network tab
3. Click any API request (e.g., GET /jobs)
4. Click the request in Network tab
5. Go to Headers tab
6. Look for Authorization header

Expected:
- ✅ Authorization: Bearer {token}
- ✅ Token is the same as auth_token cookie
- ✅ Request succeeds with 200 status
```

### Test 3: Token Refresh on 401

```
Steps:
1. Login successfully
2. Get access token from cookie:
   console.log(tokenManager.getAccessToken());
3. Manually expire it:
   Cookies.set('auth_token', 'expired_token');
4. Make an API request:
   api.get('/jobs');
5. Watch Network tab

Expected:
- ✅ Request gets 401 response
- ✅ POST /auth/refresh called automatically
- ✅ Original request retried (auto)
- ✅ Request succeeds (200)
- ✅ No error shown to user
```

### Test 4: Automatic Refresh Before Expiry

```
Steps:
1. Login successfully
2. Mock token to expire in 2 minutes:
   // Manually set a token that expires soon
3. Wait and watch Network tab
4. At 60 seconds before expiry:
   - Should see POST /auth/refresh
   - Should see new token stored
   - Should see refresh scheduled again

Expected:
- ✅ Token auto-refreshes before expiry
- ✅ User never sees 401 error
- ✅ Session seamlessly continues
```

### Test 5: Logout Clears Tokens

```
Steps:
1. Login successfully
2. Verify tokens in cookies (DevTools)
3. Click Logout button
4. Redirected to /login page
5. Check cookies again

Expected:
- ✅ Redirected to /login
- ✅ auth_token cookie cleared
- ✅ refresh_token cookie cleared
- ✅ user_data cookie cleared
```

---

## Code Verification

### Verify authService.login()

```typescript
// src/service/auth.service.ts
// Should have:
export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post('/auth/login', data);
    
    // ✅ This line should exist
    if (response.data?.data?.token) {
      tokenManager.setTokens(
        response.data.data.token,        // ✅ Access token
        response.data.data.refreshToken, // ✅ Refresh token
      );
    }
    
    return response.data;
  },
};
```

### Verify useAuth Hook

```typescript
// src/hooks/useAuth.ts
// Should have:
const loginMutation = useMutation({
  mutationFn: (data: LoginRequest) => authService.login(data),
  onSuccess: (response) => {
    const token = response.data.token;
    
    // ✅ This line should exist
    scheduleTokenRefresh(token);
    
    // ✅ Redirect should happen
    router.push('/dashboard');
  },
});
```

### Verify tokenManager

```typescript
// src/lib/token.ts
// Should have:
export const tokenManager = {
  // ✅ Store tokens
  setTokens: (accessToken, refreshToken) => {
    Cookies.set('auth_token', accessToken, cookieOptions);
    Cookies.set('refresh_token', refreshToken, cookieOptions);
  },
  
  // ✅ Get tokens
  getAccessToken: () => Cookies.get('auth_token'),
  getRefreshToken: () => Cookies.get('refresh_token'),
  
  // ✅ Clear tokens
  clearTokens: () => {
    Cookies.remove('auth_token');
    Cookies.remove('refresh_token');
  },
};
```

---

## Common Issues & Solutions

### Issue: Token Not Stored

**Cause:** Backend not returning `refreshToken` in response

**Solution:**
```java
// ❌ WRONG - Missing refreshToken
{
  "success": true,
  "data": {
    "token": "...",
    // Missing refreshToken!
  }
}

// ✅ CORRECT - Both tokens returned
{
  "success": true,
  "data": {
    "token": "...",
    "refreshToken": "...",
    "user": { ... }
  }
}
```

### Issue: Token Not Sent in Requests

**Cause:** Using wrong HTTP library (fetch instead of api)

**Solution:**
```typescript
// ❌ WRONG - No interceptor
fetch('/api/jobs');

// ✅ CORRECT - Uses interceptor
api.get('/jobs');
```

### Issue: Auto-Refresh Not Working

**Cause:** Token expiry too long for testing

**Solution:**
```java
// For testing, use shorter expiry
// Instead of: Duration.ofHours(1)
// Use: Duration.ofMinutes(1)

String token = jwtTokenProvider.generateToken(user, Duration.ofMinutes(1));
// Now token expires in 1 minute instead of 1 hour
// Refresh will trigger 60 seconds before expiry
```

---

## Integration Steps

### Step 1: Verify Frontend (Already Done)

```bash
# Check files exist and are correct
ls -la src/lib/token.ts
ls -la src/lib/api.ts
ls -la src/service/auth.service.ts
ls -la src/hooks/useAuth.ts
```

### Step 2: Implement Backend Login

```java
@PostMapping("/auth/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
  // TODO: Implement
  // 1. Validate credentials
  // 2. Generate access token (1 hour)
  // 3. Generate refresh token (30 days)
  // 4. Return both tokens + user
}
```

### Step 3: Test Together

```bash
# Terminal 1: Start Java backend
mvn spring-boot:run

# Terminal 2: Start Next.js frontend
npm run dev

# Browser: http://localhost:3000
# Login with test credentials
```

### Step 4: Verify in Browser

```
DevTools → Application → Cookies
Should see:
- auth_token
- refresh_token
- user_data
```

---

## Quick Reference

| Item | Status | Location |
|------|--------|----------|
| Token Manager | ✅ Done | `src/lib/token.ts` |
| Auth Service | ✅ Done | `src/service/auth.service.ts` |
| useAuth Hook | ✅ Done | `src/hooks/useAuth.ts` |
| Axios Interceptors | ✅ Done | `src/lib/api.ts` |
| Backend Login | ⏳ TODO | `YourController.java` |
| Backend Refresh | ⏳ TODO | `YourController.java` |
| Backend Logout | ⏳ TODO | `YourController.java` |

---

## Summary

### Frontend - Complete ✅
- Token storage implemented
- Token usage implemented
- Auto-refresh implemented
- Error handling implemented

### Backend - Needs Implementation ⏳
1. POST /auth/login - Return both tokens
2. POST /auth/refresh - Return new access token
3. POST /auth/logout - Clear refresh token

### Testing - Do This Next
1. Login and verify tokens stored
2. Make API request and verify token sent
3. Simulate 401 and verify auto-refresh
4. Logout and verify tokens cleared

**Frontend ready! Waiting for backend implementation.**

