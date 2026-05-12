# WHERE TO USE AXIOS.INSTANCE.ts - SIMPLE ANSWER

## TL;DR (Too Long; Didn't Read)

**Location:** `src/lib/api.ts`

**Use in:** `src/service/*.ts` files

**Don't use in:** Components, directly in hooks

---

## The Simple Chain

```
Component (UI)
    ↓ uses
Hook (useAuth, useJobs, etc.)
    ↓ calls
Service (authService, jobsService, etc.)
    ↓ imports & uses
Axios Instance ⭐ (src/lib/api.ts)
    ↓ sends HTTP request to
Backend API
```

---

## Where Axios Instance Lives

```
src/lib/api.ts  ← This file
```

### What's in it?

```typescript
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptors for request/response processing
api.interceptors.request.use(/* ... */);
api.interceptors.response.use(/* ... */);

export default api;
```

---

## Where to USE It

### ✅ CORRECT: Use in Service Files

**File: `src/service/jobs.service.ts`**

```typescript
import api from '@/lib/api';  // ← Import the instance
import { Job } from '@/lib/types/job';

export const jobsService = {
  // Use it here with api.get, api.post, etc.
  getAll: async () => {
    const response = await api.get<Job[]>('/jobs');
    return response.data;
  },

  create: async (data: Omit<Job, 'id'>) => {
    const response = await api.post<Job>('/jobs', data);
    return response.data;
  },

  updateJob: async (id: string, data: Partial<Job>) => {
    const response = await api.put<Job>(`/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id: string) => {
    await api.delete(`/jobs/${id}`);
  },
};
```

---

## Where NOT to Use It

### ❌ WRONG: Don't use directly in Components

```typescript
// ❌ BAD - Don't do this in components!
'use client';
import api from '@/lib/api';

export function MyComponent() {
  const handleClick = async () => {
    const response = await api.get('/jobs');  // ❌ WRONG!
    setJobs(response.data);
  };
}
```

**Instead, do this:**

```typescript
// ✅ GOOD - Use a hook instead
'use client';
import { useJobs } from '@/hooks/useJobs';

export function MyComponent() {
  const { jobs, isLoading } = useJobs();
  return <div>{jobs?.map(job => <div>{job.title}</div>)}</div>;
}
```

### ❌ WRONG: Don't use directly in custom hooks

```typescript
// ❌ BAD - Importing directly in hook
import api from '@/lib/api';

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  
  const fetchJobs = async () => {
    const response = await api.get('/jobs');  // ❌ WRONG!
    setJobs(response.data);
  };
};
```

**Instead, wrap the service:**

```typescript
// ✅ GOOD - Use React Query to wrap service
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/service/jobs.service';

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsService.getAll(),  // ✅ Service calls axios
  });
};
```

---

## The Complete Flow

### 1. Component Uses Hook

```typescript
// src/views/JobsList.tsx
'use client';
import { useJobs } from '@/hooks/useJobs';

export function JobsList() {
  const { jobs, isLoading } = useJobs();
  
  return (
    <div>
      {isLoading ? <p>Loading...</p> : (
        <ul>
          {jobs?.map(job => <li key={job.id}>{job.title}</li>)}
        </ul>
      )}
    </div>
  );
}
```

### 2. Hook Uses Service

```typescript
// src/hooks/useJobs.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/service/jobs.service';

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsService.getAll(),
  });
};
```

### 3. Service Uses Axios Instance

```typescript
// src/service/jobs.service.ts
import api from '@/lib/api';  // ← Import here
import { Job } from '@/lib/types/job';

export const jobsService = {
  getAll: async () => {
    const response = await api.get<Job[]>('/jobs');  // ← Use here!
    return response.data;
  },
};
```

### 4. Axios Instance Sends Request

```typescript
// src/lib/api.ts - Pre-configured axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// When api.get('/jobs') is called:
// Full URL becomes: http://localhost:8000/api/v1/jobs
// Request goes to backend → Backend responds → Response comes back
```

---

## All Axios Methods (How to Use)

### GET (Fetch)
```typescript
const response = await api.get('/endpoint');
const response = await api.get('/endpoint', { params: { id: 1 } });
```

### POST (Create)
```typescript
const response = await api.post('/endpoint', { name: 'value' });
```

### PUT (Full Update)
```typescript
const response = await api.put('/endpoint/1', { name: 'new' });
```

### PATCH (Partial Update)
```typescript
const response = await api.patch('/endpoint/1', { status: 'done' });
```

### DELETE (Remove)
```typescript
await api.delete('/endpoint/1');
```

---

## TypeScript Types with Axios

```typescript
// Specify the response type
const response = await api.get<Job[]>('/jobs');
// response.data is automatically typed as Job[]

// Specify both request and response
const response = await api.post<Job, CreateJobRequest>('/jobs', data);
// data is typed as CreateJobRequest
// response.data is typed as Job
```

---

## File Structure

```
src/
├── lib/
│   ├── api.ts                           ⭐ AXIOS INSTANCE (configure once)
│   └── types/
│       ├── auth.ts
│       ├── job.ts
│       └── user.ts
├── service/                             ⭐ USE AXIOS HERE
│   ├── auth.service.ts                  (import api, make HTTP calls)
│   ├── job.service.ts
│   └── user.service.ts
├── hooks/                               (wrap service in React Query)
│   ├── useAuth.ts
│   ├── useJobs.ts
│   └── useUsers.ts
└── views/ or app/                       (use hooks, NOT axios)
    ├── LoginForm.tsx
    ├── JobsList.tsx
    └── UserProfile.tsx
```

---

## Quick Checklist

When adding a new API feature:

1. **Create types** → `src/lib/types/feature.ts`
2. **Create service** → `src/service/feature.service.ts`
   - Import: `import api from '@/lib/api'`
   - Use: `api.get()`, `api.post()`, etc.
3. **Create hook** → `src/hooks/useFeature.ts`
   - Import service, wrap with React Query
4. **Use hook** → `src/views/Component.tsx`
   - Import hook, use its return values
5. **Never** import axios directly in component or hook

---

## Common Mistakes

### ❌ Mistake 1: Using Axios Directly in Component

```typescript
// WRONG
import api from '@/lib/api';

export function Component() {
  const handleClick = async () => {
    const res = await api.get('/jobs');  // ❌
  };
}
```

### ❌ Mistake 2: Skipping Service Layer

```typescript
// WRONG
export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      return await api.get('/jobs');  // ❌ api call in hook
    },
  });
};
```

### ✅ Correct Way

```typescript
// RIGHT - Service layer
export const jobsService = {
  getAll: async () => {
    const response = await api.get('/jobs');  // ✓ api call in service
    return response.data;
  },
};

// RIGHT - Hook wraps service
export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsService.getAll(),  // ✓ hook calls service
  });
};

// RIGHT - Component uses hook
export function Component() {
  const { jobs } = useJobs();  // ✓ component uses hook
  return <div>{jobs?.map(...)}</div>;
}
```

---

## Environment Variables

**File: `.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**Used in: `src/lib/api.ts`**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
```

---

## Summary Table

| Layer | File Pattern | Action | Example |
|-------|---|---|---|
| **Axios** | `src/lib/api.ts` | Configure once | `baseURL`, interceptors |
| **Service** | `src/service/*.service.ts` | Use axios here | `api.get()`, `api.post()` |
| **Hook** | `src/hooks/use*.ts` | Wrap service | `useQuery()`, `useMutation()` |
| **Component** | `src/views/*.tsx` | Use hook | `const {data} = useHook()` |

---

## One More Time: The Answer

**Q: Where do I use axios.instance.ts?**

**A:** In `src/service/{feature}.service.ts` files. Import it and use `api.get()`, `api.post()`, etc.

```typescript
// src/service/feature.service.ts
import api from '@/lib/api';  // ← Import

export const featureService = {
  getAll: () => api.get('/endpoint'),      // ← Use
  create: (data) => api.post('/endpoint', data),  // ← Use
};
```

That's it!

