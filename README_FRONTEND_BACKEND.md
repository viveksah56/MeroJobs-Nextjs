
# MeroJobs: Frontend (Next.js + React) & Backend (Java) Architecture

## Project Overview

**MeroJobs** is a job portal platform with:
- **Frontend:** Next.js 16 + React 19 (Modern frontend with MVC pattern)
- **Backend:** Java Spring Boot (REST API)
- **Database:** MySQL
- **Real-time Features:** Redis, WebSockets (optional)

---

## Frontend Architecture: MVC Pattern

The frontend follows a strict **Model-View-Controller (MVC)** pattern for clean code organization and scalability.

```
┌─────────────────────────────────────────────┐
│              React Components               │ ← USER INTERFACE
│           (Views - src/views/, src/app/)    │   Displays data, handles events
└────────────────────┬────────────────────────┘
                     │
                     ↓ imports
┌─────────────────────────────────────────────┐
│            Custom React Hooks                │ ← STATE MANAGEMENT
│ (Controllers - src/hooks/useJobs, etc.)     │   Query caching, mutations, state
└────────────────────┬────────────────────────┘
                     │
                     ↓ imports
┌─────────────────────────────────────────────┐
│          Service Layer                      │ ← BUSINESS LOGIC
│ (Services - src/service/job.service.ts)     │   API calls, validation, data transformation
└────────────────────┬────────────────────────┘
                     │
                     ↓ imports
┌─────────────────────────────────────────────┐
│           Data Models & Types                │ ← DATA LAYER
│ (Models - src/models/job/job.model.ts)      │   TypeScript interfaces, Zod schemas
└────────────────────┬────────────────────────┘
                     │
                     ↓ imports
┌─────────────────────────────────────────────┐
│           HTTP Client                        │ ← TRANSPORT LAYER
│ (Axios - src/lib/api.ts)                    │   Interceptors, headers, auth
└────────────────────┬────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ↓                     ↓
    Cookies                Database
   (JWT Token)            (Java Backend)
```

### Layer Breakdown

| Layer | Purpose | Location | Example |
|-------|---------|----------|---------|
| **View** | React UI components | `src/views/`, `src/app/` | `JobsList.tsx` |
| **Controller** | Custom hooks with React Query | `src/hooks/` | `useJobs.ts` |
| **Service** | Business logic & API calls | `src/service/` | `jobService.ts` |
| **Model** | TypeScript types & validation | `src/models/` | `job.model.ts` |
| **HTTP Client** | Axios instance with interceptors | `src/lib/api.ts` | Token management |

---

## File Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth routes (login, signup)
│   │   ├── (public)/             # Public routes
│   │   ├── dashboard/            # Protected routes
│   │   ├── layout.tsx            # Root layout with providers
│   │   └── page.tsx              # Home page
│   │
│   ├── views/                    # React components (View layer)
│   │   ├── auth/
│   │   │   └── login-form.tsx
│   │   ├── jobs/
│   │   │   ├── job-list.tsx
│   │   │   ├── job-card.tsx
│   │   │   └── create-job-form.tsx
│   │   └── applications/
│   │       └── application-list.tsx
│   │
│   ├── hooks/                    # Custom React Hooks (Controller layer)
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── useJobs.ts            # Job management hook
│   │   ├── useEmployees.ts       # Employee management hook
│   │   └── useApplications.ts    # Application management hook
│   │
│   ├── service/                  # Services (Business Logic layer)
│   │   ├── auth.service.ts       # Authentication service
│   │   ├── job.service.ts        # Job service (12 methods)
│   │   ├── employee.service.ts   # Employee/Employer service (20+ methods)
│   │   └── application.service.ts # Application service (14 methods)
│   │
│   ├── models/                   # Data Models (Model layer)
│   │   ├── job/
│   │   │   └── job.model.ts      # Job interface, enums, schemas
│   │   ├── employee/
│   │   │   └── employee-extended.model.ts
│   │   ├── application/
│   │   │   └── application.model.ts
│   │   └── enum/
│   │       └── account-status.enum.ts
│   │
│   ├── lib/                      # Utilities (HTTP Client layer)
│   │   ├── api.ts                # Axios instance (main HTTP client)
│   │   └── types/
│   │       └── auth.ts
│   │
│   ├── components/               # Reusable UI components
│   │   └── ui/                   # shadcn/ui components
│   │
│   └── provider/                 # React providers
│       └── query-provider.tsx    # React Query provider
│
├── .env.local                    # Environment variables
├── package.json                  # Dependencies
├── next.config.js                # Next.js config
└── tsconfig.json                 # TypeScript config
```

---

## Backend Architecture: Java Spring Boot

The Java backend implements standard Spring Boot patterns with proper separation of concerns.

```
Backend (Java)
├── Controller Layer              ← REST endpoints, request validation
│   ├── JobController
│   ├── EmployeeController
│   ├── EmployerController
│   └── ApplicationController
│
├── Service Layer                 ← Business logic
│   ├── JobService
│   ├── EmployeeService
│   ├── EmployerService
│   └── ApplicationService
│
├── Repository Layer              ← Data access (JPA)
│   ├── JobRepository
│   ├── EmployeeRepository
│   ├── EmployerRepository
│   └── ApplicationRepository
│
├── Entity/Model Layer            ← Database entities
│   ├── Job
│   ├── Employee
│   ├── Employer
│   └── Application
│
├── Security Layer                ← JWT, Auth
│   ├── JwtTokenProvider
│   ├── SecurityConfig
│   └── AuthenticationFilter
│
└── Database Layer                ← MySQL
    └── JPA Entities
```

---

## Data Flow: Create a Job

### Step 1: User clicks "Create Job" button in UI component
```typescript
// views/jobs/create-job-form.tsx
function CreateJobForm() {
  const createMutation = useCreateJob();  // ← Import hook
  
  const handleSubmit = async (formData) => {
    await createMutation.mutateAsync(formData);
  };
}
```

### Step 2: Hook processes mutation and calls service
```typescript
// hooks/useJobs.ts
export const useCreateJob = () => {
  return useMutation({
    mutationFn: (data) => jobService.create(data),  // ← Call service
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
```

### Step 3: Service validates and makes HTTP request
```typescript
// service/job.service.ts
export const jobService = {
  create: async (data: JobCreateRequest) => {
    const validated = jobCreateSchema.parse(data);  // ← Validate with Zod
    const response = await api.post('/jobs', validated);  // ← Call axios
    return response.data.data;
  },
};
```

### Step 4: Axios instance adds headers and sends request
```typescript
// lib/api.ts
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// Request interceptor adds token
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // ← Add auth header
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

### Step 5: Java backend receives and processes
```java
// JobController.java
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
    return ResponseEntity.ok(
      new ApiResponse<>(true, job, "Job created successfully")
    );
  }
}
```

### Step 6: Response returns to frontend
```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Senior Developer",
    "company": "TechCorp",
    "status": "DRAFT",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "Job created successfully"
}
```

### Step 7: Frontend updates UI
- React Query caches response
- Hook invalidates 'jobs' query
- Component re-fetches job list
- UI displays new job
- User sees success message

---

## Communication: Request/Response Format

### Standard Request (Frontend → Backend)
```typescript
// Example: Create a job
const request = {
  title: "Senior Developer",
  company: "TechCorp",
  location: "Kathmandu",
  description: "Looking for experienced developer",
  salaryMin: 50000,
  salaryMax: 80000,
  employmentType: "FULL_TIME",
  experienceRequired: 3,
};

// Sent as:
// POST http://localhost:8000/api/v1/jobs
// Headers: {
//   'Content-Type': 'application/json',
//   'Authorization': 'Bearer {token}'
// }
// Body: JSON stringified request
```

### Standard Response (Backend → Frontend)
```typescript
// Success (200)
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Senior Developer",
    // ... other fields
  },
  "message": "Job created successfully"
}

// Error (400, 401, 500)
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed: title is required",
  "details": {
    "field": "title",
    "constraint": "required"
  }
}

// List with pagination (200)
{
  "success": true,
  "data": [
    { "id": "1", "title": "Job 1", ... },
    { "id": "2", "title": "Job 2", ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "message": "Jobs retrieved successfully"
}
```

---

## Key Features by Layer

### Frontend Features
✅ **View Layer (Components)**
- Reusable React components with shadcn/ui
- Server-side rendering support
- Responsive design with Tailwind CSS
- Accessibility (WCAG compliant)

✅ **Controller Layer (Hooks)**
- Automatic caching with React Query
- Optimistic updates
- Loading and error states
- Automatic refetching

✅ **Service Layer**
- Zod schema validation
- Error handling and logging
- Data transformation
- Type-safe API calls

✅ **Model Layer**
- Strong TypeScript types
- Runtime validation with Zod
- Enums for constants
- Request/Response schemas

✅ **HTTP Layer**
- JWT token management
- Automatic token refresh
- Request/response interceptors
- CORS handling
- Error handling with 401 redirect

### Backend Features (Java)
✅ REST API endpoints (47 total)
✅ JWT authentication & authorization
✅ Input validation with @Valid
✅ Database transactions
✅ Proper error handling
✅ Pagination support
✅ Search and filtering
✅ Role-based access control

---

## Testing the Integration

### Prerequisites
1. Java backend running: `mvn spring-boot:run` (port 8000)
2. Frontend running: `npm run dev` (port 3000)
3. MySQL running with database

### Test 1: Login
```bash
# 1. Frontend loads login form
# 2. User enters credentials
# 3. Click "Sign In"
# 4. Frontend sends: POST /auth/login
# 5. Backend validates credentials
# 6. Backend returns JWT token
# 7. Frontend stores token in cookie
# 8. Frontend redirects to dashboard
```

### Test 2: Create Job
```bash
# 1. Employer navigates to "Create Job"
# 2. Fills form with job details
# 3. Clicks "Create"
# 4. Frontend: useCreateJob().mutate(data)
# 5. Frontend: jobService.create(data)
# 6. Frontend: api.post('/jobs', data)
# 7. Axios adds token header
# 8. Backend receives at JobController
# 9. Backend validates with @Valid
# 10. Backend creates job in database
# 11. Backend returns created job
# 12. Frontend updates React Query cache
# 13. UI re-renders with new job
```

### Test 3: View Jobs
```bash
# 1. User navigates to "Browse Jobs"
# 2. Frontend: useJobs()
# 3. Hook calls: jobService.getAll()
# 4. Service calls: api.get('/jobs')
# 5. Backend returns list of jobs
# 6. Frontend caches with React Query
# 7. UI displays jobs
```

---

## Environment Variables

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# JWT Configuration
JWT_SECRET=your_secret_key
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=86400000
JWT_PREFIX=Bearer
JWT_HEADER=Authorization
```

### Backend (application.properties)
```properties
# Server
server.servlet.context-path=/api/v1
server.port=8000

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/merojobs
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=your_secret_key
jwt.expiration=3600000

# CORS
cors.allowedOrigins=http://localhost:3000
cors.allowedMethods=GET,POST,PUT,DELETE,OPTIONS
cors.allowCredentials=true
```

---

## Development Workflow

### 1. Start Java Backend
```bash
cd backend/
mvn spring-boot:run
# Runs on http://localhost:8000/api/v1
```

### 2. Start Next.js Frontend
```bash
cd frontend/
npm run dev
# Runs on http://localhost:3000
```

### 3. Make API Calls (3 Options)

**Option 1: Use existing service (Recommended)**
```typescript
import { jobService } from '@/service/job.service';

const jobs = await jobService.getAll();
```

**Option 2: Use custom hook (Best for components)**
```typescript
import { useJobs } from '@/hooks/useJobs';

const { data: jobs, isLoading } = useJobs();
```

**Option 3: Direct axios (If needed)**
```typescript
import api from '@/lib/api';

const response = await api.get('/jobs');
```

### 4. Implement in Component
```typescript
'use client';
import { useJobs } from '@/hooks/useJobs';

export function JobsList() {
  const { data: jobs, isLoading, error } = useJobs();

  if (isLoading) return <p>Loading jobs...</p>;
  if (error) return <p>Error loading jobs</p>;

  return (
    <div>
      {jobs?.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `FRONTEND_BACKEND_INTEGRATION.md` | Complete integration guide with examples |
| `MVC_ARCHITECTURE.md` | Detailed MVC pattern explanation |
| `MVC_QUICK_START.md` | Quick reference for daily use |
| `JAVA_BACKEND_ENDPOINTS_CHECKLIST.md` | All 47 endpoints with specs |
| `AXIOS_WHERE_TO_USE.md` | Axios instance usage guide |
| This file | Overview of entire system |

---

## Troubleshooting

### CORS Error
**Problem:** `Access to XMLHttpRequest blocked by CORS policy`
**Solution:**
1. Enable CORS in Java backend
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Restart both services

### 401 Unauthorized
**Problem:** `{"message": "Unauthorized"}`
**Solution:**
1. Login first to get token
2. Check token is stored in cookie
3. Verify JWT secret matches
4. Check token expiration

### API Endpoint Not Found
**Problem:** `Cannot POST /api/v1/jobs`
**Solution:**
1. Verify endpoint exists in Java backend
2. Check context path is `/api/v1`
3. Verify HTTP method (GET vs POST)
4. Match URL exactly

---

## Summary

**Frontend:**
- MVC pattern with Models, Services, Hooks, Components
- React Query for automatic caching
- Zod for type-safe validation
- Axios for HTTP communication
- JWT token management

**Backend:**
- Spring Boot REST API
- 47 endpoints (Auth, Jobs, Employees, Employers, Applications)
- MySQL database
- JWT authentication
- Proper error handling

**Communication:**
- HTTP POST/GET/PUT/DELETE
- JSON request/response
- Standard format with success, data, message
- Pagination support
- Bearer token authentication

---

## Getting Started

1. **Read:** `FRONTEND_BACKEND_INTEGRATION.md`
2. **Check:** `JAVA_BACKEND_ENDPOINTS_CHECKLIST.md`
3. **Start Backend:** `mvn spring-boot:run`
4. **Start Frontend:** `npm run dev`
5. **Test:** Open browser and login
6. **Monitor:** Check network tab in DevTools

---

## Production Checklist

Before deploying:

- [ ] Backend deployed (Heroku, AWS, etc.)
- [ ] Frontend deployed (Vercel, Netlify, etc.)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] CORS configured for production domain
- [ ] JWT secret secure
- [ ] API endpoints verified
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Security audit complete

---

**Everything is ready to launch your job portal!** 🚀

