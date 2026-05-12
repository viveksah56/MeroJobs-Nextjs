
# Protected Routes & Multipart - Complete Summary

Complete guide for handling protected routes (with JWT tokens) and multipart file uploads.

---

## Quick Answer

### Question 1: How do I send tokens for protected routes?
**Answer:** The axios interceptor does it automatically. Just use `api.get()`, `api.post()`, etc.

### Question 2: How do I handle multipart for file uploads?
**Answer:** Create `FormData`, append files to it, post with `api.post()`. Don't manually set headers.

---

## Complete Overview

### Your System Architecture

```
Frontend (Next.js)
├─ Component (React UI)
│  └─ onClick → handleUpload(file)
│
├─ Hook (React Query)
│  └─ mutation.mutate(file)
│
├─ Service (Business Logic)
│  └─ const formData = new FormData()
│     └─ api.post('/upload', formData)
│
└─ Axios Instance (HTTP Client)
   ├─ Request Interceptor
   │  └─ Add: Authorization: Bearer {token}
   │
   └─ Response Interceptor
      └─ Catch 401 → auto-refresh → retry
```

### Data Flow: Upload Profile Picture

```
User selects file
     ↓
Component: <input onChange={handleUpload}>
     ↓
Hook: uploadMutation.mutate(file)
     ↓
Service: employeeService.uploadProfilePicture(id, file)
     ├─ Create FormData
     ├─ formData.append('file', file)
     └─ api.post('/employees/{id}/profile-picture', formData)
          ↓
       Axios Request Interceptor
       ├─ Detect FormData object
       ├─ Add Authorization header (auto)
       ├─ Set Content-Type: multipart/form-data (auto)
       └─ Send request
            ↓
         Java Backend
         ├─ Receive request
         ├─ Validate token from Authorization header
         ├─ Process multipart
         └─ Return { success, data }
            ↓
       Axios Response Interceptor
       ├─ Check status code
       ├─ If 401 → refresh token + retry
       └─ Pass response to service
            ↓
         Service: return data
            ↓
         Hook: update cache
            ↓
         Component: re-render with new data
            ↓
         User sees new profile picture
```

---

## 3 Core Concepts

### Concept 1: Request Interceptor (Token)

**Location:** `src/lib/api.ts` - Request Interceptor

**What it does:**
```typescript
api.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
```

**Impact:**
- Every request automatically includes your JWT token
- Token comes from secure httpOnly cookie
- Applied to ALL requests: GET, POST, PUT, DELETE
- Applied to both JSON and multipart requests

**You don't need to:**
- Get the token manually
- Set Authorization header
- Worry about token expiration

### Concept 2: Response Interceptor (Auto-Refresh)

**Location:** `src/lib/api.ts` - Response Interceptor

**What it does:**
```typescript
// If you get 401 (token expired):
// 1. Call /auth/refresh endpoint
// 2. Get new token
// 3. Store new token
// 4. Retry original request with new token
// 5. User never sees error
```

**Impact:**
- Token expires mid-request? No problem.
- Auto-refresh happens in background
- Original request is retried
- User experience is seamless

### Concept 3: FormData for Multipart

**How to use:**
```typescript
// Create FormData object
const formData = new FormData();

// Add files
formData.append('file', fileObject);
formData.append('resume', resumeFile);

// Add regular data
formData.append('jobId', '123');
formData.append('name', 'John');

// Post it (don't set headers!)
api.post('/upload', formData);
// ✅ Content-Type automatically: multipart/form-data
// ✅ Boundary automatically set
// ✅ Token automatically added
// ✅ Everything works
```

**What NOT to do:**
```typescript
// ❌ WRONG - manually setting Content-Type breaks it
api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// ✅ CORRECT - let axios handle it
api.post('/upload', formData);
```

---

## Real-World Examples

### Example 1: Login Then Access Protected Route

```typescript
// Step 1: Login
const loginResponse = await api.post('/auth/login', {
  email: 'user@test.com',
  password: 'password123'
});

// Token is stored in cookie (automatically by service)
// useAuth hook is notified (automatically)

// Step 2: User navigates to dashboard
// Component renders and calls:
const jobs = await api.get('/jobs');
// ✅ Token automatically added from cookie

// Final request headers:
// Authorization: Bearer eyJhbGc...
// Content-Type: application/json
```

### Example 2: Upload File with Form Data

```typescript
// User selects file from input
const file = fileInputRef.current.files[0];

// Create FormData
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'PROFILE_PICTURE');

// Send to protected route
const response = await api.post('/employees/123/profile-picture', formData);

// What happens automatically:
// 1. Request Interceptor:
//    - Gets token from cookie
//    - Adds: Authorization: Bearer {token}
//    
// 2. Axios sees FormData:
//    - Sets: Content-Type: multipart/form-data; boundary=...
//    - Encodes file properly
//    
// 3. Request is sent:
//    POST /employees/123/profile-picture
//    Headers: {
//      Authorization: Bearer eyJhbGc...,
//      Content-Type: multipart/form-data; boundary=---123abc
//    }
//    Body: [multipart encoded]
//    
// 4. Backend receives and processes
//    
// 5. Response Interceptor:
//    - Checks status code
//    - If 401: auto-refresh and retry
//    - Otherwise: pass response back
```

### Example 3: Handle 401 Error (Auto-Fixed)

```typescript
// User is logged in for 1 hour
// After 1 hour, token expires
// User makes a request:

const jobs = await api.get('/jobs');

// What happens:
// 1. Request sent with expired token
// 2. Backend returns 401 Unauthorized
// 3. Response Interceptor catches it:
//    - Is already refreshing? No
//    - Call /auth/refresh with refreshToken
//    - Get new access token
//    - Store new token in cookie
//    - Retry original request: GET /jobs
// 4. Retry succeeds (with new token)
// 5. jobs data returned
// 6. User never sees an error

// All automatic! User continues working.
```

---

## Code Patterns

### Pattern 1: Simple Protected GET

```typescript
// Service
export const jobService = {
  getAll: async () => {
    // ✅ Token auto-added
    const response = await api.get('/jobs');
    return response.data.data;
  }
};

// Component
const { data: jobs } = useQuery({
  queryKey: ['jobs'],
  queryFn: jobService.getAll
});

// Used in JSX
<div>
  {jobs?.map(job => <JobCard key={job.id} job={job} />)}
</div>
```

### Pattern 2: File Upload with Service

```typescript
// Service
export const employeeService = {
  uploadProfilePicture: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // ✅ Token auto-added
    // ✅ Multipart auto-set
    const response = await api.post(
      `/employees/${id}/profile-picture`,
      formData
    );
    
    return response.data.data;
  }
};

// Hook
export const useUploadProfilePicture = (employeeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => 
      employeeService.uploadProfilePicture(employeeId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['employee', employeeId] 
      });
    }
  });
};

// Component
export const ProfilePictureUpload = ({ employeeId }: any) => {
  const uploadMutation = useUploadProfilePicture(employeeId);
  
  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          uploadMutation.mutate(file); // ✅ Simple!
        }
      }}
      disabled={uploadMutation.isPending}
    />
  );
};
```

### Pattern 3: Application Form with File

```typescript
// Service
export const applicationService = {
  submitApplication: async (jobId: string, formData: any, resume: File) => {
    const data = new FormData();
    
    // Add fields
    data.append('jobId', jobId);
    data.append('coverLetter', formData.coverLetter);
    
    // Add file
    data.append('resume', resume);
    
    // ✅ All sent together
    // ✅ Token auto-added
    const response = await api.post('/applications', data);
    
    return response.data.data;
  }
};

// Component
export const ApplicationForm = ({ jobId }: any) => {
  const [formData, setFormData] = useState({
    coverLetter: ''
  });
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resume) return;
    
    setSubmitting(true);
    
    try {
      // ✅ All automatic
      await applicationService.submitApplication(
        jobId,
        formData,
        resume
      );
      alert('Submitted!');
    } catch (error) {
      alert('Failed!');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={formData.coverLetter}
        onChange={(e) => 
          setFormData({ ...formData, coverLetter: e.target.value })
        }
        placeholder="Cover Letter"
        required
      />
      
      <input
        type="file"
        onChange={(e) => setResume(e.target.files?.[0] || null)}
        accept=".pdf,.doc,.docx"
        required
      />
      
      <button disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

---

## Common Mistakes & Solutions

### Mistake 1: Manually Setting Authorization Header

```typescript
// ❌ WRONG
const token = tokenManager.getAccessToken();
api.get('/jobs', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ✅ CORRECT
api.get('/jobs');
// Token added by interceptor automatically
```

### Mistake 2: Manually Setting Content-Type for FormData

```typescript
// ❌ WRONG
api.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// ✅ CORRECT
api.post('/upload', formData);
// Content-Type set automatically by axios
```

### Mistake 3: Not Using FormData for File Upload

```typescript
// ❌ WRONG - sending file as JSON
api.post('/upload', {
  file: fileObject // Can't serialize File to JSON
});

// ✅ CORRECT - using FormData
const formData = new FormData();
formData.append('file', fileObject);
api.post('/upload', formData);
```

### Mistake 4: Forgetting Token on Protected Route

```typescript
// ❌ WRONG - using different HTTP library
const response = await fetch('/jobs', {
  // Token not included!
});

// ✅ CORRECT - using api instance
const response = await api.get('/jobs');
// Token automatically included!
```

### Mistake 5: Not Handling File Size Limit

```typescript
// ❌ WRONG - no validation
const formData = new FormData();
formData.append('file', file); // Could be 100MB!
api.post('/upload', formData);

// ✅ CORRECT - validate first
if (file.size > 5 * 1024 * 1024) {
  alert('File too large (max 5MB)');
  return;
}

const formData = new FormData();
formData.append('file', file);
api.post('/upload', formData);
```

---

## Debugging Checklist

### Is token being sent?
```
DevTools → Network → Click request
→ Headers tab → Search for "Authorization"

Should see: Authorization: Bearer eyJhbGc...

If missing:
- Token might be expired
- Interceptor might not be working
- Use: tokenManager.getAccessToken() to check
```

### Is multipart correct?
```
DevTools → Network → Click request
→ Headers tab → Check Content-Type

Should see: multipart/form-data; boundary=...

If shows 'application/json':
- You manually set Content-Type (wrong!)
- Remove headers parameter from api.post()
```

### Is file being sent?
```
DevTools → Network → Click request
→ Request payload tab

Should see multipart sections with file data

If file data missing:
- FormData might be empty
- Check: formData.append('file', file)
```

### Is token auto-refreshing?
```
Watch Network tab
Make request → Get 401
See /auth/refresh request
See original request retried
Should not see final 401 error

If token not refreshing:
- Refresh token might be invalid
- Check: tokenManager.getRefreshToken()
- Login again to get fresh tokens
```

---

## Java Backend Checklist

- [ ] POST /auth/login returns `{ token, refreshToken, user }`
- [ ] POST /auth/refresh accepts `{ refreshToken }`
- [ ] POST /auth/refresh returns `{ token, refreshToken }`
- [ ] All protected routes require `Authorization: Bearer {token}` header
- [ ] File upload endpoints accept `multipart/form-data`
- [ ] File size limits enforced (e.g., 5MB max)
- [ ] File type validation (e.g., only images)
- [ ] HTTP status codes correct (401, 403, 400, 200)
- [ ] `multipart.max-file-size` configured in properties
- [ ] File storage working (disk, S3, cloud, etc.)
- [ ] CORS configured correctly for frontend domain

---

## Files to Reference

| File | Content | Read Time |
|------|---------|-----------|
| PROTECTED_ROUTES_AND_MULTIPART_GUIDE.md | Full detailed guide | 30 min |
| PROTECTED_ROUTES_QUICK_REFERENCE.md | Quick copy-paste | 5 min |
| PROTECTED_ROUTES_EXAMPLES.ts | All code examples | 10 min |
| This file | Summary | 15 min |

---

## Summary

### Protected Routes
- Token automatically added by axios request interceptor
- Applied to all HTTP methods (GET, POST, PUT, DELETE)
- No manual header setting needed
- 401 errors auto-handled with token refresh

### Multipart File Upload
- Use `FormData` for files
- Don't manually set `Content-Type` header
- Axios handles multipart encoding automatically
- Token still automatically added
- Works with multiple files

### Best Practices
1. Always use `api.*` methods
2. Never manually set Authorization header
3. Never manually set Content-Type for FormData
4. Always validate file size on client
5. Always validate file type on client
6. Use services for business logic
7. Use hooks for React state management
8. Let axios/interceptors handle HTTP details

---

## TL;DR

**Protected Routes:**
```typescript
api.get('/jobs');  // Token automatically added
```

**File Upload:**
```typescript
const formData = new FormData();
formData.append('file', file);
api.post('/upload', formData);  // Token + multipart automatic
```

**That's it!** Everything else is handled automatically. Focus on your business logic, not HTTP mechanics.

