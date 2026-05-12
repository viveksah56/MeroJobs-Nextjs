
# Frontend (Next.js) ↔ Backend (Java) Integration Guide

## Overview

Your frontend uses **MVC architecture** (Models → Services → Hooks → Components) to communicate with your **Java backend** via REST API.

```
Frontend (Next.js 16 + React 19)          Backend (Java)
┌──────────────────────────────┐         ┌─────────────────────┐
│ COMPONENTS (React UI)         │         │ REST API Endpoints  │
│         ↓                     │         └──────────┬──────────┘
│ HOOKS (useJobs, etc.)         │                    ↑
│         ↓                     │         HTTP POST/GET/PUT/DELETE
│ SERVICES (jobService, etc.)   │                    ↓
│         ↓                     │         ┌──────────┴──────────┐
│ MODELS (Types + Schemas)      │         │ Controllers         │
│         ↓                     │         │         ↓           │
│ AXIOS INSTANCE (src/lib/api)  │         │ Services/Business   │
└──────────┬───────────────────┘         │ Logic               │
           │ HTTP                        │         ↓           │
           └───────────────────────────→ │ Repositories/Data   │
                                         │ Access              │
                                         └─────────────────────┘
```

---

## Environment Configuration

### Frontend (.env.local)

```env
# Java Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# JWT Configuration (from backend)
JWT_SECRET=biSATc5TwmekoReHTZyJfrgSHSWJljvcC8fSSKYp8v5b5vBRwuKihPEaDFVSkat7PyPSeMjURb29fYiCZ0vMlO
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=86400000
JWT_PREFIX=Bearer
JWT_HEADER=Authorization
```

### Backend (application.properties)

```properties
# API Base Path
server.servlet.context-path=/api/v1
server.port=8000

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/merojobs
spring.datasource.username=root
spring.datasource.password=password

# JWT
jwt.secret=biSATc5TwmekoReHTZyJfrgSHSWJljvcC8fSSKYp8v5b5vBRwuKihPEaDFVSkat7PyPSeMjURb29fYiCZ0vMlO
jwt.expiration=3600000

# CORS (Allow Frontend)
cors.allowedOrigins=http://localhost:3000,http://localhost:3001
cors.allowedMethods=GET,POST,PUT,DELETE,OPTIONS
cors.allowedHeaders=*
cors.allowCredentials=true
```

---

## API Endpoint Mapping

### Job Management

**Frontend Service:** `jobService` (src/service/job.service.ts)
**Backend Endpoints:**

```
GET    /jobs                      → jobService.getAll()
GET    /jobs?page=1&limit=10      → jobService.getPaginated()
GET    /jobs/:id                  → jobService.getById()
POST   /jobs                       → jobService.create()
PUT    /jobs/:id                   → jobService.update()
DELETE /jobs/:id                   → jobService.delete()
GET    /jobs/search?query=...      → jobService.search()
GET    /jobs/company/:name         → jobService.getByCompany()
GET    /jobs/stats                 → jobService.getStats()
POST   /jobs/:id/close             → jobService.close()
POST   /jobs/:id/reopen            → jobService.reopen()
```

### Employee/Employer Management

**Frontend Service:** `employeeService` & `employerService` (src/service/employee.service.ts)
**Backend Endpoints:**

```
# Employee Endpoints
GET    /employees/:id              → employeeService.getProfile()
GET    /employees/me               → employeeService.getMe()
GET    /employees?page=1&limit=10  → employeeService.getAll()
PUT    /employees/:id              → employeeService.updateProfile()
PUT    /employees/me               → employeeService.updateMe()
DELETE /employees/:id              → employeeService.delete()
GET    /employees/search?q=...     → employeeService.search()
POST   /employees/verify-email     → employeeService.verifyEmail()
POST   /employees/resend-verification → employeeService.resendVerificationEmail()

# Employer Endpoints
GET    /employers/:id              → employerService.getProfile()
GET    /employers/me               → employerService.getMe()
GET    /employers?page=1&limit=10  → employerService.getAll()
PUT    /employers/:id              → employerService.updateProfile()
PUT    /employers/me               → employerService.updateMe()
GET    /employers/:id/jobs         → employerService.getPostedJobs()
GET    /employers/:id/applications → employerService.getApplications()
POST   /employers/:id/verify       → employerService.verifyCompany()
```

### Application Management

**Frontend Service:** `applicationService` (src/service/application.service.ts)
**Backend Endpoints:**

```
GET    /applications?page=1&limit=10 → applicationService.getAll()
GET    /applications/:id              → applicationService.getById()
POST   /applications                  → applicationService.create()
PUT    /applications/:id              → applicationService.update()
DELETE /applications/:id              → applicationService.delete()
GET    /applications/job/:jobId       → applicationService.getByJobId()
GET    /applications/employee/:empId  → applicationService.getByEmployeeId()
GET    /applications/my               → applicationService.getEmployerApplications()
POST   /applications/:id/accept       → applicationService.accept()
POST   /applications/:id/reject       → applicationService.reject()
POST   /applications/:id/shortlist    → applicationService.shortlist()
POST   /applications/:id/schedule     → applicationService.scheduleInterview()
GET    /applications/stats            → applicationService.getStats()
```

---

## Request/Response Format

### Standard Request Format

All requests include:
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer {token}`
- **Body:** JSON object matching Zod schema

**Example: Create Job**

```typescript
// Frontend sends:
const request = {
  title: "Senior Developer",
  company: "TechCorp",
  location: "Kathmandu",
  description: "Looking for experienced developer",
  salaryMin: 50000,
  salaryMax: 80000,
  employmentType: "FULL_TIME",
  experienceLevel: 3,
};

// Axios instance adds:
// POST http://localhost:8000/api/v1/jobs
// Headers: {
//   'Content-Type': 'application/json',
//   'Authorization': 'Bearer {jwt_token}',
//   'Cookie': 'auth_token={token}'
// }
// Body: {request}
```

### Standard Response Format

All responses follow this format:

```typescript
// Success Response (200)
{
  "success": true,
  "data": {
    id: "123",
    title: "Senior Developer",
    company: "TechCorp",
    // ... other fields
  },
  "message": "Job created successfully"
}

// List Response (200)
{
  "success": true,
  "data": [
    { id: "1", title: "Job 1", ... },
    { id: "2", title: "Job 2", ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "message": "Jobs retrieved successfully"
}

// Error Response (400/401/500)
{
  "success": false,
  "error": "INVALID_INPUT",
  "message": "Validation failed: title is required",
  "details": {
    "field": "title",
    "constraint": "required"
  }
}
```

---

## Data Flow Example: Create a Job

### Step 1: User Submits Form (Component)

```typescript
'use client';
import { useCreateJob } from '@/hooks/useJobs';

export function JobForm() {
  const createMutation = useCreateJob();

  const handleSubmit = async (formData) => {
    // User clicks submit with:
    // { title: "Senior Dev", company: "TechCorp", ... }
    await createMutation.mutateAsync(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" />
      <input name="company" />
      {/* ... more fields */}
      <button>Create Job</button>
    </form>
  );
}
```

### Step 2: Hook Processes Request (React Query)

```typescript
// src/hooks/useJobs.ts
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => jobService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
```

### Step 3: Service Validates & Sends (Business Logic)

```typescript
// src/service/job.service.ts
export const jobService = {
  create: async (data: JobCreateRequest): Promise<Job> => {
    // Validate against Zod schema
    const validated = jobCreateSchema.parse(data);
    
    // Make HTTP POST request
    const response = await api.post<{ data: Job }>('/jobs', validated);
    
    return response.data.data;
  },
};
```

### Step 4: Axios Adds Headers & Sends (HTTP Client)

```typescript
// src/lib/api.ts
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

api.interceptors.request.use((config) => {
  // Get token from cookie or localStorage
  const token = getCookie('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Sends: POST http://localhost:8000/api/v1/jobs
// Headers: {
//   'Content-Type': 'application/json',
//   'Authorization': 'Bearer {token}'
// }
// Body: validated job data
```

### Step 5: Java Backend Processes

```java
@RestController
@RequestMapping("/jobs")
public class JobController {
  
  @PostMapping
  @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
  public ResponseEntity<?> createJob(
    @Valid @RequestBody JobCreateRequest request,
    @AuthenticationPrincipal UserDetails userDetails
  ) {
    Job job = jobService.create(request, userDetails);
    return ResponseEntity.ok(new ApiResponse<>(true, job, "Job created"));
  }
}
```

### Step 6: Response Returns to Frontend

```java
// Backend sends:
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Senior Developer",
    "company": "TechCorp",
    // ... other fields
  },
  "message": "Job created successfully"
}
```

### Step 7: Frontend Updates UI

```typescript
// Axios interceptor processes response
// React Query caches data
// Hook triggers onSuccess callback
// Query cache invalidated
// Component re-renders with new data
// User sees success message
```

---

## Authentication Flow

### Login Process

```
1. User submits credentials → Component
2. Component calls useAuth().login() → Hook
3. Hook calls authService.login() → Service
4. Service calls api.post('/auth/login', credentials) → Axios
5. Axios sends to: POST http://localhost:8000/api/v1/auth/login
6. Backend validates and returns:
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIs...",
       "user": { "id": "1", "email": "user@test.com", ... }
     }
   }
7. Frontend stores token in cookie (httpOnly, secure)
8. Frontend stores user in React state
9. Axios interceptor adds token to all future requests
10. User is redirected to dashboard
```

### Token Management

```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const loginMutation = useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (response) => {
      // Store token in cookie
      Cookies.set('auth_token', response.data.token, {
        expires: 7,
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
      });
      
      // Store user in state
      setUser(response.data.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    },
  });
};
```

### Token in Request Header

```typescript
// src/lib/api.ts
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
```

### Token Expiration Handling

```typescript
// src/lib/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Clear token
      Cookies.remove('auth_token');
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
```

---

## Java Backend Requirements

### Required Endpoints

Your Java backend must implement:

#### Authentication
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh token
- `POST /auth/register` - Register user

#### Jobs
- `GET /jobs` - List jobs (with pagination)
- `GET /jobs/:id` - Get single job
- `POST /jobs` - Create job (requires auth)
- `PUT /jobs/:id` - Update job (requires auth)
- `DELETE /jobs/:id` - Delete job (requires auth)
- `GET /jobs/search` - Search jobs

#### Employees
- `GET /employees/:id` - Get profile
- `GET /employees/me` - Get current user
- `PUT /employees/:id` - Update profile
- `POST /employees/verify-email` - Verify email

#### Employers
- `GET /employers/:id` - Get employer profile
- `GET /employers/me` - Get current employer
- `PUT /employers/:id` - Update employer
- `GET /employers/:id/jobs` - Get posted jobs

#### Applications
- `GET /applications` - List applications
- `POST /applications` - Submit application
- `PUT /applications/:id` - Update application
- `GET /applications/job/:jobId` - Get job applications

### Response Format

All endpoints must return:

```json
{
  "success": true/false,
  "data": {},
  "message": "Description",
  "pagination": {} // for list endpoints
}
```

### Error Handling

Return proper HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Server Error

---

## CORS Configuration (Java Backend)

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
  
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
      .allowedOrigins(
        "http://localhost:3000",  // Frontend dev
        "http://localhost:3001",
        "https://yourdomain.com"   // Production
      )
      .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
      .allowedHeaders("*")
      .allowCredentials(true)
      .maxAge(3600);
  }
}
```

---

## Testing the Integration

### Test 1: Login Flow

```bash
# 1. Send login request
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "password123"}'

# Response should include token
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGc...",
#     "user": { ... }
#   }
# }

# 2. Use token in next request
curl -X GET http://localhost:8000/api/v1/jobs \
  -H "Authorization: Bearer {token}"
```

### Test 2: Create Job

```bash
curl -X POST http://localhost:8000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "Senior Developer",
    "company": "TechCorp",
    "location": "Kathmandu",
    "description": "Looking for experienced developer",
    "salaryMin": 50000,
    "salaryMax": 80000,
    "employmentType": "FULL_TIME"
  }'
```

### Test 3: Frontend to Backend

1. Start Java backend: `mvn spring-boot:run` (runs on http://localhost:8000)
2. Start Next.js frontend: `npm run dev` (runs on http://localhost:3000)
3. Open browser: http://localhost:3000
4. Navigate to login page
5. Enter credentials
6. Watch network tab in DevTools to see API calls

---

## Troubleshooting

### Issue: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Enable CORS in Java backend (see config above)
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Restart both frontend and backend

### Issue: 401 Unauthorized

**Error:** `{"message": "Unauthorized"}`

**Solution:**
1. Login first to get token
2. Check token is stored in cookie
3. Verify JWT secret matches between frontend/backend
4. Check token expiration time

### Issue: 404 Not Found

**Error:** `{"message": "Cannot POST /api/v1/jobs"}`

**Solution:**
1. Verify endpoint exists in Java backend
2. Check context path is `/api/v1`
3. Verify HTTP method (GET vs POST)
4. Check URL matches exactly

### Issue: Validation Error

**Error:** `{"message": "Validation failed"}`

**Solution:**
1. Check request body matches backend schema
2. Verify all required fields are included
3. Check data types (string, number, enum)
4. Look at `details` field in error response

---

## Development Workflow

### 1. Backend Development
```bash
# Start Java backend
cd backend/
mvn spring-boot:run

# Runs on http://localhost:8000/api/v1
```

### 2. Frontend Development
```bash
# Start Next.js frontend
cd frontend/
npm run dev

# Runs on http://localhost:3000
```

### 3. Making API Calls

**Option 1: Use existing services**
```typescript
import { jobService } from '@/service/job.service';

const jobs = await jobService.getAll();
```

**Option 2: Use custom hooks**
```typescript
import { useJobs } from '@/hooks/useJobs';

const { data: jobs } = useJobs();
```

**Option 3: Direct axios**
```typescript
import api from '@/lib/api';

const response = await api.get('/jobs');
```

---

## File Structure Reminder

```
Frontend (Next.js)
├── src/
│   ├── lib/
│   │   ├── api.ts ..................... Axios instance (HTTP client)
│   │   └── types/
│   │       └── auth.ts ............... Auth types
│   ├── models/ ........................ Data models & schemas
│   │   ├── job/
│   │   ├── employee/
│   │   └── application/
│   ├── service/ ....................... Business logic layer
│   │   ├── job.service.ts
│   │   ├── employee.service.ts
│   │   ├── auth.service.ts
│   │   └── application.service.ts
│   ├── hooks/ ......................... React Query hooks
│   │   ├── useJobs.ts
│   │   ├── useEmployees.ts
│   │   ├── useApplications.ts
│   │   └── useAuth.ts
│   ├── views/ ......................... React components (views)
│   ├── app/ ........................... App router
│   └── provider/ ...................... React Query provider
├── .env.local ......................... Environment config
└── package.json ....................... Dependencies
```

---

## Summary

```
Your Architecture:

Frontend (MVC Pattern)              Backend (Java REST)
├─ Components (UI)                 ├─ Controllers
├─ Hooks (State Mgmt)              ├─ Services (Business Logic)
├─ Services (API Calls) ←HTTP→      ├─ Repositories (Data Access)
├─ Models (Types)                  └─ Database
└─ Axios (HTTP Client)

Communication:
- Frontend sends JSON via HTTP
- Backend validates and processes
- Backend returns JSON response
- Frontend updates React state
- UI re-renders automatically
```

Everything is configured for your Java backend!

