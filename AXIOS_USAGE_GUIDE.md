# Axios Instance Usage Guide

## Overview

The Axios instance (`src/lib/api.ts`) is the **centralized HTTP client** for your entire application. It handles all API communication with automatic interceptors, error handling, and configuration management.

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────┐
│         Components/Pages (React)                     │
│  (LoginForm, Dashboard, JobList, etc.)              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Custom Hooks       │
        │  (useAuth, etc.)     │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Service Layer       │
        │ (auth.service.ts)    │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Axios Instance      │
        │   (api.ts)           │
        │  • Interceptors      │
        │  • Base URL          │
        │  • Headers           │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Backend API        │
        │  (Node/Express)      │
        └──────────────────────┘
```

---

## File Structure

```
src/
├── lib/
│   ├── api.ts                    ← Axios instance (configure here)
│   └── types/auth.ts             ← TypeScript types
├── service/
│   └── auth.service.ts           ← Service layer (use api here)
├── hooks/
│   └── useAuth.ts                ← Custom hook (use service here)
└── views/auth/
    └── login-form.tsx            ← Component (use hook here)
```

---

## 1. The Axios Instance (`src/lib/api.ts`)

### What It Does

```typescript
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,                    // Base URL for all requests
  headers: {
    'Content-Type': 'application/json',  // Default header
  },
  withCredentials: true,               // Send cookies with requests
});

// Request interceptor - modify before sending
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle after receiving
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';  // Redirect on auth failure
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

### Key Configuration

| Setting | Purpose | Value |
|---------|---------|-------|
| `baseURL` | Base endpoint for all requests | `http://localhost:8000/api/v1` |
| `Content-Type` | Default content type | `application/json` |
| `withCredentials` | Include cookies in requests | `true` |

---

## 2. Service Layer (`src/service/auth.service.ts`)

This is where you **use the Axios instance** to make API calls.

### Current Example: Auth Service

```typescript
import api from '@/lib/api';
import { LoginRequest, AuthResponse } from '@/lib/types/auth';

export const authService = {
  // POST request
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // POST request
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // GET request
  verifyToken: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/auth/verify');
    return response.data;
  },

  // POST request
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },
};
```

---

## 3. Custom Hooks (Use the Service)

The hook uses the service, which uses the Axios instance.

### Example: useAuth Hook

```typescript
import { authService } from '@/service/auth.service';

export const useAuth = () => {
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      // Handle successful login
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
};
```

---

## 4. Components (Use the Hooks)

The component uses the hook.

### Example: LoginForm Component

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const { login, isLoading, error } = useAuth();

  const onSubmit = async (data) => {
    await login(data);  // Calls hook → service → axios
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## How It All Works Together

### Request Flow

```
1. User submits form in LoginForm component
2. Component calls: login(data) from useAuth hook
3. Hook calls: authService.login(data)
4. Service calls: api.post('/auth/login', data)
5. Axios instance makes HTTP request with:
   - Base URL: http://localhost:8000/api/v1
   - Full URL: http://localhost:8000/api/v1/auth/login
   - Interceptors applied
   - Error handling applied
6. Backend receives request and sends response
7. Response interceptor checks for 401 errors
8. Data flows back: Axios → Service → Hook → Component
```

---

## Creating New Services

### Pattern: Jobs Service

```typescript
// src/service/jobs.service.ts
import api from '@/lib/api';
import { Job, JobFilters } from '@/lib/types/jobs';

export const jobsService = {
  // GET all jobs
  getJobs: async (filters?: JobFilters) => {
    const response = await api.get<Job[]>('/jobs', {
      params: filters,  // Query parameters
    });
    return response.data;
  },

  // GET single job
  getJob: async (id: string) => {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  // POST create job
  createJob: async (data: Omit<Job, 'id'>) => {
    const response = await api.post<Job>('/jobs', data);
    return response.data;
  },

  // PUT update job
  updateJob: async (id: string, data: Partial<Job>) => {
    const response = await api.put<Job>(`/jobs/${id}`, data);
    return response.data;
  },

  // DELETE job
  deleteJob: async (id: string) => {
    await api.delete(`/jobs/${id}`);
  },
};
```

### Using the Jobs Service

```typescript
// src/hooks/useJobs.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { jobsService } from '@/service/jobs.service';

export const useJobs = () => {
  // GET request
  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsService.getJobs(),
  });

  // POST request
  const createJobMutation = useMutation({
    mutationFn: (data) => jobsService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  return {
    jobs: jobsQuery.data,
    isLoading: jobsQuery.isLoading,
    createJob: createJobMutation.mutate,
  };
};
```

---

## Axios API Methods

### GET Request (Fetch Data)
```typescript
const response = await api.get('/endpoint');
const data = response.data;

// With parameters
const response = await api.get('/jobs', {
  params: { page: 1, limit: 10 }
});
```

### POST Request (Send Data)
```typescript
const response = await api.post('/endpoint', {
  email: 'user@example.com',
  password: 'password123'
});
```

### PUT Request (Update Data)
```typescript
const response = await api.put('/jobs/123', {
  title: 'Updated Title',
  description: 'Updated Description'
});
```

### PATCH Request (Partial Update)
```typescript
const response = await api.patch('/jobs/123', {
  status: 'published'
});
```

### DELETE Request (Remove Data)
```typescript
await api.delete('/jobs/123');
```

---

## Request Interceptor (Advanced)

### Adding Authorization Token

Update `src/lib/api.ts`:

```typescript
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error),
);
```

### Adding Request ID for Tracking

```typescript
api.interceptors.request.use(
  (config) => {
    config.headers['X-Request-ID'] = generateUUID();
    return config;
  },
  (error) => Promise.reject(error),
);
```

---

## Response Interceptor (Advanced)

### Handle Token Refresh

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await authService.refreshToken();
        const newToken = response.data.token;
        
        Cookies.set('auth_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return api(originalRequest);  // Retry original request
      } catch {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
```

---

## Error Handling

### In Components

```typescript
const { login, error } = useAuth();

if (error) {
  const message = error.response?.data?.message || 'An error occurred';
  return <Alert variant="destructive">{message}</Alert>;
}
```

### In Services

```typescript
export const jobsService = {
  getJobs: async () => {
    try {
      const response = await api.get('/jobs');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data?.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
      }
      throw error;
    }
  },
};
```

---

## Environment Variables

### `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Usage in Code

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;  // http://localhost:8000/api/v1
```

### For Different Environments

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Production
NEXT_PUBLIC_API_URL=https://api.merojobs.com/api/v1
```

---

## Complete Request Example

```typescript
// Component
export function JobsPage() {
  const { jobs, isLoading, createJob } = useJobs();

  const handleCreate = async (title: string) => {
    createJob({ title, description: '' });  // 1. Component calls hook
  };

  return <div>{/* UI */}</div>;
}

// Hook
export const useJobs = () => {
  const createJobMutation = useMutation({
    mutationFn: (data) => jobsService.createJob(data),  // 2. Hook calls service
  });
  return { createJob: createJobMutation.mutate };
};

// Service
export const jobsService = {
  createJob: async (data) => {
    const response = await api.post('/jobs', data);  // 3. Service calls axios
    return response.data;
  },
};

// Axios
// 4. Axios sends POST to http://localhost:8000/api/v1/jobs
// 5. Interceptors process request/response
// 6. Data flows back through the chain
```

---

## Checklist: Setting Up New Features

When adding a new feature that needs API calls:

- [ ] Create types in `src/lib/types/{feature}.ts`
- [ ] Create service in `src/service/{feature}.service.ts` (use `api.get()`, `api.post()`, etc.)
- [ ] Create hook in `src/hooks/use{Feature}.ts` (use service methods)
- [ ] Use hook in component (call hook functions)
- [ ] Test in browser
- [ ] Update environment variables if needed

---

## Summary

**The hierarchy is:**
```
Component
   ↓
Hook (useAuth, useJobs, etc.)
   ↓
Service (authService, jobsService, etc.)
   ↓
Axios Instance (api.ts)
   ↓
Backend API
```

**Always** use this pattern:
1. **Create/Use Service** - Put API calls in service files
2. **Create/Use Hook** - Wrap service in React Query or custom hook
3. **Use in Component** - Call hook methods from components

This keeps your code clean, testable, and maintainable.

