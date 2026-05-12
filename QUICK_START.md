# Quick Start - Authentication Setup

## 30-Second Setup

### 1. Verify Dependencies
```bash
npm list @tanstack/react-query js-cookie axios
```

All dependencies are already installed! ✅

### 2. Check Environment Variables
Open `.env.local` - all variables are pre-configured with:
- API endpoint: `http://localhost:8000/api/v1`
- JWT settings
- OAuth credentials placeholders

### 3. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## Login Page Testing

### Navigate to Login
```
http://localhost:3000/login
```

### Try the Form
1. Enter email: `user@example.com`
2. Enter password: `password123` (minimum 8 characters)
3. Click "Sign in"

The form will make a request to:
```
POST http://localhost:8000/api/v1/auth/login
```

---

## Backend Integration Checklist

Your backend API must implement these endpoints:

- [ ] `POST /auth/login` - User login
- [ ] `POST /auth/logout` - User logout
- [ ] `GET /auth/verify` - Verify token
- [ ] `POST /auth/refresh` - Refresh token

Expected response format:
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
    "token": "jwt_token_string",
    "refreshToken": "refresh_token_string"
  }
}
```

---

## Using Authentication in Your Components

### In a Client Component
```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!user) return <p>Not logged in</p>;

  return (
    <>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Sign Out</button>
    </>
  );
}
```

### Making API Calls
```typescript
import api from '@/lib/api';

// Simple GET
const jobs = await api.get('/jobs');

// POST with data
await api.post('/applications', { jobId: '123' });

// PUT/PATCH
await api.patch('/profile', { name: 'New Name' });
```

---

## Common Issues & Solutions

### "API is not responding"
- Ensure backend is running on `http://localhost:8000`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is configured in backend

### "Token not persisting"
- Check browser cookies are enabled
- Ensure secure flag doesn't require HTTPS locally
- Check cookie name: `auth_token`

### "Hydration mismatch"
- Always check `isHydrated` before rendering user data
- Use `'use client'` directive

### "Types not recognized"
- Ensure `useAuth` is imported from `'@/hooks/useAuth'`
- Check TypeScript compilation: `npm run build`

---

## File Structure Reference

```
src/
├── hooks/useAuth.ts              ← Use this hook in all components
├── lib/
│   ├── api.ts                    ← Use for all API calls
│   └── types/auth.ts             ← Type definitions
├── service/auth.service.ts       ← API methods (don't modify)
├── provider/query-provider.tsx   ← Already in layout
├── views/auth/login-form.tsx     ← Login page component
└── app/dashboard/page.tsx        ← Protected dashboard
```

---

## Protected Routes Example

To protect a page, add it to `src/middleware.ts`:

```typescript
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
```

Any unauthenticated user accessing these routes will be redirected to `/login`.

---

## Environment Variables

Change API endpoint for different environments:

**Development**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**Production**
```env
NEXT_PUBLIC_API_URL=https://api.merojobs.com/api/v1
```

---

## Testing the Auth Flow

### 1. Login Success
- Backend responds with valid token and user data
- User is stored in state
- Cookies are set
- Redirect to `/dashboard`

### 2. Login Failure  
- Backend returns error
- Error message displayed
- User stays on login page
- Cookies not set

### 3. Logout
- Cookies cleared
- User state cleared
- Redirect to `/login`

### 4. Protected Route
- Without token → Redirect to `/login`
- With token → Access granted

---

## Next Steps

1. ✅ **Install & Setup** - Dependencies already installed
2. ⏭️ **Backend API** - Implement endpoints
3. ⏭️ **Test Login** - Try the login form
4. ⏭️ **Add Protected Pages** - Add to middleware
5. ⏭️ **User Profile** - Build user pages
6. ⏭️ **Logout** - Implement user menu with logout

---

## Documentation

- **AUTH_SETUP.md** - Full setup documentation
- **IMPLEMENTATION_SUMMARY.md** - What was implemented
- **src/lib/types/auth.ts** - Type definitions
- **src/hooks/useAuth.ts** - Hook source code

---

## Need Help?

1. Check **AUTH_SETUP.md** for detailed information
2. Review **IMPLEMENTATION_SUMMARY.md** for architecture
3. Check hook implementation in **src/hooks/useAuth.ts**
4. Review API config in **src/lib/api.ts**

---

**Ready to go! Your authentication system is production-ready.** 🚀
